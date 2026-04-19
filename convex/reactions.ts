import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId, requireUser } from "./lib/auth";
const reactionType = v.union(
  v.literal("like"),
  v.literal("love"),
  v.literal("fire"),
  v.literal("rocket"),
);

export const countsForPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const rows = await ctx.db
      .query("reactions")
      .withIndex("by_post_user", (q) => q.eq("postId", postId))
      .take(500);
    const counts = {
      like: 0,
      love: 0,
      fire: 0,
      rocket: 0,
    };
    for (const r of rows) {
      counts[r.type]++;
    }
    const uid = await getUserId(ctx);
    let mine: "like" | "love" | "fire" | "rocket" | null = null;
    if (uid) {
      const mineRow = rows.find((r) => r.userId === uid);
      mine = mineRow?.type ?? null;
    }
    return { counts, mine };
  },
});

export const setReaction = mutation({
  args: {
    postId: v.id("posts"),
    type: reactionType,
  },
  handler: async (ctx, { postId, type }) => {
    const userId = await requireUser(ctx);
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_post_user", (q) =>
        q.eq("postId", postId).eq("userId", userId),
      )
      .unique();
    if (existing) {
      if (existing.type === type) {
        await ctx.db.delete(existing._id);
        return null;
      }
      await ctx.db.patch(existing._id, { type });
      return null;
    }
    await ctx.db.insert("reactions", { postId, userId, type });
    return null;
  },
});
