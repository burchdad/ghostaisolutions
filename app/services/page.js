export const metadata = { title: "Services — Ghost AI Solutions" };

export default function ServicesPage() {
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "AI Strategy, Custom AI Agents, and AI Governance",
    provider: { "@type": "Organization", name: "Ghost AI Solutions", url: "https://ghostai.solutions" },
    serviceType: ["AI Strategy", "Custom AI Agents", "AI Ethics & Governance"],
    areaServed: "US",
    offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: "2500", highPrice: "6500" }
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Services</h1>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
        />
        {/* …existing services content… */}
      </div>
    </section>
  );
}
