import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId, requireUser } from "./lib/auth";

export const listMine = query({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(Math.min(limit, 100));
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const userId = await requireUser(ctx);
    const n = await ctx.db.get(id);
    if (!n || n.userId !== userId) {
      throw new Error("Not found");
    }
    await ctx.db.patch(id, { isRead: true });
    return null;
  },
});
