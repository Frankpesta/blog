import Link from "next/link";
import { Send, Rss, Share2 } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { NewsletterForm } from "@/components/shared/NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0A0F1E] text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-heading text-lg font-semibold text-zinc-100">
              {BRAND.name}
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              {BRAND.tagline}. Education, not financial advice.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://twitter.com"
                className="text-zinc-500 transition hover:text-[#F5A623]"
                aria-label="Share"
              >
                <Share2 className="size-5" />
              </a>
              <a
                href="https://t.me"
                className="text-zinc-500 transition hover:text-[#F5A623]"
                aria-label="Telegram"
              >
                <Send className="size-5" />
              </a>
              <a
                href="/"
                className="text-zinc-500 transition hover:text-[#F5A623]"
                aria-label="RSS"
              >
                <Rss className="size-5" />
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/blog" className="hover:text-[#F5A623]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[#F5A623]">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[#F5A623]">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#F5A623]">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">Newsletter</p>
            <p className="mt-2 text-sm">Weekly market notes. Unsubscribe anytime.</p>
            <div className="mt-3 max-w-sm">
              <NewsletterForm source="footer" />
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-8 text-xs text-zinc-500">
          © {new Date().getFullYear()} {BRAND.name}. Content is for educational purposes only.
        </p>
      </div>
    </footer>
  );
}
