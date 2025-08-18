export default function NotFound() {
  return (
    <section className="min-h-[60vh] grid place-items-center bg-slate-50 dark:bg-ink">
      <div className="text-center max-w-md px-6">
        <h1 className="text-3xl font-extrabold">Oops, page not found</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          The page you’re looking for doesn’t exist. If you think this is a mistake, contact us.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/" className="rounded-xl border px-4 py-2">Go home</a>
          <a href="/contact" className="rounded-xl bg-brand-600 px-4 py-2 text-white">Contact</a>
        </div>
      </div>
    </section>
  );
}
// This component renders a "Not Found" page with a message and links to go home or contact support.
// It uses Tailwind CSS for styling and is designed to be user-friendly, providing clear navigation