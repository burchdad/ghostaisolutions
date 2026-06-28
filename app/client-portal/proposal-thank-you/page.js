import Link from "next/link";

export const metadata = {
  title: "Proposal Approved - Ghost AI Solutions",
  description: "Next steps after approving a Ghost AI Solutions proposal.",
};

export default function ClientPortalProposalThankYouPage({ searchParams }) {
  const invite = typeof searchParams?.invite === "string" ? searchParams.invite : "";
  const email = typeof searchParams?.email === "string" ? searchParams.email : "";
  const createHref = invite
    ? `/client-portal/create-account?invite=${encodeURIComponent(invite)}${email ? `&email=${encodeURIComponent(email)}` : ""}`
    : "/client-portal/create-account";
  const signInHref = email
    ? `/client-portal/sign-in?email=${encodeURIComponent(email)}`
    : "/client-portal/sign-in";

  return (
    <main className="relative overflow-hidden">
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_72%_10%,rgba(34,211,238,0.15),transparent_34%),radial-gradient(circle_at_28%_0%,rgba(251,191,36,0.13),transparent_28%)]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Proposal Approved</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl">Welcome to the next step</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">
              Your proposal response has been received. Use the client portal to track what Ghost AI Solutions is building,
              what is active, and what comes next.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5">
                <h2 className="text-xl font-bold text-white">New client portal account</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Use this if this is your first Ghost portal account or your proposal email included an invite key.
                </p>
                <Link
                  href={createHref}
                  className="mt-5 inline-flex rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                >
                  Create New Account
                </Link>
              </div>

              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5">
                <h2 className="text-xl font-bold text-white">Already have a portal?</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Sign in with the portal email and access key that Ghost AI Solutions previously issued.
                </p>
                <Link
                  href={signInHref}
                  className="mt-5 inline-flex rounded-xl border border-cyan-300/35 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10 hover:text-white"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
              If you do not have an invite key yet, Ghost AI Solutions will send it after your proposal is processed.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
