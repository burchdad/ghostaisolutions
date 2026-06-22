"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import StickyCTA from "@/components/StickyCTA";
import FloatingBot from "@/components/FloatingBot";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <StickyCTA />
      <CookieBanner />
      <FloatingBot />
    </>
  );
}
