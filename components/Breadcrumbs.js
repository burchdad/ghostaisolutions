"use client";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname(); // e.g. /services
  const parts = pathname.split("/").filter(Boolean); // ["services"]

  // Build breadcrumb items
  const items = [
    { name: "Home", href: "/" },
    ...parts.map((seg, i) => {
      const href = "/" + parts.slice(0, i + 1).join("/");
      const name = seg
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
      return { name, href };
    }),
  ];

  // JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: `https://ghostai.solutions${it.href === "/" ? "" : it.href}`,
    })),
  };

  // Hide on home
  if (pathname === "/") return null;

  return (
    <div className="mb-6 text-sm text-slate-600 dark:text-slate-300">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-1">
        {items.map((it, i) => (
          <span key={it.href} className="inline">
            <a href={it.href} className="underline hover:no-underline">{it.name}</a>
            {i < items.length - 1 ? <span className="mx-1">/</span> : null}
          </span>
        ))}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}
