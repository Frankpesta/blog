"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Folder,
  Mail,
  Shield,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const adminNavLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/categories", label: "Categories", icon: Folder },
  { href: "/admin/users", label: "Users", icon: Users },
] as const;

export function AdminNav({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-[#F5A623]/15">
          <Shield className="size-5 text-[#F5A623]" aria-hidden />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold tracking-tight text-white">
            Admin
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Console
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Admin navigation">
        {adminNavLinks.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#F5A623]/12 text-[#F5A623] shadow-[inset_0_0_0_1px_rgba(245,166,35,0.2)]"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100",
              )}
            >
              <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
        >
          <ExternalLink className="size-4 shrink-0" aria-hidden />
          View site
        </Link>
      </div>
    </div>
  );
}
