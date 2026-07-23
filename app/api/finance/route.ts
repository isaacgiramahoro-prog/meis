import { NextRequest, NextResponse } from "next/server";
import { $Enums } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateCreateFinanceReviewInput } from "@/lib/validations";

// GET /api/finance — List PAPs in finance review + finance reviews
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const decision = searchParams.get("decision") || "";
    const projectId = searchParams.get("projectId") || "";

    // First get all PAPs in FINANCE_PROCESSING status
    const papWhere: Record<string, unknown> = {
      compensationStatus: "FINANCE_PROCESSING",
    };

    if (search) {
      papWhere.OR = [
        { ownerName: { contains: search, mode: "insensitive" } },
        { beneficiaryName: { contains: search, mode: "insensitive" } },
        { ownerId: { contains: search, mode: "insensitive" } },
        { affectedUpi: { contains: search, mode: "insensitive" } },
      ];
    }

    if (projectId) {
      papWhere.projectId = projectId;
    }

    if (decision) {
      papWhere.financeReviews = {
        some: {
          decision: decision as "APPROVED" | "DECLINED" | "PENDING" | "REVISION_NEEDED",
        },
      };
    }

    // Editor can only see PAPs from assigned projects
    if (user.role === "EDITOR") {
      papWhere.project = {
        assignedEditorId: user.id,
      };
    }

    const paps = await prisma.pap.findMany({
      where: papWhere,
      select: {
        id: true,
        ownerName: true,
        ownerId: true,
        beneficiaryName: true,
        compensationAmount: true,
        compensationStatus: true,
        sector: true,
        cell: true,
        village: true,
        projectId: true,
        project: {
          select: { id: true, name: true, location: true },
        },
        financeReviews: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            decision: true,
            reviewDate: true,
            reviewerName: true,
            feedback: true,
            approvedAmount: true,
            recordedBy: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { financeReviews: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Get stats
    const statsQuery: Record<string, unknown> = {
      compensationStatus: "FINANCE_PROCESSING",
    };
    if (user.role === "EDITOR") {
      statsQuery.project = { assignedEditorId: user.id };
    }

    const totalInFinance = await prisma.pap.count({ where: statsQuery });

    // Count finance reviews by decision
    const financeReviewsStats = await prisma.financeReview.groupBy({
      by: ["decision"],
      where: user.role === "EDITOR"
        ? { pap: { project: { assignedEditorId: user.id } } }
        : {},
      _count: true,
    });

    const approvedCount = financeReviewsStats.find((s) => s.decision === "APPROVED")?._count || 0;
    const declinedCount = financeReviewsStats.find((s) => s.decision === "DECLINED")?._count || 0;
    const pendingCount = financeReviewsStats.find((s) => s.decision === "PENDING")?._count || 0;
    const revisionCount = financeReviewsStats.find((s) => s.decision === "REVISION_NEEDED")?._count || 0;

    return NextResponse.json({
      success: true,
      data: {
        paps,
        stats: {
          totalInFinance,
          approved: approvedCount,
          declined: declinedCount,
          pending: pendingCount,
          revisionNeeded: revisionCount,
        },
      },
    });
  } catch (error) {
    console.error("Finance list error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// POST /api/finance — Record a finance review decision
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Viewers cannot record finance reviews" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const errors = validateCreateFinanceReviewInput(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Verify the PAP exists and is in FINANCE_PROCESSING
    const pap = await prisma.pap.findUnique({
      where: { id: body.papId },
      select: {
        id: true,
        compensationStatus: true,
        projectId: true,
        project: {
          select: { assignedEditorId: true },
        },
      },
    });

    if (!pap) {
      return NextResponse.json(
        { success: false, message: "PAP not found" },
        { status: 404 }
      );
    }

    // Editor can only review PAPs in their assigned projects
    if (user.role === "EDITOR" && pap.project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this PAP" },
        { status: 403 }
      );
    }

    // Create the finance review
    const review = await prisma.financeReview.create({
      data: {
        papId: body.papId,
        projectId: pap.projectId,
        reviewerName: body.reviewerName.trim(),
        reviewDate: body.reviewDate ? new Date(body.reviewDate) : new Date(),
        decision: body.decision,
        feedback: body.feedback?.trim() || null,
        approvedAmount: body.approvedAmount !== undefined ? body.approvedAmount : null,
        recordedById: user.id,
      },
      select: {
        id: true,
        decision: true,
        reviewDate: true,
        reviewerName: true,
        feedback: true,
        approvedAmount: true,
        recordedBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Update PAP compensation status based on decision
    let newStatus: $Enums.CompensationStatus | null = null;
    if (body.decision === "APPROVED") {
      newStatus = "NOT_YET_PAID"; // Ready for payment processing
      // Update approved amount if provided
      if (body.approvedAmount !== undefined && body.approvedAmount !== null) {
        await prisma.pap.update({
          where: { id: body.papId },
          data: {
            compensationStatus: newStatus,
            compensationAmount: body.approvedAmount,
          },
        });
      } else {
        await prisma.pap.update({
          where: { id: body.papId },
          data: { compensationStatus: newStatus },
        });
      }
    } else if (body.decision === "DECLINED") {
      newStatus = "CANCELLED";
      await prisma.pap.update({
        where: { id: body.papId },
        data: { compensationStatus: newStatus },
      });
    } else if (body.decision === "REVISION_NEEDED") {
      newStatus = "COUNCIL_REVIEW"; // Send back for revision
      await prisma.pap.update({
        where: { id: body.papId },
        data: { compensationStatus: newStatus },
      });
    }
    // If PENDING, no status change

    return NextResponse.json(
      {
        success: true,
        message: newStatus
          ? `Finance review recorded. PAP status updated to ${newStatus.replace(/_/g, " ")}.`
          : "Finance review recorded.",
        data: { review },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Finance review create error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

