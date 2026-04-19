import type { Metadata } from "next";
import { BlogIndexClient } from "./BlogIndexClient";

export const metadata: Metadata = {
  title: "Blog",
  description: "All articles from BenjaFamily Labs.",
};

export default function BlogIndexPage() {
  return <BlogIndexClient />;
}
