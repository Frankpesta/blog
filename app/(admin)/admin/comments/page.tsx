"use client";

import { usePathname } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { MessageSquare } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useConvexSessionReady } from "@/hooks/useConvexSessionReady";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { CommentListSkeleton } from "@/components/admin/admin-skeletons";
import { adminPageMeta } from "@/lib/admin-routes";

export default function AdminCommentsPage() {
  const pathname = usePathname();
  const { title, description } = adminPageMeta(pathname);
  const sessionReady = useConvexSessionReady();
  const rows = useQuery(
    api.comments.listAllForAdmin,
    sessionReady ? { limit: 100 } : "skip",
  );
  const moderate = useMutation(api.comments.moderate);

  const loading = !sessionReady || rows === undefined;
  const empty = sessionReady && rows !== undefined && rows.length === 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader title={title} description={description} />

      {loading ? (
        <CommentListSkeleton count={5} />
      ) : empty ? (
        <AdminEmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="When readers leave feedback on posts, they show up here for moderation."
        />
      ) : (
        <div className="space-y-3">
          {rows!.map((c) => (
            <div
              key={c._id}
              className="rounded-xl border border-white/10 bg-[#111827]/90 p-4 text-sm shadow-sm ring-1 ring-white/[0.04] transition-colors hover:bg-[#111827]"
            >
              <p className="leading-relaxed text-zinc-300">{c.content}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-600"
                  onClick={() => void moderate({ id: c._id, action: "approve" })}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-600"
                  onClick={() => void moderate({ id: c._id, action: "hide" })}
                >
                  Hide
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => void moderate({ id: c._id, action: "delete" })}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
