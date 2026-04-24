// FILE: app/services/page.js
import Breadcrumbs from "@/components/Breadcrumbs";
import TrackCTA from "@/components/TrackCTA";
import { siteConfig } from "@/lib/siteConfig";

export const metadata = {
  title: "Capabilities — Ghost AI Solutions",
  description: "Outcome-focused AI infrastructure, automation, voice systems, data intelligence, and custom platform engineering.",
};

export default function ServicesPage() {
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Custom AI Infrastructure and Business Systems",
    provider: {
      "@type": "Organization",
      name: "Ghost AI Solutions",
      url: "https://ghostai.solutions",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: siteConfig.supportEmail,
        },
      ],
    },
    serviceType: [
      "AI Infrastructure",
      "Operational Automation",
      "Voice Systems",
      "Data Intelligence",
      "Custom Platform Engineering",
    ],
    areaServed: "US",
    url: "https://ghostai.solutions/services",
  };

  const cards = [
    {
      id: "ai-infrastructure",
      title: "AI Infrastructure",
      value: "Build business-specific AI foundations that support scale, reliability, and measurable outcomes.",
      delivery: "Architecture design, integration planning, governance controls, and deployment frameworks.",
    },
    {
      id: "automation",
      title: "Automation",
      value: "Remove operational friction with custom workflows that reduce handoffs and improve throughput.",
      delivery: "Process mapping, orchestration layers, approvals, and execution monitoring.",
    },
    {
      id: "voice-systems",
      title: "Voice Systems",
      value: "Improve response velocity and call handling consistency across customer-facing operations.",
      delivery: "Voice workflow architecture, qualification logic, CRM synchronization, and escalation controls.",
    },
    {
      id: "data-intelligence",
      title: "Data Intelligence",
      value: "Turn fragmented data into executive-ready visibility and actionable business intelligence.",
      delivery: "Data pipelines, KPI dashboards, enrichment workflows, and reporting surfaces.",
    },
    {
      id: "custom-platforms",
      title: "Custom Platforms",
      value: "Replace disconnected tools with purpose-built systems aligned to how your organization actually runs.",
      delivery: "Full-stack engineering, secure architecture, and iterative delivery tied to business metrics.",
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <h1 className="text-4xl font-extrabold tracking-tight">Capabilities</h1>

        {/* JSON-LD for Services */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
        />

        <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl">
          We design custom business systems where value comes first and technology follows: revenue performance, operational efficiency,
          executive intelligence, and scalable AI transformation.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.title}
              id={c.id}
              className="rounded-2xl border p-6 shadow-sm bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow scroll-mt-24"
            >
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {c.value}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">How we deliver:</span> {c.delivery}</p>
            </article>
          ))}
        </div>

        {/* Optional: CTA row */}
        <div className="mt-12">
          <TrackCTA
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700"
            event="book_strategy_call_services"
            section="services"
            placement="primary"
            label="Book Strategy Call"
          >
            Book Strategy Call
          </TrackCTA>
        </div>
      </div>
    </section>
  );
}
