import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdminQuery } from "./lib/auth";

export const subscribe = mutation({
  args: { email: v.string(), source: v.optional(v.string()) },
  handler: async (ctx, { email, source }) => {
    const normalized = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error("Invalid email");
    }
    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();
    if (existing) {
      if (!existing.isActive) {
        await ctx.db.patch(existing._id, {
          isActive: true,
          subscribedAt: Date.now(),
        });
      }
      return { ok: true as const, unsubscribeToken: existing.unsubscribeToken };
    }
    const unsubscribeToken = crypto.randomUUID();
    await ctx.db.insert("subscribers", {
      email: normalized,
      subscribedAt: Date.now(),
      isActive: true,
      source,
      unsubscribeToken,
    });
    return { ok: true as const, unsubscribeToken };
  },
});

export const unsubscribeByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const sub = await ctx.db
      .query("subscribers")
      .withIndex("by_unsubscribe_token", (q) => q.eq("unsubscribeToken", token))
      .unique();
    if (!sub) {
      throw new Error("Invalid token");
    }
    await ctx.db.patch(sub._id, { isActive: false });
    return null;
  },
});

export const listActiveEmails = query({
  args: {},
  handler: async (ctx) => {
    try {
      await requireAdminQuery(ctx);
    } catch {
      return [];
    }
    const rows = await ctx.db.query("subscribers").take(500);
    return rows.filter((s) => s.isActive).map((s) => s.email);
  },
});

/** Admin-only: email + token for unsubscribe links in newsletter sends. */
export const listActiveForBroadcast = query({
  args: {},
  handler: async (ctx) => {
    try {
      await requireAdminQuery(ctx);
    } catch {
      return [];
    }
    const rows = await ctx.db.query("subscribers").take(500);
    return rows
      .filter((s) => s.isActive)
      .map((s) => ({
        email: s.email,
        unsubscribeToken: s.unsubscribeToken,
      }));
  },
});

export const listForAdmin = query({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    try {
      await requireAdminQuery(ctx);
    } catch {
      return [];
    }
    return await ctx.db
      .query("subscribers")
      .order("desc")
      .take(Math.min(limit, 500));
  },
});
