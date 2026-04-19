import { ConvexHttpClient } from "convex/browser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { AUTH_COOKIE } from "@/lib/constants";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET() {
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
    return NextResponse.json({
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
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
