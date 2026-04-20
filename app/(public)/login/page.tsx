"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        user?: { id: string; email: string; name: string; role: "admin" | "user" };
      };
      if (!res.ok) {
        toast.error("Invalid credentials");
        return;
      }
      if (data.user) {
        login({ ...data.user, id: data.user.id });
      }
      await useAuthStore.getState().hydrate();
      // If JWT verification fails (issuer / SITE_URL mismatch), hydrate clears session — restore optimistic login.
      if (!useAuthStore.getState().user && data.user) {
        login({ ...data.user, id: data.user.id });
        toast.error(
          "Session verification failed. In Vercel env set SITE_URL and NEXT_PUBLIC_SITE_URL to your exact site origin (https://…, no trailing slash), match Convex SITE_URL, then redeploy.",
        );
      } else {
        toast.success("Welcome back");
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-3xl font-bold text-white">Log in</h1>
      <p className="mt-2 text-sm text-zinc-400">
        New here?{" "}
        <Link href="/register" className="text-[#F5A623] hover:underline">
          Create an account
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 border-zinc-700 bg-[#111827] text-zinc-100"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 border-zinc-700 bg-[#111827] text-zinc-100"
          />
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="w-full bg-[#F5A623] text-black hover:bg-[#e09620]"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Continue"}
        </Button>
      </form>
    </div>
  );
}
