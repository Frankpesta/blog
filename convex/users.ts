import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import {
  getUserId,
  requireAdmin,
  requireAdminQuery,
  requireUser,
} from "./lib/auth";
import type { Id } from "./_generated/dataModel";

export const getByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase().trim()))
      .unique();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    const { passwordHash: _p, ...rest } = user;
    return rest;
  },
});

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    const { passwordHash: _p, ...rest } = user;
    return { ...rest, _id: user._id };
  },
});

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, { name, email, passwordHash }) => {
    const normalized = email.toLowerCase().trim();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();
    if (existing) {
      throw new Error("Email already registered");
    }
    const id = await ctx.db.insert("users", {
      name: name.trim(),
      email: normalized,
      passwordHash,
      role: "user",
      createdAt: Date.now(),
      isVerified: false,
      bookmarks: [],
    });
    return id;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) {
      patch.name = args.name.trim();
    }
    if (args.bio !== undefined) {
      patch.bio = args.bio;
    }
    if (args.avatarUrl !== undefined) {
      patch.avatarUrl = args.avatarUrl;
    }
    if (Object.keys(patch).length) {
      await ctx.db.patch(userId, patch);
    }
    return null;
  },
});

export const setPasswordHash = mutation({
  args: { userId: v.id("users"), passwordHash: v.string() },
  handler: async (ctx, { userId, passwordHash }) => {
    const self = await requireUser(ctx);
    if (self !== userId) {
      await requireAdmin(ctx);
    }
    await ctx.db.patch(userId, { passwordHash });
    return null;
  },
});

export const setRole = mutation({
  args: { userId: v.id("users"), role: v.union(v.literal("admin"), v.literal("user")) },
  handler: async (ctx, { userId, role }) => {
    await requireAdmin(ctx);
    const self = await getUserId(ctx);
    if (userId === self) {
      throw new Error("Cannot change your own role");
    }
    await ctx.db.patch(userId, { role });
    return null;
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
    const users = await ctx.db.query("users").order("desc").take(Math.min(limit, 200));
    return users.map(({ passwordHash: _p, ...u }) => u);
  },
});

export const toggleBookmark = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const userId = await requireUser(ctx);
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Unauthorized");
    }
    const bookmarks = [...user.bookmarks];
    const i = bookmarks.findIndex((id) => id === postId);
    if (i >= 0) {
      bookmarks.splice(i, 1);
    } else {
      bookmarks.push(postId);
    }
    await ctx.db.patch(userId, { bookmarks });
    return bookmarks.includes(postId);
  },
});

export const getBookmarkedPosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return [];
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return [];
    }
    const posts = await Promise.all(
      user.bookmarks.map((id) => ctx.db.get(id)),
    );
    const loaded = posts.filter((p): p is NonNullable<typeof p> => p !== null);
    return Promise.all(
      loaded.map(async (p) => ({
        ...p,
        coverUrl: p.coverImage
          ? await ctx.storage.getUrl(p.coverImage)
          : null,
      })),
    );
  },
});
