import type { Metadata } from "next";
import { CategoryPosts } from "./CategoryPosts";

export const metadata: Metadata = {
  title: "Category",
};

export default function CategoryPage() {
  return <CategoryPosts />;
}
