import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type ReadCtx = QueryCtx | MutationCtx;

export async function getUserId(
  ctx: ReadCtx,
): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx);
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

function effectiveRole(user: { role?: "admin" | "user" } | null): "admin" | "user" {
  return user?.role ?? "user";
}

export async function requireAdmin(
  ctx: MutationCtx,
): Promise<Id<"users">> {
  const userId = await requireUser(ctx);
  const user = await ctx.db.get(userId);
  if (!user || effectiveRole(user) !== "admin") {
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
  if (!user || effectiveRole(user) !== "admin") {
    throw new Error("Forbidden");
  }
  return userId;
}
