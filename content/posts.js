// content/posts.js
export const posts = [
  {
    slug: "what-are-ai-agents",
    title: "What Are AI Agents (In Plain English)?",
    date: "2025-08-18",
    excerpt:
      "A quick, no‑jargon intro to AI agents and where they actually create value for small teams.",
    // simple JSX content; keep it easy (no MDX dep needed)
    Content: () => (
      <>
        <p className="mt-4">
          “AI agents” are apps that can perceive input, reason with context, and take actions in
          your tools (email, CRM, spreadsheets). Think: a teammate that drafts replies, qualifies
          leads, or reconciles invoices—with guardrails.
        </p>
        <h3 className="mt-6 text-lg font-semibold">High‑ROI places to start</h3>
        <ul className="mt-2 list-disc pl-6">
          <li>Inbox triage + reply suggestions</li>
          <li>Lead qualification + auto‑booking</li>
          <li>Ops automation (matching invoices, updating sheets/ERPs)</li>
        </ul>
        <p className="mt-4">
          Start with one workflow, measure results, then expand. Our process bakes in compliance and
          human‑in‑the‑loop where needed.
        </p>
      </>
    ),
  },
  {
    slug: "ethical-ai-basics",
    title: "Ethical AI Basics for Businesses",
    date: "2025-08-18",
    excerpt:
      "Privacy, auditability, and bias testing—what you actually need to run AI responsibly.",
    Content: () => (
      <>
        <p className="mt-4">
          Responsible AI isn’t a sticker—it’s a process. Use least‑privilege access, encrypt data in
          transit, add audit logs, and keep a human gate on high‑impact actions.
        </p>
        <ul className="mt-2 list-disc pl-6">
          <li>Data minimization & vendor due‑diligence</li>
          <li>Human‑in‑the‑loop for irreversible actions</li>
          <li>Bias tests on prompts and datasets</li>
        </ul>
        <p className="mt-4">
          We include a lightweight governance checklist in every engagement so teams can ship safely.
        </p>
      </>
    ),
  },
];
