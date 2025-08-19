"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import TrackCTA from "@/components/TrackCTA";

export default function Header() {
  const [isDark, setIsDark] = useState(true);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("ghost-theme") : null;
    const dark = saved ? saved === "dark" : true; // default to dark
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ghost-theme", next ? "dark" : "light");
  };

  const themeLabel = mounted ? (isDark ? "Light" : "Dark") : "Theme";

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-ink/60 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ghost AI Solutions logo" width={36} height={36} className="rounded" />
            <span className="hidden sm:block text-lg tracking-tight">Ghost AI Solutions</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-8 text-sm">
            <Link className="hover:text-brand-300" href="/services">Services</Link>
            <Link className="hover:text-brand-300" href="/process">Process</Link>
            <Link className="hover:text-brand-300" href="/work">Case Studies</Link>
            <Link className="hover:text-brand-300" href="/pricing">Pricing</Link>
            <Link className="hover:text-brand-300" href="/faq">FAQ</Link>
            <Link className="hover:text-brand-300" href="/contact">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-pressed={isDark}
              aria-label="Toggle dark mode"
            >
              <span suppressHydrationWarning>{themeLabel}</span>
            </button>
            <TrackCTA
  href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call"
  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-brand-700"
  event="book_call_click_header"
>
  Book a Call
</TrackCTA>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 border"
            aria-expanded={open}
            aria-controls="mnav"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slide-down mobile nav */}
      <div
        id="mnav"
        className={`md:hidden overflow-hidden border-t bg-white dark:bg-ink transition-[max-height,opacity] duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 grid gap-3 text-sm">
          {["/services", "/process", "/work", "/pricing", "/faq", "/contact"].map(href => (
            <Link key={href} className="py-2" href={href} onClick={() => setOpen(false)}>
              {href.slice(1).replace("-", " ").replace(/\b\w/g, s => s.toUpperCase())}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={toggleTheme} className="rounded-xl border px-3 py-2">
              {mounted ? (isDark ? "Light" : "Dark") : "Theme"}
            </button>
            <TrackCTA
  href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call"
  className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white"
  onClick={() => setOpen(false)}
  event="book_call_click_mobile"
>
  Book a Call
</TrackCTA>
          </div>
        </div>
      </div>
    </header>
  );
}
