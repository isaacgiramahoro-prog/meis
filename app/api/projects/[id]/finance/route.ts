import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";

// GET /api/projects/[id]/finance — Get finance review stats for a project
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const id = request.nextUrl.pathname.split("/")[3] || "";

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, assignedEditorId: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    if (user.role === "EDITOR" && project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this project" },
        { status: 403 }
      );
    }

    // Get PAPs in finance review for this project
    const papsInFinance = await prisma.pap.count({
      where: {
        projectId: id,
        compensationStatus: "FINANCE_PROCESSING",
      },
    });

    // Get finance reviews for this project
    const reviews = await prisma.financeReview.findMany({
      where: { projectId: id },
      select: {
        id: true,
        decision: true,
        reviewDate: true,
        reviewerName: true,
        approvedAmount: true,
        recordedBy: { select: { name: true } },
        pap: {
          select: { id: true, ownerName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Stats
    const stats = {
      totalPapsInFinance: papsInFinance,
      totalReviews: reviews.length,
      approved: reviews.filter((r) => r.decision === "APPROVED").length,
      declined: reviews.filter((r) => r.decision === "DECLINED").length,
      pending: reviews.filter((r) => r.decision === "PENDING").length,
      revisionNeeded: reviews.filter((r) => r.decision === "REVISION_NEEDED").length,
    };

    return NextResponse.json({
      success: true,
      data: { stats, recentReviews: reviews },
    });
  } catch (error) {
    console.error("Project finance error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

