import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Listings",
  description:
    "Browse verified homes, villas, apartments, and commercial spaces across Bharat on SqftGo.",
  openGraph: {
    title: "Property Listings | SqftGo",
    description:
      "Browse verified homes, villas, apartments, and commercial spaces across Bharat on SqftGo.",
  },
};

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
