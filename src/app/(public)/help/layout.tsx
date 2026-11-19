import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help",
  alternates: { canonical: "/help" },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
