import Link from "next/link";

export const metadata = {
  title: "Client Portal Sign In - Ghost AI Solutions",
  description: "Sign in to the Ghost Growth Portal with your client account email and password.",
};

export default function ClientPortalSignInPage({ searchParams }) {
  const error = typeof searchParams?.error === "string" ? searchParams.error : "";
  const email = typeof searchParams?.email === "string" ? searchParams.email : "";

  return (
    <main className="relative overflow-hidden">
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_70%_10%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_30%_4%,rgba(251,191,36,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link href="/client-portal" className="text-sm font-semibold text-cyan-200 underline-offset-4 hover:underline">
            Back to client portal
          </Link>

          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Client Portal</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">Sign in to your portal</h1>
            <p className="mt-4 text-base text-slate-300">
              Use the email and password you created when activating your Ghost Growth Portal account.
            </p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
                {error}
              </div>
            ) : null}

            <form action="/api/client-portal/sign-in" method="post" className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-200">Account email</span>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={email}
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-200">Password</span>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
                />
              </label>
              <button
                type="submit"
                className="inline-flex w-fit rounded-xl bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Open Portal
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4 text-sm text-slate-300">
              Need a different sign-in path?{" "}
              <Link href="/client-portal/magic" className="text-cyan-200 underline-offset-4 hover:underline">
                Email me a magic link
              </Link>
              {" "}or{" "}
              <Link href="/client-portal/reset-password" className="text-cyan-200 underline-offset-4 hover:underline">
                reset my password
              </Link>
              .
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
