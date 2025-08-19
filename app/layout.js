import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react'; // 👈 add this

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
  other: {'google-site-verification': 'cYd-MHdQLNPrphUbMzn5QbwOt8Excs4CP3QDcxTEw7M'},
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-body">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-white focus:text-ink focus:rounded-lg focus:shadow">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <SpeedInsights />   {/* performance metrics */}
        <Analytics />       {/* web analytics (pageviews, referrers, etc.) */}
      </body>
    </html>
  );
}
