import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import {
  getUserId,
  requireAdmin,
  requireAdminQuery,
  requireUser,
} from "./lib/auth";
import type { Id } from "./_generated/dataModel";

function stripSensitive<T extends { passwordHash?: string }>(
  user: T | null,
): Omit<T, "passwordHash"> | null {
  if (!user) {
    return null;
  }
  const { passwordHash: _p, ...rest } = user;
  return rest;
}

export const getByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email.toLowerCase().trim()))
      .unique();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return stripSensitive(user);
  },
});

/** True when the signed-in Convex Auth user has `role: "admin"` on their profile doc. */
export const checkIsAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return false;
    }
    const user = await ctx.db.get(userId);
    return user?.role === "admin";
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
    const stripped = stripSensitive(user);
    if (!stripped) {
      return null;
    }
    const role = stripped.role ?? "user";
    return {
      ...stripped,
      id: stripped._id,
      role,
    };
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

export const setRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { userId, role }) => {
    await requireAdmin(ctx);
    const self = await getUserId(ctx);
    if (userId === self) {
      throw new Error("Cannot change your own role");
    }
    if (role === "user") {
      const everyone = await ctx.db.query("users").collect();
      const admins = everyone.filter((u) => (u.role ?? "user") === "admin");
      const target = everyone.find((u) => u._id === userId);
      if ((target?.role ?? "user") === "admin" && admins.length <= 1) {
        throw new Error("Cannot remove the last admin");
      }
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
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "Unauthorized") {
        return { ok: false as const, reason: "not_authenticated" as const };
      }
      return { ok: false as const, reason: "not_admin" as const };
    }
    const rows = await ctx.db
      .query("users")
      .order("desc")
      .take(Math.min(limit, 200));
    return {
      ok: true as const,
      users: rows.map((u) => stripSensitive(u)!),
    };
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
    const bookmarks = [...(user.bookmarks ?? [])];
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
    const marks = user.bookmarks ?? [];
    const posts = await Promise.all(marks.map((id) => ctx.db.get(id)));
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
