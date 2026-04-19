import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    createdAt: v.number(),
    isVerified: v.boolean(),
    bookmarks: v.array(v.id("posts")),
  }).index("by_email", ["email"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.string(),
  }).index("by_slug", ["slug"]),

  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    searchText: v.string(),
    coverImage: v.optional(v.id("_storage")),
    authorId: v.id("users"),
    categoryId: v.id("categories"),
    tags: v.array(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("scheduled"),
    ),
    publishedAt: v.optional(v.number()),
    scheduledFor: v.optional(v.number()),
    views: v.number(),
    isPinned: v.boolean(),
    readingTime: v.number(),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    newsletterSentAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["authorId"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["status"])
    .index("by_published", ["publishedAt"])
    .searchIndex("search_posts", {
      searchField: "searchText",
      filterFields: ["status", "categoryId"],
    }),

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    parentId: v.optional(v.id("comments")),
    content: v.string(),
    isApproved: v.boolean(),
    isHidden: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"]),

  reactions: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    type: v.union(
      v.literal("like"),
      v.literal("love"),
      v.literal("fire"),
      v.literal("rocket"),
    ),
  }).index("by_post_user", ["postId", "userId"]),

  subscribers: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
    isActive: v.boolean(),
    source: v.optional(v.string()),
    unsubscribeToken: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_unsubscribe_token", ["unsubscribeToken"]),

  views: defineTable({
    postId: v.id("posts"),
    visitorId: v.string(),
    viewedAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_post_visitor", ["postId", "visitorId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    link: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
