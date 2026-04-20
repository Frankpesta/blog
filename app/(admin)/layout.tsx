import type { Metadata } from "next";
import { AdminChrome } from "@/components/admin/AdminChrome";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminChrome>{children}</AdminChrome>;
}
