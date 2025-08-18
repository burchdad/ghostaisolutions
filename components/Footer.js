import Link from 'next/link';
import Image from 'next/image';
export default function Footer(){
  return (
    <footer className="border-t bg-white dark:bg-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Ghost AI Solutions logo" width={40} height={40} className="rounded-md object-contain" />
              <span className="font-semibold">Ghost AI Solutions</span>
            </div>
            <p className="mt-4 text-sm text-slate-600 max-w-md dark:text-slate-300">
              AI agents that drive real outcomes with governance by design. © {new Date().getFullYear()} Ghost AI Solutions. All rights reserved.
            </p>
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
            <a className="underline" href="mailto:support@ghostdefenses.com">Email</a>
          </div>
        </div>
      </div>
    </footer>
  );
}