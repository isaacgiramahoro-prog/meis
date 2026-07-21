import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateCouncilReviewInput } from "@/lib/validations";

// GET /api/council — List PAPs in council review (with their reviews)
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search");
    const decision = searchParams.get("decision");

    // Build query filters for PAPs
    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (user.role === "EDITOR") {
      where.project = {
        assignedEditorId: user.id,
      };
    }

    // Project filter
    if (projectId) {
      where.projectId = projectId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { ownerName: { contains: search, mode: "insensitive" } },
        { ownerId: { contains: search, mode: "insensitive" } },
        { beneficiaryName: { contains: search, mode: "insensitive" } },
        { affectedUpi: { contains: search, mode: "insensitive" } },
      ];
    }

    const paps = await prisma.pap.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        ownerName: true,
        ownerId: true,
        beneficiaryName: true,
        affectedUpi: true,
        affectedArea: true,
        propertyType: true,
        sector: true,
        cell: true,
        village: true,
        compensationStatus: true,
        compensationAmount: true,
        ownerSigned: true,
        cellSigned: true,
        sectorSigned: true,
        createdAt: true,
        updatedAt: true,
        projectId: true,
        project: {
          select: { id: true, name: true, location: true },
        },
        councilReviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            reviewDate: true,
            reviewerName: true,
            decision: true,
            feedback: true,
            approvedAmount: true,
            createdAt: true,
            recordedBy: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Filter by decision if specified
    let filteredPaps = paps;
    if (decision) {
      filteredPaps = paps.filter(
        (pap) =>
          pap.councilReviews.length > 0 &&
          pap.councilReviews[0].decision === decision
      );
    }

    // Compute stats
    const councilReviewPaps = paps.filter(
      (p) => p.compensationStatus === "COUNCIL_REVIEW"
    );
    const approvedPaps = paps.filter(
      (p) =>
        p.councilReviews.length > 0 &&
        p.councilReviews[0].decision === "APPROVED"
    );
    const revisionPaps = paps.filter(
      (p) =>
        p.councilReviews.length > 0 &&
        p.councilReviews[0].decision === "REVISION_NEEDED"
    );
    const pendingPaps = paps.filter(
      (p) =>
        p.compensationStatus === "COUNCIL_REVIEW" &&
        (p.councilReviews.length === 0 ||
          p.councilReviews[0].decision === "PENDING")
    );

    return NextResponse.json({
      success: true,
      data: {
        paps: filteredPaps,
        stats: {
          totalInReview: councilReviewPaps.length,
          approved: approvedPaps.length,
          revisionNeeded: revisionPaps.length,
          pending: pendingPaps.length,
        },
      },
    });
  } catch (error) {
    console.error("Council list error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// POST /api/council — Record a council review decision for a PAP
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Viewers cannot record council reviews" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const errors = validateCouncilReviewInput(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { papId, reviewerName, reviewDate, decision, feedback, approvedAmount } = body;

    // Verify PAP exists and check access
    const pap = await prisma.pap.findUnique({
      where: { id: papId },
      select: {
        id: true,
        compensationStatus: true,
        project: {
          select: { id: true, assignedEditorId: true },
        },
      },
    });

    if (!pap) {
      return NextResponse.json(
        { success: false, message: "PAP not found" },
        { status: 404 }
      );
    }

    // Editor can only review PAPs from assigned projects
    if (user.role === "EDITOR" && pap.project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this PAP record" },
        { status: 403 }
      );
    }

    // Create the council review record
    const councilReview = await prisma.councilReview.create({
      data: {
        papId,
        reviewerName: reviewerName.trim(),
        reviewDate: reviewDate ? new Date(reviewDate) : new Date(),
        decision,
        feedback: feedback?.trim() || null,
        approvedAmount: approvedAmount !== undefined ? parseFloat(approvedAmount) : null,
        recordedById: user.id,
      },
      select: {
        id: true,
        reviewDate: true,
        reviewerName: true,
        decision: true,
        feedback: true,
        approvedAmount: true,
        createdAt: true,
        pap: {
          select: {
            id: true,
            ownerName: true,
            compensationStatus: true,
          },
        },
      },
    });

    // If decision is APPROVED, update PAP compensation status
    if (decision === "APPROVED") {
      await prisma.pap.update({
        where: { id: papId },
        data: {
          compensationStatus: "FINANCE_PROCESSING",
          ...(approvedAmount !== undefined && {
            compensationAmount: parseFloat(approvedAmount),
          }),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          decision === "APPROVED"
            ? "Council review approved. PAP moved to finance processing."
            : "Council review recorded. Revisions requested.",
        data: { councilReview },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Council review create error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

