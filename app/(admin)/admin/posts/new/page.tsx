"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostForm } from "@/components/admin/PostForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminPageMeta } from "@/lib/admin-routes";
import { Button } from "@/components/ui/button";

export default function NewPostPage() {
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
      <PostForm />
    </div>
  );
}
