import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { AppProviders } from "@/providers/AppProviders";
import Navbar from "@/components/shared/Navbar";
import MainWrapper from "@/components/shared/MainWrapper";


// Prevent Font Awesome from dynamically adding its CSS since we imported it above
config.autoAddCss = false;
import Footer from "@/components/shared/Footer";
import DepthBackground from "@/components/shared/DepthBackground";
import { PostPropertyButton } from "@/features/properties";
import { JsonLd, organizationJsonLd } from "@/lib/seo/json-ld";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  getSiteOrigin,
  SITE_NAME,
} from "@/lib/seo/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteOrigin = getSiteOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "SqftGo",
    "Bharat real estate",
    "buy property India",
    "rent property",
    "Udaipur property",
    "Jaipur property",
    "heritage homes",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteOrigin,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "LDXp-Rrimu7F-ajxg6HiiVrRSc8FVe7ZBKatdRCPsLU",
  },
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
        <JsonLd data={organizationJsonLd()} />
        <AppProviders>
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
          


          {/* Logged-in user: Post Property FAB */}
          <PostPropertyButton />
        </AppProviders>
      </body>
    </html>
  );
}
