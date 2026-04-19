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

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        user?: { id: string; email: string; name: string; role: "admin" | "user" };
      };
      if (!res.ok) {
        toast.error("Registration failed");
        return;
      }
      if (data.user) {
        login({ ...data.user, id: data.user.id });
      }
      await useAuthStore.getState().hydrate();
      toast.success("Account created");
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-3xl font-bold text-white">Sign up</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-[#F5A623] hover:underline">
          Log in
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 border-zinc-700 bg-[#111827] text-zinc-100"
          />
        </div>
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
          <Label htmlFor="password">Password (min 8 characters)</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
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
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
    </div>
  );
}
