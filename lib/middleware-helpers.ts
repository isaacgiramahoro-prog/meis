import { NextResponse } from "next/server";
import { getUserFromRequest, JwtPayload } from "./auth";
import { NextRequest } from "next/server";

export type RouteHandler = (
  request: NextRequest,
  user: JwtPayload
) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler) {
  return async (request: NextRequest) => {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    return handler(request, user);
  };
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export function successResponse<T>(data: T, message: string = "Success") {
  return NextResponse.json({ success: true, message, data });
}

