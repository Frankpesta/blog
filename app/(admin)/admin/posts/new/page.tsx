"use client";

import Link from "next/link";

/** Full Tiptap editor scaffold — extend with components/admin/PostEditor.tsx */
export default function NewPostPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-heading text-3xl font-bold text-white">New post</h1>
      <p className="text-zinc-400">
        Wire the rich-text editor here using Tiptap, Convex{" "}
        <code className="text-[#F5A623]">posts.createPost</code>, and{" "}
        <code className="text-[#F5A623]">files.generatePostImageUploadUrl</code>{" "}
        for assets. Core mutations and schema are ready.
      </p>
      <Link href="/admin/posts" className="text-[#F5A623] hover:underline">
        ← Back to posts
      </Link>
    </div>
  );
}
