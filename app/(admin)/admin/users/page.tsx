"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useConvexSessionReady } from "@/hooks/useConvexSessionReady";

export default function AdminUsersPage() {
  const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth();
  const sessionReady = useConvexSessionReady();
  /** Avoid firing before Convex `setAuth` finishes — first unauthenticated result was sticky on this page. */
  const result = useQuery(
    api.users.listForAdmin,
    sessionReady ? { limit: 200 } : "skip",
  );
  const setRole = useMutation(api.users.setRole);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function changeRole(
    userId: Id<"users">,
    role: "admin" | "user",
    label: string,
  ) {
    setPendingId(userId);
    try {
      await setRole({ userId, role });
      toast.success(
        role === "admin"
          ? "User is now an admin. They may need to refresh or re-open the app to access /admin."
          : "Admin access removed for that user.",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `${label} failed`);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Users</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Admins can publish and manage posts. Promote trusted accounts so they can use the admin
          area; they should use the same site URL you configured for{" "}
          <code className="text-[#F5A623]">SITE_URL</code> so their session matches Convex auth.
        </p>
      </div>

      {convexAuthLoading ? (
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 className="size-5 animate-spin" />
          Connecting session…
        </div>
      ) : !isAuthenticated ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/95">
          <p className="font-medium text-amber-50">Convex doesn’t see a logged-in session.</p>
          <p className="mt-2 text-amber-100/80">
            Ensure <code className="text-amber-200">SITE_URL</code> matches your browser origin on both Vercel and Convex;
            use <code className="text-amber-200">CONVEX_AUTH_JWKS_DATA_URI</code> from{" "}
            <code className="text-amber-200">npm run convex:jwks-uri</code> if JWKS isn’t public. Add matching origins to{" "}
            <code className="text-amber-200">JWT_EXTRA_ISSUERS</code> if you use www and apex. Hard refresh, sign out, sign in.
          </p>
          <Button asChild className="mt-4 bg-[#F5A623] text-black hover:bg-[#e69b1f]">
            <Link href="/login">Go to login</Link>
          </Button>
        </div>
      ) : result === undefined ? (
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 className="size-5 animate-spin" />
          Loading users…
        </div>
      ) : !result.ok ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/95">
          {result.reason === "not_authenticated" ? (
            <>
              <p className="font-medium text-amber-50">Convex doesn’t see a logged-in session.</p>
              <p className="mt-2 text-amber-100/80">
                Ensure <code className="text-amber-200">SITE_URL</code> matches your browser origin on both Vercel and
                Convex; use <code className="text-amber-200">CONVEX_AUTH_JWKS_DATA_URI</code> from{" "}
                <code className="text-amber-200">npm run convex:jwks-uri</code> if JWKS isn’t public. Hard refresh, sign out,
                sign in.
              </p>
              <Button asChild className="mt-4 bg-[#F5A623] text-black hover:bg-[#e69b1f]">
                <Link href="/login">Go to login</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium text-amber-50">Convex doesn’t treat this account as an admin.</p>
              <p className="mt-2 text-amber-100/80">
                Next.js may still let you open <code className="text-amber-200">/admin</code> from your database role,
                but Convex functions read your JWT + DB user from{" "}
                <code className="text-amber-200">ctx.auth</code>. Fix by aligning{" "}
                <code className="text-amber-200">SITE_URL</code> in{" "}
                <code className="text-amber-200">.env.local</code> with{" "}
                <code className="text-amber-200">convex/auth.config.ts</code> (same origin as the URL in the browser), restart{" "}
                <code className="text-amber-200">npx convex dev</code>, then hard-refresh and log in again so new admins sync.
              </p>
            </>
          )}
        </div>
      ) : result.users.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-zinc-400">
          No users in the database yet. When people register, they appear here.
        </p>
      ) : (
        <div className="space-y-2">
          {result.users.map((u) => {
            const busy = pendingId === u._id;
            return (
              <div
                key={u._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#111827] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-zinc-100">{u.name}</p>
                  <p className="text-sm text-zinc-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
                      u.role === "admin"
                        ? "bg-[#F5A623]/15 text-[#F5A623]"
                        : "bg-zinc-700/50 text-zinc-400",
                    )}
                  >
                    {u.role}
                  </span>
                  {u.role === "user" ? (
                    <Button
                      size="sm"
                      className="inline-flex items-center gap-1.5 bg-[#F5A623] text-black hover:bg-[#e69b1f]"
                      disabled={busy}
                      onClick={() =>
                        void changeRole(u._id, "admin", "Promote")
                      }
                    >
                      {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                      Make admin
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="inline-flex items-center gap-1.5 border-zinc-600"
                      disabled={busy}
                      onClick={() =>
                        void changeRole(u._id, "user", "Demote")
                      }
                    >
                      {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                      Revoke admin
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
