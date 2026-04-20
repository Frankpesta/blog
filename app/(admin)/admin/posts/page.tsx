"use client";

import Link from "next/link";
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

export default function AdminPostsPage() {
  const filter = useAdminStore((s) => s.postStatusFilter);
  const posts = useQuery(api.posts.listForAdmin, {
    status: filter === "all" ? undefined : filter,
    limit: 100,
  });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold text-white">Posts</h1>
        <div className="flex flex-wrap items-center gap-2">
          {selectedCount > 0 ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => void handleBulkDelete()}
            >
              Delete selected ({selectedCount})
            </Button>
          ) : null}
          <Button asChild className="bg-[#F5A623] text-black hover:bg-[#e69b1f]">
            <Link href="/admin/posts/new">New post</Link>
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#111827]">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-700 hover:bg-transparent">
              <TableHead className="w-10 text-zinc-300">
                <Checkbox
                  checked={headerCheckboxState}
                  onCheckedChange={(v) =>
                    toggleAll(v === true || v === "indeterminate")
                  }
                  aria-label="Select all posts"
                />
              </TableHead>
              <TableHead className="text-zinc-300">Title</TableHead>
              <TableHead className="text-zinc-300">Status</TableHead>
              <TableHead className="text-zinc-300">Views</TableHead>
              <TableHead className="text-zinc-300">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(posts ?? []).map((p) => (
              <TableRow key={p._id} className="border-zinc-800">
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
                <TableCell className="text-zinc-400">{p.views}</TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {!posts?.length ? (
        <p className="text-zinc-500">
          No posts yet. Seed categories in Convex or create a new post.
        </p>
      ) : null}
    </div>
  );
}
