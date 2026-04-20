import { ConvexHttpClient } from "convex/browser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { AUTH_COOKIE } from "@/lib/constants";
import { verifyAccessToken } from "@/lib/jwt";

const bodySchema = z.object({
  postId: z.string(),
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
  if (payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const postId = parsed.data.postId as Id<"posts">;
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  convex.setAuth(token);

  const post = await convex.query(api.posts.getById, { id: postId });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.status !== "published") {
    return NextResponse.json(
      { error: "Post must be published before emailing" },
      { status: 400 },
    );
  }
  if (post.newsletterSentAt) {
    return NextResponse.json(
      { error: "Newsletter already sent for this post" },
      { status: 400 },
    );
  }

  const recipients = await convex.query(api.subscribers.listActiveForBroadcast, {});
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000";
  const base = site.replace(/\/$/, "");
  const postUrl = `${base}/blog/${post.slug}`;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const resend = new Resend(resendKey);
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  let sent = 0;
  for (const row of recipients) {
    const unsubUrl = `${base}/unsubscribe?token=${encodeURIComponent(row.unsubscribeToken)}`;
    await resend.emails.send({
      from,
      to: row.email,
      subject: `New from BenjaFamily Labs: ${post.title}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;color:#111">
          <h2 style="margin-top:0">${escapeHtml(post.title)}</h2>
          <p style="color:#444;line-height:1.5">${escapeHtml(post.excerpt)}</p>
          <p><a href="${postUrl}" style="color:#c27803;font-weight:600">Read full article →</a></p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
          <p style="font-size:12px;color:#888">
            <a href="${unsubUrl}">Unsubscribe</a>
          </p>
        </div>
      `,
    });
    sent++;
  }

  await convex.mutation(api.posts.updatePost, {
    id: postId,
    markNewsletterSent: true,
  });

  return NextResponse.json({ ok: true, sent });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
