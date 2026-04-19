import type { Metadata } from "next";
import { TagPosts } from "./TagPosts";

export const metadata: Metadata = {
  title: "Tag",
};

export default function TagPage() {
  return <TagPosts />;
}
