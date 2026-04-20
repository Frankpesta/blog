import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "BenjaFamily Labs",
    template: "%s — BenjaFamily Labs",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full antialiased",
        inter.variable,
        spaceGrotesk.variable,
        "font-sans",
      )}
    >
      <body className="flex min-h-full flex-col bg-[#0A0F1E] font-sans text-zinc-100">
        <ConvexAuthNextjsServerProvider>
          <AppProviders>{children}</AppProviders>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
