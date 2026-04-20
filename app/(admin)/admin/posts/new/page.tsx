"use client";

import Link from "next/link";
import { PostForm } from "@/components/admin/PostForm";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold text-white">New post</h1>
        <Link
          href="/admin/posts"
          className="text-sm text-[#F5A623] hover:underline"
        >
          ← Back to posts
        </Link>
      </div>
      <PostForm />
    </div>
  );
}
