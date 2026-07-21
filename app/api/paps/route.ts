import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateCreatePapInput } from "@/lib/validations";

// GET /api/paps — List PAPs (with role-based and project-based filtering)
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Build query filters
    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (user.role === "EDITOR") {
      // Editor can only see PAPs from their assigned projects
      where.project = {
        assignedEditorId: user.id,
      };
    }
    // Admin sees all, Viewer sees all (read-only)

    // Project filter
    if (projectId) {
      where.projectId = projectId;
    }

    // Status filter
    if (status) {
      where.compensationStatus = status;
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
      orderBy: { createdAt: "desc" },
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
      },
    });

    return NextResponse.json({
      success: true,
      data: { paps },
    });
  } catch (error) {
    console.error("PAPs list error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// POST /api/paps — Create a new PAP (Admin or Editor only)
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // Only Admin and Editor can create PAPs
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Viewers cannot create PAP records" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const errors = validateCreatePapInput(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const {
      projectId,
      ownerName,
      ownerId,
      ownerPhone,
      ownerEmail,
      civilStatus,
      beneficiaryName,
      beneficiaryId,
      beneficiaryPhone,
      beneficiaryEmail,
      relationship,
      affectedUpi,
      affectedArea,
      propertyType,
      sector,
      cell,
      village,
      landRegistration,
      landDescription,
      compensationAmount,
      valuationDate,
      valuationComment,
      bankName,
      accountNumber,
    } = body;

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

    // Editor can only add PAPs to their assigned projects
    if (user.role === "EDITOR" && project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You are not assigned to this project" },
        { status: 403 }
      );
    }

    const pap = await prisma.pap.create({
      data: {
        projectId,
        ownerName: ownerName.trim(),
        ownerId: ownerId.trim(),
        ownerPhone: ownerPhone?.trim() || null,
        ownerEmail: ownerEmail?.trim() || null,
        civilStatus: civilStatus?.trim() || null,
        beneficiaryName: beneficiaryName.trim(),
        beneficiaryId: beneficiaryId.trim(),
        beneficiaryPhone: beneficiaryPhone?.trim() || null,
        beneficiaryEmail: beneficiaryEmail?.trim() || null,
        relationship: relationship?.trim() || null,
        affectedUpi: affectedUpi.trim(),
        affectedArea: parseFloat(affectedArea),
        propertyType,
        sector: sector.trim(),
        cell: cell.trim(),
        village: village.trim(),
        landRegistration: landRegistration?.trim() || null,
        landDescription: landDescription?.trim() || null,
        compensationAmount: compensationAmount ? parseFloat(compensationAmount) : null,
        valuationDate: valuationDate ? new Date(valuationDate) : null,
        valuationComment: valuationComment?.trim() || null,
        bankName: bankName?.trim() || null,
        accountNumber: accountNumber?.trim() || null,
      },
      select: {
        id: true,
        ownerName: true,
        ownerId: true,
        beneficiaryName: true,
        affectedUpi: true,
        compensationStatus: true,
        createdAt: true,
        projectId: true,
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "PAP registered successfully",
        data: { pap },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("PAP create error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

