import TrackCTA from "@/components/TrackCTA";
import Breadcrumbs from "@/components/Breadcrumbs";
import Newsletter from "@/components/Newsletter";
import { siteConfig } from "@/lib/siteConfig";


export const metadata = { title: 'Contact — Ghost AI Solutions' };

export default function Contact(){
  const hasGoogleForm = siteConfig.googleFormEmbedUrl.startsWith("https://docs.google.com/forms/");

  return (
    <section className="py-20 bg-slate-50 dark:bg-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <Breadcrumbs />
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Let’s talk</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Tell us about your workflows and we’ll map an agent that fits.
              Prefer email? <a className="text-brand-300 underline" href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
            </p>
            <ul className="mt-6 space-y-2 text-slate-600 dark:text-slate-300">
              <li>• Response within 1 business day</li>
              <li>• NDA available on request</li>
              <li>• Remote-first, global clients</li>
            </ul>
            <TrackCTA
              href={siteConfig.calendlyUrl}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
              event="book_call_click_header"
            >
              Book Strategy Call
            </TrackCTA>
          </div>

          <div className="rounded-2xl border bg-white dark:bg-ink p-0 shadow-sm overflow-hidden">
            {hasGoogleForm ? (
              <iframe
                title="Contact form"
                src={siteConfig.googleFormEmbedUrl}
                width="100%"
                height="640"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                className="min-h-[640px] w-full"
              >
                Loading…
              </iframe>
            ) : (
              <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight">Tell us what you want to automate</h2>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  Send a short note with your workflow, tools, and current bottlenecks. We will reply with a practical first-agent plan.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${siteConfig.supportEmail}?subject=Automation%20Strategy%20Request`}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Email Your Workflow
                  </a>
                  <TrackCTA
                    href={siteConfig.calendlyUrl}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
                    event="contact_book_call_fallback"
                  >
                    Book Strategy Call
                  </TrackCTA>
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
