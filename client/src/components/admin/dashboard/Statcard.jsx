export default function StatCard({ title, value = 0, icon }) {
  const displayValue = typeof value === "object" || value === null ? "0" : String(value);

  return (
    <div className="dashboard-stat-card min-w-0 overflow-hidden rounded-xl border bg-white p-4 shadow transition hover:shadow-md sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="dashboard-stat-title min-w-0 text-xs font-medium leading-tight text-gray-500 sm:text-sm">
            {title}
          </p>
          <h2
            className="dashboard-value mt-2 min-w-0 max-w-full font-bold leading-tight text-gray-900"
            title={displayValue}
          >
            {displayValue}
          </h2>
        </div>
        {icon && (
          <div className="shrink-0 text-xl text-gray-400 sm:text-2xl" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
