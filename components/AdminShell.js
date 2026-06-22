"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "Command",
    items: [
      { label: "Overview", href: "/admin" },
      { label: "Agent Hub", href: "/admin/agents" },
      { label: "Lead Command", href: "/admin/agents/leads" },
      { label: "Analytics", href: "/admin/agents/analytics" },
    ],
  },
  {
    label: "Growth Agents",
    items: [
      { label: "Content", href: "/admin/agents/content" },
      { label: "Social", href: "/admin/agents/social" },
      { label: "SEO", href: "/admin/agents/seo" },
      { label: "CRO", href: "/admin/agents/cro" },
      { label: "Engagement", href: "/admin/agents/engagement" },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Orchestrator", href: "/admin/agents/orchestrator" },
      { label: "Trends", href: "/admin/agents/trends" },
      { label: "Newsletter", href: "/admin/agents/newsletter" },
      { label: "Competitors", href: "/admin/agents/competitors" },
      { label: "Editorial", href: "/admin/agents/editorial" },
    ],
  },
  {
    label: "Assets",
    items: [
      { label: "Image Gen", href: "/admin/agents/image-gen" },
      { label: "Video", href: "/admin/agents/video" },
      { label: "X Threads", href: "/admin/agents/thread" },
      { label: "Case Studies", href: "/admin/agents/case-study" },
    ],
  },
];

function isActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname) {
  if (pathname === "/admin") return "Operations Dashboard";
  if (pathname === "/admin/agents") return "Agent Hub";
  const match = NAV_GROUPS.flatMap((group) => group.items).find((item) => isActive(pathname, item.href));
  return match?.label || "Admin";
}

export default function AdminShell({ children }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <main id="main">{children}</main>;
  }

  const title = pageTitle(pathname);

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-slate-950/95 px-4 py-5 lg:block">
        <Link href="/admin" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <img src="/FullLogo_Transparent.png" alt="Ghost AI Solutions" className="h-9 w-9 object-contain" />
          <div>
            <p className="text-sm font-bold text-white">Ghost Mission Control</p>
            <p className="text-xs text-cyan-200">Admin Command</p>
          </div>
        </Link>

        <nav className="mt-6 space-y-6" aria-label="Admin sidebar">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.label}</p>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-cyan-300/15 text-cyan-100 ring-1 ring-cyan-300/25"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Ghost Mission Control</p>
              <h1 className="text-lg font-bold text-white">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">
                Public Site
              </Link>
              <form action="/api/admin/logout" method="post">
                <button type="submit" className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-rose-300/40 hover:text-white">
                  Log Out
                </button>
              </form>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-2 lg:hidden">
            {NAV_GROUPS.flatMap((group) => group.items).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold ${
                  isActive(pathname, item.href)
                    ? "bg-cyan-300/15 text-cyan-100"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>

        <main id="main" className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
