export const metadata = { title: 'Contact — Ghost AI Solutions' };
export default function Contact(){
  return (
    <section className="py-20 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Let’s talk</h1>
            <p className="mt-4 text-slate-600">Tell us about your workflows and we’ll map an agent that fits. Prefer email? <a className="text-brand-700 underline" href="mailto:hello@ghostaisolutions.com">hello@ghostaisolutions.com</a></p>
            <ul className="mt-6 space-y-2 text-slate-600">
              <li>• Response within 1 business day</li>
              <li>• NDA available on request</li>
              <li>• Remote‑first, global clients</li>
            </ul>
          </div>
          {/* Tally embed (replace with your form id) */}
          <div className="rounded-2xl border bg-white p-0 shadow-sm overflow-hidden">
            <iframe
              title="Contact form"
              src="https://tally.so/embed/w4gN0x?hideTitle=1&transparentBackground=1"
              width="100%"
              height="500"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              className="min-h-[560px] w-full"
            />
          </div>
          {/* Google Forms alternative:
          <iframe src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true" width="100%" height="600" frameBorder="0" marginHeight="0" marginWidth="0">Loading…</iframe>
          */}
        </div>
      </div>
    </section>
  );
}
