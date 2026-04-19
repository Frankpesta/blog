"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditPostPage() {
  const id = useParams().id as string;
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-heading text-3xl font-bold text-white">Edit post</h1>
      <p className="font-mono text-sm text-zinc-500">{id}</p>
      <p className="text-zinc-400">
        Load post via <code className="text-[#F5A623]">posts.getById</code>, bind
        Tiptap + publish updates through <code className="text-[#F5A623]">posts.updatePost</code>.
      </p>
      <Link href="/admin/posts" className="text-[#F5A623] hover:underline">
        ← Back to posts
      </Link>
    </div>
  );
}
