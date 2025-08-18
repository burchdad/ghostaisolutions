export const metadata = { title: 'Terms of Service — Ghost AI Solutions' };

export default function Terms(){
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-6 text-slate-600 dark:text-slate-300">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="mt-8 text-xl font-semibold">Agreement</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          By accessing or using our website or services, you agree to these Terms. If you do not agree, do not use the site or services.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Services</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          We provide AI strategy, custom agent development, and governance consulting. The scope, deliverables, fees, and timelines are defined in a separate SOW.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Client Responsibilities</h2>
        <ul className="mt-2 list-disc pl-6 text-slate-600 dark:text-slate-300">
          <li>Provide accurate information and timely access to systems as needed.</li>
          <li>Ensure you have rights to share any data used in the engagement.</li>
          <li>Comply with applicable laws and regulations.</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">Intellectual Property</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Unless otherwise agreed, project deliverables are assigned to the client upon final payment. We retain rights to our pre-existing IP and reusable components.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Confidentiality</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Each party agrees to keep confidential information secret and use it only for the purposes of the engagement.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Disclaimers</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Services are provided “as is”. We do not warrant uninterrupted or error-free operation of third-party tools and models.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Limitation of Liability</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          To the maximum extent permitted by law, liability is limited to fees paid in the 3 months preceding the claim and excludes indirect or consequential damages.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Contact</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Questions? <a className="underline" href="mailto:support@ghostdefenses.com">support@ghostdefenses.com</a>
        </p>
      </div>
    </section>
  );
}
