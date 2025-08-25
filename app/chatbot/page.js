// app/chatbot/page.js
import Breadcrumbs from "@/components/Breadcrumbs";
import TrackCTA from "@/components/TrackCTA";

export const metadata = { title: "Ghostbot — Ghost AI Solutions" };

export default function ChatbotPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <h1 className="text-4xl font-extrabold tracking-tight">Ghostbot</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl">
          Our GPT‑powered assistant that captures leads, answers questions, and can be embedded on your site.
        </p>

        {/* Embedded Ghostbot app */}
        <div className="mt-8 aspect-[16/10] rounded-2xl overflow-hidden border bg-black">
          <iframe
            src="https://ghostbot-chat.vercel.app/"
            className="w-full h-full"
            title="Ghostbot"
            allow="clipboard-write; microphone; camera"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <TrackCTA
            href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700"
            event="chatbot_book_call_click"
          >
            Book a Setup Call
          </TrackCTA>
          <a
            href="/demo"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            See Live Demo
          </a>
        </div>
      </div>
    </section>
  );
}
