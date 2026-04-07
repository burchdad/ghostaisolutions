// app/layout.js
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from "@/components/CookieBanner";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import StickyCTA from "@/components/StickyCTA";
import FloatingBot from "@/components/FloatingBot";
import UTMTracker from "@/components/UTMTracker";
import { siteConfig } from "@/lib/siteConfig";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingSiteVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL('https://ghostai.solutions'),
  title: 'Ghost AI Solutions - Custom Systems Engineering',
  description: 'Custom software, AI systems, and operational platforms designed from scratch to solve real-world problems.',
  openGraph: {
    title: 'Ghost AI Solutions - Custom Systems Engineering',
    description: 'If it does not exist, we build it. Custom software, AI systems, and operational platforms for real-world deployment.',
    url: 'https://ghostai.solutions',
    siteName: 'Ghost AI Solutions',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  icons: { icon: '/favicon.ico' },
  authors: [{ name: siteConfig.companyName, url: `mailto:${siteConfig.supportEmail}` }],
  creator: 'Ghost AI Solutions',

  other: {
    ...(googleSiteVerification ? { 'google-site-verification': googleSiteVerification } : {}),
    ...(bingSiteVerification ? { 'msvalidate.01': bingSiteVerification } : {}),
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed',
    },
  },
};

export default function RootLayout({ children }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ghost AI Solutions",
    url: "https://ghostai.solutions",
    logo: "https://ghostai.solutions/logo.png",
    sameAs: ["https://www.linkedin.com/company/ghostaisolutions"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.supportEmail,
        availableLanguage: ["en"],
        areaServed: "US"
      }
    ]
  };

  return (
    <html lang="en" className={`dark scroll-smooth ${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <UTMTracker />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-white focus:text-ink focus:rounded-lg focus:shadow"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyCTA />
        <CookieBanner />
        <FloatingBot />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
