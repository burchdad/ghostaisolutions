// FILE: components/Header.js
"use client";
import Link from "next/link";
import Image from 'next/image';
import { useEffect, useState } from "react";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true); // default to dark
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("ghost-theme") : null;
    const initial = saved ? saved === "dark" : true; // dark by default
    applyTheme(initial);
    setIsDark(initial);
    setMounted(true);
  }, []);

  const applyTheme = (dark) => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    document.body.classList.toggle("bg-ink", dark);
    document.body.classList.toggle("text-slate-100", dark);
    document.body.classList.toggle("bg-white", !dark);
    document.body.classList.toggle("text-slate-900", !dark);
    localStorage.setItem("ghost-theme", dark ? "dark" : "light");
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
  };

  // Render a neutral label until mounted so SSR and client match
  const themeLabel = mounted ? (isDark ? "Light" : "Dark") : "Theme";

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-ink/60 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
  <span className="relative inline-flex h-9 w-9 overflow-hidden rounded-xl">
    <Image src="/logo.png" alt="Ghost AI Solutions" fill className="object-contain" />
  </span>
  <span className="hidden sm:block text-lg tracking-tight">Ghost AI Solutions</span>
</Link>

          <nav aria-label="Main" className="hidden md:flex items-center gap-8 text-sm">
            <Link className="hover:text-brand-700" href="/services">Services</Link>
            <Link className="hover:text-brand-700" href="/process">Process</Link>
            <Link className="hover:text-brand-700" href="/work">Case Studies</Link>
            <Link className="hover:text-brand-700" href="/pricing">Pricing</Link>
            <Link className="hover:text-brand-700" href="/faq">FAQ</Link>
            <Link className="hover:text-brand-700" href="/contact">Contact</Link>
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
            <a
              href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-brand-700"
            >
              Book a Call
            </a>
          </div>

          {/* Mobile */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 border"
            aria-expanded={mobileOpen}
            aria-controls="mnav"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div id="mnav" className={`md:hidden ${mobileOpen ? "" : "hidden"} border-t bg-white dark:bg-ink`}>
        <div className="mx-auto max-w-7xl px-4 py-4 grid gap-3 text-sm">
          <Link className="py-2" href="/services" onClick={()=>setMobileOpen(false)}>Services</Link>
          <Link className="py-2" href="/process" onClick={()=>setMobileOpen(false)}>Process</Link>
          <Link className="py-2" href="/work" onClick={()=>setMobileOpen(false)}>Case Studies</Link>
          <Link className="py-2" href="/pricing" onClick={()=>setMobileOpen(false)}>Pricing</Link>
          <Link className="py-2" href="/faq" onClick={()=>setMobileOpen(false)}>FAQ</Link>
          <Link className="py-2" href="/contact" onClick={()=>setMobileOpen(false)}>Contact</Link>
          <div className="flex gap-3 pt-2">
            <button onClick={toggleTheme} className="rounded-xl border px-3 py-2">
              {mounted ? (isDark ? "Light" : "Dark") : "Theme"}
            </button>
            <a
              href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call"
              className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white"
              onClick={()=>setMobileOpen(false)}
            >
              Book a Call
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
