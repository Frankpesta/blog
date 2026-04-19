"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";

export default function AdminUsersPage() {
  const users = useQuery(api.users.listForAdmin, { limit: 200 });
  const setRole = useMutation(api.users.setRole);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold text-white">Users</h1>
      <div className="space-y-2">
        {(users ?? []).map((u) => (
          <div
            key={u._id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#111827] px-4 py-3"
          >
            <div>
              <p className="font-medium text-zinc-100">{u.name}</p>
              <p className="text-sm text-zinc-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase text-zinc-500">{u.role}</span>
              {u.role === "user" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void setRole({ userId: u._id as Id<"users">, role: "admin" })
                  }
                >
                  Make admin
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void setRole({ userId: u._id as Id<"users">, role: "user" })
                  }
                >
                  Revoke admin
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
