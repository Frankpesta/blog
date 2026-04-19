"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { PostCard } from "@/components/blog/PostCard";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { BRAND } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const title = "Navigate the Financial Future";

export function HomeContent() {
  const pinned = useQuery(api.posts.listPinned);
  const postsRaw = useQuery(api.posts.listPublishedHome);
  type HomePost = Doc<"posts"> & { coverUrl?: string | null };
  const posts = postsRaw as HomePost[] | undefined;
  const categories = useQuery(api.categories.list);
  const trendingRaw = useQuery(api.posts.trending);
  const trending = trendingRaw as HomePost[] | undefined;

  const cats = (categories ?? []) as Doc<"categories">[];
  const catMap = Object.fromEntries(
    cats.map((c) => [c._id, { name: c.name, icon: c.icon }]),
  );

  const hero = (pinned as HomePost[] | undefined)?.[0];

  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="relative overflow-hidden px-4 pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#F5A62322,_transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl">
          <motion.h1
            className="font-heading text-4xl font-bold tracking-tight text-white md:text-6xl"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.06 } },
              hidden: {},
            }}
          >
            {title.split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="mr-[0.25em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 max-w-xl text-lg text-zinc-400"
          >
            Premium market education and crypto insights from {BRAND.name}.
            Trade smarter—stay skeptical, stay curious.
          </motion.p>
        </div>
      </section>

      {hero ? (
        <section className="mx-auto max-w-6xl px-4">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-[#F5A623]">
            Featured
          </p>
          <Link href={`/blog/${hero.slug}`}>
            <motion.div
              whileHover={{ y: -3 }}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]"
            >
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px]">
                  {hero.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hero.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full min-h-[220px] bg-gradient-to-br from-[#0A0F1E] to-[#111827]" />
                  )}
                </div>
                <div className="flex flex-col justify-center p-8">
                  <Badge className="mb-3 w-fit border-[#F5A623]/40 bg-[#F5A623]/15 text-[#F5A623]">
                    {catMap[hero.categoryId]?.name ?? "Article"}
                  </Badge>
                  <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">
                    {hero.title}
                  </h2>
                  <p className="mt-3 text-zinc-400">{hero.excerpt}</p>
                  <p className="mt-4 text-sm text-zinc-500">
                    {hero.readingTime} min read
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-semibold text-white">
            Latest
          </h2>
          <Button asChild variant="ghost" className="text-[#F5A623]">
            <Link href="/blog">View all</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(posts ?? ([] as HomePost[]))
            .filter((p) => !hero || p._id !== hero._id)
            .map((post) => (
              <PostCard
                key={post._id}
                post={post}
                categoryLabel={catMap[post.categoryId]?.name}
              />
            ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="font-heading text-2xl font-semibold text-white">
          Categories
        </h2>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {cats.map((c) => (
            <Link
              key={c._id}
              href={`/blog/category/${c.slug}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[#111827] px-4 py-2 text-sm text-zinc-300 transition hover:border-[#F5A623]/50 hover:text-[#F5A623]"
            >
              <span>{c.icon}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#F5A623]/30 bg-gradient-to-br from-[#111827] to-[#0A0F1E] p-8 lg:col-span-2"
          >
            <h3 className="font-heading text-xl font-semibold text-white">
              Join the weekly letter
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              One email. Key charts, on-chain signals, and risk-aware theses.
            </p>
            <div className="mt-4 max-w-md">
              <NewsletterForm source="home-banner" />
            </div>
          </motion.div>
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
            <h3 className="font-heading text-lg font-semibold text-white">
              Trending (7d)
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {(trending ?? ([] as HomePost[])).slice(0, 5).map((p) => (
                <li key={p._id}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="text-zinc-300 hover:text-[#F5A623]"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
