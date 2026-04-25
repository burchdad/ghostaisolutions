import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { siteConfig } from "@/lib/siteConfig";

const LAST_UPDATED = "April 25, 2026";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    body: [
      "Ghost AI Solutions (\"Ghost AI\", \"we\", \"our\", or \"us\") operates the website ghostai.solutions and related digital properties, software products, client dashboards, and service integrations.",
      "This Privacy Policy explains how we collect, use, disclose, and protect information when you visit our website, communicate with us, or engage us for services including AI consulting, custom software development, automation systems, digital growth support, and platform integrations.",
    ],
  },
  {
    id: "information-collected",
    title: "2. Information We Collect",
    body: [
      "We may collect information you provide directly, information collected automatically, and information obtained from authorized third-party connections.",
    ],
    bullets: [
      "Personal and business information submitted through forms, strategy-call scheduling, or service intake (for example: name, email, company name, role, project details).",
      "Contact and communication data exchanged by email, contact forms, and client communication channels.",
      "Usage and analytics data such as page views, session behavior, referrer data, and engagement events.",
      "Technical and device data such as browser type, IP address, operating system, and general geolocation derived from network metadata.",
      "Cookie and tracking data used for website functionality, analytics, and marketing performance measurement.",
      "Authorized third-party platform data (for example: CRM, advertising, social, analytics, or API-connected systems) when provided or approved by a client for contracted service delivery.",
    ],
  },
  {
    id: "use-of-information",
    title: "3. How We Use Information",
    body: [
      "We use information in ways that are reasonably necessary to operate our business, deliver services, and protect our systems.",
    ],
    bullets: [
      "Deliver consulting, implementation, software development, analytics, and automation services.",
      "Respond to inquiries, proposals, support requests, and client communications.",
      "Operate, maintain, optimize, and secure our website and service workflows.",
      "Provide reporting, performance insights, and service-related analytics.",
      "Improve service quality, user experience, and internal processes.",
      "Detect, prevent, and investigate fraud, abuse, security incidents, and misuse.",
      "Comply with legal obligations, contractual commitments, and lawful requests.",
    ],
  },
  {
    id: "platform-api-data",
    title: "4. Platform and API Data Usage",
    body: [
      "When clients authorize integrations with third-party platforms or APIs, Ghost AI accesses and processes only the data reasonably required to deliver the contracted services.",
      "Connected platform data may be used for automation workflows, analytics, operational optimization, personalization logic, reporting, and system performance management.",
      "We do not sell or license client-authorized platform data for unrelated commercial purposes, and we do not share it outside service delivery and approved operational requirements except as described in this Privacy Policy.",
    ],
  },
  {
    id: "sharing-disclosure",
    title: "5. Sharing and Disclosure of Information",
    body: [
      "We do not sell personal information. We may disclose information in the following limited circumstances:",
    ],
    bullets: [
      "To trusted service providers and subprocessors that support hosting, analytics, communications, security, scheduling, payment, and infrastructure operations.",
      "To comply with legal obligations, legal process, or enforceable governmental requests.",
      "To protect the rights, property, security, and integrity of Ghost AI, our clients, and users.",
      "In connection with a merger, acquisition, financing, asset sale, or similar corporate transaction, subject to appropriate confidentiality controls.",
      "With client direction or authorization where disclosure is required to provide requested services.",
    ],
  },
  {
    id: "data-security",
    title: "6. Data Security",
    body: [
      "We apply commercially reasonable administrative, technical, and organizational safeguards designed to protect information from unauthorized access, disclosure, alteration, or destruction.",
      "Safeguards may include access controls, least-privilege permissions, secure credential management, encryption in transit where applicable, logging, and monitoring practices appropriate to the context of the service.",
      "No method of transmission or storage is guaranteed to be completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "data-retention",
    title: "7. Data Retention",
    body: [
      "We retain personal and service-related data for as long as reasonably necessary to fulfill the purposes described in this policy, comply with legal obligations, resolve disputes, enforce agreements, and maintain legitimate business records.",
      "Retention periods vary based on data type, contractual obligations, legal requirements, and service context.",
    ],
  },
  {
    id: "user-rights",
    title: "8. Your Choices and Rights",
    body: [
      "Depending on your location and applicable law, you may have rights regarding access, correction, deletion, restriction, portability, or objection to certain processing activities.",
    ],
    bullets: [
      "Request access to or correction of personal information we hold about you.",
      "Request deletion of personal information, subject to legal, contractual, and security exceptions.",
      "Opt out of marketing emails by using unsubscribe links or contacting us directly.",
      "Control cookies and tracking through browser settings, device controls, and applicable consent preferences.",
    ],
  },
  {
    id: "third-party-links",
    title: "9. Third-Party Links and Integrations",
    body: [
      "Our website and services may contain links to or integrations with third-party sites, platforms, and tools that we do not own or control.",
      "We are not responsible for the privacy practices of third parties. We encourage you to review their privacy notices and terms before sharing data.",
    ],
  },
  {
    id: "children",
    title: "10. Children's Privacy",
    body: [
      "Our website and services are not directed to children under 13 years of age, and we do not knowingly collect personal information from children under 13.",
      "If you believe a child has provided us with personal information, contact us and we will take appropriate steps to review and remove such data where required.",
    ],
  },
  {
    id: "policy-changes",
    title: "11. Changes to This Privacy Policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in services, legal requirements, or business operations.",
      "When we update this policy, we will revise the Last Updated date above. Continued use of our website or services after updates indicates acknowledgment of the revised policy.",
    ],
  },
  {
    id: "contact",
    title: "12. Contact Information",
    body: [
      "For questions, requests, or concerns related to privacy and data handling, contact us at the email below or through our contact form.",
    ],
  },
];

export const metadata = {
  title: "Privacy Policy - Ghost AI Solutions",
  description:
    "Read the Ghost AI Solutions Privacy Policy covering data collection, API-connected platform data use, security, retention, rights, and contact information.",
  alternates: {
    canonical: "https://ghostai.solutions/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <header className="rounded-3xl border border-amber-300/20 bg-slate-950/70 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Legal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-3xl text-slate-300 sm:text-lg">
            This policy describes how Ghost AI Solutions collects, uses, protects, and discloses information in connection with our website,
            consulting engagements, software platforms, and authorized third-party integrations.
          </p>
          <p className="mt-4 text-sm font-medium text-amber-100">Last Updated: {LAST_UPDATED}</p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <nav className="rounded-2xl border border-white/10 bg-slate-950/60 p-4" aria-label="Privacy Policy sections">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Table of Contents</p>
              <ol className="mt-3 grid gap-2 text-sm">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="inline-flex items-center gap-2 text-slate-200 transition hover:text-amber-200"
                    >
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 sm:p-8">
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                    <a
                      href={`#${section.id}`}
                      aria-label={`Copy link to ${section.title}`}
                      className="inline-flex rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-amber-300/40 hover:text-amber-200"
                    >
                      Link
                    </a>
                  </div>

                  <div className="mt-4 space-y-4 text-slate-300">
                    {section.body?.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}

                    {section.bullets?.length ? (
                      <ul className="list-disc space-y-2 pl-6">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}

                    {section.id === "contact" ? (
                      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
                        <p>
                          Email: <a className="underline underline-offset-4" href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
                        </p>
                        <p className="mt-2">
                          Contact Form: <Link className="underline underline-offset-4" href="/contact">ghostai.solutions/contact</Link>
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}