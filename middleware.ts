import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Admin gating uses GET /api/auth/verify-admin (Convex `users.role`) so it stays
 * in sync when a user is promoted in the dashboard; the session JWT still
 * encodes `role` at login time and is not the source of truth here.
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/admin")) {
    return NextResponse.next();
  }

  const checkUrl = request.nextUrl.clone();
  checkUrl.pathname = "/api/auth/verify-admin";
  checkUrl.search = "";

  const res = await fetch(checkUrl, {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  let body: { admin?: boolean } = {};
  try {
    body = (await res.json()) as { admin?: boolean };
  } catch {
    /* empty */
  }

  if (res.status === 401) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (res.status === 403 || !body.admin) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
