import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";

// GET /api/users — List users (Admin only)
// GET /api/users?role=EDITOR — Filter by role
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    // Only Admin can list all users
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only administrators can view users" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");

    const where: Record<string, unknown> = {};
    if (roleFilter && ["ADMIN", "EDITOR", "VIEWER"].includes(roleFilter)) {
      where.role = roleFilter;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error("Users list error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

