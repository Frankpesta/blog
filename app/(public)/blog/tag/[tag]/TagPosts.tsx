"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "@/components/blog/PostCard";
import type { Doc } from "@/convex/_generated/dataModel";

export function TagPosts() {
  const raw = useParams().tag as string;
  const tag = decodeURIComponent(raw);
  const posts = useQuery(api.posts.listByTag, { tag });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-4xl font-bold text-white">
        #{tag}
      </h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {((posts ?? []) as Array<Doc<"posts"> & { coverUrl?: string | null }>).map(
          (p) => (
            <PostCard key={p._id} post={p} />
          ),
        )}
      </div>
    </div>
  );
}
