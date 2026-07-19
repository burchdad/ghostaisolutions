// app/chatbot/page.js
import Breadcrumbs from "@/components/Breadcrumbs";
import TrackCTA from "@/components/TrackCTA";
import { BOOKING_URL } from "@/lib/constants";

export const metadata = {
  title: "AI Chatbot for Lead Capture | Ghost AI Solutions",
  description:
    "See how Ghostbot turns website visitors into qualified conversations with lead capture, routing, and implementation support from Ghost AI Solutions.",
};

const faqItems = [
  [
    "What does Ghostbot do?",
    "Ghostbot helps capture website visitors, qualify their intent, and route high-intent conversations toward booking or a project blueprint.",
  ],
  [
    "Can Ghostbot be embedded on an existing website?",
    "Yes. The chatbot can run as a hosted experience or be embedded with a script tag and configured for brand color, placement, and handoff behavior.",
  ],
  [
    "What happens after someone starts chatting?",
    "The flow gathers context, identifies fit, and points qualified visitors toward the next conversion step such as a blueprint request or walkthrough.",
  ],
];

export default function ChatbotPage() {
  const embedSnippet = `<script
  src="https://ghostai.solutions/ghostbot-embed.js"
  data-agent-url="https://ghostbot-chat.vercel.app"
  data-brand="Ghostbot"
  data-primary="#1db954"
  data-position="right"
  data-config-id="ghostai"
  defer
></script>`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        <h1 className="text-4xl font-extrabold tracking-tight">
          AI chatbot built to turn website traffic into booked conversations
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
          Ghostbot captures visitor intent, qualifies fit, and routes high-intent leads
          toward a blueprint request or walkthrough instead of letting them drift away.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <TrackCTA
            href="/contact#blueprint"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700"
            event="chatbot_blueprint_hero_cta"
            section="chatbot"
            placement="hero_primary"
            label="Get My Chatbot Blueprint"
          >
            Get My Chatbot Blueprint
          </TrackCTA>
          <TrackCTA
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
            event="book_chatbot_walkthrough"
            section="chatbot"
            placement="hero_secondary"
            label="Book a Walkthrough"
          >
            Book a Walkthrough
          </TrackCTA>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Hosted Preview
              </h2>
              <a
                href="https://ghostbot-chat.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline"
              >
                Open full app
              </a>
            </div>
            <div className="aspect-[16/10] overflow-hidden rounded-2xl border bg-black">
              <iframe
                src="https://ghostbot-chat.vercel.app/"
                className="h-full w-full"
                title="Ghostbot"
                loading="lazy"
                allow="clipboard-write; microphone; camera"
              />
            </div>
          </div>

          <aside className="rounded-2xl border bg-white p-6 dark:bg-slate-900">
            <h2 className="text-lg font-bold">Conversion-ready chatbot embed</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Add Ghostbot to an existing site, then shape the greeting, capture flow,
              and handoff path around the leads you actually want.
            </p>

            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
              <code>{embedSnippet}</code>
            </pre>

            <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>? Captures email, company, goal, and project context</li>
              <li>? Routes qualified visitors toward booking or blueprint requests</li>
              <li>? Works on desktop and mobile viewports</li>
              <li>? Opens as a floating launcher and iframe panel</li>
            </ul>

            <a
              href="/demo"
              className="mt-5 inline-flex text-sm font-semibold text-brand-600 dark:text-brand-300 hover:underline"
            >
              See full implementation details &rarr;
            </a>
          </aside>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Lead Capture", "Collects email, company, and project intent during conversation."],
            ["Routing Logic", "Qualifies high-intent leads and routes them to booking instantly."],
            ["Brand Safe", "Controlled tone, bounded prompts, and configurable behavior per site."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border bg-white p-4 dark:bg-slate-900">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{body}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border bg-white p-6 dark:bg-slate-900">
          <h2 className="text-2xl font-bold tracking-tight">What the chatbot improves first</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ["Clear next step", "Visitors see whether to request a blueprint, book a walkthrough, or explore the live demo."],
              ["Qualified handoff", "The conversation captures context before a lead reaches your calendar or inbox."],
              ["Measurable path", "CTA events are separated by placement so traffic, clicks, and conversions can be reviewed after launch."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl border p-4 dark:border-slate-800">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border bg-white p-6 dark:bg-slate-900">
          <h2 className="text-2xl font-bold tracking-tight">Common chatbot questions</h2>
          <div className="mt-5 space-y-4">
            {faqItems.map(([question, answer]) => (
              <div key={question}>
                <h3 className="font-semibold">{question}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <TrackCTA
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700"
            event="book_chatbot_walkthrough"
            section="chatbot"
            placement="primary"
            label="Book a Chatbot Walkthrough"
          >
            Book a Chatbot Walkthrough
          </TrackCTA>

          <TrackCTA
            href="/contact#blueprint"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
            event="chatbot_blueprint_cta"
            section="chatbot"
            placement="secondary"
            label="Get My Chatbot Blueprint"
          >
            Get My Chatbot Blueprint
          </TrackCTA>

          <a
            href="/demo"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            See Live Demo
          </a>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/70 p-6 dark:border-brand-900 dark:bg-brand-950/30">
          <h3 className="text-lg font-bold">Need a white-labeled version?</h3>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            We can deploy Ghostbot with your own domain, prompt policy, integrations,
            and handoff workflow in a fixed-fee sprint.
          </p>
        </div>
      </div>
    </section>
  );
}
