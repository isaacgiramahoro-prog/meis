import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { validateCreateComplaintInput, validateUpdateComplaintInput } from "@/lib/validations";

// GET /api/complaints — List complaints (with role-based filtering)
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
      // Editor can only see complaints from their assigned projects
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
        { description: { contains: search, mode: "insensitive" } },
        { pap: { ownerName: { contains: search, mode: "insensitive" } } },
        { pap: { beneficiaryName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        pap: {
          select: {
            id: true,
            ownerName: true,
            ownerId: true,
            beneficiaryName: true,
            affectedUpi: true,
            sector: true,
            cell: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        parentComplaint: {
          select: {
            id: true,
            category: true,
            status: true,
            description: true,
          },
        },
      },
    });

    // Compute stats
    const statsWhere = { ...where } as Record<string, unknown>;
    delete statsWhere.status;
    delete statsWhere.OR;
    const statsBaseWhere: Parameters<typeof prisma.complaint.count>[0] = { where: statsWhere as never };
    
    const totalComplaints = await prisma.complaint.count(statsBaseWhere);
    const submittedCount = await prisma.complaint.count({
      where: { ...statsBaseWhere.where, status: "SUBMITTED" } as never,
    });
    const underReviewCount = await prisma.complaint.count({
      where: { ...statsBaseWhere.where, status: "UNDER_REVIEW" } as never,
    });
    const resolvedCount = await prisma.complaint.count({
      where: { ...statsBaseWhere.where, status: "RESOLVED" } as never,
    });
    const rejectedCount = await prisma.complaint.count({
      where: { ...statsBaseWhere.where, status: "REJECTED" } as never,
    });

    return NextResponse.json({
      success: true,
      data: {
        complaints,
        stats: {
          total: totalComplaints,
          submitted: submittedCount,
          underReview: underReviewCount,
          resolved: resolvedCount,
          rejected: rejectedCount,
        },
      },
    });
  } catch (error) {
    console.error("Complaints list error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// POST /api/complaints — Create a new complaint (Admin or Editor only)
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // Only Admin and Editor can create complaints
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Viewers cannot create complaints" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const errors = validateCreateComplaintInput(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { papId, projectId, category, description, parentComplaintId } = body;

    // Verify PAP exists
    const pap = await prisma.pap.findUnique({
      where: { id: papId },
      select: { id: true, projectId: true },
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

    // Editor can only add complaints to their assigned projects
    if (user.role === "EDITOR" && project.assignedEditorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "You are not assigned to this project" },
        { status: 403 }
      );
    }

    // If this is an appeal, verify parent complaint exists
    if (parentComplaintId) {
      const parentComplaint = await prisma.complaint.findUnique({
        where: { id: parentComplaintId },
        select: { id: true },
      });

      if (!parentComplaint) {
        return NextResponse.json(
          { success: false, message: "Parent complaint not found for appeal" },
          { status: 404 }
        );
      }
    }

    const complaint = await prisma.complaint.create({
      data: {
        papId,
        projectId,
        category,
        description: description.trim(),
        status: "SUBMITTED" as never,
        parentComplaintId: parentComplaintId || null,
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
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Complaint submitted successfully",
        data: { complaint },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Complaint create error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

