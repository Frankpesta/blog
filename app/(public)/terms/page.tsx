import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-invert">
      <h1 className="font-heading text-4xl font-bold text-white">Terms of service</h1>
      <p>
        By accessing this site you agree not to misuse services, scrape content in
        violation of robots policies, or attempt unauthorized access to systems.
      </p>
      <p>
        Content is provided “as is” without warranties. We may update these terms;
        continued use constitutes acceptance.
      </p>
    </div>
  );
}
