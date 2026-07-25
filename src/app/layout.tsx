import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/shared/Navbar";
import MainWrapper from "@/components/shared/MainWrapper";
import CompareBar from "@/components/shared/CompareBar";

// Prevent Font Awesome from dynamically adding its CSS since we imported it above
config.autoAddCss = false;
import Footer from "@/components/shared/Footer";
import DepthBackground from "@/components/shared/DepthBackground";
import DreamProjectButton from "@/components/shared/DreamProjectButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SqftGo | Rajasthan Real Estate Marketplace",
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
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProvider>
          {/* Depth drifting background layers */}
          <DepthBackground />
          
          {/* Global Header */}
          <Navbar />
          
          {/* Main content, adding margin-top for fixed navbar clearance, and bottom padding on mobile for floating bar clearance */}
          <MainWrapper>
            {children}
          </MainWrapper>
          
          {/* Global Footer */}
          <Footer />
          
          {/* Sticky compare tray when 2+ properties selected */}
          <CompareBar />

          {/* Global Dream Project Button */}
          <DreamProjectButton />
        </AppProvider>
      </body>
    </html>
  );
}
