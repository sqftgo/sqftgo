import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Services",
  description:
    "Book trusted local service professionals for packing, cleaning, legal, and home needs on SqftGo.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Home Services | SqftGo",
    description:
      "Book trusted local service professionals for packing, cleaning, legal, and home needs on SqftGo.",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
