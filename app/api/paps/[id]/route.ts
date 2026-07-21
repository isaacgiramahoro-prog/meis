import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateUpdatePapInput } from "@/lib/validations";

// Helper to extract ID from URL pathname
function getIdFromPath(pathname: string): string {
  const segments = pathname.split("/");
  return segments[segments.length - 1] || "";
}

// GET /api/paps/[id] — Get PAP details
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const id = getIdFromPath(request.nextUrl.pathname);

    const pap = await prisma.pap.findUnique({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        projectId: true,
        ownerName: true,
        ownerId: true,
        ownerPhone: true,
        ownerEmail: true,
        civilStatus: true,
        beneficiaryName: true,
        beneficiaryId: true,
        beneficiaryPhone: true,
        beneficiaryEmail: true,
        relationship: true,
        affectedUpi: true,
        affectedArea: true,
        propertyType: true,
        sector: true,
        cell: true,
        village: true,
        landRegistration: true,
        landDescription: true,
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
        landVerified: true,
        landVerifiedBy: true,
        landVerifiedDate: true,
        landTitleVerified: true,
        landTitleVerifiedBy: true,
        landTitleVerifiedDate: true,
        idVerified: true,
        idVerifiedBy: true,
        idVerifiedDate: true,
        bankName: true,
        accountNumber: true,
        paymentCode: true,
        paidAmount: true,
        paidDate: true,
        project: {
          select: {
            id: true,
            name: true,
            location: true,
            assignedEditorId: true,
          },
        },
      },
    });

    if (!pap) {
      return NextResponse.json(
        { success: false, message: "PAP not found" },
        { status: 404 }
      );
    }

    // Editor can only view PAPs from assigned projects
    if (user.role === "EDITOR" && pap.project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this PAP record" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { pap },
    });
  } catch (error) {
    console.error("PAP detail error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// PATCH /api/paps/[id] — Update PAP
export const PATCH = withAuth(async (request: NextRequest, user) => {
  try {
    // Viewers cannot update
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Viewers cannot update PAP records" },
        { status: 403 }
      );
    }

    const id = getIdFromPath(request.nextUrl.pathname);

    // Verify PAP exists and check access
    const existingPap = await prisma.pap.findUnique({
      where: { id },
      select: {
        id: true,
        project: {
          select: { id: true, assignedEditorId: true },
        },
      },
    });

    if (!existingPap) {
      return NextResponse.json(
        { success: false, message: "PAP not found" },
        { status: 404 }
      );
    }

    // Editor can only update PAPs from assigned projects
    if (user.role === "EDITOR" && existingPap.project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this PAP record" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const errors = validateUpdatePapInput(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Build update data dynamically
    const updateData: Record<string, unknown> = {};
    const stringFields = [
      "ownerName", "ownerId", "ownerPhone", "ownerEmail", "civilStatus",
      "beneficiaryName", "beneficiaryId", "beneficiaryPhone", "beneficiaryEmail",
      "relationship", "affectedUpi", "sector", "cell", "village",
      "landRegistration", "landDescription", "valuationComment",
      "compensationStatus", "bankName", "accountNumber", "paymentCode",
      "landVerifiedBy", "landTitleVerifiedBy", "idVerifiedBy",
    ];
    const floatFields = ["affectedArea", "compensationAmount", "paidAmount"];
    const boolFields = [
      "ownerSigned", "cellSigned", "sectorSigned",
      "landVerified", "landTitleVerified", "idVerified",
    ];
    const dateFields = [
      "valuationDate", "ownerSignedDate", "cellSignedDate", "sectorSignedDate",
      "landVerifiedDate", "landTitleVerifiedDate", "idVerifiedDate", "paidDate",
    ];

    for (const field of stringFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]?.trim?.() ?? body[field];
      }
    }

    for (const field of floatFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field] !== null ? parseFloat(body[field]) : null;
      }
    }

    for (const field of boolFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    for (const field of dateFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field] ? new Date(body[field]) : null;
      }
    }

    // Property type enum
    if (body.propertyType !== undefined) {
      updateData.propertyType = body.propertyType;
    }

    const updated = await prisma.pap.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        ownerName: true,
        ownerId: true,
        beneficiaryName: true,
        affectedUpi: true,
        compensationStatus: true,
        compensationAmount: true,
        propertyType: true,
        ownerSigned: true,
        cellSigned: true,
        sectorSigned: true,
        updatedAt: true,
        projectId: true,
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "PAP updated successfully",
      data: { pap: updated },
    });
  } catch (error) {
    console.error("PAP update error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// DELETE /api/paps/[id] — Delete PAP (Admin only)
export const DELETE = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only administrators can delete PAP records" },
        { status: 403 }
      );
    }

    const id = getIdFromPath(request.nextUrl.pathname);

    const pap = await prisma.pap.findUnique({
      where: { id },
    });

    if (!pap) {
      return NextResponse.json(
        { success: false, message: "PAP not found" },
        { status: 404 }
      );
    }

    await prisma.pap.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "PAP deleted successfully",
    });
  } catch (error) {
    console.error("PAP delete error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

