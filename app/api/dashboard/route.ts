import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";

// GET /api/dashboard — Aggregated dashboard statistics
export const GET = withAuth(async (_request: NextRequest, user) => {
  try {
    // Build base filters based on user role
    const userFilter =
      user.role === "EDITOR"
        ? { assignedEditorId: user.id }
        : {};

    // ── Project Stats ──────────────────────────────────────────
    const projects = await prisma.project.findMany({
      where: userFilter,
      select: {
        id: true,
        status: true,
        budget: true,
      },
    });

    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

    const projectStatusCounts = {
      PENDING: 0,
      ACTIVE: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const p of projects) {
      if (p.status in projectStatusCounts) {
        projectStatusCounts[p.status as keyof typeof projectStatusCounts]++;
      }
    }

    // Build project-level ID filter for related entities
    const projectIds = projects.map((p) => p.id);
    const projectFilter =
      projectIds.length > 0 ? { projectId: { in: projectIds } } : { projectId: { in: [] } };

    // ── PAP Stats ──────────────────────────────────────────────
    const papWhere = { ...projectFilter } as Record<string, unknown>;

    const paps = await prisma.pap.findMany({
      where: papWhere,
      select: {
        id: true,
        compensationStatus: true,
        compensationAmount: true,
      },
    });

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
      if (status in papStatusCounts) {
        papStatusCounts[status]++;
      }
    }

    // ── Payment Stats ──────────────────────────────────────────
    const payments = await prisma.payment.findMany({
      where: projectFilter as never,
      select: {
        id: true,
        status: true,
        amount: true,
      },
    });

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

    // ── Complaint Stats ────────────────────────────────────────
    const complaints = await prisma.complaint.findMany({
      where: projectFilter as never,
      select: {
        id: true,
        status: true,
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
    for (const c of complaints) {
      if (c.status in complaintStatusCounts) {
        complaintStatusCounts[c.status as keyof typeof complaintStatusCounts]++;
      }
    }

    // ── Pending Reviews (PAPs in council review or finance processing) ──
    const pendingReviews = paps.filter(
      (pap) =>
        pap.compensationStatus === "COUNCIL_REVIEW" ||
        pap.compensationStatus === "FINANCE_PROCESSING"
    ).length;

    // ── Assemble response ──────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          activePaps,
          completedPayments,
          pendingReviews,
          totalComplaints,
          resolvedComplaints,
          totalBudget,
          paidAmount,
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
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

