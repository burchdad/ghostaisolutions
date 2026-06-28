import Link from "next/link";

export const metadata = {
  title: "Magic Link Sign In - Ghost AI Solutions",
};

export default function ClientPortalMagicPage({ searchParams }) {
  const email = typeof searchParams?.email === "string" ? searchParams.email : "";
  const error = typeof searchParams?.error === "string" ? searchParams.error : "";
  const sent = searchParams?.sent === "true";

  return (
    <main className="relative overflow-hidden">
      <section className="relative py-16 sm:py-20">
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Link href="/client-portal/sign-in" className="text-sm font-semibold text-cyan-200 underline-offset-4 hover:underline">
            Back to sign in
          </Link>
          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/65 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Client Portal</p>
            <h1 className="mt-3 text-3xl font-bold text-white">Email me a magic link</h1>
            <p className="mt-4 text-slate-300">We will send a short-lived sign-in link to the email on your portal account.</p>
            {error ? <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">{error}</div> : null}
            {sent ? <div className="mt-5 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm text-cyan-100">If that email has a portal account, a magic link has been sent.</div> : null}
            <form action="/api/client-portal/magic/request" method="post" className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-200">Account email</span>
                <input name="email" type="email" required defaultValue={email} autoComplete="email" placeholder="you@company.com" className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white" />
              </label>
              <button className="w-fit rounded-xl bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950">Send Magic Link</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
