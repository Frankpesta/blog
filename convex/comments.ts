import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getUserId,
  requireAdminQuery,
  requireAdmin,
  requireUser,
} from "./lib/auth";

export const listByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const uid = await getUserId(ctx);
    const me = uid ? await ctx.db.get(uid) : null;
    const canModerate = me?.role === "admin";
    const all = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .take(200);
    return all
      .filter(
        (c) =>
          !c.isHidden &&
          (c.isApproved || canModerate || c.authorId === uid),
      )
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const uid = await getUserId(ctx);
    if (!uid) {
      return [];
    }
    const all = await ctx.db
      .query("comments")
      .withIndex("by_author", (q) => q.eq("authorId", uid))
      .order("desc")
      .take(100);
    return Promise.all(
      all.map(async (c) => {
        const post = await ctx.db.get(c.postId);
        return { ...c, postSlug: post?.slug ?? "" };
      }),
    );
  },
});

export const listAllForAdmin = query({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    await requireAdminQuery(ctx);
    return await ctx.db.query("comments").order("desc").take(Math.min(limit, 300));
  },
});

export const create = mutation({
  args: {
    postId: v.id("posts"),
    parentId: v.optional(v.id("comments")),
    content: v.string(),
  },
  handler: async (ctx, { postId, parentId, content }) => {
    const authorId = await requireUser(ctx);
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error("Comment required");
    }
    if (parentId) {
      const parent = await ctx.db.get(parentId);
      if (!parent || parent.postId !== postId) {
        throw new Error("Invalid reply");
      }
      if (parent.parentId) {
        throw new Error("Only one level of threading");
      }
    }
    const now = Date.now();
    const me = await ctx.db.get(authorId);
    const isApproved = me?.role === "admin";
    return await ctx.db.insert("comments", {
      postId,
      authorId,
      parentId,
      content: trimmed,
      isApproved,
      isHidden: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const moderate = mutation({
  args: {
    id: v.id("comments"),
    action: v.union(
      v.literal("approve"),
      v.literal("hide"),
      v.literal("delete"),
    ),
  },
  handler: async (ctx, { id, action }) => {
    await requireAdmin(ctx);
    if (action === "delete") {
      await ctx.db.delete(id);
      return null;
    }
    if (action === "approve") {
      await ctx.db.patch(id, { isApproved: true, updatedAt: Date.now() });
    }
    if (action === "hide") {
      await ctx.db.patch(id, { isHidden: true, updatedAt: Date.now() });
    }
    return null;
  },
});
