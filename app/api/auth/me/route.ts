import { ConvexHttpClient } from "convex/browser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { AUTH_COOKIE, SITE_URL } from "@/lib/constants";
import { signAccessToken, verifyAccessToken } from "@/lib/jwt";

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }
  try {
    const payload = await verifyAccessToken(token);
    const sub = payload.sub as string;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const profile = await convex.query(api.users.getById, {
      userId: sub as Id<"users">,
    });

    /**
     * Session cookie encodes role/email/name at login time. Middleware trusts only
     * the JWT for /admin. If Convex was updated (e.g. promoted to admin), refresh
     * the cookie so middleware matches what `/api/auth/me` returns.
     */
    let refreshedToken: string | null = null;
    if (profile) {
      const tokenRole = (payload.role as string | undefined) ?? "user";
      const tokenEmail = (payload.email as string | undefined) ?? "";
      const tokenName = (payload.name as string | undefined) ?? "";
      if (
        tokenRole !== profile.role ||
        tokenEmail !== profile.email ||
        tokenName !== profile.name
      ) {
        const iss =
          typeof payload.iss === "string"
            ? payload.iss.replace(/\/$/, "")
            : SITE_URL.replace(/\/$/, "");
        refreshedToken = await signAccessToken(
          {
            sub: profile._id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
          },
          iss,
        );
      }
    }

    const body = {
      user: profile
        ? {
            id: profile._id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            avatarUrl: profile.avatarUrl,
            bio: profile.bio,
            bookmarks: profile.bookmarks,
          }
        : null,
    };

    const res = NextResponse.json(body);
    if (refreshedToken) {
      res.cookies.set(AUTH_COOKIE, refreshedToken, AUTH_COOKIE_OPTIONS);
    }
    return res;
  } catch {
    return NextResponse.json({ user: null });
  }
}
