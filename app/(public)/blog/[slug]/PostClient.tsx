"use client";

import Image from "next/image";
import Link from "next/link";
import DOMPurify from "dompurify";
import { motion, useScroll, useSpring } from "framer-motion";
import { useMutation, usePreloadedQuery, useQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import { api as convexApi } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePostStore } from "@/stores/usePostStore";
import type { Doc } from "@/convex/_generated/dataModel";
import { PostComments } from "@/components/blog/PostComments";

type RelatedPost = Doc<"posts"> & { coverUrl: string | null };

function visitorId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const key = "bf_vid";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function PostClient({
  preloaded,
}: {
  preloaded: Preloaded<typeof convexApi.posts.getPublishedBySlug>;
}) {
  const post = usePreloadedQuery(preloaded);
  const recordView = useMutation(convexApi.posts.recordView);
  const counts = useQuery(
    convexApi.reactions.countsForPost,
    post ? { postId: post._id } : "skip",
  );
  const setReaction = useMutation(convexApi.reactions.setReaction);
  const toggleBookmark = useMutation(convexApi.users.toggleBookmark);
  const related = useQuery(
    convexApi.posts.listRelated,
    post ? { postId: post._id, categoryId: post.categoryId } : "skip",
  );

  const user = useAuthStore((s) => s.user);
  const storeBookmarked = usePostStore((s) => s.bookmarked);
  const setBookmarkedStore = usePostStore((s) => s.setBookmarked);
  const setReactionState = usePostStore((s) => s.setReactionState);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem("bf_disclaimer_dismiss");
      if (v === "1") {
        setShowDisclaimer(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!post) {
      return;
    }
    void recordView({ postId: post._id, visitorId: visitorId() });
  }, [post, recordView]);

  useEffect(() => {
    if (!counts) {
      return;
    }
    setReactionState(counts.counts, counts.mine);
  }, [counts, setReactionState]);

  useEffect(() => {
    if (!post || !user?.bookmarks) {
      setBookmarkedStore(false);
      return;
    }
    setBookmarkedStore(user.bookmarks.includes(post._id));
  }, [post, user, setBookmarkedStore]);

  const html = useMemo(() => {
    if (!post?.content) {
      return "";
    }
    return DOMPurify.sanitize(post.content);
  }, [post]);

  async function react(type: "like" | "love" | "fire" | "rocket") {
    if (!post) {
      return;
    }
    if (!user) {
      toast.error("Log in to react.");
      return;
    }
    try {
      await setReaction({ postId: post._id, type });
    } catch {
      toast.error("Could not react.");
    }
  }

  async function bookmark() {
    if (!post || !user) {
      toast.error("Log in to bookmark.");
      return;
    }
    try {
      const next = await toggleBookmark({ postId: post._id });
      setBookmarkedStore(next);
      toast.success(next ? "Saved" : "Removed");
    } catch {
      toast.error("Could not update bookmark.");
    }
  }

  if (!post) {
    return null;
  }

  return (
    <div>
      <motion.div
        className="fixed left-0 right-0 top-0 z-40 h-1 origin-left bg-[#F5A623]"
        style={{ scaleX }}
      />

      {showDisclaimer ? (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
          This content is for educational purposes only and does not constitute
          financial advice.
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => {
              setShowDisclaimer(false);
              localStorage.setItem("bf_disclaimer_dismiss", "1");
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <header className="relative">
        <div className="relative aspect-[21/9] max-h-[420px] w-full overflow-hidden bg-zinc-900">
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="mx-auto max-w-4xl">
              {post.category ? (
                <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-[#F5A623] backdrop-blur">
                  {post.category.icon} {post.category.name}
                </span>
              ) : null}
              <h1 className="mt-4 font-heading text-3xl font-bold text-white md:text-5xl">
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
                {post.author ? (
                  <div className="flex items-center gap-2">
                    {post.author.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.author.avatarUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : null}
                    <span>{post.author.name}</span>
                  </div>
                ) : null}
                <span>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : ""}
                </span>
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-10 prose prose-invert prose-headings:font-heading prose-a:text-[#F5A623]">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <PostComments postId={post._id} />

      <section className="sticky bottom-0 z-30 border-t border-white/10 bg-[#0A0F1E]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["like", "love", "fire", "rocket"] as const).map((t) => (
              <motion.button
                key={t}
                type="button"
                whileTap={{ scale: 0.88 }}
                className="flex items-center gap-1 rounded-full border border-white/15 bg-[#111827] px-3 py-2 text-sm"
                onClick={() => void react(t)}
              >
                <span>
                  {t === "like"
                    ? "💙"
                    : t === "love"
                      ? "❤️"
                      : t === "fire"
                        ? "🔥"
                        : "🚀"}
                </span>
                <span>{counts?.counts[t] ?? 0}</span>
              </motion.button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void bookmark()}>
              {storeBookmarked ? "Saved" : "Bookmark"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied");
              }}
            >
              Share
            </Button>
          </div>
        </div>
      </section>

      {related && related.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-heading text-xl font-semibold">Related</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {(related as RelatedPost[]).map((r) => (
              <Link
                key={r._id}
                href={`/blog/${r.slug}`}
                className="rounded-xl border border-white/10 bg-[#111827] p-4 hover:border-[#F5A623]/40"
              >
                {r.coverUrl ? (
                  <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src={r.coverUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                ) : null}
                <p className="font-medium text-zinc-100">{r.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
