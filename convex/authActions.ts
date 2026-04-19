"use node";

import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

type Ok = {
  userId: Id<"users">;
  email: string;
  name: string;
  role: "admin" | "user";
};

export const validateCredentials = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }): Promise<Ok | null> => {
    const user = await ctx.runQuery(internal.users.getByEmailInternal, {
      email: email.toLowerCase().trim(),
    });
    if (!user) {
      return null;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return null;
    }
    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});
