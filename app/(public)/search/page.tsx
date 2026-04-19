"use client";

import { useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const results = useQuery(
    api.posts.searchPosts,
    q.trim().length >= 2 ? { q } : "skip",
  ) as Doc<"posts">[] | undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-white">Search</h1>
      <p className="mt-2 text-zinc-400">Full-text across published posts.</p>
      <div className="mt-6 flex gap-2">
        <Input
          placeholder="Try &quot;defi&quot;, &quot;liquidity&quot;…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border-zinc-700 bg-[#111827] text-zinc-100"
        />
        <Button type="button" variant="outline" className="border-zinc-600">
          Clear
        </Button>
      </div>
      <ul className="mt-8 space-y-4">
        {(results ?? []).map((p) => (
          <li key={p._id}>
            <Link
              href={`/blog/${p.slug}`}
              className="text-lg font-medium text-zinc-100 hover:text-[#F5A623]"
            >
              {p.title}
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
              {p.excerpt}
            </p>
          </li>
        ))}
      </ul>
      {q.trim().length >= 2 && results && results.length === 0 ? (
        <p className="mt-8 text-zinc-500">No matches.</p>
      ) : null}
    </div>
  );
}
