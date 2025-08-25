// app/layout.js
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from "@/components/CookieBanner";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import StickyCTA from "@/components/StickyCTA";
import FloatingBot from "@/components/FloatingBot";

export const metadata = {
  metadataBase: new URL('https://ghostai.solutions'),
  title: 'Ghost AI Solutions — Automate Smarter. Scale Faster.',
  description: 'AI agents for measurable business impact — strategy, custom agents, and ethical governance.',
  openGraph: {
    title: 'Ghost AI Solutions — Automate Smarter. Scale Faster.',
    description: 'AI agents for measurable business impact — strategy, custom agents, and ethical governance.',
    url: 'https://ghostai.solutions',
    siteName: 'Ghost AI Solutions',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  icons: { icon: '/favicon.ico' },
  authors: [{ name: 'Ghost AI Solutions', url: 'mailto:support@ghostdefenses.com' }],
  creator: 'Ghost AI Solutions',

  // 👇 add these two new sections
  other: {
    'google-site-verification': 'YOUR_GOOGLE_CODE',
    'msvalidate.01': 'YOUR_BING_CODE',
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
        email: "support@ghostdefenses.com",
        availableLanguage: ["en"],
        areaServed: "US"
      }
    ]
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="font-body">
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
