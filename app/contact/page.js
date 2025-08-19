import TrackCTA from "@/components/TrackCTA";
import Breadcrumbs from "@/components/Breadcrumbs";
import Newsletter from "@/components/Newsletter";


export const metadata = { title: 'Contact — Ghost AI Solutions' };

export default function Contact(){
  return (
    <section className="py-20 bg-slate-50 dark:bg-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <Breadcrumbs />
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Let’s talk</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Tell us about your workflows and we’ll map an agent that fits.
              Prefer email? <a className="text-brand-300 underline" href="mailto:support@ghostdefenses.com">support@ghostdefenses.com</a>
            </p>
            <ul className="mt-6 space-y-2 text-slate-600 dark:text-slate-300">
              <li>• Response within 1 business day</li>
              <li>• NDA available on request</li>
              <li>• Remote-first, global clients</li>
            </ul>
            <TrackCTA
              href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
              event="book_call_click_header"
            >
              Book a Call
            </TrackCTA>
          </div>

          {/* Replace the src with your real Google Form when ready */}
          <div className="rounded-2xl border bg-white dark:bg-ink p-0 shadow-sm overflow-hidden">
            <iframe
              title="Contact form"
              src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true"
              width="100%"
              height="640"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              className="min-h-[640px] w-full"
            >
              Loading…
            </iframe>

            {/* Fallback if the form fails to load (keeps it pretty while you build) */}
            <noscript>
              <div className="p-6 text-slate-600">
                Our contact form requires scripts. Email us at support@ghostdefenses.com or book a call.
              </div>
            </noscript>
            <Newsletter />
          </div>
        </div>
      </div>
    </section>
  );
}
