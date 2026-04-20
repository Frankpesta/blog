"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { FolderTree } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConvexSessionReady } from "@/hooks/useConvexSessionReady";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import {
  CategoryFormSkeleton,
  CategoryListSkeleton,
} from "@/components/admin/admin-skeletons";
import { adminPageMeta } from "@/lib/admin-routes";

export default function AdminCategoriesPage() {
  const pathname = usePathname();
  const { title, description } = adminPageMeta(pathname);
  const sessionReady = useConvexSessionReady();
  const list = useQuery(
    api.categories.listForAdmin,
    sessionReady ? {} : "skip",
  );
  const create = useMutation(api.categories.create);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        color: "#F5A623",
        icon: "📁",
      });
      toast.success("Category created");
      setName("");
      setSlug("");
    } catch {
      toast.error("Could not create");
    }
  }

  const loading = !sessionReady || list === undefined;
  const empty = sessionReady && list !== undefined && list.length === 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader title={title} description={description} />

      {loading ? (
        <div className="space-y-8">
          <CategoryFormSkeleton />
          <CategoryListSkeleton />
        </div>
      ) : (
        <>
          <form
            onSubmit={onCreate}
            className="max-w-md space-y-4 rounded-xl border border-white/10 bg-[#111827]/90 p-6 shadow-lg shadow-black/15 ring-1 ring-white/[0.05]"
          >
            <div>
              <Label className="text-zinc-300">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5 border-zinc-700 bg-[#0A0F1E]"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto from name"
                className="mt-1.5 border-zinc-700 bg-[#0A0F1E]"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#F5A623] text-black shadow-md shadow-[#F5A623]/15 hover:bg-[#e69b1f]"
            >
              Create category
            </Button>
          </form>

          {empty ? (
            <AdminEmptyState
              icon={FolderTree}
              title="No categories yet"
              description="Add a name and slug above so you can tag posts and help readers browse by topic."
            />
          ) : (
            <ul className="space-y-2">
              {list!.map((c) => (
                <li
                  key={c._id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111827]/90 px-4 py-3 text-zinc-300 shadow-sm ring-1 ring-white/[0.04]"
                >
                  <span className="text-lg" aria-hidden>
                    {c.icon}
                  </span>
                  <span className="font-medium text-zinc-100">{c.name}</span>
                  <span className="text-zinc-500">/{c.slug}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
