import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type ReadCtx = QueryCtx | MutationCtx;

export async function getUserId(
  ctx: ReadCtx,
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject as Id<"users">;
}

export async function requireUser(
  ctx: ReadCtx,
): Promise<Id<"users">> {
  const userId = await getUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function requireAdmin(
  ctx: MutationCtx,
): Promise<Id<"users">> {
  const userId = await requireUser(ctx);
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return userId;
}

export async function requireAdminQuery(
  ctx: QueryCtx,
): Promise<Id<"users">> {
  const userId = await getUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return userId;
}
