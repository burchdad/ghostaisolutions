export const metadata = { title: 'Privacy Policy — Ghost AI Solutions' };

export default function Privacy(){
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-6 text-slate-600 dark:text-slate-300">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="mt-10 text-xl font-semibold">Overview</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Ghost AI Solutions (“we”, “us”) respects your privacy. This policy explains what we collect, why we collect it, and how we use and protect it.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Information We Collect</h2>
        <ul className="mt-2 list-disc pl-6 text-slate-600 dark:text-slate-300">
          <li>Contact details (name, email, company) when you submit forms or book calls.</li>
          <li>Usage analytics (pages visited, device, general location) via analytics tools.</li>
          <li>Project information you share for scoping and delivery.</li>
        </ul>

        <h2 id="analytics" className="mt-8 text-xl font-semibold">Analytics</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          We use Vercel Analytics and Speed Insights to measure anonymous traffic and performance (page views, navigation timing, Core Web Vitals). 
          These tools do not store personally identifiable information. You can dismiss the analytics banner and your choice will be
          saved in your browser.
        </p>

        <h2 className="mt-8 text-xl font-semibold">How We Use Information</h2>
        <ul className="mt-2 list-disc pl-6 text-slate-600 dark:text-slate-300">
          <li>Respond to inquiries and deliver services.</li>
          <li>Improve our website and offerings.</li>
          <li>Maintain security, prevent abuse, and meet legal obligations.</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">Data Sharing</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          We do not sell your data. We may share limited data with trusted processors (e.g., analytics, scheduling, form processors) under data processing agreements.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Security</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          We apply reasonable technical and organizational measures including least-privilege access, encryption in transit, and audit logging for production systems.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Your Rights</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          You can request access, correction, or deletion of personal data by emailing <a className="underline" href="mailto:support@ghostdefenses.com">support@ghostdefenses.com</a>.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Contact</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          For privacy questions, contact <a className="underline" href="mailto:support@ghostdefenses.com">support@ghostdefenses.com</a>.
        </p>
      </div>
    </section>
  );
}
