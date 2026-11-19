import type { Metadata } from "next";

/** Logged-in listing flow — keep out of search indexes (also listed in robots.txt). */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: "/post-property" },
};

export default function PostPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
