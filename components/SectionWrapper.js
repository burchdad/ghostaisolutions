export default function SectionWrapper({ id, eyebrow, title, description, children, className = "" }) {
  return (
    <section id={id} className={`relative py-20 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || description) && (
          <header className="mx-auto max-w-3xl text-center">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">{eyebrow}</p>
            ) : null}
            {title ? <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">{title}</h2> : null}
            {description ? <p className="mt-5 text-base text-slate-300 sm:text-lg">{description}</p> : null}
          </header>
        )}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
