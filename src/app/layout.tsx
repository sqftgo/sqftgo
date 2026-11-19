import type { Metadata } from "next";
import {
  Geist_Mono,
  Mozilla_Text,
  Stack_Sans_Headline,
  Uncial_Antiqua,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
import PostPropertyButton from "@/features/properties/components/PostPropertyButton";
import { JsonLd, organizationJsonLd } from "@/lib/seo/json-ld";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  getSiteOrigin,
  SITE_NAME,
} from "@/lib/seo/site";

const mozillaText = Mozilla_Text({
  subsets: ["latin"],
  variable: "--font-mozilla-text",
  display: "swap",
});

const stackSansHeadline = Stack_Sans_Headline({
  subsets: ["latin"],
  variable: "--font-stack-sans-headline",
  display: "swap",
});

const uncialAntiqua = Uncial_Antiqua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-uncial-antiqua",
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
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
  // Do not set a global canonical here — it would force every page to "/" .
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
      className={`${mozillaText.variable} ${stackSansHeadline.variable} ${uncialAntiqua.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col font-sans">
        <JsonLd data={organizationJsonLd()} />
        <AppProviders>
          <DepthBackground />
          <Navbar />
          <MainWrapper>{children}</MainWrapper>
          <Footer />
          <PostPropertyButton />
          <Analytics />
        </AppProviders>
      </body>
    </html>
  );
}
