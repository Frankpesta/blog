"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

export function PostComments({ postId }: { postId: Id<"posts"> }) {
  const user = useAuthStore((s) => s.user);
  const comments = useQuery(api.comments.listByPost, { postId });
  const create = useMutation(api.comments.create);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const top = (comments ?? []).filter((c) => !c.parentId);
  const replies = (comments ?? []).filter((c) => c.parentId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Log in to comment");
      return;
    }
    if (!text.trim()) {
      return;
    }
    setBusy(true);
    try {
      await create({ postId, content: text });
      setText("");
      toast.success("Comment posted");
    } catch {
      toast.error("Failed to post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl border-t border-white/10 px-4 py-12">
      <h2 className="font-heading text-2xl font-semibold text-white">
        Discussion
      </h2>
      {user ? (
        <form onSubmit={submit} className="mt-4 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share a take (markdown: **bold**, `code`)"
            rows={3}
            className="border-zinc-700 bg-[#111827] text-zinc-100"
          />
          <Button
            type="submit"
            disabled={busy}
            className="bg-[#F5A623] text-black"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Post comment"}
          </Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">Log in to join the thread.</p>
      )}

      <ul className="mt-8 space-y-4">
        {top.map((c, i) => (
          <motion.li
            key={c._id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-lg border border-white/10 bg-[#111827] p-4"
          >
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {c.content}
              </ReactMarkdown>
            </div>
            {replies
              .filter((r) => r.parentId === c._id)
              .map((r) => (
                <div
                  key={r._id}
                  className="ml-4 mt-3 border-l-2 border-zinc-600 pl-4"
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                      {r.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
