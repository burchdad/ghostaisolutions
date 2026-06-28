import Link from "next/link";
import { cookies } from "next/headers";
import { CLIENT_PORTAL_SESSION_COOKIE, getClientPortalData } from "@/lib/clientPortalData";

export const metadata = {
  title: "Client Portal Account - Ghost AI Solutions",
};

export default async function ClientPortalAccountPage({ searchParams }) {
  const sessionToken = cookies().get(CLIENT_PORTAL_SESSION_COOKIE)?.value || "";
  const portalData = sessionToken ? await getClientPortalData("", sessionToken) : null;
  const account = portalData?.account || null;
  const error = typeof searchParams?.error === "string" ? searchParams.error : "";
  const saved = searchParams?.saved === "true";

  return (
    <main className="relative overflow-hidden">
      <section className="relative py-16 sm:py-20">
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Link href="/client-portal" className="text-sm font-semibold text-cyan-200 underline-offset-4 hover:underline">
            Back to portal
          </Link>
          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/65 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Client Portal Account</p>
            <h1 className="mt-3 text-3xl font-bold text-white">Account settings</h1>
            {account ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                <p><span className="font-semibold text-white">Email:</span> {account.email}</p>
                <p><span className="font-semibold text-white">Role:</span> {account.role}</p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">Sign in to manage your account.</div>
            )}
            {error ? <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">{error}</div> : null}
            {saved ? <div className="mt-5 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm text-cyan-100">Password updated.</div> : null}
            {account ? (
              <>
                <form action="/api/client-portal/change-password" method="post" className="mt-8 grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-200">Current password</span>
                    <input name="currentPassword" type="password" required autoComplete="current-password" className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-200">New password</span>
                    <input name="newPassword" type="password" required minLength={10} autoComplete="new-password" className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white" />
                  </label>
                  <button className="w-fit rounded-xl bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950">Change Password</button>
                </form>
                <form action="/api/client-portal/logout" method="post" className="mt-4">
                  <button className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-cyan-300/60">Sign Out</button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
