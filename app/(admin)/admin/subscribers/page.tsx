"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexSessionReady } from "@/hooks/useConvexSessionReady";

export default function AdminSubscribersPage() {
  const sessionReady = useConvexSessionReady();
  const subs = useQuery(
    api.subscribers.listForAdmin,
    sessionReady ? { limit: 500 } : "skip",
  );

  function downloadCsv() {
    const lines = [["email", "subscribedAt", "isActive"].join(",")];
    for (const s of subs ?? []) {
      lines.push(
        [
          `"${s.email.replace(/"/g, '""')}"`,
          s.subscribedAt,
          s.isActive ? "yes" : "no",
        ].join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "subscribers.csv";
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold text-white">Subscribers</h1>
        <button
          type="button"
          className="rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-medium text-black"
          onClick={downloadCsv}
        >
          Export CSV
        </button>
      </div>
      <ul className="divide-y divide-zinc-800 rounded-xl border border-white/10 bg-[#111827]">
        {(subs ?? []).map((s) => (
          <li key={s._id} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-zinc-200">{s.email}</span>
            <span className="text-zinc-500">
              {s.isActive ? "active" : "inactive"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
