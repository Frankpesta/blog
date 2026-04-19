"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "@/components/blog/PostCard";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import type { Doc } from "@/convex/_generated/dataModel";

export function BlogIndexClient() {
  const cat = useQuery(api.categories.list);
  const { results, status, loadMore } = usePaginatedQuery(
    api.posts.listPublished,
    {},
    { initialNumItems: 12 },
  );
  const cats = (cat ?? []) as Doc<"categories">[];
  const catMap = Object.fromEntries(cats.map((c) => [c._id, c.name]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-white">Blog</h1>
      <p className="mt-2 text-zinc-400">All published research and guides.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            categoryLabel={catMap[post.categoryId]}
          />
        ))}
      </div>
      {status === "CanLoadMore" ? (
        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="border-zinc-600"
            onClick={() => loadMore(12)}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
