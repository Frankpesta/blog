import { Resend } from "resend";
import { NextResponse } from "next/server";
import { z } from "zod";

const body = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  const json = await req.json().catch(() => null);
  const parsed = body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const resend = new Resend(key);
  try {
    await resend.emails.send({
      from,
      to: parsed.data.email,
      subject: "You are on the list — BenjaFamily Labs",
      text: "Thanks for subscribing. Unsubscribe link is always in the footer of our emails.",
    });
  } catch {
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
