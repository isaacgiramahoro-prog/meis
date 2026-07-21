import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateCreateProjectInput } from "@/lib/validations";

// GET /api/projects — List projects (with role-based filtering)
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query filters
    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (user.role === "EDITOR") {
      where.assignedEditorId = user.id;
    }
    // Admin sees all, Viewer sees all (read-only)

    // Status filter
    if (status && ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"].includes(status)) {
      where.status = status;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        location: true,
        budget: true,
        deadline: true,
        status: true,
        createdAt: true,
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
      data: { projects },
    });
  } catch (error) {
    console.error("Projects list error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// POST /api/projects — Create a new project (Admin only)
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // Only Admin can create projects
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only administrators can create projects" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const errors = validateCreateProjectInput(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { name, location, budget, deadline, description } = body;

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        location: location.trim(),
        budget: parseFloat(budget),
        deadline: new Date(deadline),
        description: description?.trim() || null,
        createdById: user.id,
      },
      select: {
        id: true,
        name: true,
        location: true,
        budget: true,
        deadline: true,
        description: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: { project },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Project create error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

