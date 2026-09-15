import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSearch,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";
import { getAuditLogs } from "../../api/auditApi";
import Pagination from "../../components/admin/Pagination";

const PAGE_SIZE = 10;
const INITIAL_FILTERS = { search: "", severity: "", status: "", action: "", resource: "" };
const ACTIONS = ["login", "create", "update", "delete", "logout", "approve", "reject", "export"];
const SEVERITIES = ["critical", "high", "medium", "low"];
const STATUSES = ["success", "failed"];
const RESOURCES = [
  "Authentication",
  "User",
  "Tenant",
  "Booking",
  "Payment",
  "Tour",
  "Hotel",
  "Transfer",
  "Finance",
  "System",
];

const numberValue = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);
const label = (value) =>
  String(value || "—")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(date);
};

const getInitials = (value) =>
  String(value || "System")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "SY";

export default function SuperAdminAudit() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const query = useQuery({
    queryKey: ["audit-center", page, filters],
    queryFn: () => getAuditLogs({ page, limit: PAGE_SIZE, ...filters }),
    retry: 1,
    staleTime: 15000,
    refetchOnWindowFocus: true,
  });

  const { data, isLoading, isFetching, error, refetch } = query;
  const logs = Array.isArray(data?.logs) ? data.logs : [];
  const statistics = data?.statistics || {};
  const pagination = data?.pagination || {};
  const pages = Math.max(1, numberValue(pagination.pages) || 1);
  const total = numberValue(pagination.total);
  const hasStatistics = ["total", "success", "failed", "critical"].some((key) => statistics[key] !== undefined && statistics[key] !== null);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const filteredView = activeFilterCount > 0;

  const counts = useMemo(() => ({
    total: numberValue(statistics.total),
    success: numberValue(statistics.success),
    failed: numberValue(statistics.failed),
    critical: numberValue(statistics.critical),
  }), [statistics]);

  const changeFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
    setSelected(null);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
    setSelected(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto max-w-[1600px] animate-pulse space-y-6">
          <div className="h-36 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 rounded-2xl bg-slate-200" />)}
          </div>
          <div className="h-20 rounded-2xl bg-slate-200" />
          <div className="h-[520px] rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto max-w-1600px rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-2xl bg-rose-50 p-4 text-rose-600"><ShieldAlert className="h-7 w-7" /></div>
            <h1 className="mt-4 text-2xl font-black text-slate-950">Audit Center unavailable</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              The platform audit service did not return a valid response. Statistics are intentionally not shown as zero when the source is unavailable.
            </p>
            <p className="mt-3 rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-600">{error?.response?.data?.message || error?.message || "Unable to load audit events."}</p>
            <button type="button" onClick={() => refetch()} className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">
              <RefreshCw className="mr-2 inline h-4 w-4" /> Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-[0_22px_70px_-32px_rgba(15,23,42,0.65)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                <ShieldAlert className="h-3.5 w-3.5" /> Security & monitoring
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">Audit Center</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Platform-wide activity monitoring for authentication, administration, financial actions and other security-relevant events.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              <RefreshCw className={`mr-2 inline h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Platform scope</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Immutable activity history</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Africa/Nairobi display time</span>
          </div>
        </header>

        {!hasStatistics && (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Audit statistics are unavailable</p>
              <p className="mt-0.5">The event list may still be available, but summary counts are not being represented as zero without authoritative statistics.</p>
            </div>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={FileSearch} title="Total events" value={counts.total} hint="Platform audit records" tone="slate" />
          <MetricCard icon={CheckCircle2} title="Successful" value={counts.success} hint="Recorded successful actions" tone="emerald" />
          <MetricCard icon={XCircle} title="Failed" value={counts.failed} hint="Recorded failed actions" tone="rose" />
          <MetricCard icon={ShieldAlert} title="Critical" value={counts.critical} hint="Events requiring attention" tone="amber" />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-black text-slate-950">Audit filters</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {filteredView ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}.` : "Review the full platform activity stream."}
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:max-w-5xl xl:grid-cols-5">
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 xl:col-span-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search user, description..." value={filters.search} onChange={(event) => changeFilter("search", event.target.value)} />
                {filters.search && <button type="button" onClick={() => changeFilter("search", "")} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}
              </div>
              <SelectFilter value={filters.action} onChange={(value) => changeFilter("action", value)} label="Action" options={ACTIONS} />
              <SelectFilter value={filters.resource} onChange={(value) => changeFilter("resource", value)} label="Resource" options={RESOURCES} />
              <SelectFilter value={filters.severity} onChange={(value) => changeFilter("severity", value)} label="Severity" options={SEVERITIES} />
              <SelectFilter value={filters.status} onChange={(value) => changeFilter("status", value)} label="Status" options={STATUSES} />
            </div>
          </div>
          {filteredView && (
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
              <button type="button" onClick={clearFilters} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Clear all filters</button>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-black">Activity stream</h2>
              <p className="mt-0.5 text-xs text-slate-400">Click an event to inspect its complete audit payload.</p>
            </div>
            <div className="text-xs font-semibold text-slate-400">
              {total !== null ? `${total.toLocaleString("en-KE")} matching records` : `${logs.length.toLocaleString("en-KE")} records returned`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-50">
                <tr>
                  {["User", "Action", "Resource", "Description", "Status", "Severity", "Date"].map((heading) => (
                    <th key={heading} className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="mx-auto flex max-w-md flex-col items-center">
                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-500"><FileSearch className="h-6 w-6" /></div>
                        <p className="mt-3 font-bold text-slate-900">No audit events found</p>
                        <p className="mt-1 text-sm text-slate-500">No records match the current filters. Clear a filter or refresh the audit stream.</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.map((log) => (
                  <tr key={log._id} className="group cursor-pointer transition hover:bg-emerald-50/40" onClick={() => setSelected(log)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-emerald-700 text-xs font-black text-white">{getInitials(log.user?.name || log.userName || "System")}</div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">{log.user?.name || log.userName || "System"}</p>
                          {log.user?.email && <p className="truncate text-xs text-slate-500">{log.user.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><Badge value={log.action} type="action" /></td>
                    <td className="px-5 py-4"><span className="font-semibold text-slate-700">{label(log.resource)}</span></td>
                    <td className="max-w-[360px] px-5 py-4 text-sm leading-5 text-slate-600">{log.description || "No description recorded."}</td>
                    <td className="px-5 py-4"><Badge value={log.status} type="status" /></td>
                    <td className="px-5 py-4"><Badge value={log.severity} type="severity" /></td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-4 md:px-5">
            <Pagination page={page} pages={pages} total={total ?? logs.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard icon={ShieldAlert} title="Security visibility" text="Failed and critical events remain separately visible so operational incidents are not hidden inside general activity totals." />
          <InfoCard icon={Clock3} title="Kenya operations" text="Audit timestamps are rendered in Africa/Nairobi for consistent review by the platform operations team." />
          <InfoCard icon={Activity} title="Authoritative source" text="The page displays the audit service response as received and does not manufacture zero values when summary statistics are unavailable." />
        </section>
      </div>

      {selected && <AuditDrawer log={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function SelectFilter({ value, onChange, label: placeholder, options }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option} value={option}>{label(option)}</option>)}
    </select>
  );
}

function MetricCard({ icon: Icon, title, value, hint, tone }) {
  const tones = {
    slate: { card: "border-slate-200 bg-slate-50 text-slate-950", icon: "bg-slate-950 text-white" },
    emerald: { card: "border-emerald-200 bg-emerald-50 text-emerald-950", icon: "bg-emerald-600 text-white" },
    rose: { card: "border-rose-200 bg-rose-50 text-rose-950", icon: "bg-rose-600 text-white" },
    amber: { card: "border-amber-200 bg-amber-50 text-amber-950", icon: "bg-amber-500 text-white" },
  };
  const style = tones[tone] || tones.slate;
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${style.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold opacity-70">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value === null ? "—" : value.toLocaleString("en-KE")}</p>
          <p className="mt-1 text-xs opacity-60">{hint}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${style.icon}`}><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  );
}

function Badge({ value, type }) {
  const normalized = String(value || "unknown").toLowerCase();
  const classes = type === "status"
    ? normalized === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : normalized === "failed" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-100 text-slate-600"
    : type === "severity"
      ? normalized === "critical" ? "border-rose-200 bg-rose-50 text-rose-700" : normalized === "high" ? "border-orange-200 bg-orange-50 text-orange-700" : normalized === "medium" ? "border-amber-200 bg-amber-50 text-amber-700" : normalized === "low" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-100 text-slate-600"
      : "border-slate-200 bg-slate-50 text-slate-700";
  const Icon = type === "status" ? (normalized === "success" ? CheckCircle2 : normalized === "failed" ? XCircle : AlertTriangle) : type === "severity" && normalized === "critical" ? ShieldAlert : ChevronRight;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${classes}`}><Icon className="h-3.5 w-3.5" />{label(value || "Unknown")}</span>;
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-slate-950 p-2.5 text-white"><Icon className="h-5 w-5" /></div>
        <div>
          <h3 className="font-bold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}

function AuditDrawer({ log, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm" onClick={onClose}>
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">Audit event</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Event details</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900" aria-label="Close audit details"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-5 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label="User" value={log.user?.name || log.userName || "System"} />
            <Detail label="Email" value={log.user?.email || "—"} />
            <Detail label="Action" value={label(log.action)} />
            <Detail label="Resource" value={label(log.resource)} />
            <Detail label="Status" value={label(log.status)} />
            <Detail label="Severity" value={label(log.severity)} />
            <Detail label="Date" value={formatDate(log.createdAt)} />
            <Detail label="Event ID" value={log._id || "—"} mono />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Description</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{log.description || "No description recorded."}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Raw audit payload</p>
            <pre className="mt-2 max-h-[520px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-200">{JSON.stringify(log, null, 2)}</pre>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Detail({ label: title, value, mono = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <p className={`mt-1 break-words text-sm font-semibold text-slate-800 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}
