import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Navigate the financial future with BenjaFamily Labs — crypto, markets, and strategy.",
};

export default function HomePage() {
  return <HomeContent />;
}
