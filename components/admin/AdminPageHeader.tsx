import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
