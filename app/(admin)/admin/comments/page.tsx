"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function AdminCommentsPage() {
  const rows = useQuery(api.comments.listAllForAdmin, { limit: 100 });
  const moderate = useMutation(api.comments.moderate);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold text-white">Comments</h1>
      <div className="space-y-3">
        {(rows ?? []).map((c) => (
          <div
            key={c._id}
            className="rounded-lg border border-white/10 bg-[#111827] p-4 text-sm"
          >
            <p className="text-zinc-300">{c.content}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void moderate({ id: c._id, action: "approve" })}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void moderate({ id: c._id, action: "hide" })}
              >
                Hide
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => void moderate({ id: c._id, action: "delete" })}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
