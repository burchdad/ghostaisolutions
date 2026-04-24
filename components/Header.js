"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import TrackCTA from "@/components/TrackCTA";

export default function Header() {
  const [open, setOpen] = useState(false);
  const navGroups = [
    {
      label: "Solutions",
      links: [
        { href: "/for-startups", label: "For Startups" },
        { href: "/for-growth", label: "For Growth Businesses" },
        { href: "/enterprise", label: "For Enterprise" },
      ],
    },
    {
      label: "Capabilities",
      links: [
        { href: "/services#ai-infrastructure", label: "AI Infrastructure" },
        { href: "/services#automation", label: "Automation" },
        { href: "/services#voice-systems", label: "Voice Systems" },
        { href: "/services#data-intelligence", label: "Data Intelligence" },
        { href: "/services#custom-platforms", label: "Custom Platforms" },
      ],
    },
    {
      label: "Work",
      links: [
        { href: "/work", label: "Case Studies" },
        { href: "/demo", label: "Demos" },
      ],
    },
  ];

  const directLinks = [
    { href: "/process", label: "Process" },
    { href: "/#founder", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-slate-950/55">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/FullLogo_Transparent.png"
              alt="Ghost AI Solutions logo"
              width={180}
              height={44}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-7 text-sm">
            {navGroups.map((group) => (
              <div key={group.label} className="group relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-slate-200 transition hover:text-amber-200"
                  aria-label={group.label}
                >
                  {group.label}
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M5 8l5 5 5-5" />
                  </svg>
                </button>
                <div className="pointer-events-none invisible absolute left-0 top-full z-30 mt-3 min-w-60 rounded-2xl border border-white/10 bg-slate-950/95 p-3 opacity-0 shadow-2xl transition-all group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                  <div className="grid gap-1">
                    {group.links.map((item) => (
                      <Link
                        key={item.href}
                        className="rounded-xl px-3 py-2 text-slate-200 transition hover:bg-amber-300/10 hover:text-amber-100"
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {directLinks.map((item) => (
              <Link key={item.href} className="text-slate-200 transition hover:text-amber-200" href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
            >
              Login
            </Link>
            <TrackCTA
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(251,191,36,0.32)] transition hover:bg-amber-200"
              event="book_strategy_call_click_header"
              section="header"
              placement="desktop_primary"
              label="Book Strategy Call"
            >
              Book Strategy Call
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
        className={`md:hidden overflow-hidden border-t border-white/10 bg-slate-950/95 transition-[max-height,opacity] duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 grid gap-3 text-sm">
          {navGroups.map((group) => (
            <div key={group.label} className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">{group.label}</p>
              <div className="mt-2 grid gap-1">
                {group.links.map((item) => (
                  <Link key={item.href} className="py-1.5 text-slate-200" href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {directLinks.map((item) => (
            <Link key={item.href} className="py-1 text-slate-200" href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              href="/admin"
              className="rounded-xl border border-white/15 px-4 py-2 font-semibold text-slate-200"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
            <TrackCTA
              href="/contact"
              className="rounded-xl bg-amber-300 px-4 py-2 font-semibold text-slate-950"
              onClick={() => setOpen(false)}
              event="book_strategy_call_click_mobile"
              section="header"
              placement="mobile_primary"
              label="Book Strategy Call"
            >
              Book Strategy Call
            </TrackCTA>
          </div>
        </div>
      </div>
    </header>
  );
}
