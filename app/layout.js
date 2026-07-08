// app/layout.js
import './globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import Script from "next/script";
import SiteChrome from "@/components/SiteChrome";
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
  metadataBase: new URL("https://www.ghostai.solutions"),
  title: "Ghost AI Solutions - Websites, Automation, and AI Systems",
  description: "Modern websites, lead funnels, automations, and AI-powered systems for businesses that need a sharper digital presence and cleaner operations.",
  keywords: [
    "custom software development",
    "ai automation agency",
    "ai voice systems",
    "workflow automation",
    "custom crm development",
    "data pipeline engineering",
    "ghost ai solutions",
  ],
  openGraph: {
    title: "Ghost AI Solutions - Websites, Automation, and AI Systems",
    description: "Websites, intake funnels, automations, and AI systems for businesses ready to capture leads and operate cleaner.",
    url: "https://ghostai.solutions",
    siteName: "Ghost AI Solutions",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
  icons: { icon: "/favicon.ico" },
  authors: [{ name: siteConfig.companyName, url: `mailto:${siteConfig.supportEmail}` }],
  creator: "Ghost AI Solutions",

  other: {
    ...(googleSiteVerification ? { "google-site-verification": googleSiteVerification } : {}),
    ...(bingSiteVerification ? { "msvalidate.01": bingSiteVerification } : {}),
  },
  alternates: {
    canonical: "https://www.ghostai.solutions",
    types: {
      "application/rss+xml": "/feed",
    },
  },
};

export default function RootLayout({ children }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ghost AI Solutions",
    url: "https://ghostai.solutions",
    logo: "https://ghostai.solutions/FullLogo_Transparent.png",
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

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Custom Systems Engineering",
    provider: {
      "@type": "Organization",
      name: "Ghost AI Solutions",
      url: "https://ghostai.solutions",
    },
    serviceType: [
      "Website Design and Development",
      "Lead Funnel Development",
      "Custom Platform Development",
      "Workflow Automation Engineering",
      "AI Voice Systems",
      "Data Pipeline and Intelligence Systems",
    ],
    areaServed: "US",
    url: "https://ghostai.solutions/services",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ghost AI Solutions",
    url: "https://ghostai.solutions",
  };

  return (
    <html lang="en" className={`dark scroll-smooth ${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-JCBXCKPPK3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JCBXCKPPK3');
          `}
        </Script>
      </head>
      <body className="font-body antialiased">
        <UTMTracker />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-white focus:text-ink focus:rounded-lg focus:shadow"
        >
          Skip to content
        </a>
        <SiteChrome>{children}</SiteChrome>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
