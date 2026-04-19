"use client";

import { useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

function UnsubscribeInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const unsubscribe = useMutation(api.subscribers.unsubscribeByToken);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit() {
    if (!token) {
      toast.error("Invalid link");
      return;
    }
    setBusy(true);
    try {
      await unsubscribe({ token });
      setDone(true);
      toast.success("You are unsubscribed.");
    } catch {
      toast.error("Could not unsubscribe.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-heading text-2xl font-bold text-white">
        Unsubscribe
      </h1>
      {done ? (
        <p className="mt-4 text-zinc-400">You will not receive further emails.</p>
      ) : (
        <>
          <p className="mt-4 text-zinc-400">
            Confirm you want to leave the mailing list.
          </p>
          <Button
            type="button"
            className="mt-6 bg-[#F5A623] text-black"
            disabled={busy || !token}
            onClick={() => void onSubmit()}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Confirm"}
          </Button>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-500">Loading…</p>}>
      <UnsubscribeInner />
    </Suspense>
  );
}
