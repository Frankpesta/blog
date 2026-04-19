"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, MessageSquare, Users, Folder, Mail, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/categories", label: "Categories", icon: Folder },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#111827] p-4 md:block">
      <div className="flex items-center gap-2 px-2 py-3 font-heading text-lg font-semibold text-[#F5A623]">
        <Shield className="size-5" /> Admin
      </div>
      <nav className="mt-6 flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
              pathname === href
                ? "bg-[#F5A623]/15 text-[#F5A623]"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
      <Link
        href="/"
        className="mt-8 block px-3 text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← Back to site
      </Link>
    </aside>
  );
}
