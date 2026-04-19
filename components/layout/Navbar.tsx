"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Menu, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/blog", label: "Blog" },
  { href: "/search", label: "Search" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(10,15,30,0.6)", "rgba(10,15,30,0.92)"]);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSearch = useUIStore((s) => s.toggleSearch);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSearch]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    logout();
    window.location.href = "/";
  }

  return (
    <motion.header
      style={{ backgroundColor: bg }}
      className={cn(
        "sticky top-0 z-50 border-b border-white/10 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight text-white">
          <span className="rounded-md bg-[#F5A623]/15 px-2 py-1 text-[#F5A623]">
            BF
          </span>
          {BRAND.name}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "text-sm transition hover:text-[#F5A623]",
                pathname === n.href ? "text-[#F5A623]" : "text-zinc-400",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-zinc-300"
            aria-label="Open search"
            onClick={toggleSearch}
          >
            <Search className="size-5" />
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatarUrl} alt="" />
                    <AvatarFallback>
                      {user.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-zinc-800 bg-zinc-950 text-zinc-100">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                {user.role === "admin" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin</Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm" className="hidden border-zinc-700 md:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-zinc-800 bg-[#0A0F1E] text-zinc-100">
              <div className="mt-8 flex flex-col gap-4">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} className="text-lg">
                    {n.label}
                  </Link>
                ))}
                {!user ? (
                  <Link href="/login" className="flex items-center gap-2 text-lg">
                    <User className="size-5" /> Log in
                  </Link>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
