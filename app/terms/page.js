export const metadata = { title: 'Terms of Service — Ghost AI Solutions' };

export default function Terms(){
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-6 text-slate-600 dark:text-slate-300">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="mt-8 text-xl font-semibold">1. Agreement</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          By accessing or using Ghost AI Solutions’ website or services, you agree to these Terms of Service. 
          If you do not agree, please do not use our website or services.
        </p>

        <h2 className="mt-8 text-xl font-semibold">2. Services</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          We provide AI strategy, custom agent development, and governance consulting. 
          Specific deliverables, fees, and timelines are outlined in a separate Statement of Work (SOW) or service agreement.
        </p>

        <h2 className="mt-8 text-xl font-semibold">3. Client Responsibilities</h2>
        <ul className="mt-2 list-disc pl-6 text-slate-600 dark:text-slate-300">
          <li>Provide accurate and timely information necessary for us to perform services.</li>
          <li>Ensure you have the right to use and share any data or systems made available to us.</li>
          <li>Comply with all applicable laws, regulations, and industry standards.</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">4. Intellectual Property</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Unless otherwise agreed, project deliverables are assigned to the client upon full payment. 
          Ghost AI Solutions retains rights to pre-existing intellectual property, methodologies, and reusable components.
        </p>

        <h2 className="mt-8 text-xl font-semibold">5. Confidentiality</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Both parties agree to keep confidential information secure and use it only for the purposes of the engagement.
        </p>

        <h2 className="mt-8 text-xl font-semibold">6. Disclaimers</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Services are provided “as is”. We make no guarantees that AI solutions will be error-free, 
          uninterrupted, or produce specific results. 
          Clients remain responsible for ensuring legal and ethical use of AI within their organizations.
        </p>

        <h2 className="mt-8 text-xl font-semibold">7. Limitation of Liability</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          To the maximum extent permitted by law, Ghost AI Solutions’ liability is limited to the fees paid 
          for services in the three (3) months prior to the claim. 
          We are not liable for indirect, incidental, or consequential damages.
        </p>

        <h2 className="mt-8 text-xl font-semibold">8. Governing Law</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          These Terms are governed by the laws of the United States and the State in which Ghost AI Solutions is incorporated, 
          without regard to conflict of law principles.
        </p>

        <h2 className="mt-8 text-xl font-semibold">9. Contact</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Questions about these Terms can be sent to 
          <a className="underline" href="mailto:support@ghostdefenses.com"> support@ghostdefenses.com</a>.
        </p>
      </div>
    </section>
  );
}
