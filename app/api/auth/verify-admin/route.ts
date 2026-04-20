import { ConvexHttpClient } from "convex/browser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { AUTH_COOKIE } from "@/lib/constants";
import { verifyAccessToken } from "@/lib/jwt";

/**
 * Source of truth for /admin access: Convex `users.role` (not the JWT `role` claim,
 * which is only updated on login or explicit refresh).
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { admin: false, reason: "no_token" },
      { status: 401 },
    );
  }
  try {
    const payload = await verifyAccessToken(token);
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const profile = await convex.query(api.users.getById, {
      userId: payload.sub as Id<"users">,
    });
    if (!profile) {
      return NextResponse.json(
        { admin: false, reason: "no_user" },
        { status: 403 },
      );
    }
    if (profile.role !== "admin") {
      return NextResponse.json(
        { admin: false, reason: "not_admin" },
        { status: 403 },
      );
    }
    return NextResponse.json({ admin: true });
  } catch {
    return NextResponse.json(
      { admin: false, reason: "invalid_token" },
      { status: 401 },
    );
  }
}
