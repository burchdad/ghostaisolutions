export default function Newsletter({
  action = "https://buttondown.email/api/emails/embed-subscribe/burch", // 👈 your handle
}) {
  return (
    <form
      action={action}
      method="post"
      target="popupwindow"
      onSubmit={() => window.open(action, "popupwindow")}
      className="rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold">Get practical AI tips</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Occasional posts on agents, governance, and ROI (no spam).
      </p>
      <label className="mt-4 block text-sm font-medium">
        Email
        <input
          required
          type="email"
          name="email"
          placeholder="you@company.com"
          className="mt-1 w-full rounded-xl border px-3 py-2"
        />
      </label>
      <button
        type="submit"
        className="mt-4 inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        onClick={() => {
          try { import("@vercel/analytics").then(m => m.track?.("newsletter_subscribe_click")); } catch {}
        }}
      >
        Subscribe
      </button>
      <input type="hidden" value="1" name="embed" />
    </form>
  );
}
