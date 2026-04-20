"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function buildTocFromHtml(html: string): TocItem[] {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const nodes = [...doc.querySelectorAll("h2, h3")];
    return nodes.map((el, i) => ({
      id: `section-${i}`,
      text: (el.textContent ?? "").trim(),
      level: el.tagName === "H2" ? 2 : 3,
    }));
  } catch {
    return [];
  }
}

export function TableOfContents({
  items,
  activeId,
}: {
  items: TocItem[];
  activeId: string | null;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="On this page"
      className="rounded-xl border border-white/10 bg-[#111827]/90 p-4 backdrop-blur"
    >
      <p className="font-heading text-sm font-semibold uppercase tracking-wide text-[#F5A623]">
        On this page
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block text-sm transition hover:text-[#F5A623]",
                item.level === 3 && "pl-3",
                activeId === item.id
                  ? "font-medium text-[#F5A623]"
                  : "text-zinc-400",
              )}
            >
              <motion.span layout="position">{item.text}</motion.span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
