"use client";

import Image from "next/image";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-9 shrink-0 items-center justify-center", className)}>
      <Image
        src="/logo.png"
        alt=""
        width={36}
        height={36}
        className="object-contain"
        priority
      />
    </span>
  );
}

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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 font-heading text-base font-semibold tracking-tight text-white sm:text-lg"
        >
          <BrandLogo />
          <span className="truncate">{BRAND.name}</span>
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
            <SheetContent
              side="right"
              className="w-full gap-0 border-l border-white/10 bg-[#0A0F1E] p-0 text-zinc-100 sm:max-w-sm"
            >
              <div className="px-6 pb-6 pt-14">
                <SheetHeader className="space-y-4 border-b border-white/10 p-0 pb-6 text-left">
                  <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                  <SheetClose asChild>
                    <Link href="/" className="flex items-center gap-3 text-left">
                      <BrandLogo />
                      <span className="font-heading text-lg font-semibold text-white">
                        {BRAND.name}
                      </span>
                    </Link>
                  </SheetClose>
                  <p className="text-xs leading-relaxed text-zinc-500">
                    Research, tools, and commentary from BenjaFamily Labs.
                  </p>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-0" aria-label="Main">
                  {nav.map((n) => (
                    <SheetClose key={n.href} asChild>
                      <Link
                        href={n.href}
                        className={cn(
                          "border-b border-white/6 py-4 text-base font-medium transition first:pt-0 hover:text-[#F5A623]",
                          pathname === n.href ? "text-[#F5A623]" : "text-zinc-200",
                        )}
                      >
                        {n.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-8 rounded-xl border border-white/10 bg-[#111827]/80 p-4">
                  {!user ? (
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#F5A623] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#e69b1f]"
                      >
                        <User className="size-4" />
                        Log in
                      </Link>
                    </SheetClose>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <SheetClose asChild>
                        <Link
                          href="/profile"
                          className="rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm text-zinc-200 hover:border-[#F5A623]/40 hover:text-[#F5A623]"
                        >
                          Profile
                        </Link>
                      </SheetClose>
                      {user.role === "admin" ? (
                        <SheetClose asChild>
                          <Link
                            href="/admin"
                            className="rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm text-zinc-200 hover:border-[#F5A623]/40 hover:text-[#F5A623]"
                          >
                            Admin
                          </Link>
                        </SheetClose>
                      ) : null}
                      <button
                        type="button"
                        className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10"
                        onClick={() => void handleLogout()}
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
