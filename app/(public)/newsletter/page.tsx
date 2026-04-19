import type { Metadata } from "next";
import { NewsletterForm } from "@/components/shared/NewsletterForm";

export const metadata: Metadata = {
  title: "Newsletter",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-heading text-4xl font-bold text-white">Newsletter</h1>
      <p className="mt-4 text-zinc-400">
        One concise note per week—charts, narratives we are tracking, and risk
        checks.
      </p>
      <div className="mt-8">
        <NewsletterForm source="newsletter-page" />
      </div>
    </div>
  );
}
