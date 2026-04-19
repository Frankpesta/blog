import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `About ${BRAND.name} — financial education and crypto research.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl font-bold text-white">
        About {BRAND.name}
      </h1>
      <p className="mt-6 text-lg text-zinc-400">
        We publish research-grade explainers on markets, digital assets, and risk
        management—built for curious readers who want signal, not hype.
      </p>
      <h2 className="mt-10 font-heading text-2xl text-zinc-100">Mission</h2>
      <p className="mt-3 text-zinc-400">
        Demystify finance and crypto with disciplined frameworks, transparent
        sourcing, and community-first discussion.
      </p>
    </div>
  );
}
