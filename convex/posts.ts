import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getUserId, requireAdminQuery, requireAdmin } from "./lib/auth";
import type { Id } from "./_generated/dataModel";

function buildSearchText(title: string, excerpt: string, content: string) {
  const stripped = content.replace(/<[^>]+>/g, " ");
  return `${title} ${excerpt} ${stripped}`.slice(0, 8000);
}

function readingTimeMin(content: string) {
  const text = content.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const publishScheduled = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const batch = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .take(200);
    for (const p of batch) {
      if (p.scheduledFor !== undefined && p.scheduledFor <= now) {
        await ctx.db.patch(p._id, {
          status: "published",
          publishedAt: p.scheduledFor,
          updatedAt: now,
        });
      }
    }
    return null;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const getPublishedBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!post || post.status !== "published") {
      return null;
    }
    const coverUrl = post.coverImage
      ? await ctx.storage.getUrl(post.coverImage)
      : null;
    const authorDoc = await ctx.db.get(post.authorId);
    const cat = await ctx.db.get(post.categoryId);
    const author = authorDoc
      ? {
          id: authorDoc._id,
          name: authorDoc.name,
          avatarUrl: authorDoc.avatarUrl,
          bio: authorDoc.bio,
        }
      : null;
    const category = cat
      ? {
          name: cat.name,
          slug: cat.slug,
          color: cat.color,
          icon: cat.icon,
        }
      : null;
    return { ...post, coverUrl, author, category };
  },
});

export const getById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getByIdForEditor = query({
  args: { id: v.id("posts") },
  handler: async (ctx, { id }) => {
    try {
      await requireAdminQuery(ctx);
    } catch {
      return null;
    }
    const post = await ctx.db.get(id);
    if (!post) {
      return null;
    }
    const coverUrl = post.coverImage
      ? await ctx.storage.getUrl(post.coverImage)
      : null;
    return { ...post, coverUrl };
  },
});

export const listPublished = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const res = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.gt("publishedAt", 0))
      .order("desc")
      .paginate(paginationOpts);
    const page = await Promise.all(
      res.page.map(async (p) => ({
        ...p,
        coverUrl: p.coverImage
          ? await ctx.storage.getUrl(p.coverImage)
          : null,
      })),
    );
    return { ...res, page };
  },
});

export const listPublishedHome = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.gt("publishedAt", 0))
      .order("desc")
      .take(80);
    const sorted = [...posts].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return (b.publishedAt ?? 0) - (a.publishedAt ?? 0);
    });
    const sliced = sorted.slice(0, 24);
    return Promise.all(
      sliced.map(async (p) => ({
        ...p,
        coverUrl: p.coverImage
          ? await ctx.storage.getUrl(p.coverImage)
          : null,
      })),
    );
  },
});

export const listPinned = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.gt("publishedAt", 0))
      .order("desc")
      .take(40);
    const pinned = posts.filter((p) => p.isPinned).slice(0, 3);
    return Promise.all(
      pinned.map(async (p) => ({
        ...p,
        coverUrl: p.coverImage
          ? await ctx.storage.getUrl(p.coverImage)
          : null,
      })),
    );
  },
});

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, { categoryId }) => {
    const all = await ctx.db
      .query("posts")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .order("desc")
      .take(100);
    const published = all.filter((p) => p.status === "published");
    return Promise.all(
      published.map(async (p) => ({
        ...p,
        coverUrl: p.coverImage
          ? await ctx.storage.getUrl(p.coverImage)
          : null,
      })),
    );
  },
});

export const listByTag = query({
  args: { tag: v.string() },
  handler: async (ctx, { tag }) => {
    const all = await ctx.db.query("posts").order("desc").take(200);
    const t = tag.toLowerCase();
    const filtered = all.filter(
      (p) =>
        p.tags.some((x) => x.toLowerCase() === t) && p.status === "published",
    );
    return Promise.all(
      filtered.map(async (p) => ({
        ...p,
        coverUrl: p.coverImage
          ? await ctx.storage.getUrl(p.coverImage)
          : null,
      })),
    );
  },
});

export const searchPosts = query({
  args: { q: v.string(), categoryId: v.optional(v.id("categories")) },
  handler: async (ctx, { q, categoryId }) => {
    if (!q.trim()) {
      return [];
    }
    if (categoryId) {
      return await ctx.db
        .query("posts")
        .withSearchIndex("search_posts", (s) =>
          s.search("searchText", q).eq("status", "published").eq("categoryId", categoryId),
        )
        .take(30);
    }
    return await ctx.db
      .query("posts")
      .withSearchIndex("search_posts", (s) => s.search("searchText", q).eq("status", "published"))
      .take(30);
  },
});

export const listRelated = query({
  args: { postId: v.id("posts"), categoryId: v.id("categories") },
  handler: async (ctx, { postId, categoryId }) => {
    const all = await ctx.db
      .query("posts")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .order("desc")
      .take(20);
    const related = all
      .filter((p) => p._id !== postId && p.status === "published")
      .slice(0, 3);
    return Promise.all(
      related.map(async (p) => ({
        ...p,
        coverUrl: p.coverImage
          ? await ctx.storage.getUrl(p.coverImage)
          : null,
      })),
    );
  },
});

export const listForAdmin = query({
  args: { status: v.optional(v.string()), limit: v.number() },
  handler: async (ctx, args) => {
    await requireAdminQuery(ctx);
    let q = ctx.db.query("posts").order("desc");
    const posts = await q.take(Math.min(args.limit, 200));
    if (args.status && args.status !== "all") {
      return posts.filter((p) => p.status === args.status);
    }
    return posts;
  },
});

export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    coverImage: v.optional(v.id("_storage")),
    categoryId: v.id("categories"),
    tags: v.array(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("scheduled"),
    ),
    scheduledFor: v.optional(v.number()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    sendNewsletter: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const authorId = await requireAdmin(ctx);
    const now = Date.now();
    const slug = args.slug.trim().toLowerCase();
    const dup = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (dup) {
      throw new Error("Slug already exists");
    }
    const rt = readingTimeMin(args.content);
    const searchText = buildSearchText(args.title, args.excerpt, args.content);
    let publishedAt: number | undefined;
    if (args.status === "published") {
      publishedAt = now;
    } else if (
      args.status === "scheduled" &&
      args.scheduledFor &&
      args.scheduledFor <= now
    ) {
      publishedAt = args.scheduledFor;
    }
    const id = await ctx.db.insert("posts", {
      title: args.title.trim(),
      slug,
      content: args.content,
      excerpt: args.excerpt.trim(),
      searchText,
      coverImage: args.coverImage,
      authorId,
      categoryId: args.categoryId,
      tags: args.tags.map((t) => t.trim()).filter(Boolean),
      status: args.status,
      publishedAt,
      scheduledFor: args.scheduledFor,
      views: 0,
      isPinned: args.isPinned ?? false,
      readingTime: rt,
      metaTitle: args.metaTitle,
      metaDescription: args.metaDescription,
      createdAt: now,
      updatedAt: now,
      newsletterSentAt: undefined,
    });
    return id;
  },
});

export const updatePost = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.id("_storage")),
    categoryId: v.optional(v.id("categories")),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("scheduled"),
      ),
    ),
    scheduledFor: v.optional(v.number()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    markNewsletterSent: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...args }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Not found");
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) {
      patch.title = args.title.trim();
    }
    if (args.slug !== undefined) {
      const s = args.slug.trim().toLowerCase();
      if (s !== existing.slug) {
        const dup = await ctx.db
          .query("posts")
          .withIndex("by_slug", (q) => q.eq("slug", s))
          .unique();
        if (dup) {
          throw new Error("Slug already exists");
        }
      }
      patch.slug = s;
    }
    if (args.content !== undefined) {
      patch.content = args.content;
      patch.readingTime = readingTimeMin(args.content);
    }
    if (args.excerpt !== undefined) {
      patch.excerpt = args.excerpt.trim();
    }
    if (args.coverImage !== undefined) {
      patch.coverImage = args.coverImage;
    }
    if (args.categoryId !== undefined) {
      patch.categoryId = args.categoryId;
    }
    if (args.tags !== undefined) {
      patch.tags = args.tags.map((t) => t.trim()).filter(Boolean);
    }
    if (args.status !== undefined) {
      patch.status = args.status;
      if (args.status === "published" && !existing.publishedAt) {
        patch.publishedAt = Date.now();
      }
    }
    if (args.scheduledFor !== undefined) {
      patch.scheduledFor = args.scheduledFor;
    }
    if (args.metaTitle !== undefined) {
      patch.metaTitle = args.metaTitle;
    }
    if (args.metaDescription !== undefined) {
      patch.metaDescription = args.metaDescription;
    }
    if (args.isPinned !== undefined) {
      patch.isPinned = args.isPinned;
    }
    if (args.markNewsletterSent) {
      patch.newsletterSentAt = Date.now();
    }
    const title =
      (patch.title as string | undefined) ?? existing.title;
    const excerpt =
      (patch.excerpt as string | undefined) ?? existing.excerpt;
    const content =
      (patch.content as string | undefined) ?? existing.content;
    patch.searchText = buildSearchText(title, excerpt, content);
    await ctx.db.patch(id, patch);
    return null;
  },
});

export const deletePost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return null;
  },
});

export const bulkDelete = mutation({
  args: { ids: v.array(v.id("posts")) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx);
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return null;
  },
});

export const recordView = mutation({
  args: {
    postId: v.id("posts"),
    visitorId: v.string(),
  },
  handler: async (ctx, { postId, visitorId }) => {
    const existing = await ctx.db
      .query("views")
      .withIndex("by_post_visitor", (q) =>
        q.eq("postId", postId).eq("visitorId", visitorId),
      )
      .unique();
    if (existing) {
      return null;
    }
    await ctx.db.insert("views", {
      postId,
      visitorId,
      viewedAt: Date.now(),
    });
    const post = await ctx.db.get(postId);
    if (post) {
      await ctx.db.patch(postId, { views: post.views + 1 });
    }
    return null;
  },
});

export const trending = query({
  args: {},
  handler: async (ctx) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const views = await ctx.db.query("views").order("desc").take(500);
    const recent = views.filter((v) => v.viewedAt >= weekAgo);
    const counts = new Map<Id<"posts">, number>();
    for (const vi of recent) {
      counts.set(vi.postId, (counts.get(vi.postId) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const result = [];
    for (const [postId] of sorted.slice(0, 8)) {
      const p = await ctx.db.get(postId);
      if (p && p.status === "published") {
        result.push(p);
      }
    }
    return Promise.all(
      result.map(async (p) => ({
        ...p,
        coverUrl: p.coverImage
          ? await ctx.storage.getUrl(p.coverImage)
          : null,
      })),
    );
  },
});
