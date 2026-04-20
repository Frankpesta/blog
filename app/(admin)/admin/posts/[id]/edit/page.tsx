"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { PostForm } from "@/components/admin/PostForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminPageMeta } from "@/lib/admin-routes";
import { Button } from "@/components/ui/button";

export default function EditPostPage() {
  const id = useParams().id as Id<"posts">;
  const pathname = usePathname();
  const { title, description } = adminPageMeta(pathname);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-600 text-zinc-200"
          >
            <Link href="/admin/posts">
              <ArrowLeft className="size-4" />
              Back to posts
            </Link>
          </Button>
        }
      />
      <PostForm postId={id} />
    </div>
  );
}
