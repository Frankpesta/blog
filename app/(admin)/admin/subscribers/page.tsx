"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { Download, Mail } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useConvexSessionReady } from "@/hooks/useConvexSessionReady";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { SubscriberListSkeleton } from "@/components/admin/admin-skeletons";
import { adminPageMeta } from "@/lib/admin-routes";

export default function AdminSubscribersPage() {
  const pathname = usePathname();
  const { title, description } = adminPageMeta(pathname);
  const sessionReady = useConvexSessionReady();
  const subs = useQuery(
    api.subscribers.listForAdmin,
    sessionReady ? { limit: 500 } : "skip",
  );

  function downloadCsv() {
    const lines = [["email", "subscribedAt", "isActive"].join(",")];
    for (const s of subs ?? []) {
      lines.push(
        [
          `"${s.email.replace(/"/g, '""')}"`,
          s.subscribedAt,
          s.isActive ? "yes" : "no",
        ].join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "subscribers.csv";
    a.click();
  }

  const loading = !sessionReady || subs === undefined;
  const empty = sessionReady && subs !== undefined && subs.length === 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="gap-2 border border-white/10 bg-white/[0.06] text-zinc-100 hover:bg-white/[0.1]"
            disabled={loading || empty}
            onClick={downloadCsv}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      {loading ? (
        <SubscriberListSkeleton count={10} />
      ) : empty ? (
        <AdminEmptyState
          icon={Mail}
          title="No subscribers yet"
          description="When visitors subscribe to updates, their emails appear here. Export to CSV anytime."
        />
      ) : (
        <ul className="divide-y divide-zinc-800/80 overflow-hidden rounded-xl border border-white/10 bg-[#111827]/90 shadow-lg shadow-black/20 ring-1 ring-white/[0.05]">
          {subs!.map((s) => (
            <li
              key={s._id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 text-sm transition-colors hover:bg-white/[0.03]"
            >
              <span className="min-w-0 truncate text-zinc-200">{s.email}</span>
              <span
                className={
                  s.isActive
                    ? "shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400"
                    : "shrink-0 rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs font-medium text-zinc-500"
                }
              >
                {s.isActive ? "active" : "inactive"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
