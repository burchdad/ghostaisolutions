'use client';

export default function ChatbotPage() {
  return (
    <main className="bg-[#121217] text-white min-h-screen py-10 px-6">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#1db954]">
          Ghostbot: Your AI Assistant for Sales, Support, and Scheduling
        </h1>
      </header>

      <section className="max-w-5xl mx-auto text-lg">
        <p className="mb-6">Ghostbot is a customizable AI chatbot powered by GPT-4, built to help you:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1e1e28] border-l-4 border-[#1db954] p-4 rounded-md">💬 Answer customer questions instantly</div>
          <div className="bg-[#1e1e28] border-l-4 border-[#1db954] p-4 rounded-md">📩 Capture and score leads with CRM-ready forms</div>
          <div className="bg-[#1e1e28] border-l-4 border-[#1db954] p-4 rounded-md">📅 Book demos via Calendly</div>
          <div className="bg-[#1e1e28] border-l-4 border-[#1db954] p-4 rounded-md">📊 Sync to Google Sheets, Slack, and Zapier</div>
          <div className="bg-[#1e1e28] border-l-4 border-[#1db954] p-4 rounded-md">🧠 Personalize tone, branding, and workflow per business</div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl mb-4">👀 Want to Try Ghostbot?</h2>
          <iframe
            src="/demo?configId=ghostai"
            className="w-full max-w-xl h-[500px] rounded-xl mx-auto"
            title="Ghostbot Demo"
          ></iframe>
          <div className="mt-6">
            <a
              href="/onboarding.html"
              className="bg-[#1db954] text-[#121217] px-6 py-3 rounded-md text-lg font-semibold hover:opacity-90"
            >
              Launch Your Own Ghostbot →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
