import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** App profile fields merged onto Convex Auth `users` (see labs.convex.dev/auth/setup/schema). */
const applicationUserFields = {
  role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  bio: v.optional(v.string()),
  /** Prefer over `image` when set (legacy blog field). */
  avatarUrl: v.optional(v.string()),
  bookmarks: v.optional(v.array(v.id("posts"))),
  createdAt: v.optional(v.number()),
  isVerified: v.optional(v.boolean()),
  /** Legacy bcrypt — unused after Convex Auth migration; optional for old rows. */
  passwordHash: v.optional(v.string()),
};

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    ...applicationUserFields,
  }).index("email", ["email"]),

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
