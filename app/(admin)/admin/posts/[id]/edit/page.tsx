"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import { PostForm } from "@/components/admin/PostForm";

export default function EditPostPage() {
  const id = useParams().id as Id<"posts">;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold text-white">Edit post</h1>
        <Link
          href="/admin/posts"
          className="text-sm text-[#F5A623] hover:underline"
        >
          ← Back to posts
        </Link>
      </div>
      <PostForm postId={id} />
    </div>
  );
}
