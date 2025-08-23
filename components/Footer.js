import Link from 'next/link';
import Image from 'next/image';

export default function Footer(){
  return (
    <footer className="border-t bg-white dark:bg-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand + blurb */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Ghost AI Solutions logo"
                width={40}
                height={40}
                className="rounded-md object-contain"
                priority
              />
              <span className="font-semibold">Ghost AI Solutions</span>
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 max-w-md">
              AI agents that drive real outcomes with governance by design. © {new Date().getFullYear()} Ghost AI Solutions. All rights reserved.
            </p>

            {/* Trust row: SSL secure + company info */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                {/* lock icon */}
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 016 0v3H9z"
                  />
                </svg>
                <span className="uppercase tracking-wide">SSL Secure</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Remote‑first, US‑based company</span>
              <span className="hidden sm:inline">•</span>
              <a className="underline" href="mailto:support@ghostdefenses.com">support@ghostdefenses.com</a>
              <a className="underline" href="https://buttondown.com/burch" target="_blank" rel="noopener noreferrer">
  Newsletter
</a>
            </div>
          </div>

          {/* Column 1 */}
          <nav className="grid gap-2 text-sm">
            <Link className="hover:text-brand-700" href="/services">Services</Link>
            <Link className="hover:text-brand-700" href="/demo">Demo</Link>
            <Link className="hover:text-brand-700" href="/process">Process</Link>
            <Link className="hover:text-brand-700" href="/work">Case Studies</Link>
            <Link className="hover:text-brand-700" href="/chatbot">Chatbot</Link>
          </nav>

          {/* Column 2 */}
          <nav className="grid gap-2 text-sm">
            <Link className="hover:text-brand-700" href="/pricing">Pricing</Link>
            <Link className="hover:text-brand-700" href="/faq">FAQ</Link>
            <Link className="hover:text-brand-700" href="/blog">Blog</Link>
            <Link className="hover:text-brand-700" href="/privacy">Privacy</Link>
            <Link className="hover:text-brand-700" href="/terms">Terms</Link>
          </nav>
        </div>

        <div className="mt-8 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>Built with accessibility and performance in mind.</p>
          <div className="flex items-center gap-3">
            <a className="underline" href="https://www.facebook.com/profile.php?id=61578770879824">Facebook</a>
            <a className="underline" href="https://www.linkedin.com/company/ghostaisolutions">LinkedIn</a>
            <a className="underline" href="mailto:support@ghostdefenses.com">Email</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
