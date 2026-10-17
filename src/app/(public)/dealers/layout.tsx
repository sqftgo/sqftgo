import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dealers Directory",
  description:
    "Find verified real estate dealers and brokers in your city on SqftGo.",
  openGraph: {
    title: "Dealers Directory | SqftGo",
    description: "Find verified real estate dealers and brokers in your city on SqftGo.",
  },
};

export default function DealersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
