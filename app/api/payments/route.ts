import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateCreatePaymentInput } from "@/lib/validations";

// GET /api/payments — List payments (with role-based filtering)
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const papId = searchParams.get("papId");
    const projectId = searchParams.get("projectId");

    // Build query filters
    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (user.role === "EDITOR") {
      // Editor can only see payments from their assigned projects
      where.project = {
        assignedEditorId: user.id,
      };
    }
    // Admin sees all, Viewer sees all (read-only)

    // PAP filter
    if (papId) {
      where.papId = papId;
    }

    // Project filter
    if (projectId) {
      where.projectId = projectId;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Search filter
    if (search) {
      where.OR = [
        { beneficiaryName: { contains: search, mode: "insensitive" } },
        { beneficiaryId: { contains: search, mode: "insensitive" } },
        { bankName: { contains: search, mode: "insensitive" } },
        { paymentCode: { contains: search, mode: "insensitive" } },
        { pap: { ownerName: { contains: search, mode: "insensitive" } } },
        { pap: { beneficiaryName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        pap: {
          select: {
            id: true,
            ownerName: true,
            ownerId: true,
            beneficiaryName: true,
            beneficiaryId: true,
            affectedUpi: true,
            sector: true,
            cell: true,
            compensationStatus: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            location: true,
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

    // Compute stats
    const statsWhere = { ...where } as Record<string, unknown>;
    delete statsWhere.status;
    delete statsWhere.OR;
    const statsBaseWhere: Parameters<typeof prisma.payment.count>[0] = { where: statsWhere as never };

    const totalPayments = await prisma.payment.count(statsBaseWhere);
    const pendingCount = await prisma.payment.count({
      where: { ...statsBaseWhere.where, status: "PENDING" } as never,
    });
    const paidCount = await prisma.payment.count({
      where: { ...statsBaseWhere.where, status: "PAID" } as never,
    });
    const failedCount = await prisma.payment.count({
      where: { ...statsBaseWhere.where, status: "FAILED" } as never,
    });
    const cancelledCount = await prisma.payment.count({
      where: { ...statsBaseWhere.where, status: "CANCELLED" } as never,
    });

    return NextResponse.json({
      success: true,
      data: {
        payments,
        stats: {
          total: totalPayments,
          pending: pendingCount,
          paid: paidCount,
          failed: failedCount,
          cancelled: cancelledCount,
        },
      },
    });
  } catch (error) {
    console.error("Payments list error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// POST /api/payments — Create a new payment record (Admin or Editor only)
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // Only Admin and Editor can create payments
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Viewers cannot create payments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const errors = validateCreatePaymentInput(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { papId, projectId, beneficiaryName, beneficiaryId, beneficiaryPhone, beneficiaryEmail, bankName, accountNumber, amount, paymentCode, paidDate, notes } = body;

    // Parse amount as float (it may come as string from JSON)
    const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // Verify PAP exists
    const pap = await prisma.pap.findUnique({
      where: { id: papId },
      select: {
        id: true,
        projectId: true,
        ownerSigned: true,
        cellSigned: true,
        sectorSigned: true,
        compensationStatus: true,
      },
    });

    if (!pap) {
      return NextResponse.json(
        { success: false, message: "PAP not found" },
        { status: 404 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, assignedEditorId: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // Editor can only add payments to their assigned projects
    if (user.role === "EDITOR" && project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You are not assigned to this project" },
        { status: 403 }
      );
    }

    // Invariant #1: Payment cannot be completed without required approvals
    // Check approval signatures
    if (!pap.ownerSigned || !pap.cellSigned || !pap.sectorSigned) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment cannot be created until all approvals are completed. Owner, Cell, and Sector signatures are required.",
        },
        { status: 400 }
      );
    }

    // Prepare paidDate as ISO string if provided
    const paidDateValue = paidDate ? new Date(paidDate).toISOString() : null;

    const payment = await prisma.payment.create({
      data: {
        papId,
        projectId,
        beneficiaryName: beneficiaryName.trim(),
        beneficiaryId: beneficiaryId.trim(),
        beneficiaryPhone: beneficiaryPhone || null,
        beneficiaryEmail: beneficiaryEmail || null,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        amount: parsedAmount,
        paymentCode: paymentCode || null,
        paidDate: paidDateValue,
        notes: notes || null,
        status: "PENDING",
        recordedById: user.id,
      },
      include: {
        pap: {
          select: {
            id: true,
            ownerName: true,
            beneficiaryName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
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

    // Update the PAP's basic payment info and compensation status
    await prisma.pap.update({
      where: { id: papId },
      data: {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        paymentCode: paymentCode || null,
        paidAmount: parsedAmount,
        paidDate: paidDateValue,
        compensationStatus: "FINANCE_PROCESSING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment recorded successfully",
        data: { payment },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});
