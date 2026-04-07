"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import TrackCTA from "@/components/TrackCTA";
import { BOOKING_URL } from "@/lib/constants";

export default function Header() {
  const [open, setOpen] = useState(false);
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/#solutions", label: "Solutions" },
    { href: "/#industries", label: "Industries" },
    { href: "/projects", label: "Projects" },
    { href: "/technology", label: "Technology" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-slate-950/55">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ghost AI Solutions logo" width={36} height={36} className="rounded" />
            <span className="hidden sm:block text-lg tracking-tight text-white">Ghost AI Solutions</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-8 text-sm">
            {navItems.map((item) => (
              <Link key={item.href} className="text-slate-200 transition hover:text-cyan-300" href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <TrackCTA
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.32)] transition hover:bg-cyan-300"
              event="start_project_click_header"
              section="header"
              placement="desktop_primary"
              label="Start a Project"
            >
              Start a Project
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
          {navItems.map((item) => (
            <Link key={item.href} className="py-2 text-slate-200" href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <TrackCTA
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
              onClick={() => setOpen(false)}
              event="start_project_click_mobile"
              section="header"
              placement="mobile_primary"
              label="Start a Project"
            >
              Start a Project
            </TrackCTA>
          </div>
        </div>
      </div>
    </header>
  );
}
