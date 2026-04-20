"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PostEditor, PostPreviewHtml } from "@/components/admin/PostEditor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/slug";

function stripHtmlWordCount(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").trim();
  return Math.max(
    0,
    text.split(/\s+/).filter((w) => w.replace(/\W/g, "").length > 0).length,
  );
}

export function PostForm({
  postId: initialPostId,
}: {
  postId?: Id<"posts"> | null;
}) {
  const router = useRouter();
  const convex = useConvex();
  const categories = useQuery(api.categories.listForAdmin);
  const existing = useQuery(
    api.posts.getByIdForEditor,
    initialPostId ? { id: initialPostId } : "skip",
  );

  const createPost = useMutation(api.posts.createPost);
  const updatePost = useMutation(api.posts.updatePost);
  const deletePost = useMutation(api.posts.deletePost);
  const generateUploadUrl = useMutation(api.files.generatePostImageUploadUrl);

  const [postId, setPostId] = useState<Id<"posts"> | null>(
    initialPostId ?? null,
  );
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const slugManual = useRef(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tagsStr, setTagsStr] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(
    "draft",
  );
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [sendNewsletter, setSendNewsletter] = useState(false);
  const [coverStorageId, setCoverStorageId] = useState<
    Id<"_storage"> | undefined
  >(undefined);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(!initialPostId);

  useEffect(() => {
    if (!existing) {
      return;
    }
    setTitle(existing.title);
    setSlug(existing.slug);
    slugManual.current = true;
    setExcerpt(existing.excerpt);
    setContent(existing.content || "<p></p>");
    setCategoryId(existing.categoryId);
    setTagsStr(existing.tags.join(", "));
    setStatus(existing.status);
    if (existing.scheduledFor) {
      const d = new Date(existing.scheduledFor);
      const pad = (n: number) => String(n).padStart(2, "0");
      setScheduledLocal(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
      );
    }
    setMetaTitle(existing.metaTitle ?? "");
    setMetaDescription(existing.metaDescription ?? "");
    setIsPinned(existing.isPinned);
    setCoverStorageId(existing.coverImage);
    setCoverPreviewUrl(existing.coverUrl ?? null);
    setHydrated(true);
  }, [existing]);

  useEffect(() => {
    if (!title.trim() || slugManual.current) {
      return;
    }
    setSlug(slugify(title));
  }, [title]);

  const words = useMemo(() => stripHtmlWordCount(content), [content]);
  const readingMin = Math.max(1, Math.ceil(words / 200));

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const postUrl = await generateUploadUrl();
        const res = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const json = (await res.json()) as { storageId: Id<"_storage"> };
        const url = await convex.query(api.files.getStoragePublicUrl, {
          storageId: json.storageId,
        });
        return url;
      } catch {
        toast.error("Image upload failed");
        return null;
      }
    },
    [convex, generateUploadUrl],
  );

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const postUrl = await generateUploadUrl();
    const res = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const json = (await res.json()) as { storageId: Id<"_storage"> };
    setCoverStorageId(json.storageId);
    const url = await convex.query(api.files.getStoragePublicUrl, {
      storageId: json.storageId,
    });
    setCoverPreviewUrl(url);
    toast.success("Cover image uploaded");
  }

  const tags = tagsStr
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  async function persist(opts: {
    publish?: boolean;
    newsletter?: boolean;
  }) {
    if (!categoryId) {
      toast.error("Choose a category.");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    const finalSlug = slug.trim() ? slugify(slug) : slugify(title);
    if (!finalSlug) {
      toast.error("Slug is invalid.");
      return;
    }

    let scheduledFor: number | undefined;
    if (status === "scheduled" && scheduledLocal) {
      scheduledFor = new Date(scheduledLocal).getTime();
    }

    let nextStatus = status;
    if (opts.publish) {
      nextStatus = "published";
    }

    setBusy(true);
    try {
      let id = postId;
      if (!id) {
        id = await createPost({
          title,
          slug: finalSlug,
          content,
          excerpt: excerpt || title.slice(0, 160),
          coverImage: coverStorageId,
          categoryId: categoryId as Id<"categories">,
          tags,
          status: nextStatus,
          scheduledFor:
            nextStatus === "scheduled" ? scheduledFor : undefined,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          isPinned,
          sendNewsletter: opts.newsletter,
        });
        setPostId(id);
        toast.success("Post created");
        router.replace(`/admin/posts/${id}/edit`);
      } else {
        await updatePost({
          id,
          title,
          slug: finalSlug,
          content,
          excerpt,
          coverImage: coverStorageId,
          categoryId: categoryId as Id<"categories">,
          tags,
          status: nextStatus,
          scheduledFor:
            nextStatus === "scheduled" ? scheduledFor : undefined,
          metaTitle,
          metaDescription,
          isPinned,
        });
        toast.success("Post updated");
      }

      if (
        opts.newsletter &&
        nextStatus === "published" &&
        id &&
        !existing?.newsletterSentAt
      ) {
        const sendRes = await fetch("/api/newsletter/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ postId: id }),
        });
        if (sendRes.ok) {
          const data = await sendRes.json().catch(() => ({}));
          toast.success(
            typeof data === "object" &&
              data &&
              "sent" in data &&
              typeof (data as { sent: number }).sent === "number"
              ? `Newsletter sent (${(data as { sent: number }).sent})`
              : "Newsletter sent",
          );
        } else {
          const err = await sendRes.json().catch(() => ({}));
          toast.error(
            typeof err === "object" && err && "error" in err
              ? String((err as { error: string }).error)
              : "Newsletter send failed — check RESEND_API_KEY",
          );
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const autosaveRef = useRef({
    title,
    slug,
    content,
    excerpt,
    categoryId,
    tagsStr,
    status,
    scheduledLocal,
    metaTitle,
    metaDescription,
    isPinned,
    coverStorageId,
  });
  autosaveRef.current = {
    title,
    slug,
    content,
    excerpt,
    categoryId,
    tagsStr,
    status,
    scheduledLocal,
    metaTitle,
    metaDescription,
    isPinned,
    coverStorageId,
  };

  useEffect(() => {
    if (!postId || !hydrated) {
      return;
    }
    const interval = window.setInterval(() => {
      void (async () => {
        const s = autosaveRef.current;
        const tagList = s.tagsStr
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        try {
          await updatePost({
            id: postId,
            title: s.title,
            slug: slugify(s.slug || s.title),
            content: s.content,
            excerpt: s.excerpt,
            coverImage: s.coverStorageId,
            categoryId: s.categoryId as Id<"categories">,
            tags: tagList,
            status: s.status,
            scheduledFor:
              s.status === "scheduled" && s.scheduledLocal
                ? new Date(s.scheduledLocal).getTime()
                : undefined,
            metaTitle: s.metaTitle,
            metaDescription: s.metaDescription,
            isPinned: s.isPinned,
          });
          toast.success("Auto-saved draft", { duration: 1800 });
        } catch {
          /* ignore */
        }
      })();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [postId, hydrated, updatePost]);

  async function removePost() {
    if (!postId || !confirm("Delete this post permanently?")) {
      return;
    }
    setBusy(true);
    try {
      await deletePost({ id: postId });
      toast.success("Deleted");
      router.push("/admin/posts");
    } finally {
      setBusy(false);
    }
  }

  const safePreview = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return DOMPurify.sanitize(content);
  }, [content]);

  if (initialPostId && !hydrated) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-10 animate-spin text-[#F5A623]" />
      </div>
    );
  }

  const catOptions = categories ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/posts"
            className="text-sm text-zinc-500 hover:text-[#F5A623]"
          >
            ← All posts
          </Link>
          <h1 className="font-heading text-3xl font-bold text-white">
            {postId ? "Edit post" : "New post"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-zinc-600"
            disabled={busy}
            onClick={() => void persist({})}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Save"}
          </Button>
          <Button
            type="button"
            className="bg-[#F5A623] text-black hover:bg-[#e09620]"
            disabled={busy}
            onClick={() =>
              void persist({ publish: true, newsletter: sendNewsletter })
            }
          >
            Publish
          </Button>
          {postId ? (
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => void removePost()}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 border-zinc-700 bg-[#111827] text-white"
              placeholder="Headline"
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                slugManual.current = true;
                setSlug(e.target.value);
              }}
              className="mt-1 border-zinc-700 bg-[#111827] font-mono text-sm text-zinc-300"
              placeholder="url-slug"
            />
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="mt-1 border-zinc-700 bg-[#111827] text-zinc-200"
              placeholder="Short summary for cards & SEO"
            />
          </div>

          <Tabs defaultValue="edit">
            <TabsList className="border border-zinc-700 bg-[#111827]">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-4">
              <PostEditor
                content={content}
                onChange={setContent}
                onImageUpload={uploadImage}
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="rounded-xl border border-zinc-700 bg-[#0A0F1E] p-4">
                <PostPreviewHtml html={safePreview} />
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-sm text-zinc-500">
            {words} words · ~{readingMin} min read (stored on save)
          </p>
        </div>

        <div className="space-y-5 rounded-xl border border-white/10 bg-[#111827] p-5 lg:sticky lg:top-24 lg:self-start">
          <div>
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1 border-zinc-700 bg-[#0A0F1E]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-950">
                {catOptions.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.icon} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!catOptions.length ? (
              <p className="mt-2 text-xs text-amber-400">
                Create a category first in Admin → Categories.
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="mt-1 border-zinc-700 bg-[#0A0F1E]"
              placeholder="defi, btc, macro"
            />
          </div>

          <div>
            <Label>Cover image</Label>
            <Input
              type="file"
              accept="image/*"
              className="mt-1 text-sm text-zinc-400"
              onChange={(e) => void uploadCover(e)}
            />
            {coverPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreviewUrl}
                alt=""
                className="mt-3 max-h-40 w-full rounded-lg object-cover"
              />
            ) : null}
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) =>
                setStatus(v as "draft" | "published" | "scheduled")
              }
            >
              <SelectTrigger className="mt-1 border-zinc-700 bg-[#0A0F1E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-950">
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "scheduled" ? (
            <div>
              <Label htmlFor="sched">Publish at (local)</Label>
              <Input
                id="sched"
                type="datetime-local"
                value={scheduledLocal}
                onChange={(e) => setScheduledLocal(e.target.value)}
                className="mt-1 border-zinc-700 bg-[#0A0F1E]"
              />
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <Checkbox
              id="pin"
              checked={isPinned}
              onCheckedChange={(c) => setIsPinned(c === true)}
            />
            <Label htmlFor="pin" className="cursor-pointer text-sm font-normal">
              Pin to homepage
            </Label>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 p-3">
            <Checkbox
              id="nw"
              checked={sendNewsletter}
              onCheckedChange={(c) => setSendNewsletter(c === true)}
            />
            <div>
              <Label htmlFor="nw" className="cursor-pointer font-medium text-[#F5A623]">
                Send newsletter on publish
              </Label>
              <p className="text-xs text-zinc-500">
                Requires RESEND_API_KEY. Only sends when publishing and post was
                not already emailed.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="mt">Meta title</Label>
            <Input
              id="mt"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="mt-1 border-zinc-700 bg-[#0A0F1E]"
            />
          </div>
          <div>
            <Label htmlFor="md">Meta description</Label>
            <Textarea
              id="md"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="mt-1 border-zinc-700 bg-[#0A0F1E]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
