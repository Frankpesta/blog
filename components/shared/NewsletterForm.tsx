"use client";

import { useMutation } from "convex/react";
import { z } from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({ email: z.string().email() });

export function NewsletterForm({
  source,
  variant = "default",
}: {
  source?: string;
  variant?: "default" | "compact";
}) {
  const subscribe = useMutation(api.subscribers.subscribe);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error("Enter a valid email.");
      return;
    }
    setBusy(true);
    try {
      await subscribe({ email: parsed.data.email, source });
      toast.success("You're subscribed.");
      setEmail("");
      try {
        await fetch("/api/newsletter/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: parsed.data.email }),
        });
      } catch {
        /* optional Resend — ignore failures */
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        variant === "compact"
          ? "flex flex-col gap-2 sm:flex-row"
          : "flex gap-2"
      }
    >
      <Input
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border-zinc-700 bg-[#111827] text-zinc-100 placeholder:text-zinc-500"
      />
      <Button
        type="submit"
        disabled={busy}
        className="bg-[#F5A623] text-black hover:bg-[#e09620]"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Subscribe"
        )}
      </Button>
    </form>
  );
}
