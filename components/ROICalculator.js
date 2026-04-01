"use client";

import { useMemo, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import TrackCTA from "@/components/TrackCTA";
import useCampaignContext from "@/components/useCampaignContext";

export default function ROICalculator() {
  const [teamSize, setTeamSize] = useState(8);
  const [hoursPerPerson, setHoursPerPerson] = useState(7);
  const [hourlyRate, setHourlyRate] = useState(45);
  const { campaignType, campaignCopy } = useCampaignContext();

  const model = useMemo(() => {
    const monthlyHours = teamSize * hoursPerPerson * 4.33;
    const monthlyCost = monthlyHours * hourlyRate;
    const recoverableHours = monthlyHours * 0.42;
    const recoverableValue = monthlyCost * 0.42;
    return {
      monthlyHours,
      monthlyCost,
      recoverableHours,
      recoverableValue,
      annualValue: recoverableValue * 12,
    };
  }, [teamSize, hoursPerPerson, hourlyRate]);

  return (
    <section className="py-20" data-track-section="roi_calculator">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/70 p-6 sm:p-10 shadow-[0_0_80px_rgba(34,211,238,0.15)]">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">ROI Estimator</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">See the automation upside in 30 seconds</h2>
              <p className="mt-4 text-slate-300">
                Plug in your current team load. We model a conservative recovery scenario based on repetitive admin and follow-up tasks.
              </p>

              <div className="mt-8 space-y-6">
                <Control
                  label="Team members touching admin/sales ops"
                  value={teamSize}
                  min={1}
                  max={80}
                  onChange={setTeamSize}
                />
                <Control
                  label="Hours per person/week spent on repeatable tasks"
                  value={hoursPerPerson}
                  min={1}
                  max={20}
                  onChange={setHoursPerPerson}
                />
                <Control
                  label="Blended hourly cost ($)"
                  value={hourlyRate}
                  min={20}
                  max={200}
                  onChange={setHourlyRate}
                />
              </div>
            </div>

            <aside className="rounded-2xl border border-cyan-200/20 bg-slate-900/80 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">Estimated impact</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Metric label="Monthly hours recovered" value={`${Math.round(model.recoverableHours).toLocaleString()} hrs`} />
                <Metric label="Monthly cost recovered" value={`$${Math.round(model.recoverableValue).toLocaleString()}`} />
                <Metric label="Annual value opportunity" value={`$${Math.round(model.annualValue).toLocaleString()}`} />
                <Metric label="Recovery assumption" value="42%" />
              </div>
              <p className="mt-6 text-sm text-slate-300">
                Model is directional, not a guarantee. We validate this with your actual workflow map in a strategy session.
              </p>
              <TrackCTA
                href={siteConfig.calendlyUrl}
                event="roi_build_plan_click"
                section="roi_calculator"
                placement={`primary_${campaignType}`}
                label={campaignCopy.roiCta}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                {campaignCopy.roiCta}
              </TrackCTA>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function Control({ label, value, min, max, onChange }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
        <span>{label}</span>
        <span className="font-semibold text-cyan-300">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-400"
      />
    </label>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
