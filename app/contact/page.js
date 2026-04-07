import TrackCTA from "@/components/TrackCTA";
import Breadcrumbs from "@/components/Breadcrumbs";
import Newsletter from "@/components/Newsletter";
import QualificationIntake from "@/components/QualificationIntake";
import { siteConfig } from "@/lib/siteConfig";
import { BOOKING_URL } from "@/lib/constants";

export const metadata = { title: "Contact — Ghost AI Solutions" };

export default function Contact() {
  const hasGoogleForm = siteConfig.googleFormEmbedUrl.startsWith("https://docs.google.com/forms/");

  return (
    <section className="py-20 bg-slate-50 dark:bg-ink">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <div className="grid lg:grid-cols-[1fr_1.25fr] gap-10 items-start">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Start your build intake</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Submit the workflow, bottleneck, stack, budget, and timeline. We route you to the right build lane and next action.
            </p>
            <ul className="mt-6 space-y-2 text-slate-600 dark:text-slate-300">
              <li>• Qualification response within 1 business day</li>
              <li>• NDA available on request</li>
              <li>• Build blueprint available before kickoff</li>
            </ul>
            <TrackCTA
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
              event="start_project_contact_primary"
              section="contact"
              placement="primary"
              label="Start a Project"
            >
              Start a Project
            </TrackCTA>
          </div>

          <div className="rounded-2xl border bg-white dark:bg-ink p-0 shadow-sm overflow-hidden">
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
                <h2 className="text-2xl font-bold tracking-tight">Multi-step build qualification</h2>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  High-intent requests are routed to strategy booking. Early-stage requests are routed to blueprint + email planning.
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
