import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import DepthBackground from "@/components/shared/DepthBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sun Valley | Rajasthan Real Estate Marketplace",
  description: "Buy, rent, sell properties in Udaipur, Jaipur, Jodhpur, and across Rajasthan. Find heritage havelis, luxury lakeview villas, modern apartments, and get relocating assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProvider>
          {/* Depth drifting background layers */}
          <DepthBackground />
          
          {/* Global Header */}
          <Navbar />
          
          {/* Main content, adding margin-top for fixed navbar clearance, and bottom padding on mobile for floating bar clearance */}
          <main className="flex-1 flex flex-col pt-24 pb-24 md:pb-0">
            {children}
          </main>
          
          {/* Global Footer */}
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
