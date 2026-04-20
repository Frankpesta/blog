import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { AUTH_COOKIE } from "@/lib/constants";
import { signAccessToken } from "@/lib/jwt";
import { getRequestIssuer } from "@/lib/request-issuer";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const user = await convex.action(api.authActions.validateCredentials, parsed.data);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = await signAccessToken(
    {
      sub: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    getRequestIssuer(req),
  );
  const res = NextResponse.json({
    ok: true,
    user: {
      id: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
