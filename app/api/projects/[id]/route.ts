import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateUpdateProjectInput } from "@/lib/validations";

// GET /api/projects/[id] — Get project details
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const id = request.nextUrl.pathname.split("/").pop() || "";

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        location: true,
        budget: true,
        deadline: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignedEditor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // Editor can only view assigned projects
    if (user.role === "EDITOR" && project.assignedEditor?.id !== user.id) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this project" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    console.error("Project detail error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// PATCH /api/projects/[id] — Update project
export const PATCH = withAuth(async (request: NextRequest, user) => {
  try {
    const id = request.nextUrl.pathname.split("/").pop() || "";

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

    // Editors can only update assigned projects; Admin can update any
    if (user.role === "EDITOR" && project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this project" },
        { status: 403 }
      );
    }

    // Only Admin can change status to COMPLETED or CANCELLED
    const body = await request.json();
    if (
      (body.status === "COMPLETED" || body.status === "CANCELLED") &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, message: "Only administrators can complete or cancel projects" },
        { status: 403 }
      );
    }

    const errors = validateUpdateProjectInput(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.location !== undefined) updateData.location = body.location.trim();
    if (body.budget !== undefined) updateData.budget = parseFloat(body.budget);
    if (body.deadline !== undefined) updateData.deadline = new Date(body.deadline);
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        location: true,
        budget: true,
        deadline: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignedEditor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: { project: updated },
    });
  } catch (error) {
    console.error("Project update error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// DELETE /api/projects/[id] — Delete/cancel project (Admin only)
export const DELETE = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only administrators can delete projects" },
        { status: 403 }
      );
    }

    const id = request.nextUrl.pathname.split("/").pop() || "";

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Project delete error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

