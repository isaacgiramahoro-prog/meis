import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateUpdateComplaintInput } from "@/lib/validations";

// GET /api/complaints/[id] — Get complaint details
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const id = request.nextUrl.pathname.split("/").pop() as string;

    const complaint = await prisma.complaint.findUnique({
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
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parentComplaint: {
          include: {
            pap: {
              select: {
                id: true,
                ownerName: true,
              },
            },
          },
        },
        childComplaints: {
          include: {
            pap: {
              select: {
                id: true,
                ownerName: true,
              },
            },
            resolvedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found" },
        { status: 404 }
      );
    }

    // Role-based check
    if (user.role === "EDITOR") {
      const project = await prisma.project.findUnique({
        where: { id: complaint.projectId },
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
      data: { complaint },
    });
  } catch (error) {
    console.error("Complaint detail error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// PATCH /api/complaints/[id] — Update complaint status/resolution
export const PATCH = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Viewers cannot update complaints" },
        { status: 403 }
      );
    }

    const id = request.nextUrl.pathname.split("/").pop() as string;
    const body = await request.json();

    // Get existing complaint
    const existing = await prisma.complaint.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        project: {
          select: { assignedEditorId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Complaint not found" },
        { status: 404 }
      );
    }

    // Editor can only update complaints in their assigned projects
    if (user.role === "EDITOR" && existing.project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You are not assigned to this project" },
        { status: 403 }
      );
    }

    // Check if complaint is already resolved — cannot be reopened (invariant #4)
    if (existing.status === "RESOLVED" && body.status && body.status !== "RESOLVED") {
      return NextResponse.json(
        { success: false, message: "A resolved complaint cannot be reopened. Create an appeal instead." },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (body.status) {
      updateData.status = body.status;

      // If resolved or rejected, set resolved info
      if (body.status === "RESOLVED" || body.status === "REJECTED") {
        updateData.resolvedAt = new Date().toISOString();
        updateData.resolvedById = user.id;
      }
    }

    if (body.resolution !== undefined) {
      updateData.resolution = body.resolution.trim();
    }

    // Validate
    const validationInput = {
      status: body.status,
      resolution: body.resolution,
    };

    const errors = validateUpdateComplaintInput(validationInput);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.update({
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
        resolvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Complaint ${complaint.status.toLowerCase()} successfully`,
      data: { complaint },
    });
  } catch (error) {
    console.error("Complaint update error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// DELETE /api/complaints/[id] — Delete a complaint (Admin only)
export const DELETE = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only admins can delete complaints" },
        { status: 403 }
      );
    }

    const id = request.nextUrl.pathname.split("/").pop() as string;

    const existing = await prisma.complaint.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Complaint not found" },
        { status: 404 }
      );
    }

    await prisma.complaint.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Complaint delete error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

