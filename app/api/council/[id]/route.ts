import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateCouncilReviewInput } from "@/lib/validations";

// Helper to extract ID from URL pathname
function getIdFromPath(pathname: string): string {
  const segments = pathname.split("/");
  return segments[segments.length - 1] || "";
}

// GET /api/council/[id] — Get a specific council review with PAP details
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const id = getIdFromPath(request.nextUrl.pathname);

    const councilReview = await prisma.councilReview.findUnique({
      where: { id },
      select: {
        id: true,
        reviewDate: true,
        reviewerName: true,
        decision: true,
        feedback: true,
        approvedAmount: true,
        createdAt: true,
        updatedAt: true,
        recordedBy: {
          select: { id: true, name: true },
        },
        pap: {
          select: {
            id: true,
            ownerName: true,
            ownerId: true,
            ownerPhone: true,
            ownerEmail: true,
            civilStatus: true,
            beneficiaryName: true,
            beneficiaryId: true,
            affectedUpi: true,
            affectedArea: true,
            propertyType: true,
            sector: true,
            cell: true,
            village: true,
            compensationStatus: true,
            compensationAmount: true,
            valuationDate: true,
            valuationComment: true,
            ownerSigned: true,
            ownerSignedDate: true,
            cellSigned: true,
            cellSignedDate: true,
            sectorSigned: true,
            sectorSignedDate: true,
            projectId: true,
            project: {
              select: {
                id: true,
                name: true,
                location: true,
                assignedEditorId: true,
              },
            },
          },
        },
      },
    });

    if (!councilReview) {
      return NextResponse.json(
        { success: false, message: "Council review not found" },
        { status: 404 }
      );
    }

    // Check access
    if (
      user.role === "EDITOR" &&
      councilReview.pap.project.assignedEditorId !== user.id
    ) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this review" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { councilReview },
    });
  } catch (error) {
    console.error("Council review detail error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// PATCH /api/council/[id] — Update a council review
export const PATCH = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Viewers cannot update council reviews" },
        { status: 403 }
      );
    }

    const id = getIdFromPath(request.nextUrl.pathname);

    // Verify council review exists and check access
    const existingReview = await prisma.councilReview.findUnique({
      where: { id },
      select: {
        id: true,
        pap: {
          select: {
            project: { select: { id: true, assignedEditorId: true } },
          },
        },
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: "Council review not found" },
        { status: 404 }
      );
    }

    if (
      user.role === "EDITOR" &&
      existingReview.pap.project.assignedEditorId !== user.id
    ) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this review" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate if decision/required fields are being updated
    if (body.decision || body.reviewerName) {
      const validationErrors = validateCouncilReviewInput({
        papId: existingReview.id,
        reviewerName: body.reviewerName || "",
        decision: body.decision || "PENDING",
        ...(body.feedback !== undefined && { feedback: body.feedback }),
        ...(body.approvedAmount !== undefined && {
          approvedAmount: body.approvedAmount,
        }),
      });

      if (Object.keys(validationErrors).length > 0) {
        return NextResponse.json(
          { success: false, message: "Validation failed", errors: validationErrors },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (body.reviewerName !== undefined) updateData.reviewerName = body.reviewerName.trim();
    if (body.decision !== undefined) updateData.decision = body.decision;
    if (body.feedback !== undefined) updateData.feedback = body.feedback?.trim() || null;
    if (body.approvedAmount !== undefined) {
      updateData.approvedAmount = body.approvedAmount !== null ? parseFloat(body.approvedAmount) : null;
    }
    if (body.reviewDate !== undefined) {
      updateData.reviewDate = body.reviewDate ? new Date(body.reviewDate) : new Date();
    }

    const updated = await prisma.councilReview.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        reviewDate: true,
        reviewerName: true,
        decision: true,
        feedback: true,
        approvedAmount: true,
        updatedAt: true,
      },
    });

    // If decision changed to APPROVED, update PAP status
    if (body.decision === "APPROVED") {
      const review = await prisma.councilReview.findUnique({
        where: { id },
        select: { papId: true },
      });
      if (review) {
        await prisma.pap.update({
          where: { id: review.papId },
          data: {
            compensationStatus: "FINANCE_PROCESSING",
            ...(body.approvedAmount !== undefined && {
              compensationAmount: parseFloat(body.approvedAmount),
            }),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Council review updated successfully",
      data: { councilReview: updated },
    });
  } catch (error) {
    console.error("Council review update error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

