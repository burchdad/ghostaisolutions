"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TrackCTA from "@/components/TrackCTA";
import { BOOKING_URL } from "@/lib/constants";

const steps = [
  { label: "Contact", kicker: "Who should we follow up with?" },
  { label: "Goal", kicker: "Pick the first business outcome." },
  { label: "Path", kicker: "Choose the buying motion." },
  { label: "Details", kicker: "Help us route it correctly." },
  { label: "Review", kicker: "Check the recommended path." },
];

const primaryNeeds = [
  ["more-leads", "Get more leads", "Pipeline", "Lead capture, conversion, and follow-up"],
  ["website", "Build or redesign a website", "Website", "A stronger site, funnel, or landing experience"],
  ["seo", "Improve SEO / AEO / GEO", "Search", "Organic visibility across search and AI answers"],
  ["ads", "Run paid ads", "Ads", "Google, social, and conversion campaign support"],
  ["social", "Social media or content", "Content", "Publishing, creative, and brand consistency"],
  ["software", "Build software, an app, or SaaS", "Build", "Custom tools, portals, mobile apps, or SaaS"],
  ["automation", "Add AI automation or agents", "AI", "Agents, workflows, integrations, and ops automation"],
  ["strategy", "Fractional CTO / AI architect", "Strategy", "Technical leadership, architecture, and roadmap help"],
  ["not-sure", "Not sure yet", "Guide", "A guided recommendation from your current bottleneck"],
];

const offerPaths = [
  ["package", "Ongoing growth partner", "Best when you want marketing, systems, reporting, and strategy handled together."],
  ["ala-carte", "One-time / a la carte", "Best when you know the exact project or service you need right now."],
  ["unsure", "Help me choose", "Best when you want us to recommend the right starting point."],
];

const services = [
  ["website-design", "Website Design"],
  ["seo-aeo-geo", "SEO / AEO / GEO"],
  ["social-management", "Social Media Management"],
  ["google-ads", "Google Ads"],
  ["social-ads", "Social Media Ads"],
  ["video-commercials", "Video Commercials"],
  ["mobile-app", "Mobile App Dev"],
  ["saas-build", "SaaS Build"],
  ["ai-automation", "AI Integrations / Automations / Agents"],
  ["fractional-cto", "Fractional CTO / Fractional AI Architect"],
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  smsConsent: false,
  company: "",
  industry: "",
  websiteUrl: "",
  primaryNeed: "",
  offerPath: "",
  selectedServices: [],
  businessStage: "",
  teamSize: "",
  revenueRange: "",
  investmentComfort: "",
  timeline: "",
  desiredOutcome: "",
  currentProblem: "",
  visualDirection: "",
  exampleSites: "",
  projectType: "",
  budget: "",
  recommendedTier: "",
  recommendedPath: "",
};

const fieldClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-cyan-300/20";

function selectedLabel(options, value) {
  return options.find(([id]) => id === value)?.[1] || value || "Not provided";
}

function getRecommendedPath(form) {
  if (form.offerPath === "ala-carte") return "One-time / a la carte project";
  if (form.offerPath === "package") return "Growth partner package";
  if (["software", "automation", "strategy"].includes(form.primaryNeed)) return "Custom build or strategic engagement";
  if (form.selectedServices.length > 1 || ["ads", "social", "seo", "more-leads"].includes(form.primaryNeed)) {
    return "Growth partner package";
  }
  return "One-time / a la carte project";
}

function getRecommendedTier(form) {
  if (form.offerPath === "ala-carte") return "A la carte project";
  if (form.teamSize === "50+" || form.revenueRange === "10m+" || form.investmentComfort === "5k+") {
    return "Enterprise / Custom";
  }
  if (form.teamSize === "21-50" || form.revenueRange === "2m-10m") return "Scale";
  if (form.teamSize === "6-20" || form.revenueRange === "250k-2m" || form.investmentComfort === "3k-5k") {
    return "Growth";
  }
  if (form.investmentComfort === "500-1500" || form.investmentComfort === "1500-3k") return "Startup";
  if (form.businessStage === "new" || form.investmentComfort === "under-500") return "Founder Launch";
  if (["software", "automation", "strategy"].includes(form.primaryNeed)) return "Custom";
  return "Startup";
}

function ChoiceCard({ active, label, eyebrow, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border p-4 text-left transition duration-200 ${
        active
          ? "border-cyan-300/80 bg-cyan-300/15 shadow-[0_0_0_1px_rgba(103,232,249,0.22),0_18px_45px_rgba(8,145,178,0.14)]"
          : "border-white/12 bg-white/[0.055] hover:border-cyan-200/40 hover:bg-white/[0.085]"
      }`}
    >
      <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-slate-600 transition group-hover:bg-cyan-300" />
      <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
        active ? "border-cyan-200/50 bg-cyan-200/15 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300"
      }`}>
        {eyebrow}
      </span>
      <span className="mt-3 block text-sm font-bold text-white">{label}</span>
      {description ? <span className="mt-1 block text-xs leading-5 text-slate-300">{description}</span> : null}
    </button>
  );
}

function SectionIntro({ step, children }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Step {step + 1}</p>
      <h3 className="mt-1 text-xl font-bold text-white">{steps[step].label}</h3>
      <p className="mt-1 text-sm text-slate-300">{children || steps[step].kicker}</p>
    </div>
  );
}

export default function QualificationIntake({ supportEmail }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState(initialForm);

  const recommendation = useMemo(
    () => ({
      path: getRecommendedPath(form),
      tier: getRecommendedTier(form),
    }),
    [form]
  );

  const progress = Math.round(((step + 1) / steps.length) * 100);

  const routePreview = useMemo(() => {
    const primary = selectedLabel(primaryNeeds, form.primaryNeed);
    const path = selectedLabel(offerPaths, form.offerPath);
    const serviceCount = form.selectedServices.length;
    return [
      ["Need", form.primaryNeed ? primary : "Waiting on goal"],
      ["Path", form.offerPath ? path : "Not selected"],
      ["Services", serviceCount ? `${serviceCount} selected` : "To be determined"],
    ];
  }, [form.offerPath, form.primaryNeed, form.selectedServices.length]);

  const highIntent = useMemo(() => {
    const urgent = form.timeline === "now" || form.timeline === "30-days";
    const highBudget = ["3k-5k", "5k+"].includes(form.investmentComfort);
    const strategic = ["software", "automation", "strategy"].includes(form.primaryNeed);
    return urgent || highBudget || strategic || recommendation.tier === "Enterprise / Custom";
  }, [form.investmentComfort, form.primaryNeed, form.timeline, recommendation.tier]);

  const update = (key, value) => {
    setSubmitted(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleService = (value) => {
    setSubmitted(false);
    setForm((current) => {
      const selected = new Set(current.selectedServices);
      if (selected.has(value)) selected.delete(value);
      else selected.add(value);
      return { ...current, selectedServices: [...selected] };
    });
  };

  const canContinue = useMemo(() => {
    if (step === 0) return form.name.trim() && form.email.trim();
    if (step === 1) return form.primaryNeed && form.desiredOutcome.trim();
    if (step === 2) return form.offerPath;
    if (step === 3) {
      if (!form.timeline || !form.investmentComfort) return false;
      if (form.offerPath === "package") return form.businessStage && form.teamSize && form.revenueRange;
      if (form.offerPath === "ala-carte") return form.selectedServices.length > 0;
      return form.currentProblem.trim();
    }
    return true;
  }, [form, step]);

  const summary = useMemo(
    () => [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || "Not provided"}`,
      `SMS Consent: ${form.smsConsent ? "Yes" : "No"}`,
      `Company: ${form.company || "Not provided"}`,
      `Industry: ${form.industry || "Not provided"}`,
      `Current Website: ${form.websiteUrl || "Not provided"}`,
      `Primary Need: ${selectedLabel(primaryNeeds, form.primaryNeed)}`,
      `Offer Path: ${selectedLabel(offerPaths, form.offerPath)}`,
      `Selected Services: ${form.selectedServices.map((item) => selectedLabel(services, item)).join(", ") || "Not provided"}`,
      `Business Stage: ${form.businessStage || "Not provided"}`,
      `Team Size: ${form.teamSize || "Not provided"}`,
      `Revenue Range: ${form.revenueRange || "Not provided"}`,
      `Investment Comfort: ${form.investmentComfort || "Not provided"}`,
      `Timeline: ${form.timeline || "Not provided"}`,
      `Primary Goal: ${form.desiredOutcome}`,
      `Current Problem: ${form.currentProblem || "Not provided"}`,
      `Visual Direction: ${form.visualDirection || "Not provided"}`,
      `Example Sites: ${form.exampleSites || "Not provided"}`,
      `Recommended Path: ${recommendation.path}`,
      `Recommended Tier: ${recommendation.tier}`,
    ].join("\n"),
    [form, recommendation.path, recommendation.tier]
  );

  const handleSubmit = async () => {
    const shouldOpenBooking = highIntent;
    const payload = {
      ...form,
      budget: form.investmentComfort,
      projectType: recommendation.path,
      recommendedPath: recommendation.path,
      recommendedTier: recommendation.tier,
      highIntent: shouldOpenBooking,
    };

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Submission failed");

      setSubmitted(true);
      setForm(initialForm);
      setStep(0);

      if (shouldOpenBooking) {
        window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
      }
    } catch {
      setSubmitError(`Something went wrong. Email ${supportEmail} directly and mention GhostAI growth intake.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-200/15 bg-slate-950/90 shadow-[0_24px_80px_rgba(2,6,23,0.42)]">
      <div className="border-b border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Growth route builder</p>
            <p className="mt-1 text-sm text-slate-300">Your answers tune the recommendation as you go.</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200">
            {progress}% complete
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-cyan-300 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_0.72fr]">
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap gap-2">
            {steps.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => index < step && setStep(index)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  index === step
                    ? "bg-cyan-300 text-slate-950"
                    : index < step
                      ? "bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/25"
                      : "bg-white/5 text-slate-400"
                }`}
              >
                {index + 1}. {item.label}
              </button>
            ))}
          </div>

          {submitted ? (
            <div className="mb-5 rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm text-cyan-100">
              Thank you. Your intake was submitted, a confirmation email is on the way, and we will follow up with the
              right next step. The form has been reset for a fresh submission.
            </div>
          ) : null}

          {step === 0 ? (
            <div>
              <SectionIntro step={step} />
              <div className="grid gap-3">
                <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className={fieldClass} />
                <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Work email" className={fieldClass} />
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Mobile phone (optional)" className={fieldClass} />
                <label className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/[0.06] p-4 text-xs leading-5 text-slate-200">
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
                <input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Company" className={fieldClass} />
                <input value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder="Industry / business type" className={fieldClass} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <SectionIntro step={step} />
              <div className="grid gap-3 sm:grid-cols-2">
                {primaryNeeds.map(([value, label, eyebrow, description]) => (
                  <ChoiceCard
                    key={value}
                    active={form.primaryNeed === value}
                    label={label}
                    eyebrow={eyebrow}
                    description={description}
                    onClick={() => update("primaryNeed", value)}
                  />
                ))}
              </div>
              <textarea value={form.desiredOutcome} onChange={(e) => update("desiredOutcome", e.target.value)} placeholder="What do you want to accomplish first?" rows={3} className={`${fieldClass} mt-4`} />
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <SectionIntro step={step} />
              <div className="grid gap-3">
                {offerPaths.map(([value, label, description]) => (
                  <ChoiceCard
                    key={value}
                    active={form.offerPath === value}
                    label={label}
                    eyebrow={value === "package" ? "Partner" : value === "ala-carte" ? "Project" : "Guide"}
                    description={description}
                    onClick={() => update("offerPath", value)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <SectionIntro step={step} />
              <div className="grid gap-3">
                <input value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="Current website URL (optional)" className={fieldClass} />

                {form.offerPath === "package" ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <select value={form.businessStage} onChange={(e) => update("businessStage", e.target.value)} className={fieldClass}>
                      <option value="">Business stage</option>
                      <option value="new">New / launching</option>
                      <option value="early">Early traction</option>
                      <option value="growing">Growing and needs systems</option>
                      <option value="scaling">Scaling operations</option>
                      <option value="enterprise">Enterprise / multi-location</option>
                    </select>
                    <select value={form.teamSize} onChange={(e) => update("teamSize", e.target.value)} className={fieldClass}>
                      <option value="">Team size</option>
                      <option value="solo">Solo / founder led</option>
                      <option value="1-5">1-5 employees</option>
                      <option value="6-20">6-20 employees</option>
                      <option value="21-50">21-50 employees</option>
                      <option value="50+">50+ employees</option>
                    </select>
                    <select value={form.revenueRange} onChange={(e) => update("revenueRange", e.target.value)} className={fieldClass}>
                      <option value="">Annual revenue range</option>
                      <option value="under-100k">Under 100k</option>
                      <option value="100k-250k">100k - 250k</option>
                      <option value="250k-2m">250k - 2M</option>
                      <option value="2m-10m">2M - 10M</option>
                      <option value="10m+">10M+</option>
                      <option value="not-sure">Not sure / prefer not to say</option>
                    </select>
                  </div>
                ) : null}

                {form.offerPath === "ala-carte" ? (
                  <div className="rounded-xl border border-white/12 bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Select what you need</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {services.map(([value, label]) => (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm transition ${
                            form.selectedServices.includes(value)
                              ? "border-cyan-300/80 bg-cyan-300/15 text-cyan-100"
                              : "border-white/15 bg-white/[0.05] text-slate-200 hover:border-cyan-200/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.selectedServices.includes(value)}
                            onChange={() => toggleService(value)}
                            className="h-4 w-4 rounded border-white/30 bg-slate-950 accent-cyan-300"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <select value={form.investmentComfort} onChange={(e) => update("investmentComfort", e.target.value)} className={fieldClass}>
                    <option value="">Investment comfort if the plan is a clear fit</option>
                    <option value="under-500">Under $500/month</option>
                    <option value="500-1500">$500 - $1,500/month</option>
                    <option value="1500-3k">$1,500 - $3,000/month</option>
                    <option value="3k-5k">$3,000 - $5,000/month</option>
                    <option value="5k+">$5,000+/month</option>
                    <option value="one-time">I prefer one-time project pricing</option>
                    <option value="not-sure">Not sure yet</option>
                  </select>
                  <select value={form.timeline} onChange={(e) => update("timeline", e.target.value)} className={fieldClass}>
                    <option value="">Desired start timeline</option>
                    <option value="now">Ready now</option>
                    <option value="30-days">Within 30 days</option>
                    <option value="60-90-days">60-90 days</option>
                    <option value="planning">Still planning</option>
                  </select>
                </div>
                <textarea value={form.currentProblem} onChange={(e) => update("currentProblem", e.target.value)} placeholder="What feels missing, unclear, outdated, or not working right now?" rows={3} className={fieldClass} />
                <textarea value={form.visualDirection} onChange={(e) => update("visualDirection", e.target.value)} placeholder="Any ideas for the look, feel, style, or systems you want?" rows={3} className={fieldClass} />
                <textarea value={form.exampleSites} onChange={(e) => update("exampleSites", e.target.value)} placeholder="Example websites, apps, competitors, or references you like, if any" rows={3} className={fieldClass} />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <SectionIntro step={step} />
              <div className="grid gap-4">
                <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Likely best path</p>
                  <p className="mt-2 text-lg font-bold text-white">{recommendation.path}</p>
                  <p className="mt-1 text-sm text-slate-300">{recommendation.tier}</p>
                  <p className="mt-3 text-xs text-slate-300">
                    We will confirm the right package or one-time project after reviewing the intake.
                  </p>
                </div>
                <pre className="max-h-64 overflow-auto rounded-xl border border-white/15 bg-white/[0.06] p-4 text-xs text-slate-200">{summary}</pre>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((current) => current - 1)} className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                Back
              </button>
            ) : null}

            {step < steps.length - 1 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep((current) => current + 1)}
                className="rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <TrackCTA
                href="#submit-intake"
                event="contact_intake_submit"
                section="contact_intake"
                placement="submit"
                label={highIntent ? "Submit and Book Call" : "Send Intake"}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                aria-disabled={submitting}
                className="rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 aria-disabled:pointer-events-none aria-disabled:opacity-60"
              >
                {submitting ? "Sending..." : highIntent ? "Submit and Book Call" : "Send Intake"}
              </TrackCTA>
            )}

            <a href="#blueprint" className="text-sm font-semibold text-cyan-200 underline underline-offset-4">
              Prefer to start with email?
            </a>
          </div>

          {submitError ? (
            <p className="mt-4 text-xs text-red-200">{submitError}</p>
          ) : null}
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 xl:sticky xl:top-24 xl:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Live route preview</p>
          <div className="mt-4 space-y-3">
            {routePreview.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-slate-950/55 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200">Recommendation</p>
            <p className="mt-2 text-sm font-bold text-white">{recommendation.path}</p>
            <p className="mt-1 text-xs text-slate-300">{recommendation.tier}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
              <p className="text-lg font-bold text-cyan-100">{step + 1}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Current step</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
              <p className="text-lg font-bold text-cyan-100">{form.selectedServices.length}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Services</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
