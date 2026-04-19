import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TickerBar } from "@/components/layout/TickerBar";
import { SearchCommand } from "@/components/layout/SearchCommand";

export const metadata: Metadata = {
  title: {
    default: "BenjaFamily Labs — Finance & Crypto Education",
    template: "%s — BenjaFamily Labs",
  },
  description:
    "Financial education, crypto analysis, and markets insight from BenjaFamily Labs.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TickerBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <SearchCommand />
    </>
  );
}
