"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { LayoutList, MessageSquare, PenLine, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DashboardStatsSkeleton } from "@/components/admin/admin-skeletons";
import { useConvexSessionReady } from "@/hooks/useConvexSessionReady";
import { adminPageMeta } from "@/lib/admin-routes";

export default function AdminDashboardPage() {
  const pathname = usePathname();
  const { title, description } = adminPageMeta(pathname);
  const sessionReady = useConvexSessionReady();
  const stats = useQuery(api.stats.adminDashboard, sessionReady ? {} : "skip");
  const loading = !sessionReady || stats === undefined;

  return (
    <div className="space-y-8">
      <AdminPageHeader title={title} description={description} />

      {loading ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/10 bg-gradient-to-br from-[#111827] to-[#0d121f] text-zinc-100 shadow-lg shadow-black/20 ring-1 ring-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <PenLine className="size-3.5 text-[#F5A623]/80" aria-hidden />
                Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold tabular-nums tracking-tight">
              {stats.totalPosts}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-gradient-to-br from-[#111827] to-[#0d121f] text-zinc-100 shadow-lg shadow-black/20 ring-1 ring-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <LayoutList className="size-3.5 text-emerald-400/80" aria-hidden />
                Views (approx.)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold tabular-nums tracking-tight">
              {stats.totalViews}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-gradient-to-br from-[#111827] to-[#0d121f] text-zinc-100 shadow-lg shadow-black/20 ring-1 ring-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <Users className="size-3.5 text-sky-400/80" aria-hidden />
                Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold tabular-nums tracking-tight">
              {stats.totalSubscribers}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-gradient-to-br from-[#111827] to-[#0d121f] text-zinc-100 shadow-lg shadow-black/20 ring-1 ring-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <MessageSquare className="size-3.5 text-amber-400/90" aria-hidden />
                Pending comments
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold tabular-nums tracking-tight text-amber-400">
              {stats.pendingComments}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.08] bg-[#111827]/40 p-5 ring-1 ring-white/[0.04] sm:p-6">
        <p className="text-sm font-medium text-zinc-300">Quick actions</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            asChild
            className="bg-[#F5A623] text-black shadow-md shadow-[#F5A623]/20 hover:bg-[#e09620]"
          >
            <Link href="/admin/posts/new">New post</Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-600 bg-transparent">
            <Link href="/admin/subscribers">Subscribers</Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-600 bg-transparent">
            <Link href="/admin/comments">Comments</Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-600 bg-transparent">
            <Link href="/admin/categories">Categories</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
