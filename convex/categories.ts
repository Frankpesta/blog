import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdminQuery, requireAdmin } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("asc").take(100);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const exists = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (exists) {
      throw new Error("Slug already exists");
    }
    return await ctx.db.insert("categories", {
      name: args.name.trim(),
      slug: args.slug.trim().toLowerCase(),
      description: args.description,
      color: args.color,
      icon: args.icon,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx);
    const updates: Record<string, unknown> = {};
    if (patch.name !== undefined) {
      updates.name = patch.name.trim();
    }
    if (patch.slug !== undefined) {
      updates.slug = patch.slug.trim().toLowerCase();
    }
    if (patch.description !== undefined) {
      updates.description = patch.description;
    }
    if (patch.color !== undefined) {
      updates.color = patch.color;
    }
    if (patch.icon !== undefined) {
      updates.icon = patch.icon;
    }
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return null;
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminQuery(ctx);
    return await ctx.db.query("categories").order("asc").take(200);
  },
});
