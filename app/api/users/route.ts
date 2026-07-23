import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { hashPassword } from "@/lib/auth";
import { validateCreateUserInput } from "@/lib/validations";

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
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (roleFilter && ["ADMIN", "EDITOR", "VIEWER"].includes(roleFilter)) {
      where.role = roleFilter;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
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

// POST /api/users — Create a new user (Admin only)
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // Only Admin can create users
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only administrators can create users" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const errors = validateCreateUserInput(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = body;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role as "ADMIN" | "EDITOR" | "VIEWER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: { user: newUser },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User create error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

