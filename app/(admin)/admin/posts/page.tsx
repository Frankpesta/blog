"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminStore } from "@/stores/useAdminStore";
import { toast } from "sonner";
import { useConvexSessionReady } from "@/hooks/useConvexSessionReady";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { TableSkeleton } from "@/components/admin/admin-skeletons";
import { adminPageMeta } from "@/lib/admin-routes";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const filters: { id: "all" | "draft" | "published" | "scheduled"; label: string }[] =
  [
    { id: "all", label: "All" },
    { id: "draft", label: "Draft" },
    { id: "published", label: "Published" },
    { id: "scheduled", label: "Scheduled" },
  ];

export default function AdminPostsPage() {
  const pathname = usePathname();
  const { title, description } = adminPageMeta(pathname);
  const sessionReady = useConvexSessionReady();
  const filter = useAdminStore((s) => s.postStatusFilter);
  const setPostStatusFilter = useAdminStore((s) => s.setPostStatusFilter);
  const posts = useQuery(
    api.posts.listForAdmin,
    sessionReady
      ? {
          status: filter === "all" ? undefined : filter,
          limit: 100,
        }
      : "skip",
  );
  const bulkDelete = useMutation(api.posts.bulkDelete);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected =
    Boolean(posts?.length) && selected.size === (posts?.length ?? 0);
  const someSelected = selected.size > 0 && !allSelected;

  function toggleRow(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    if (!posts?.length) {
      return;
    }
    if (checked) {
      setSelected(new Set(posts.map((p) => p._id)));
    } else {
      setSelected(new Set());
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) {
      return;
    }
    const ok = window.confirm(
      `Delete ${selected.size} post(s)? This cannot be undone.`,
    );
    if (!ok) {
      return;
    }
    try {
      await bulkDelete({
        ids: [...selected] as Id<"posts">[],
      });
      toast.success(`Deleted ${selected.size} post(s)`);
      setSelected(new Set());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const selectedCount = selected.size;

  const headerCheckboxState = useMemo(() => {
    if (allSelected) {
      return true;
    }
    if (someSelected) {
      return "indeterminate" as const;
    }
    return false;
  }, [allSelected, someSelected]);

  const loading = !sessionReady || posts === undefined;
  const empty = sessionReady && posts !== undefined && posts.length === 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <>
            {selectedCount > 0 ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => void handleBulkDelete()}
              >
                Delete ({selectedCount})
              </Button>
            ) : null}
            <Button
              asChild
              className="bg-[#F5A623] text-black shadow-md shadow-[#F5A623]/15 hover:bg-[#e69b1f]"
            >
              <Link href="/admin/posts/new">New post</Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#111827]/60 p-1 ring-1 ring-white/[0.04]">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPostStatusFilter(id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === id
                ? "bg-[#F5A623]/20 text-[#F5A623] shadow-sm"
                : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : empty ? (
        <AdminEmptyState
          icon={FileText}
          title="No posts yet"
          description="Create your first post or add categories so drafts have somewhere to live."
        >
          <Button asChild className="bg-[#F5A623] text-black hover:bg-[#e69b1f]">
            <Link href="/admin/posts/new">Create post</Link>
          </Button>
        </AdminEmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#111827]/80 shadow-lg shadow-black/20 ring-1 ring-white/[0.05]">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-700/80 hover:bg-transparent">
                <TableHead className="w-10 text-zinc-400">
                  <Checkbox
                    checked={headerCheckboxState}
                    onCheckedChange={(v) =>
                      toggleAll(v === true || v === "indeterminate")
                    }
                    aria-label="Select all posts"
                  />
                </TableHead>
                <TableHead className="text-zinc-400">Title</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Views</TableHead>
                <TableHead className="text-zinc-400">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts!.map((p) => (
                <TableRow
                  key={p._id}
                  className="border-zinc-800/80 transition-colors hover:bg-white/[0.03]"
                >
                  <TableCell className="align-middle">
                    <Checkbox
                      checked={selected.has(p._id)}
                      onCheckedChange={(v) => toggleRow(p._id, v === true)}
                      aria-label={`Select ${p.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/posts/${p._id}/edit`}
                      className="font-medium text-[#F5A623] hover:underline"
                    >
                      {p.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-zinc-400">{p.status}</TableCell>
                  <TableCell className="tabular-nums text-zinc-400">
                    {p.views}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
