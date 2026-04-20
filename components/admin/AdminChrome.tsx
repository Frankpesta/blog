"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminNav } from "@/components/admin/AdminNav";
import { adminPageMeta } from "@/lib/admin-routes";
import { cn } from "@/lib/utils";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const meta = adminPageMeta(pathname);

  return (
    <div className="min-h-[100dvh] bg-[#0A0F1E] text-zinc-100">
      {/* Desktop: fixed sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-64 flex-col md:flex",
          "border-r border-white/[0.08] bg-[#080c18]/95 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.45)]",
          "backdrop-blur-md",
        )}
        aria-label="Admin sidebar"
      >
        <AdminNav pathname={pathname} />
      </aside>

      {/* Main column */}
      <div className="flex min-h-[100dvh] flex-col md:pl-64">
        {/* Mobile top bar */}
        <header
          className={cn(
            "sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0A0F1E]/90 px-4 backdrop-blur-md md:hidden",
          )}
        >
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-zinc-300"
                aria-label="Open admin menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[min(100vw,18rem)] border-white/10 bg-[#080c18] p-0"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Admin navigation</SheetTitle>
              </SheetHeader>
              <AdminNav
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-semibold text-white">
              {meta.title}
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 text-xs font-medium text-[#F5A623] hover:underline"
          >
            Site
          </Link>
        </header>

        {/* Desktop: contextual strip */}
        <header className="sticky top-0 z-20 hidden border-b border-white/[0.06] bg-[#0A0F1E]/80 px-6 py-3 backdrop-blur-md md:block lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-zinc-500">
            <Link
              href="/admin"
              className="transition-colors hover:text-zinc-300"
            >
              Admin
            </Link>
            <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
            <span className="font-medium text-zinc-300">{meta.title}</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <footer className="mt-auto border-t border-white/[0.06] bg-[#060912]/80 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              BenjaFamily Labs · Admin console
            </p>
            <div className="flex flex-wrap gap-4 text-xs">
              <Link
                href="/"
                className="font-medium text-zinc-400 transition-colors hover:text-[#F5A623]"
              >
                View public site
              </Link>
              <Link
                href="/admin"
                className="font-medium text-zinc-400 transition-colors hover:text-[#F5A623]"
              >
                Overview
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
