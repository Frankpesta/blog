import bcrypt from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { AUTH_COOKIE } from "@/lib/constants";
import { signAccessToken } from "@/lib/jwt";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  try {
    const userId = await convex.mutation(api.users.register, {
      name,
      email,
      passwordHash,
    });
    const token = await signAccessToken({
      sub: userId,
      email: email.toLowerCase().trim(),
      name,
      role: "user",
    });
    const res = NextResponse.json({
      ok: true,
      user: { id: userId, email: email.toLowerCase().trim(), name, role: "user" },
    });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Could not register" }, { status: 400 });
  }
}
