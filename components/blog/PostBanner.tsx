import Image from "next/image";

export type PostBannerProps = {
  title: string;
  excerpt?: string;
  coverUrl: string | null;
  category: { name: string; icon: string } | null;
  author: { name: string; avatarUrl?: string | null } | null;
  publishedAt: number | undefined;
  readingTime: number;
};

/**
 * Full-bleed hero for the post cover + title. Kept separate from article HTML so
 * cover images never compete visually with inline editor images in the body.
 */
export function PostBanner({
  title,
  excerpt,
  coverUrl,
  category,
  author,
  publishedAt,
  readingTime,
}: PostBannerProps) {
  const hasCover = Boolean(coverUrl);

  return (
    <section
      aria-label="Article banner"
      className="relative border-b border-[#F5A623]/20 bg-[#0A0F1E]"
    >
      {/* Decorative bottom accent — reads as “editorial header”, not body copy */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-gradient-to-r from-transparent via-[#F5A623]/60 to-transparent"
        aria-hidden
      />

      <div
        className={`relative w-full overflow-hidden ${
          hasCover
            ? "aspect-[21/9] max-h-[min(420px,50vh)] min-h-[240px]"
            : "min-h-[300px] md:min-h-[360px]"
        }`}
      >
        {hasCover ? (
          <Image
            src={coverUrl!}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(245,166,35,0.18),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(17,24,39,0.9),transparent),linear-gradient(to_bottom,#111827,#0A0F1E)]"
            aria-hidden
          />
        )}

        {/* Scrim: stronger at bottom so type stays legible with or without photo */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/85 to-[#0A0F1E]/25"
          aria-hidden
        />
        {!hasCover ? (
          <div
            className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:48px_48px]"
            aria-hidden
          />
        ) : null}

        <div className="relative z-[1] flex min-h-[inherit] flex-col justify-end px-4 pb-8 pt-24 md:px-10 md:pb-12 md:pt-28">
          <div className="mx-auto w-full max-w-4xl">
            {category ? (
              <span className="inline-flex items-center rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-[#F5A623] backdrop-blur-md">
                {category.icon} {category.name}
              </span>
            ) : null}
            <h1 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl md:leading-[1.1]">
              {title}
            </h1>
            {excerpt ? (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300 md:text-lg">
                {excerpt}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-400">
              {author ? (
                <div className="flex items-center gap-2">
                  {author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={author.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-white/10"
                    />
                  ) : null}
                  <span className="font-medium text-zinc-200">{author.name}</span>
                </div>
              ) : null}
              {publishedAt ? (
                <time dateTime={new Date(publishedAt).toISOString()}>
                  {new Date(publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              ) : null}
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
