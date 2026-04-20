"use client";

import Image from "next/image";
import Link from "next/link";
import DOMPurify from "dompurify";
import { motion, useScroll, useSpring } from "framer-motion";
import { useMutation, usePreloadedQuery, useQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import { api as convexApi } from "@/convex/_generated/api";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/hooks/useSessionUser";
import { usePostStore } from "@/stores/usePostStore";
import type { Doc } from "@/convex/_generated/dataModel";
import { PostComments } from "@/components/blog/PostComments";
import { PostBanner } from "@/components/blog/PostBanner";
import {
  buildTocFromHtml,
  TableOfContents,
} from "@/components/blog/TableOfContents";

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

  const { user } = useSessionUser();
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
    if (!post || !user) {
      setBookmarkedStore(false);
      return;
    }
    const marks = user.bookmarks ?? [];
    setBookmarkedStore(marks.includes(post._id));
  }, [post, user, setBookmarkedStore]);

  const html = useMemo(() => {
    if (!post?.content) {
      return "";
    }
    return DOMPurify.sanitize(post.content);
  }, [post]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const tocItems = useMemo(() => buildTocFromHtml(html), [html]);
  const [activeToc, setActiveToc] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) {
      return;
    }
    el.querySelectorAll("h2, h3").forEach((h, i) => {
      h.id = `section-${i}`;
    });
  }, [html]);

  useEffect(() => {
    if (tocItems.length === 0) {
      return;
    }
    const onScroll = () => {
      const el = bodyRef.current;
      if (!el) {
        return;
      }
      const headings = [...el.querySelectorAll("h2, h3")];
      let current: string | null = null;
      const offset = 120;
      for (const h of headings) {
        const r = h.getBoundingClientRect();
        if (r.top <= offset) {
          current = h.id;
        }
      }
      setActiveToc(current ?? headings[0]?.id ?? null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [html, tocItems.length]);

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

      <PostBanner
        title={post.title}
        excerpt={post.excerpt}
        coverUrl={post.coverUrl}
        category={post.category}
        author={post.author}
        publishedAt={post.publishedAt}
        readingTime={post.readingTime}
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
          <div>
            <article className="prose prose-invert max-w-none prose-headings:font-heading prose-a:text-[#F5A623] prose-img:mx-auto prose-img:my-8 prose-img:max-w-full prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl prose-img:shadow-black/50 prose-figure:my-10 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-zinc-500">
              <div
                ref={bodyRef}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </article>

            {post.author ? (
              <div className="mt-12 rounded-2xl border border-white/10 bg-[#111827] p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-[#F5A623]">
                  Author
                </p>
                <div className="mt-3 flex gap-4">
                  {post.author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.author.avatarUrl}
                      alt=""
                      className="size-16 rounded-full object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="font-heading text-lg font-semibold text-white">
                      {post.author.name}
                    </p>
                    {post.author.bio ? (
                      <p className="mt-1 text-sm text-zinc-400">{post.author.bio}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <TableOfContents items={tocItems} activeId={activeToc} />
            </div>
          </aside>
        </div>
      </div>

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
              Copy link
            </Button>
            <Button variant="outline" size="sm" asChild disabled={!shareUrl}>
              <a
                href={
                  shareUrl
                    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                X
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild disabled={!shareUrl}>
              <a
                href={
                  shareUrl
                    ? `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram
              </a>
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
