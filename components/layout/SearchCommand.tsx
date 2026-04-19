"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useUIStore } from "@/stores/useUIStore";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

export function SearchCommand() {
  const open = useUIStore((s) => s.isSearchOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const [q, setQ] = useState("");
  const router = useRouter();
  const results = useQuery(
    api.posts.searchPosts,
    q.trim().length >= 2 ? { q } : "skip",
  ) as Doc<"posts">[] | undefined;

  useEffect(() => {
    if (!open) {
      setQ("");
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={setSearchOpen}>
      <CommandInput
        placeholder="Search articles…"
        value={q}
        onValueChange={setQ}
      />
      <CommandList>
        <CommandEmpty>
          {q.trim().length < 2 ? "Type at least 2 characters." : "No results."}
        </CommandEmpty>
        {results && results.length > 0 ? (
          <CommandGroup heading="Posts">
            {results.map((post) => (
              <CommandItem
                key={post._id}
                onSelect={() => {
                  router.push(`/blog/${post.slug}`);
                  setSearchOpen(false);
                }}
              >
                {post.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
