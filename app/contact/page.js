import { pageMetadata } from "@/lib/seo.mjs";
import TrackCTA from "@/components/TrackCTA";
import Breadcrumbs from "@/components/Breadcrumbs";
import Newsletter from "@/components/Newsletter";
import QualificationIntake from "@/components/QualificationIntake";
import { siteConfig } from "@/lib/siteConfig";
import { BOOKING_URL } from "@/lib/constants";

export const metadata = pageMetadata("/start", { title: "Website Audit and Project Intake - Ghost AI Solutions", description: "Request a free website audit or tell Ghost AI Solutions about your website, CRM, automation, or custom AI project." });

export default function Contact() {
  const hasGoogleForm = siteConfig.googleFormEmbedUrl.startsWith("https://docs.google.com/forms/");

  return (
    <section className="bg-slate-50 py-20 dark:bg-ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <div className="grid items-start gap-10 lg:grid-cols-[0.82fr_1.35fr]">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Start with a free website audit</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Share your website and what you want to improve. Looking for CRM, automation, or a custom AI system? Tell us here too.
            </p>
            <ul className="mt-6 space-y-2 text-slate-600 dark:text-slate-300">
              <li>- For new websites, redesigns, and connected workflows</li>
              <li>- Tell us about your current website and goals</li>
              <li>- We will review the details to recommend a next step</li>
            </ul>
            <TrackCTA
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
              event="schedule_call_contact_primary"
              section="contact"
              placement="primary"
              label="Schedule Call"
            >
              Schedule Call
            </TrackCTA>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-white p-0 shadow-sm dark:bg-ink">
            {hasGoogleForm ? (
              <iframe
                title="Contact form"
                src={siteConfig.googleFormEmbedUrl}
                width="100%"
                height="720"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                className="min-h-[720px] w-full"
              >
                Loading...
              </iframe>
            ) : (
              <div className="p-6" id="blueprint">
                <h2 className="text-2xl font-bold tracking-tight">Website audit and project intake</h2>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  Tell us a little about your business, website, and goals so we can understand the help you need.
                </p>
                <div className="mt-6">
                  <QualificationIntake supportEmail={siteConfig.supportEmail} />
                </div>
              </div>
            )}
            <Newsletter />
          </div>
        </div>
      </div>
    </section>
  );
}
