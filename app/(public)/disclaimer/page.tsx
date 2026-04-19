import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Educational disclaimer for BenjaFamily Labs.",
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-invert">
      <h1 className="font-heading text-4xl font-bold text-white">Disclaimer</h1>
      <p>
        Content on this site is for general educational and informational purposes
        only. Nothing here is investment, legal, or tax advice. Past performance
        does not guarantee future results. Crypto and leveraged products carry
        substantial risk of loss.
      </p>
      <p>
        Always conduct your own research and consult qualified professionals before
        making financial decisions.
      </p>
    </div>
  );
}
