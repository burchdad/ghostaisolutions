import Link from 'next/link';

export default function Header(){
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-glow animate-floaty">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M12 2C7.58 2 4 5.58 4 10v7a1 1 0 0 0 1.58.81l1.84-1.38a1 1 0 0 1 1.2 0l1.84 1.38a1 1 0 0 0 1.2 0l1.84-1.38a1 1 0 0 1 1.2 0l1.84 1.38A1 1 0 0 0 20 17v-7c0-4.42-3.58-8-8-8Z"/></svg>
            </span>
            <span className="hidden sm:block text-lg tracking-tight">Ghost AI Solutions</span>
          </Link>

          <nav aria-label="Main" className="hidden md:flex items-center gap-8 text-sm">
            <Link className="hover:text-brand-700" href="/services">Services</Link>
            <Link className="hover:text-brand-700" href="/process">Process</Link>
            <Link className="hover:text-brand-700" href="/work">Case Studies</Link>
            <Link className="hover:text-brand-700" href="/pricing">Pricing</Link>
            <Link className="hover:text-brand-700" href="/faq">FAQ</Link>
            <Link className="hover:text-brand-700" href="/contact">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button id="themeToggle" className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50" aria-pressed="false" aria-label="Toggle dark mode">Dark</button>
            <a href="https://calendly.com/YOUR-SLUG/intro-call" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-brand-700">Book a Call</a>
          </div>

          {/* Mobile */}
          <button id="menuBtn" className="md:hidden inline-flex items-center justify-center rounded-lg p-2 border" aria-expanded="false" aria-controls="mnav" aria-label="Open menu">
            <span className="sr-only">Open menu</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div id="mnav" className="md:hidden hidden border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 grid gap-3 text-sm">
          <Link className="py-2" href="/services">Services</Link>
          <Link className="py-2" href="/process">Process</Link>
          <Link className="py-2" href="/work">Case Studies</Link>
          <Link className="py-2" href="/pricing">Pricing</Link>
          <Link className="py-2" href="/faq">FAQ</Link>
          <Link className="py-2" href="/contact">Contact</Link>
          <div className="flex gap-3 pt-2">
            <button id="themeToggleM" className="rounded-xl border px-3 py-2">Dark</button>
            <a href="https://calendly.com/YOUR-SLUG/intro-call" className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Book a Call</a>
          </div>
        </div>
      </div>
    </header>
  );
}
