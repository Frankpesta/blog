"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
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
import { useAdminStore } from "@/stores/useAdminStore";

export default function AdminPostsPage() {
  const filter = useAdminStore((s) => s.postStatusFilter);
  const posts = useQuery(api.posts.listForAdmin, {
    status: filter === "all" ? undefined : filter,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold text-white">Posts</h1>
        <Button asChild className="bg-[#F5A623] text-black">
          <Link href="/admin/posts/new">New post</Link>
        </Button>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#111827]">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-700 hover:bg-transparent">
              <TableHead className="text-zinc-300">Title</TableHead>
              <TableHead className="text-zinc-300">Status</TableHead>
              <TableHead className="text-zinc-300">Views</TableHead>
              <TableHead className="text-zinc-300">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(posts ?? []).map((p) => (
              <TableRow key={p._id} className="border-zinc-800">
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
                <TableCell className="text-zinc-500 text-sm">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {!posts?.length ? (
        <p className="text-zinc-500">
          No posts yet. Seed categories in Convex or create from New post (editor Tiptap scaffold next).
        </p>
      ) : null}
    </div>
  );
}
