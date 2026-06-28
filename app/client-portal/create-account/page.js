import Link from "next/link";

export const metadata = {
  title: "Create Client Portal Account - Ghost AI Solutions",
  description: "Activate a Ghost Growth Portal account after discovery, proposal approval, or client onboarding.",
};

export default function ClientPortalCreateAccountPage() {
  return (
    <main className="relative overflow-hidden">
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_70%_10%,rgba(251,191,36,0.15),transparent_34%),radial-gradient(circle_at_30%_4%,rgba(34,211,238,0.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link href="/client-portal" className="text-sm font-semibold text-cyan-200 underline-offset-4 hover:underline">
            Back to client portal
          </Link>

          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-amber-950/20 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">Account Activation</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">Create your client portal account</h1>
            <p className="mt-4 text-base text-slate-300">
              Portal accounts are created after discovery, proposal approval, or onboarding. Enter the invite key from Ghost AI Solutions to activate your client view.
            </p>

            <form action="/client-portal" method="get" className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-200">Portal invite key</span>
                <input
                  name="key"
                  required
                  autoComplete="one-time-code"
                  placeholder="Paste your invite key"
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/20"
                />
              </label>
              <button
                type="submit"
                className="inline-flex w-fit rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Activate Account
              </button>
            </form>

            <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <span className="font-semibold text-white">Not a client yet?</span> Start with the free website audit so we can route you correctly.
              </div>
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4">
                <span className="font-semibold text-cyan-100">Already have access?</span>{" "}
                <Link href="/client-portal/sign-in" className="text-cyan-200 underline-offset-4 hover:underline">
                  Sign in here.
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
