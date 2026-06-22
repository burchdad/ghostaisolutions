import Image from "next/image";
import TrackCTA from "@/components/TrackCTA";
import { portfolioProjects } from "@/lib/portfolioProjects";

export default function PortfolioShowcase({ limit, compact = false }) {
  const projects = typeof limit === "number" ? portfolioProjects.slice(0, limit) : portfolioProjects;

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {projects.map((project) => (
          <article key={project.name} className="group overflow-hidden rounded-2xl border border-white/12 bg-slate-950/70 shadow-[0_18px_70px_rgba(15,23,42,0.22)]">
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="block">
              <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-slate-900">
                <Image
                  src={project.image}
                  alt={`${project.name} website preview`}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover object-top transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
            </a>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">{project.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{project.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{project.summary}</p>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-amber-200 transition hover:text-amber-100"
              >
                View live site
              </a>
            </div>
          </article>
        ))}
      </div>

      {compact ? (
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <TrackCTA
            href="/work"
            event="portfolio_view_all_work"
            section="portfolio"
            placement="secondary"
            label="View More Work"
            className="inline-flex rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-amber-300/60 hover:bg-amber-300/10"
          >
            View More Work
          </TrackCTA>
          <TrackCTA
            href="/start"
            event="portfolio_start_audit"
            section="portfolio"
            placement="primary"
            label="Get Free Website Audit"
            className="inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            Get Free Website Audit
          </TrackCTA>
        </div>
      ) : null}
    </div>
  );
}
