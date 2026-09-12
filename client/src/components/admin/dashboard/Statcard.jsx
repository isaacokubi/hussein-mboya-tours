const cardTheme = {
  Revenue: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 ring-1 ring-emerald-100",
  Bookings: "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-sky-100/60 ring-1 ring-sky-100",
  Payments: "border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-100/60 ring-1 ring-violet-100",
  Customers: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100/60 ring-1 ring-amber-100",
  Users: "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-100/60 ring-1 ring-indigo-100",
  Staff: "border-slate-300 bg-gradient-to-br from-slate-50 via-white to-slate-100/70 ring-1 ring-slate-100",
  Guides: "border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-cyan-100/60 ring-1 ring-cyan-100",
  Drivers: "border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-100/60 ring-1 ring-orange-100",
  Agents: "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-fuchsia-100/60 ring-1 ring-fuchsia-100",
  "Approved Agents": "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 ring-1 ring-emerald-100",
  Vehicles: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100/60 ring-1 ring-blue-100",
  "Available Vehicles": "border-teal-200 bg-gradient-to-br from-teal-50 via-white to-teal-100/60 ring-1 ring-teal-100",
  Tours: "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-100/60 ring-1 ring-rose-100",
  Destinations: "border-lime-200 bg-gradient-to-br from-lime-50 via-white to-lime-100/60 ring-1 ring-lime-100",
  "Pending Bookings": "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100/60 ring-1 ring-amber-100",
  "Confirmed Bookings": "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 ring-1 ring-emerald-100",
  "Completed Payments": "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100/60 ring-1 ring-blue-100",
};

const valueTheme = {
  Revenue: "text-emerald-800",
  Bookings: "text-sky-800",
  Payments: "text-violet-800",
  Customers: "text-amber-800",
  Users: "text-indigo-800",
  Staff: "text-slate-800",
  Guides: "text-cyan-800",
  Drivers: "text-orange-800",
  Agents: "text-fuchsia-800",
  "Approved Agents": "text-emerald-800",
  Vehicles: "text-blue-800",
  "Available Vehicles": "text-teal-800",
  Tours: "text-rose-800",
  Destinations: "text-lime-800",
  "Pending Bookings": "text-amber-800",
  "Confirmed Bookings": "text-emerald-800",
  "Completed Payments": "text-blue-800",
};

export default function StatCard({ title, value = 0, icon, className = "", valueClassName = "" }) {
  const displayValue = typeof value === "object" || value === null ? "0" : String(value);
  const theme = cardTheme[title] || "border-slate-200 bg-white ring-1 ring-slate-100";
  const valueColor = valueTheme[title] || "text-slate-900";

  return (
    <div className={`dashboard-stat-card group relative min-w-0 overflow-hidden rounded-2xl border p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-5 ${theme} ${className}`}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/50 blur-2xl transition group-hover:scale-125" />
      <div className="relative flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="dashboard-stat-title min-w-0 text-xs font-semibold uppercase tracking-wide leading-tight text-slate-600 sm:text-sm">
            {title}
          </p>
          <h2 className={`dashboard-value mt-2 min-w-0 max-w-full whitespace-nowrap font-bold leading-none ${valueColor} ${valueClassName || "text-xl sm:text-2xl"}`} title={displayValue}>
            {displayValue}
          </h2>
        </div>
        {icon && <div className="shrink-0 rounded-xl bg-white/70 p-2 text-xl text-slate-600 shadow-sm sm:text-2xl" aria-hidden="true">{icon}</div>}
      </div>
    </div>
  );
}
