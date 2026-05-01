import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export const metadata = {
  title: "Data Deletion Request - Ghost AI Solutions",
  description:
    "How to request deletion of user data associated with Ghost AI Solutions services and connected platform integrations.",
  alternates: {
    canonical: "https://ghostai.solutions/data-deletion",
  },
};

const deletionSteps = [
  {
    title: "Submit your request",
    description:
      "Email our support team or submit a request through our contact form and include the platform account details associated with your request.",
  },
  {
    title: "Identity verification",
    description:
      "Before deleting data, we verify identity and authorization to prevent unauthorized or fraudulent deletion attempts.",
  },
  {
    title: "Review and process",
    description:
      "Our team reviews associated records, removes eligible data from active systems, and records completion status.",
  },
  {
    title: "Confirmation",
    description:
      "Once complete, we send confirmation of deletion processing and any applicable retention exceptions required by law or contract.",
  },
];

export default function DataDeletionPage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <header className="rounded-3xl border border-amber-300/20 bg-slate-950/70 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Compliance</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">User Data Deletion Request</h1>
          <p className="mt-4 max-w-3xl text-slate-300 sm:text-lg">
            Ghost AI Solutions supports user data deletion requests related to our website, connected platform integrations,
            automation systems, and client service environments.
          </p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white">How data deletion requests work</h2>
            <p className="mt-3 text-slate-300">
              Users may request deletion of personal data stored by Ghost AI Solutions where applicable. For security and legal reasons,
              some records may be retained for limited periods (for example: security logs, contractual records, or legal obligations).
            </p>

            <ol className="mt-6 space-y-4">
              {deletionSteps.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-white/10 bg-slate-900/75 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Step {index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{step.description}</p>
                </li>
              ))}
            </ol>
          </article>

          <aside className="grid gap-4 content-start">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5">
              <h2 className="text-lg font-semibold text-white">Verification requirement</h2>
              <p className="mt-2 text-sm text-slate-300">
                We require identity verification before processing deletion to protect users from unauthorized account actions.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <h2 className="text-lg font-semibold text-white">Processing timeframe</h2>
              <p className="mt-2 text-sm text-slate-300">
                Most verified deletion requests are processed within 7-30 business days depending on system complexity and legal constraints.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <h2 className="text-lg font-semibold text-white">Contact for deletion requests</h2>
              <p className="mt-2 text-sm text-slate-300">
                Email: <a href={`mailto:${siteConfig.supportEmail}`} className="underline underline-offset-4">{siteConfig.supportEmail}</a>
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Form: <Link href="/contact" className="underline underline-offset-4">ghostai.solutions/contact</Link>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}