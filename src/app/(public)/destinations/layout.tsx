import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore heritage real estate destinations across Rajasthan, Gujarat, and Bharat on SqftGo.",
  openGraph: {
    title: "Destinations | SqftGo",
    description:
      "Explore heritage real estate destinations across Rajasthan, Gujarat, and Bharat on SqftGo.",
  },
};

export default function DestinationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
