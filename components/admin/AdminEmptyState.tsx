import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-gradient-to-b from-[#111827]/80 to-[#0d121f]/60 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#F5A623]/10 ring-1 ring-[#F5A623]/20">
        <Icon className="size-7 text-[#F5A623]" aria-hidden />
      </div>
      <h2 className="font-heading text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
