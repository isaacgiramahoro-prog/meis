import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";

// GET /api/reports — Aggregated reporting data with optional date-range filtering
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    // Build date filters
    const dateFilter: Record<string, unknown> = {};
    if (fromDate || toDate) {
      const createdAt: Record<string, Date> = {};
      if (fromDate) createdAt.gte = new Date(fromDate);
      if (toDate) createdAt.lte = new Date(toDate);
      dateFilter.createdAt = createdAt;
    }

    // Role-based project filtering
    const projectWhere: Record<string, unknown> = { ...dateFilter };
    if (user.role === "EDITOR") {
      projectWhere.assignedEditorId = user.id;
    }

    // ── Projects ──────────────────────────────────────────────
    const projects = await prisma.project.findMany({
      where: projectWhere,
      select: {
        id: true,
        name: true,
        location: true,
        budget: true,
        status: true,
        createdAt: true,
        createdBy: { select: { id: true, name: true } },
        assignedEditor: { select: { id: true, name: true } },
      },
    });

    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

    const projectStatusCounts: Record<string, number> = {
      PENDING: 0,
      ACTIVE: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const p of projects) {
      if (p.status in projectStatusCounts) {
        projectStatusCounts[p.status]++;
      }
    }

    // Project-level IDs for related entity filtering
    const projectIds = projects.map((p) => p.id);
    const projectFilter =
      projectIds.length > 0 ? { projectId: { in: projectIds } } : { projectId: { in: [] } };

    // Apply same date filter to related entities
    const relatedWhere = { ...projectFilter } as Record<string, unknown>;
    if (fromDate || toDate) {
      const createdAt: Record<string, Date> = {};
      if (fromDate) createdAt.gte = new Date(fromDate);
      if (toDate) createdAt.lte = new Date(toDate);
      relatedWhere.createdAt = createdAt;
    }

    // ── PAPs ──────────────────────────────────────────────────
    const paps = await prisma.pap.findMany({
      where: relatedWhere,
      select: {
        id: true,
        compensationStatus: true,
        compensationAmount: true,
        createdAt: true,
      },
    });

    const totalPaps = paps.length;
    const activePaps = paps.filter(
      (pap) => pap.compensationStatus !== "PAID" && pap.compensationStatus !== "CANCELLED"
    ).length;

    const papStatusCounts: Record<string, number> = {
      DRAFT: 0,
      NOT_YET_PAID: 0,
      COUNCIL_REVIEW: 0,
      FINANCE_PROCESSING: 0,
      PAID: 0,
      FAILED: 0,
      CANCELLED: 0,
    };
    for (const pap of paps) {
      const status = pap.compensationStatus as string;
      if (status in papStatusCounts) papStatusCounts[status]++;
    }

    const totalCompensation = paps.reduce(
      (sum, pap) => sum + (pap.compensationAmount || 0),
      0
    );

    // ── Payments ──────────────────────────────────────────────
    const payments = await prisma.payment.findMany({
      where: relatedWhere as never,
      select: {
        id: true,
        status: true,
        amount: true,
        paidDate: true,
        createdAt: true,
      },
    });

    const totalPayments = payments.length;
    const completedPayments = payments.filter((p) => p.status === "PAID").length;
    const paidAmount = payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    const paymentStatusCounts: Record<string, number> = {
      PENDING: 0,
      PAID: 0,
      FAILED: 0,
      CANCELLED: 0,
    };
    for (const p of payments) {
      if (p.status in paymentStatusCounts) {
        paymentStatusCounts[p.status as keyof typeof paymentStatusCounts]++;
      }
    }

    // ── Complaints ────────────────────────────────────────────
    const complaintsWhere = { ...relatedWhere } as Record<string, unknown>;
    delete complaintsWhere.createdAt;
    if (fromDate || toDate) {
      const createdAt: Record<string, Date> = {};
      if (fromDate) createdAt.gte = new Date(fromDate);
      if (toDate) createdAt.lte = new Date(toDate);
      complaintsWhere.createdAt = createdAt;
    }

    const complaints = await prisma.complaint.findMany({
      where: complaintsWhere as never,
      select: {
        id: true,
        status: true,
        category: true,
        createdAt: true,
      },
    });

    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter((c) => c.status === "RESOLVED").length;

    const complaintStatusCounts: Record<string, number> = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      RESOLVED: 0,
      REJECTED: 0,
    };
    const complaintCategoryCounts: Record<string, number> = {
      LAND_ISSUE: 0,
      VALUATION_ISSUE: 0,
      OWNERSHIP_ISSUE: 0,
      PAYMENT_ISSUE: 0,
      OTHER: 0,
    };
    for (const c of complaints) {
      if (c.status in complaintStatusCounts) complaintStatusCounts[c.status]++;
      if (c.category in complaintCategoryCounts) complaintCategoryCounts[c.category]++;
    }

    // ── Pending Reviews ───────────────────────────────────────
    const pendingReviews = paps.filter(
      (pap) =>
        pap.compensationStatus === "COUNCIL_REVIEW" ||
        pap.compensationStatus === "FINANCE_PROCESSING"
    ).length;

    // ── Monthly Trends (last 12 months) ───────────────────────
    const now = new Date();
    const monthlyTrends: {
      month: string;
      label: string;
      projectsCreated: number;
      paymentsMade: number;
      papsRegistered: number;
      complaintsFiled: number;
    }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthLabel = monthStart.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;

      monthlyTrends.push({
        month: monthKey,
        label: monthLabel,
        projectsCreated: projects.filter(
          (p) => new Date(p.createdAt) >= monthStart && new Date(p.createdAt) <= monthEnd
        ).length,
        paymentsMade: payments.filter(
          (p) =>
            p.status === "PAID" &&
            new Date(p.paidDate || p.createdAt) >= monthStart &&
            new Date(p.paidDate || p.createdAt) <= monthEnd
        ).length,
        papsRegistered: paps.filter(
          (pap) => new Date(pap.createdAt) >= monthStart && new Date(pap.createdAt) <= monthEnd
        ).length,
        complaintsFiled: complaints.filter(
          (c) => new Date(c.createdAt) >= monthStart && new Date(c.createdAt) <= monthEnd
        ).length,
      });
    }

    // ── Budget vs Actual Analysis ─────────────────────────────
    const budgetAnalysis = {
      totalBudget,
      totalCompensation,
      paidAmount,
      remainingBudget: totalBudget - paidAmount,
      paymentProgress: totalBudget > 0 ? Math.round((paidAmount / totalBudget) * 100) : 0,
      compensationProgress: totalCompensation > 0 ? Math.round((paidAmount / totalCompensation) * 100) : 0,
    };

    // ── Recent Activity (last 10 actions) ─────────────────────
    const recentProjects = projects.slice(-5).map((p) => ({
      type: "project" as const,
      action: p.status === "COMPLETED" ? "completed" : "created",
      description: `Project "${p.name}" was ${p.status === "COMPLETED" ? "completed" : "created"}`,
      date: p.createdAt,
      id: p.id,
    }));

    const recentPayments = payments.slice(-5).map((p) => ({
      type: "payment" as const,
      action: p.status === "PAID" ? "paid" : "recorded",
      description: `Payment of ${p.amount.toLocaleString()} RWF was ${p.status === "PAID" ? "completed" : "recorded"}`,
      date: p.paidDate || p.createdAt,
      id: p.id,
    }));

    const recentActivity = [...recentProjects, ...recentPayments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // ── Assemble Response ─────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalProjects,
          totalPaps,
          activePaps,
          totalPayments,
          completedPayments,
          totalComplaints,
          resolvedComplaints,
          pendingReviews,
          totalBudget,
          paidAmount,
          totalCompensation,
        },
        projectStatusData: [
          { label: "Active", value: projectStatusCounts.ACTIVE, color: "#1E3A8A" },
          { label: "Pending", value: projectStatusCounts.PENDING, color: "#EAB308" },
          { label: "Completed", value: projectStatusCounts.COMPLETED, color: "#16A34A" },
          { label: "Cancelled", value: projectStatusCounts.CANCELLED, color: "#6B7280" },
        ],
        papStatusData: [
          { label: "Not Yet Paid", value: papStatusCounts.NOT_YET_PAID, color: "#DC2626" },
          { label: "Council Review", value: papStatusCounts.COUNCIL_REVIEW, color: "#EAB308" },
          { label: "Finance Processing", value: papStatusCounts.FINANCE_PROCESSING, color: "#F97316" },
          { label: "Paid", value: papStatusCounts.PAID, color: "#16A34A" },
          { label: "Draft", value: papStatusCounts.DRAFT, color: "#3B82F6" },
        ],
        paymentStatusData: [
          { label: "Paid", value: paymentStatusCounts.PAID, color: "#16A34A", bgColor: "#DCFCE7" },
          { label: "Pending", value: paymentStatusCounts.PENDING, color: "#DC2626", bgColor: "#FEE2E2" },
          { label: "Failed", value: paymentStatusCounts.FAILED, color: "#DC2626", bgColor: "#FEE2E2" },
          { label: "Cancelled", value: paymentStatusCounts.CANCELLED, color: "#6B7280", bgColor: "#F3F4F6" },
        ],
        complaintStatusData: [
          { label: "Resolved", value: complaintStatusCounts.RESOLVED, color: "#16A34A" },
          { label: "Under Review", value: complaintStatusCounts.UNDER_REVIEW, color: "#EAB308" },
          { label: "Submitted", value: complaintStatusCounts.SUBMITTED, color: "#F97316" },
          { label: "Rejected", value: complaintStatusCounts.REJECTED, color: "#DC2626" },
        ],
        complaintCategoryData: [
          { label: "Land Issue", value: complaintCategoryCounts.LAND_ISSUE, color: "#1E3A8A" },
          { label: "Valuation Issue", value: complaintCategoryCounts.VALUATION_ISSUE, color: "#EAB308" },
          { label: "Ownership Issue", value: complaintCategoryCounts.OWNERSHIP_ISSUE, color: "#F97316" },
          { label: "Payment Issue", value: complaintCategoryCounts.PAYMENT_ISSUE, color: "#DC2626" },
          { label: "Other", value: complaintCategoryCounts.OTHER, color: "#6B7280" },
        ],
        budgetAnalysis,
        monthlyTrends,
        recentActivity,
        projects,
        dateRange: {
          from: fromDate || null,
          to: toDate || null,
        },
      },
    });
  } catch (error) {
    console.error("Reports data error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

