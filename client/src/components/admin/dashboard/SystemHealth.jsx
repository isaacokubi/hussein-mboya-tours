const systems = [
  { name: "Database", status: "Online" },
  { name: "API Server", status: "Online" },
  { name: "Cloudinary", status: "Connected" },
  { name: "M-Pesa Gateway", status: "Active" },
];

export default function SystemHealth() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Health</h2>
          <p className="mt-1 text-sm text-slate-500">Core services currently supporting the platform.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          All systems operational
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {systems.map((system) => (
          <div key={system.name} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-800">{system.name}</p>
              <span className="relative flex h-3 w-3" aria-label={`${system.name} ${system.status}`}>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-emerald-700">{system.status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
