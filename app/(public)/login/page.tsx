"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthActions } from "@convex-dev/auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      toast.success("Welcome back");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Invalid credentials");
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
