import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateUpdatePaymentInput } from "@/lib/validations";

// GET /api/payments/[id] — Get payment details
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const id = request.nextUrl.pathname.split("/").pop() as string;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        pap: {
          select: {
            id: true,
            ownerName: true,
            ownerId: true,
            ownerPhone: true,
            ownerEmail: true,
            beneficiaryName: true,
            beneficiaryId: true,
            beneficiaryPhone: true,
            beneficiaryEmail: true,
            affectedUpi: true,
            affectedArea: true,
            propertyType: true,
            sector: true,
            cell: true,
            village: true,
            compensationStatus: true,
            compensationAmount: true,
            ownerSigned: true,
            ownerSignedDate: true,
            cellSigned: true,
            cellSignedDate: true,
            sectorSigned: true,
            sectorSignedDate: true,
            bankName: true,
            accountNumber: true,
            paymentCode: true,
            paidAmount: true,
            paidDate: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            location: true,
            status: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Role-based check
    if (user.role === "EDITOR") {
      const project = await prisma.project.findUnique({
        where: { id: payment.projectId },
        select: { assignedEditorId: true },
      });
      if (project?.assignedEditorId !== user.id) {
        return NextResponse.json(
          { success: false, message: "You are not assigned to this project" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error("Payment detail error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// PATCH /api/payments/[id] — Update payment status/info
export const PATCH = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Viewers cannot update payments" },
        { status: 403 }
      );
    }

    const id = request.nextUrl.pathname.split("/").pop() as string;
    const body = await request.json();

    // Get existing payment
    const existing = await prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        papId: true,
        project: {
          select: { assignedEditorId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Editor can only update payments in their assigned projects
    if (user.role === "EDITOR" && existing.project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You are not assigned to this project" },
        { status: 403 }
      );
    }

    // Validate input
    const validationInput = {
      status: body.status,
      paymentCode: body.paymentCode,
      paidDate: body.paidDate,
      notes: body.notes,
    };

    const errors = validateUpdatePaymentInput(validationInput);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (body.status) {
      updateData.status = body.status;
    }

    if (body.paymentCode !== undefined) {
      updateData.paymentCode = body.paymentCode;
    }

    if (body.paidDate !== undefined) {
      updateData.paidDate = body.paidDate ? new Date(body.paidDate).toISOString() : null;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        pap: {
          select: {
            id: true,
            ownerName: true,
            beneficiaryName: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update the PAP compensation status if payment status changed
    if (body.status) {
      let papCompensationStatus: string;
      switch (body.status) {
        case "PAID":
          papCompensationStatus = "PAID";
          break;
        case "FAILED":
          papCompensationStatus = "FAILED";
          break;
        case "CANCELLED":
          papCompensationStatus = "CANCELLED";
          break;
        default:
          papCompensationStatus = "FINANCE_PROCESSING";
      }

      await prisma.pap.update({
        where: { id: existing.papId },
        data: {
          compensationStatus: papCompensationStatus as never,
          ...(body.status === "PAID" ? { paidDate: body.paidDate ? new Date(body.paidDate).toISOString() : new Date().toISOString() } : {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Payment ${payment.status.toLowerCase()} successfully`,
      data: { payment },
    });
  } catch (error) {
    console.error("Payment update error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// DELETE /api/payments/[id] — Delete a payment record (Admin only)
export const DELETE = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only admins can delete payments" },
        { status: 403 }
      );
    }

    const id = request.nextUrl.pathname.split("/").pop() as string;

    const existing = await prisma.payment.findUnique({
      where: { id },
      select: { id: true, papId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    await prisma.payment.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Payment delete error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

