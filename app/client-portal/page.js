import Link from "next/link";
import TrackCTA from "@/components/TrackCTA";
import ClientPortalDashboard from "./ClientPortalDashboard";
import { getClientPortalData } from "@/lib/clientPortalData";

export const metadata = {
  title: "Client Portal - Ghost AI Solutions",
  description:
    "Ghost Growth Portal is the client-facing command center for services, project progress, metrics, support, and next growth moves.",
};

export default async function ClientPortalPage({ searchParams }) {
  const accessKey = typeof searchParams?.key === "string" ? searchParams.key : "";
  const portalData = accessKey ? await getClientPortalData(accessKey) : null;
  const isConnected = Boolean(portalData?.ok);

  return (
    <main className="relative overflow-hidden">
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_72%_14%,rgba(34,211,238,0.17),transparent_34%),radial-gradient(circle_at_28%_8%,rgba(251,191,36,0.13),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.35),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[0.84fr_1.16fr]">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Ghost Growth Portal</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Your Growth Command Center
              </h1>
              <p className="mt-5 text-lg text-slate-300">
                See what Ghost AI Solutions is managing, what is producing results, and what the next growth move should be.
              </p>
              <div className="mt-8 grid gap-3 text-sm text-slate-200">
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <span className="font-semibold text-white">Not just a CRM.</span> This is the client-facing layer that tells the story of services, progress, money, and momentum.
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4">
                  {isConnected ? (
                    <>
                      <span className="font-semibold text-cyan-100">Connected:</span> this view is loading read-only client data from Mission Control.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-cyan-100">V1:</span> portal experience and client entry point. <span className="font-semibold text-cyan-100">V2:</span> live HighLevel, website, ads, SEO, and Mission Control data.
                    </>
                  )}
                </div>
                {portalData && !portalData.ok ? (
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100">
                    Portal key not recognized yet. Showing the demo dashboard until access is configured.
                  </div>
                ) : null}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <TrackCTA
                  href="/start"
                  event="client_portal_request_access"
                  section="client_portal"
                  placement="hero"
                  label="Create New Account"
                  className="inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                >
                  Create New Account
                </TrackCTA>
                <Link
                  href="/admin/login"
                  className="inline-flex rounded-xl border border-cyan-300/35 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/process"
                  className="inline-flex rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
                >
                  See How Ghost Works
                </Link>
              </div>
            </div>

            <ClientPortalDashboard portalData={portalData?.ok ? portalData : null} />
          </div>
        </div>
      </section>
    </main>
  );
}
