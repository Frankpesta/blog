import { query } from "./_generated/server";
import { requireAdminQuery } from "./lib/auth";

export const adminDashboard = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminQuery(ctx);
    const posts = await ctx.db.query("posts").take(2000);
    const subscribers = await ctx.db.query("subscribers").take(2000);
    const comments = await ctx.db.query("comments").take(2000);
    let totalViews = 0;
    for (const p of posts) {
      totalViews += p.views;
    }
    const pendingComments = comments.filter(
      (c) => !c.isApproved && !c.isHidden,
    ).length;
    return {
      totalPosts: posts.length,
      totalViews,
      totalSubscribers: subscribers.filter((s) => s.isActive).length,
      pendingComments,
    };
  },
});
