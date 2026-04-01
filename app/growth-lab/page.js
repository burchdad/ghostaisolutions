import Breadcrumbs from "@/components/Breadcrumbs";
import AttributionConsole from "@/components/AttributionConsole";

export const metadata = {
  title: "Growth Lab — Ghost AI Solutions",
  description: "Internal growth diagnostics for attribution, campaign routing, and experiment state.",
};

export default function GrowthLabPage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/75 p-8 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Internal Tools</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">Growth Lab</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Use this page to validate campaign attribution, landing variants, and hero experiment assignment in your own browser session.
          </p>

          <div className="mt-8">
            <AttributionConsole />
          </div>
        </div>
      </div>
    </section>
  );
}
