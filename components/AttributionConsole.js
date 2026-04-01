"use client";

import { useEffect, useMemo, useState } from "react";

const base = "https://www.ghostai.solutions";

const campaignTemplates = [
  {
    name: "AI-Native Launch",
    url: `${base}/?utm_source=linkedin&utm_medium=organic&utm_campaign=ai-native-launch&utm_content=founder-post`,
  },
  {
    name: "Real Estate Offer",
    url: `${base}/?utm_source=meta&utm_medium=paid&utm_campaign=real-estate-q2&utm_content=video-a`,
  },
  {
    name: "Ecommerce Offer",
    url: `${base}/?utm_source=google&utm_medium=paid&utm_campaign=ecom-growth&utm_content=search-headline-1`,
  },
  {
    name: "Service Ops Offer",
    url: `${base}/?utm_source=youtube&utm_medium=organic&utm_campaign=service-automation&utm_content=shorts-cta`,
  },
];

export default function AttributionConsole() {
  const [utm, setUtm] = useState({});
  const [variantCookie, setVariantCookie] = useState("(none)");
  const [heroVariant, setHeroVariant] = useState("(none)");

  useEffect(() => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem("ghost_utm") || "{}");
      setUtm(parsed);
    } catch {
      setUtm({});
    }

    const cookieValue = document.cookie
      .split("; ")
      .find((c) => c.startsWith("ghost_landing_variant="))
      ?.split("=")[1];
    setVariantCookie(cookieValue || "(none)");

    const hv = localStorage.getItem("ghost_hero_variant");
    setHeroVariant(hv || "(none)");
  }, []);

  const rows = useMemo(
    () => [
      ["utm_source", utm.utm_source || "(empty)"],
      ["utm_medium", utm.utm_medium || "(empty)"],
      ["utm_campaign", utm.utm_campaign || "(empty)"],
      ["utm_content", utm.utm_content || "(empty)"],
      ["utm_term", utm.utm_term || "(empty)"],
      ["landing_page", utm.landing_page || "(empty)"],
      ["referrer", utm.referrer || "(empty)"],
      ["landing_variant_cookie", variantCookie],
      ["hero_variant_local", heroVariant],
    ],
    [utm, variantCookie, heroVariant]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-5">
        <h2 className="text-lg font-bold text-white">Current Attribution State</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-white/10 last:border-b-0">
                  <th className="py-2 pr-4 text-left font-semibold text-cyan-200">{k}</th>
                  <td className="py-2 text-slate-300 break-all">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-5">
        <h2 className="text-lg font-bold text-white">Campaign URL Presets</h2>
        <ul className="mt-4 space-y-3">
          {campaignTemplates.map((item) => (
            <li key={item.name} className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <p className="font-semibold text-cyan-200">{item.name}</p>
              <a
                href={item.url}
                className="mt-1 block text-xs text-slate-300 underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.url}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
