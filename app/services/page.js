// FILE: app/services/page.js
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = { title: "Services — Ghost AI Solutions" };

export default function ServicesPage() {
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "AI Strategy, Custom AI Agents, and AI Governance",
    provider: {
      "@type": "Organization",
      name: "Ghost AI Solutions",
      url: "https://ghostai.solutions",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@ghostdefenses.com",
        },
      ],
    },
    serviceType: ["AI Strategy", "Custom AI Agents", "AI Ethics & Governance"],
    areaServed: "US",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "2500",
      highPrice: "6500",
      availability: "https://schema.org/InStock",
    },
  };

  const cards = [
    {
      title: "AI Strategy & Roadmap",
      body:
        "Identify high‑ROI use cases, quantify impact, and deliver a phased plan with clear success metrics.",
    },
    {
      title: "Custom AI Agents",
      body:
        "Inbox responders, lead qualifiers, ops assistants — integrated with your tools and data.",
    },
    {
      title: "Ethics & Governance",
      body:
        "Privacy, audit logs, human‑in‑the‑loop, bias testing, and robust security practices.",
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <h1 className="text-4xl font-extrabold tracking-tight">Services</h1>

        {/* JSON-LD for Services */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
        />

        <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl">
          End‑to‑end delivery — from roadmap to reliable, governed AI agents in
          production.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.title}
              className="rounded-2xl border p-6 shadow-sm bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {c.body}
              </p>
            </article>
          ))}
        </div>

        {/* Optional: CTA row */}
        <div className="mt-12">
          <a
            href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700"
          >
            Book a Strategy Call
          </a>
        </div>
      </div>
    </section>
  );
}
