import Breadcrumbs from "@/components/Breadcrumbs";
import TrackCTA from "@/components/TrackCTA";
import { siteConfig } from "@/lib/siteConfig";

export const metadata = {
  title: "Capabilities - Ghost AI Solutions",
  description: "Website, automation, AI, voice, data intelligence, and custom platform capabilities from Ghost AI Solutions.",
};

export default function ServicesPage() {
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Websites, Automation, and AI Business Systems",
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
      "Website Design and Development",
      "Lead Funnel Development",
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
      id: "websites",
      title: "Websites & Lead Funnels",
      value: "Create a sharper first impression and guide visitors toward calls, quotes, bookings, or purchases.",
      delivery: "Website strategy, page design, conversion copy, forms, booking paths, analytics, and launch support.",
    },
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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
        />

        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          We design custom business systems where value comes first and technology follows: website conversion, revenue performance,
          operational efficiency, executive intelligence, and scalable AI transformation.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.title}
              id={c.id}
              className="scroll-mt-24 rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:bg-slate-900"
            >
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{c.value}</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold">How we deliver:</span> {c.delivery}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <TrackCTA
            href="/start"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700"
            event="free_website_audit_services"
            section="services"
            placement="primary"
            label="Get Free Website Audit"
          >
            Get Free Website Audit
          </TrackCTA>
        </div>
      </div>
    </section>
  );
}
