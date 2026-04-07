export default function IndustryGrid({ industries }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {industries.map((industry) => (
        <span
          key={industry}
          className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-sm"
        >
          {industry}
        </span>
      ))}
    </div>
  );
}
