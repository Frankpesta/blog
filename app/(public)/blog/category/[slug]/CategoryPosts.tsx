"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "@/components/blog/PostCard";
import type { Doc } from "@/convex/_generated/dataModel";

export function CategoryPosts() {
  const slug = useParams().slug as string;
  const cat = useQuery(api.categories.getBySlug, { slug });
  const posts = useQuery(
    api.posts.listByCategory,
    cat ? { categoryId: cat._id } : "skip",
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {cat ? (
        <>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{cat.icon}</span>
            <div>
              <h1 className="font-heading text-4xl font-bold text-white">
                {cat.name}
              </h1>
              {cat.description ? (
                <p className="mt-2 max-w-2xl text-zinc-400">{cat.description}</p>
              ) : null}
            </div>
          </div>
          <div
            className="mt-4 h-1 max-w-xs rounded-full"
            style={{ backgroundColor: cat.color }}
          />
        </>
      ) : (
        <h1 className="font-heading text-4xl font-bold text-white">Category</h1>
      )}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {((posts ?? []) as Array<Doc<"posts"> & { coverUrl?: string | null }>).map(
          (p) => (
            <PostCard key={p._id} post={p} categoryLabel={cat?.name} />
          ),
        )}
      </div>
    </div>
  );
}
