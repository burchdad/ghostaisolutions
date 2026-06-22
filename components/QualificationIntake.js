"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TrackCTA from "@/components/TrackCTA";
import { BOOKING_URL } from "@/lib/constants";

const steps = [
  "Contact",
  "Website Goals",
  "Budget + Timeline",
  "Submit",
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  smsConsent: false,
  company: "",
  industry: "",
  websiteUrl: "",
  projectType: "",
  desiredOutcome: "",
  visualDirection: "",
  exampleSites: "",
  currentProblem: "",
  budget: "",
  timeline: "",
};

export default function QualificationIntake({ supportEmail }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(initialForm);

  const highIntent = useMemo(() => {
    const budgetHigh = form.budget === "5-10k" || form.budget === "10k+";
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
      return form.projectType && form.desiredOutcome.trim();
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
      `Phone: ${form.phone}`,
      `SMS Consent: ${form.smsConsent ? "Yes" : "No"}`,
      `Company: ${form.company}`,
      `Industry: ${form.industry}`,
      `Current Website: ${form.websiteUrl || "Not provided"}`,
      `Project Type: ${form.projectType}`,
      `Primary Goal: ${form.desiredOutcome}`,
      `Current Problem: ${form.currentProblem}`,
      `Visual Direction: ${form.visualDirection}`,
      `Example Sites: ${form.exampleSites}`,
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

    const subject = encodeURIComponent("Ghost AI Website Audit Intake");
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
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Mobile phone (optional)" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <label className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4 text-xs leading-5 text-slate-200">
            <input
              type="checkbox"
              checked={form.smsConsent}
              onChange={(e) => update("smsConsent", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/30 bg-slate-950 accent-cyan-300"
            />
            <span>
              I agree to receive SMS messages from Ghost AI Solutions about appointment scheduling, follow-up,
              support, service updates, and business communications. Message frequency may vary. Message and data
              rates may apply. Reply HELP for help or STOP to opt out. Consent is not a condition of purchase.
              View our{" "}
              <Link className="font-semibold text-cyan-200 underline underline-offset-4" href="/privacy-policy">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link className="font-semibold text-cyan-200 underline underline-offset-4" href="/terms">
                Terms of Service
              </Link>
              .
            </span>
          </label>
          <input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Company" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder="Industry / business type" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-3">
          <input value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="Current website URL (optional)" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <select value={form.projectType} onChange={(e) => update("projectType", e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            <option value="">What do you need help with?</option>
            <option value="New website">New website</option>
            <option value="Website redesign">Website redesign</option>
            <option value="Landing page / funnel">Landing page / funnel</option>
            <option value="Website + automation">Website + automation</option>
            <option value="AI chatbot / assistant">AI chatbot / assistant</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
          <textarea value={form.desiredOutcome} onChange={(e) => update("desiredOutcome", e.target.value)} placeholder="What do you want the website to help you do?" rows={3} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <textarea value={form.currentProblem} onChange={(e) => update("currentProblem", e.target.value)} placeholder="What feels broken, outdated, missing, or unclear right now?" rows={3} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <textarea value={form.visualDirection} onChange={(e) => update("visualDirection", e.target.value)} placeholder="Any ideas for the look, feel, colors, style, or sections you want?" rows={3} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <textarea value={form.exampleSites} onChange={(e) => update("exampleSites", e.target.value)} placeholder="Example websites you like, if any" rows={3} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-3">
          <select value={form.budget} onChange={(e) => update("budget", e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            <option value="">Budget range</option>
            <option value="under-2k">Under 2k</option>
            <option value="2-5k">2k - 5k</option>
            <option value="5-10k">5k - 10k</option>
            <option value="10k+">10k+</option>
            <option value="not-sure">Not sure yet</option>
          </select>
          <select value={form.timeline} onChange={(e) => update("timeline", e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            <option value="">Desired start timeline</option>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="30 days">30 days</option>
            <option value="60-90 days">60-90 days</option>
            <option value="planning">Still planning</option>
          </select>
          <p className="text-xs text-slate-300">
            Ready-now submissions are routed to calendar booking after submit. Early-stage requests are routed to email follow-up first.
          </p>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <pre className="max-h-64 overflow-auto rounded-xl border border-white/15 bg-white/5 p-4 text-xs text-slate-200">{summary}</pre>
          <p className="mt-3 text-xs text-slate-300">
            We route this submission to the right website, automation, or AI lane and reply with a clear first step.
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
          Prefer to start with email?
        </a>
      </div>

      {submitted ? (
        <p className="mt-4 text-xs text-cyan-200">
          Intake submitted. If calendar did not open, use Schedule Call and mention this submission.
        </p>
      ) : null}
    </div>
  );
}
