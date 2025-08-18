import Link from 'next/link';
export default function Footer(){
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M12 2C7.58 2 4 5.58 4 10v7a1 1 0 0 0 1.58.81l1.84-1.38a1 1 0 0 1 1.2 0l1.84 1.38a1 1 0 0 0 1.2 0l1.84-1.38a1 1 0 0 1 1.2 0l1.84 1.38A1 1 0 0 0 20 17v-7c0-4.42-3.58-8-8-8Z"/></svg>
              </span>
              <span className="font-semibold">Ghost AI Solutions</span>
            </div>
            <p className="mt-4 text-sm text-slate-600 max-w-md">AI agents that drive real outcomes with governance by design. © <span id="year"></span> Ghost AI Solutions. All rights reserved.</p>
          </div>
          <nav className="grid gap-2 text-sm">
            <Link className="hover:text-brand-700" href="/services">Services</Link>
            <Link className="hover:text-brand-700" href="/process">Process</Link>
            <Link className="hover:text-brand-700" href="/work">Case Studies</Link>
          </nav>
          <nav className="grid gap-2 text-sm">
            <Link className="hover:text-brand-700" href="/pricing">Pricing</Link>
            <Link className="hover:text-brand-700" href="/faq">FAQ</Link>
            <Link className="hover:text-brand-700" href="/privacy">Privacy</Link>
            <Link className="hover:text-brand-700" href="/terms">Terms</Link>
          </nav>
        </div>
        <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
          <p>Built with accessibility and performance in mind.</p>
          <div className="flex items-center gap-3">
            <a className="underline" href="https://www.linkedin.com/company/ghostaisolutions">LinkedIn</a>
            <a className="underline" href="mailto:hello@ghostaisolutions.com">Email</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
