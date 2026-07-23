import { NextRequest, NextResponse } from "next/server";
import { $Enums } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateUpdateFinanceReviewInput } from "@/lib/validations";

// GET /api/finance/[id] — Get a finance review detail with PAP info
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const id = request.nextUrl.pathname.split("/").pop() || "";

    const review = await prisma.financeReview.findUnique({
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
          select: { id: true, name: true, email: true },
        },
        pap: {
          select: {
            id: true,
            ownerName: true,
            ownerId: true,
            beneficiaryName: true,
            beneficiaryId: true,
            compensationAmount: true,
            compensationStatus: true,
            affectedUpi: true,
            affectedArea: true,
            propertyType: true,
            sector: true,
            cell: true,
            village: true,
            ownerSigned: true,
            cellSigned: true,
            sectorSigned: true,
            project: {
              select: { id: true, name: true, location: true },
            },
          },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Finance review not found" },
        { status: 404 }
      );
    }

    // Editor can only view reviews from their assigned projects
    if (user.role === "EDITOR") {
      const pap = await prisma.pap.findUnique({
        where: { id: review.pap.id },
        select: { project: { select: { assignedEditorId: true } } },
      });
      if (pap?.project.assignedEditorId !== user.id) {
        return NextResponse.json(
          { success: false, message: "You do not have access to this review" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { review },
    });
  } catch (error) {
    console.error("Finance review detail error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// PATCH /api/finance/[id] — Update a finance review decision
export const PATCH = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Viewers cannot update finance reviews" },
        { status: 403 }
      );
    }

    const id = request.nextUrl.pathname.split("/").pop() || "";
    const body = await request.json();

    const errors = validateUpdateFinanceReviewInput(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const existingReview = await prisma.financeReview.findUnique({
      where: { id },
      select: {
        id: true,
        papId: true,
        projectId: true,
        pap: {
          select: {
            project: { select: { assignedEditorId: true } },
          },
        },
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: "Finance review not found" },
        { status: 404 }
      );
    }

    // Editor can only update reviews from their assigned projects
    if (user.role === "EDITOR" && existingReview.pap.project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this review" },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.decision !== undefined) updateData.decision = body.decision;
    if (body.feedback !== undefined) updateData.feedback = body.feedback?.trim() || null;
    if (body.approvedAmount !== undefined) updateData.approvedAmount = body.approvedAmount;

    const updated = await prisma.financeReview.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        decision: true,
        feedback: true,
        approvedAmount: true,
        reviewDate: true,
        reviewerName: true,
        recordedBy: {
          select: { id: true, name: true },
        },
      },
    });

    // If decision changed, update PAP compensation status
    if (body.decision) {
      let newStatus: $Enums.CompensationStatus | null = null;
      if (body.decision === "APPROVED") {
        newStatus = "NOT_YET_PAID";
        if (body.approvedAmount !== undefined && body.approvedAmount !== null) {
          await prisma.pap.update({
            where: { id: existingReview.papId },
            data: { compensationStatus: newStatus, compensationAmount: body.approvedAmount },
          });
        } else {
          await prisma.pap.update({
            where: { id: existingReview.papId },
            data: { compensationStatus: newStatus },
          });
        }
      } else if (body.decision === "DECLINED") {
        newStatus = "CANCELLED";
        await prisma.pap.update({
          where: { id: existingReview.papId },
          data: { compensationStatus: newStatus },
        });
      } else if (body.decision === "REVISION_NEEDED") {
        newStatus = "COUNCIL_REVIEW";
        await prisma.pap.update({
          where: { id: existingReview.papId },
          data: { compensationStatus: newStatus },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Finance review updated successfully",
      data: { review: updated },
    });
  } catch (error) {
    console.error("Finance review update error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

