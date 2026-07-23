import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware-helpers";
import { hashPassword } from "@/lib/auth";
import { validateUpdateUserInput } from "@/lib/validations";

// GET /api/users/[id] — Get single user (Admin only)
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only administrators can view users" },
        { status: 403 }
      );
    }

    const id = request.nextUrl.pathname.split("/").pop() || "";

    const foundUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: foundUser },
    });
  } catch (error) {
    console.error("User get error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// PATCH /api/users/[id] — Update a user (Admin only)
export const PATCH = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only administrators can update users" },
        { status: 403 }
      );
    }

    const id = request.nextUrl.pathname.split("/").pop() || "";

    // Check user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const errors = validateUpdateUserInput(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      const newEmail = email.toLowerCase().trim();
      // Check if email is taken by another user
      const emailExists = await prisma.user.findFirst({
        where: {
          email: newEmail,
          id: { not: id },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "This email is already in use by another user" },
          { status: 409 }
        );
      }

      updateData.email = newEmail;
    }

    if (password !== undefined) {
      updateData.password = await hashPassword(password);
    }

    if (role !== undefined) {
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

// DELETE /api/users/[id] — Delete a user (Admin only, cannot delete self)
export const DELETE = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only administrators can delete users" },
        { status: 403 }
      );
    }

    const id = request.nextUrl.pathname.split("/").pop() || "";

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
});

