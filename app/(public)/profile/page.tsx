"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/blog/PostCard";
import type { Doc } from "@/convex/_generated/dataModel";

export default function ProfilePage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => !s.isLoading);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const updateProfile = useMutation(api.users.updateProfile);
  const bookmarks = useQuery(api.users.getBookmarkedPosts);
  const comments = useQuery(api.comments.listMine);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
    if (user) {
      setName(user.name);
      setBio(user.bio ?? "");
    }
  }, [user, hydrated, router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, bio });
      await hydrate();
      toast.success("Profile saved");
    } finally {
      setSaving(false);
    }
  }

  if (!hydrated || !user) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-[#F5A623]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-heading text-4xl font-bold text-white">Profile</h1>
      <Tabs defaultValue="profile" className="mt-8">
        <TabsList className="border border-white/10 bg-[#111827]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="comments">My comments</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6 space-y-6">
          <form onSubmit={saveProfile} className="space-y-4 rounded-xl border border-white/10 bg-[#111827] p-6">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 border-zinc-700 bg-[#0A0F1E]"
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="mt-1 border-zinc-700 bg-[#0A0F1E]"
              />
            </div>
            <Button type="submit" disabled={saving} className="bg-[#F5A623] text-black">
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="bookmarks" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {(bookmarks ?? []).map((p: Doc<"posts"> & { coverUrl?: string | null }) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
          {!bookmarks?.length ? (
            <p className="text-zinc-500">No bookmarks yet.</p>
          ) : null}
        </TabsContent>
        <TabsContent value="comments" className="mt-6 space-y-3">
          {(comments ?? []).map((c) => (
            <div key={c._id} className="rounded-lg border border-white/10 bg-[#111827] p-4 text-sm">
              <p className="text-zinc-300">{c.content}</p>
              {c.postSlug ? (
                <Link
                  href={`/blog/${c.postSlug}`}
                  className="mt-2 inline-block text-xs text-[#F5A623]"
                >
                  View post
                </Link>
              ) : null}
            </div>
          ))}
          {!comments?.length ? (
            <p className="text-zinc-500">No comments yet.</p>
          ) : null}
        </TabsContent>
        <TabsContent value="security">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      if (!res.ok) {
        toast.error("Could not update password");
        return;
      }
      toast.success("Password updated");
      setCurrent("");
      setNext("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-md space-y-4 rounded-xl border border-white/10 bg-[#111827] p-6">
      <div>
        <Label>Current password</Label>
        <Input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="mt-1 border-zinc-700 bg-[#0A0F1E]"
          required
        />
      </div>
      <div>
        <Label>New password</Label>
        <Input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="mt-1 border-zinc-700 bg-[#0A0F1E]"
          required
          minLength={8}
        />
      </div>
      <Button type="submit" disabled={busy} className="bg-[#F5A623] text-black">
        {busy ? <Loader2 className="size-4 animate-spin" /> : "Update"}
      </Button>
    </form>
  );
}
