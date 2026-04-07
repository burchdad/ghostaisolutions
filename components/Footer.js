import Link from 'next/link';
import Image from 'next/image';
import TrackCTA from "@/components/TrackCTA";
import { siteConfig } from "@/lib/siteConfig";
import { BOOKING_URL } from "@/lib/constants";

export default function Footer(){
  return (
    <footer className="border-t border-white/10 bg-slate-950/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/FullLogo_Transparent.png"
                alt="Ghost AI Solutions logo"
                width={190}
                height={48}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>
            <p className="mt-4 max-w-md text-sm text-slate-300">
              We build custom software, AI systems, and operational platforms designed to solve real-world problems.
            </p>
            <div className="mt-4 text-sm text-slate-400">
              <p>Tyler, TX • Remote-first</p>
              <p className="mt-1">Built by engineers. Deployed in the real world.</p>
              <p className="mt-3 text-cyan-300">No templates. No shortcuts. Built from scratch.</p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <nav className="grid gap-2 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Company</p>
              <Link className="text-slate-200 hover:text-cyan-300" href="/">Home</Link>
              <Link className="text-slate-200 hover:text-cyan-300" href="/#solutions">Solutions</Link>
              <Link className="text-slate-200 hover:text-cyan-300" href="/#industries">Industries</Link>
              <Link className="text-slate-200 hover:text-cyan-300" href="/projects">Projects</Link>
              <Link className="text-slate-200 hover:text-cyan-300" href="/technology">Technology</Link>
            </nav>

            <nav className="grid gap-2 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Resources</p>
              <Link className="text-slate-200 hover:text-cyan-300" href="/projects">Case Studies</Link>
              <Link className="text-slate-200 hover:text-cyan-300" href="/process">Process</Link>
              <Link className="text-slate-200 hover:text-cyan-300" href="/blog">Blog</Link>
            </nav>
          </div>

          <div className="grid content-start gap-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Contact</p>
            <TrackCTA
              className="inline-flex w-fit items-center rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              event="start_project_footer"
              section="footer"
              placement="primary"
              label="Start a Project"
            >
              Start a Project
            </TrackCTA>
            <a className="text-slate-200 underline underline-offset-4" href={`mailto:${siteConfig.supportEmail}`}>
              {siteConfig.supportEmail}
            </a>
            <a className="text-slate-200 underline underline-offset-4" href="https://www.facebook.com/profile.php?id=61578770879824" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a className="text-slate-200 underline underline-offset-4" href="https://www.linkedin.com/company/ghostaisolutions" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-xs text-slate-400">
          <p>© 2026 Ghost AI Solutions. All rights reserved.</p>
          <p className="mt-1">Built for performance, scalability, and real-world deployment.</p>
        </div>
      </div>
    </footer>
  );
}
