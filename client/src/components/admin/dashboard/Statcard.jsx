export default function StatCard({ title, value = 0, icon, className = "", valueClassName = "" }) {
  const displayValue = typeof value === "object" || value === null ? "0" : String(value);

  return (
    <div className={`dashboard-stat-card min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${className}`}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="dashboard-stat-title min-w-0 text-xs font-semibold uppercase tracking-wide leading-tight text-slate-500 sm:text-sm">
            {title}
          </p>
          <h2 className={`dashboard-value mt-2 min-w-0 max-w-full whitespace-nowrap font-bold leading-none text-slate-900 ${valueClassName || "text-xl sm:text-2xl"}`} title={displayValue}>
            {displayValue}
          </h2>
        </div>
        {icon && <div className="shrink-0 text-xl text-slate-400 sm:text-2xl" aria-hidden="true">{icon}</div>}
      </div>
    </div>
  );
}
