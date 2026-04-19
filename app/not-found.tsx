import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-heading text-7xl font-bold text-[#F5A623]">404</p>
      <h1 className="font-heading text-2xl text-zinc-100">
        This page drifted off-chain.
      </h1>
      <p className="max-w-md text-zinc-400">
        The link may be outdated or the post was moved. Head back to the hub.
      </p>
      <Button asChild className="bg-[#F5A623] text-black hover:bg-[#e09620]">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
