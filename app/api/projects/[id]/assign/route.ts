import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";

// PATCH /api/projects/[id]/assign — Assign an Editor to a project (Admin only)
export const PATCH = withAuth(async (request: NextRequest, user) => {
  try {
    // Only Admin can assign editors
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only administrators can assign editors" },
        { status: 403 }
      );
    }

    // Extract project ID from path: /api/projects/[id]/assign
    const pathParts = request.nextUrl.pathname.split("/");
    const id = pathParts[pathParts.length - 2]; // index of [id]

    const body = await request.json();
    const { editorId } = body;

    if (!editorId) {
      return NextResponse.json(
        { success: false, message: "Editor ID is required" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // Verify editor exists and has EDITOR role
    const editor = await prisma.user.findUnique({
      where: { id: editorId },
    });

    if (!editor) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (editor.role !== "EDITOR") {
      return NextResponse.json(
        { success: false, message: "Selected user is not an Editor" },
        { status: 400 }
      );
    }

    // Assign editor to project
    const updated = await prisma.project.update({
      where: { id },
      data: { assignedEditorId: editorId },
      select: {
        id: true,
        name: true,
        location: true,
        status: true,
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
      message: `Editor ${editor.name} assigned to project successfully`,
      data: { project: updated },
    });
  } catch (error) {
    console.error("Project assign error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// DELETE /api/projects/[id]/assign — Unassign editor from project (Admin only)
export const DELETE = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only administrators can unassign editors" },
        { status: 403 }
      );
    }

    const pathParts = request.nextUrl.pathname.split("/");
    const id = pathParts[pathParts.length - 2];

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { assignedEditorId: null },
      select: {
        id: true,
        name: true,
        status: true,
        assignedEditor: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Editor unassigned from project successfully",
      data: { project: updated },
    });
  } catch (error) {
    console.error("Project unassign error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

