"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Doc } from "@/convex/_generated/dataModel";
import { Clock } from "lucide-react";

type PostDoc = Doc<"posts"> & { coverUrl?: string | null };

export function PostCard({
  post,
  categoryLabel,
}: {
  post: PostDoc;
  categoryLabel?: string;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="group overflow-hidden rounded-xl border border-white/10 bg-[#111827] shadow-lg"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0A0F1E] to-[#1F2937]" />
          )}
          {categoryLabel ? (
            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-[#F5A623] backdrop-blur">
              {categoryLabel}
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <h3 className="font-heading text-lg font-semibold leading-snug text-zinc-50 group-hover:text-[#F5A623]">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{post.excerpt}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {post.readingTime} min read
            </span>
            <span>
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString()
                : ""}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
