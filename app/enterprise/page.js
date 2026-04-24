import TrackCTA from "@/components/TrackCTA";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Enterprise AI Transformation - Ghost AI Solutions",
  description:
    "Enterprise-grade AI transformation and secure custom infrastructure for modernization, automation, and executive intelligence.",
};

const enterpriseThemes = [
  {
    title: "Enterprise-Grade Deployment",
    description:
      "Design and deploy AI systems that align to enterprise controls, scale, and reliability requirements.",
  },
  {
    title: "Secure AI Architecture",
    description:
      "Build with governance, access controls, observability, and process accountability from the start.",
  },
  {
    title: "Department Modernization",
    description:
      "Upgrade high-friction business processes with custom automation and intelligence layers.",
  },
];

const enterpriseInitiatives = [
  "Executive intelligence and cross-functional reporting",
  "Department and process modernization roadmaps",
  "Custom automation for complex operational workflows",
  "Secure integrations across internal and third-party systems",
  "AI-enhanced customer and service operations",
  "Scalable platform architecture for long-term transformation",
];

export default function EnterprisePage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">For Enterprise</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl">Enterprise AI Transformation</h1>
          <p className="mt-5 text-lg text-slate-300">
            We partner with enterprise leaders to modernize systems, unify intelligence, and deploy secure AI infrastructure at scale.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {enterpriseThemes.map((item) => (
            <article key={item.title} className="rounded-2xl border border-amber-300/20 bg-slate-950/70 p-6">
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-slate-950/60 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-white">Transformation Priorities We Support</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {enterpriseInitiatives.map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <TrackCTA
              href="/contact"
              event="enterprise_page_request_consultation"
              section="enterprise"
              placement="primary"
              label="Request Enterprise Consultation"
              className="inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Request Enterprise Consultation
            </TrackCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
