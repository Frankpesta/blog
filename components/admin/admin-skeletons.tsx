import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const sk = "bg-zinc-800/70";

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-[#111827]/80 p-5"
        >
          <Skeleton className={cn("h-3 w-24", sk)} />
          <Skeleton className={cn("mt-4 h-9 w-16", sk)} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111827]/80">
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 border-b border-white/10 px-4 py-3">
        <Skeleton className={cn("size-4 rounded", sk)} />
        <Skeleton className={cn("h-4 w-32", sk)} />
        <Skeleton className={cn("h-4 w-16", sk)} />
        <Skeleton className={cn("h-4 w-10", sk)} />
        <Skeleton className={cn("h-4 w-20", sk)} />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-4 py-3"
          >
            <Skeleton className={cn("size-4 rounded", sk)} />
            <Skeleton className={cn("h-4 max-w-[min(100%,20rem)]", sk)} />
            <Skeleton className={cn("h-4 w-14", sk)} />
            <Skeleton className={cn("h-4 w-8", sk)} />
            <Skeleton className={cn("h-4 w-24", sk)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-[#111827]/80 p-4"
        >
          <Skeleton className={cn("h-4 w-full max-w-lg", sk)} />
          <Skeleton className={cn("mt-2 h-4 w-full max-w-md", sk)} />
          <div className="mt-4 flex gap-2">
            <Skeleton className={cn("h-8 w-20 rounded-md", sk)} />
            <Skeleton className={cn("h-8 w-16 rounded-md", sk)} />
            <Skeleton className={cn("h-8 w-16 rounded-md", sk)} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SubscriberListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="divide-y divide-zinc-800/80 rounded-xl border border-white/10 bg-[#111827]/80">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex justify-between px-4 py-3">
          <Skeleton className={cn("h-4 w-48", sk)} />
          <Skeleton className={cn("h-4 w-14", sk)} />
        </li>
      ))}
    </ul>
  );
}

export function UserListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#111827]/80 px-4 py-3"
        >
          <div className="space-y-2">
            <Skeleton className={cn("h-4 w-40", sk)} />
            <Skeleton className={cn("h-3 w-56", sk)} />
          </div>
          <Skeleton className={cn("h-8 w-28 rounded-md", sk)} />
        </div>
      ))}
    </div>
  );
}

export function CategoryFormSkeleton() {
  return (
    <div className="max-w-md space-y-3 rounded-xl border border-white/10 bg-[#111827]/80 p-6">
      <Skeleton className={cn("h-4 w-16", sk)} />
      <Skeleton className={cn("h-10 w-full rounded-md", sk)} />
      <Skeleton className={cn("h-4 w-12", sk)} />
      <Skeleton className={cn("h-10 w-full rounded-md", sk)} />
      <Skeleton className={cn("h-10 w-24 rounded-md", sk)} />
    </div>
  );
}

export function CategoryListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#111827]/80 px-4 py-3"
        >
          <Skeleton className={cn("size-6 rounded", sk)} />
          <Skeleton className={cn("h-4 flex-1 max-w-xs", sk)} />
        </li>
      ))}
    </ul>
  );
}
