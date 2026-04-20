"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useConvexSessionReady } from "@/hooks/useConvexSessionReady";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { UserListSkeleton } from "@/components/admin/admin-skeletons";
import { adminPageMeta } from "@/lib/admin-routes";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  const pathname = usePathname();
  const { title, description } = adminPageMeta(pathname);
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
    <div className="space-y-8">
      <AdminPageHeader title={title} description={description} />

      <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
        Admins can publish and manage posts. Sign-in uses Convex Auth. If roles look wrong, confirm{" "}
        <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[#F5A623]">CONVEX_SITE_URL</code>{" "}
        on your deployment matches the origin people use in the browser.
      </p>

      {convexAuthLoading ? (
        <UserListSkeleton count={3} />
      ) : !isAuthenticated ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/95">
          <p className="font-medium text-amber-50">Convex doesn’t see a logged-in session.</p>
          <p className="mt-2 text-amber-100/80">
            Sign in again, or check that <code className="text-amber-200">CONVEX_SITE_URL</code> in the Convex dashboard
            matches the exact origin you use in the browser. Hard refresh after env changes.
          </p>
          <Button asChild className="mt-4 bg-[#F5A623] text-black hover:bg-[#e69b1f]">
            <Link href="/login">Go to login</Link>
          </Button>
        </div>
      ) : result === undefined ? (
        <UserListSkeleton count={6} />
      ) : !result.ok ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/95">
          {result.reason === "not_authenticated" ? (
            <>
              <p className="font-medium text-amber-50">Convex doesn’t see a logged-in session.</p>
              <p className="mt-2 text-amber-100/80">
                Try signing out and back in. If it persists, check <code className="text-amber-200">CONVEX_SITE_URL</code> in
                the Convex deployment and that you are not mixing www and non-www without updating that value.
              </p>
              <Button asChild className="mt-4 bg-[#F5A623] text-black hover:bg-[#e69b1f]">
                <Link href="/login">Go to login</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium text-amber-50">Convex doesn’t treat this account as an admin.</p>
              <p className="mt-2 text-amber-100/80">
                Middleware lets you through because your Convex profile has{" "}
                <code className="text-amber-200">role: &quot;admin&quot;</code>, but this query could not confirm admin. Sign
                out and in, or have another admin verify your account in the database.
              </p>
            </>
          )}
        </div>
      ) : result.users.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No users yet"
          description="When people register, they appear here so you can promote admins or review accounts."
        />
      ) : (
        <div className="space-y-2">
          {result.users.map((u) => {
            const busy = pendingId === u._id;
            return (
              <div
                key={u._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#111827]/90 px-4 py-3 shadow-sm ring-1 ring-white/[0.04] transition-colors hover:bg-[#111827]"
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
