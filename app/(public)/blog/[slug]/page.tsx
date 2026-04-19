import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  preloadQuery,
  preloadedQueryResult,
} from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { PostClient } from "./PostClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const preloaded = await preloadQuery(api.posts.getPublishedBySlug, { slug });
  const post = preloadedQueryResult(preloaded);
  if (!post) {
    return { title: "Not found" };
  }
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${url}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: post.coverUrl ? [{ url: post.coverUrl }] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preloaded = await preloadQuery(api.posts.getPublishedBySlug, { slug });
  const post = preloadedQueryResult(preloaded);
  if (!post) {
    notFound();
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt
              ? new Date(post.publishedAt).toISOString()
              : undefined,
          }),
        }}
      />
      <PostClient preloaded={preloaded} />
    </>
  );
}
