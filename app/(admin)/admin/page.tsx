"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const stats = useQuery(api.stats.adminDashboard);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">Welcome to the BenjaFamily Labs control center.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-[#111827] text-zinc-100">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Posts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats?.totalPosts ?? "—"}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#111827] text-zinc-100">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Views (approx.)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats?.totalViews ?? "—"}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#111827] text-zinc-100">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Subscribers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats?.totalSubscribers ?? "—"}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#111827] text-zinc-100">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Pending comments</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-amber-400">
            {stats?.pendingComments ?? "—"}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-[#F5A623] text-black hover:bg-[#e09620]">
          <Link href="/admin/posts/new">New post</Link>
        </Button>
        <Button asChild variant="outline" className="border-zinc-600">
          <Link href="/admin/subscribers">View subscribers</Link>
        </Button>
        <Button asChild variant="outline" className="border-zinc-600">
          <Link href="/admin/comments">Moderate comments</Link>
        </Button>
      </div>
    </div>
  );
}
