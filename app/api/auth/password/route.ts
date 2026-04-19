import bcrypt from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { AUTH_COOKIE } from "@/lib/constants";
import type { Id } from "@/convex/_generated/dataModel";
import { verifyAccessToken } from "@/lib/jwt";

const schema = z.object({
  current: z.string().min(1),
  next: z.string().min(8),
});

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let payload;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const email = payload.email as string;
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const valid = await convex.action(api.authActions.validateCredentials, {
    email,
    password: parsed.data.current,
  });
  if (!valid) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  convex.setAuth(token);
  const passwordHash = await bcrypt.hash(parsed.data.next, 12);
  await convex.mutation(api.users.setPasswordHash, {
    userId: valid.userId as Id<"users">,
    passwordHash,
  });
  return NextResponse.json({ ok: true });
}
