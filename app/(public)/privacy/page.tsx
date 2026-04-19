import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-invert">
      <h1 className="font-heading text-4xl font-bold text-white">Privacy policy</h1>
      <p>
        We collect email addresses when you subscribe to the newsletter or create an
        account. We use cookies for authentication sessions. Data is processed to
        operate this site and send emails you opt into.
      </p>
      <p>
        Contact the site operator for data requests or deletion where applicable.
      </p>
    </div>
  );
}
