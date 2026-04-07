"use client";

import { useMemo, useState } from "react";
import TrackCTA from "@/components/TrackCTA";
import { BOOKING_URL } from "@/lib/constants";

const steps = [
  "Contact",
  "Build Scope",
  "Budget + Timeline",
  "Submit",
];

const initialForm = {
  name: "",
  email: "",
  company: "",
  role: "",
  industry: "",
  workflow: "",
  bottleneck: "",
  desiredOutcome: "",
  stack: "",
  budget: "",
  timeline: "",
};

export default function QualificationIntake({ supportEmail }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(initialForm);

  const highIntent = useMemo(() => {
    const budgetHigh = form.budget === "25-50k" || form.budget === "50k+";
    const timelineHigh = form.timeline === "2-4 weeks" || form.timeline === "30 days";
    return budgetHigh || timelineHigh;
  }, [form.budget, form.timeline]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const canContinue = useMemo(() => {
    if (step === 0) {
      return form.name.trim() && form.email.trim();
    }
    if (step === 1) {
      return form.workflow.trim() && form.bottleneck.trim();
    }
    if (step === 2) {
      return form.budget && form.timeline;
    }
    return true;
  }, [form, step]);

  const summary = useMemo(
    () => [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Company: ${form.company}`,
      `Role: ${form.role}`,
      `Industry: ${form.industry}`,
      `Workflow: ${form.workflow}`,
      `Bottleneck: ${form.bottleneck}`,
      `Desired Outcome: ${form.desiredOutcome}`,
      `Current Stack: ${form.stack}`,
      `Budget: ${form.budget}`,
      `Timeline: ${form.timeline}`,
    ].join("\n"),
    [form]
  );

  const handleSubmit = () => {
    setSubmitted(true);

    if (highIntent) {
      window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
      return;
    }

    const subject = encodeURIComponent("Ghost AI Build Intake");
    const body = encodeURIComponent(summary);
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="rounded-2xl border border-white/15 bg-slate-950/75 p-6">
      <div className="mb-6 flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${index <= step ? "bg-cyan-300/20 text-cyan-200" : "bg-white/5 text-slate-400"}`}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      {step === 0 ? (
        <div className="grid gap-3">
          <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Work email" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Company" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="Role" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-3">
          <input value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder="Industry" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <textarea value={form.workflow} onChange={(e) => update("workflow", e.target.value)} placeholder="Which workflow should we build first?" rows={3} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <textarea value={form.bottleneck} onChange={(e) => update("bottleneck", e.target.value)} placeholder="Biggest bottleneck today" rows={3} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <textarea value={form.desiredOutcome} onChange={(e) => update("desiredOutcome", e.target.value)} placeholder="Target outcome / KPI" rows={3} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input value={form.stack} onChange={(e) => update("stack", e.target.value)} placeholder="Current stack (CRM, tools, data sources)" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-3">
          <select value={form.budget} onChange={(e) => update("budget", e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            <option value="">Budget range</option>
            <option value="under-10k">Under 10k</option>
            <option value="10-25k">10k - 25k</option>
            <option value="25-50k">25k - 50k</option>
            <option value="50k+">50k+</option>
          </select>
          <select value={form.timeline} onChange={(e) => update("timeline", e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            <option value="">Desired start timeline</option>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="30 days">30 days</option>
            <option value="60-90 days">60-90 days</option>
            <option value="planning">Still planning</option>
          </select>
          <p className="text-xs text-slate-300">
            High-intent submissions are routed directly to calendar booking after submit.
          </p>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <pre className="max-h-64 overflow-auto rounded-xl border border-white/15 bg-white/5 p-4 text-xs text-slate-200">{summary}</pre>
          <p className="mt-3 text-xs text-slate-300">
            We route this submission to the right build lane and reply with a concrete first-phase plan.
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((current) => current - 1)} className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
            Back
          </button>
        ) : null}

        {step < 3 ? (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep((current) => current + 1)}
            className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <TrackCTA
            href={highIntent ? BOOKING_URL : `mailto:${supportEmail}`}
            event="contact_intake_submit"
            section="contact_intake"
            placement="submit"
            label={highIntent ? "Book Strategy Call" : "Send Intake"}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {highIntent ? "Book Strategy Call" : "Send Intake"}
          </TrackCTA>
        )}

        <a href="#blueprint" className="text-sm font-semibold text-cyan-200 underline underline-offset-4">
          Also want the blueprint template?
        </a>
      </div>

      {submitted ? (
        <p className="mt-4 text-xs text-cyan-200">
          Intake submitted. If calendar did not open, use Start a Project and mention this submission.
        </p>
      ) : null}
    </div>
  );
}
