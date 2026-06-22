"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin" },
  { label: "Agent Hub", href: "/admin/agents" },
  { label: "Leads", href: "/admin/agents/leads" },
  { label: "Social", href: "/admin/agents/social" },
  { label: "Content", href: "/admin/agents/content" },
  { label: "SEO", href: "/admin/agents/seo" },
  { label: "CRO", href: "/admin/agents/cro" },
  { label: "Analytics", href: "/admin/agents/analytics" },
  { label: "Orchestrator", href: "/admin/agents/orchestrator" },
];

function isActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSubnav({ className = "" }) {
  const pathname = usePathname();

  return (
    <nav className={`rounded-2xl border border-white/10 bg-slate-950/70 p-2 ${className}`} aria-label="Admin dashboard navigation">
      <div className="flex gap-2 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-cyan-300/15 text-cyan-100 ring-1 ring-cyan-300/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
