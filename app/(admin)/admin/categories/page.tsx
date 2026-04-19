"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminCategoriesPage() {
  const list = useQuery(api.categories.listForAdmin);
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

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-bold text-white">Categories</h1>
      <form onSubmit={onCreate} className="max-w-md space-y-3 rounded-xl border border-white/10 bg-[#111827] p-6">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 border-zinc-700 bg-[#0A0F1E]" />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" className="mt-1 border-zinc-700 bg-[#0A0F1E]" />
        </div>
        <Button type="submit" className="bg-[#F5A623] text-black">Create</Button>
      </form>
      <ul className="space-y-2">
        {(list ?? []).map((c) => (
          <li key={c._id} className="rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-zinc-300">
            <span className="mr-2">{c.icon}</span>
            {c.name}{" "}
            <span className="text-zinc-500">/{c.slug}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
