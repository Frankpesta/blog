import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { DocumentByName, WithoutSystemFields } from "convex/server";
import type { DataModel } from "./_generated/dataModel";

type UserProfile = WithoutSystemFields<DocumentByName<DataModel, "users">> & {
  email: string;
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params): UserProfile {
        const email = String(params.email ?? "")
          .toLowerCase()
          .trim();
        const flow = params.flow as string | undefined;
        if (flow === "signUp") {
          const name = String(params.name ?? "").trim();
          return {
            email,
            name,
            role: "user",
            bookmarks: [],
            createdAt: Date.now(),
            isVerified: false,
          };
        }
        return { email };
      },
    }),
  ],
});
