import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, ShieldAlert, Database, KeyRound, RefreshCw, Users, LockKeyhole, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { getSecurityStatus } from "../../api/superAdminApi";

const normalizeStatus = (value) => String(value || "unknown").trim().toLowerCase();

export default function SuperAdminSecurity() {
  const { data: response, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["superadmin-security"],
    queryFn: getSecurityStatus,
    staleTime: 30_000,
    retry: 1,
  });

  if (isLoading) return <SecurityLoading />;

  if (isError) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <PageHeader onRefresh={() => refetch()} refreshing={isFetching} />
        <div className="mt-6 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-50 p-3 text-red-600"><ShieldAlert size={24} /></div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900">Security telemetry unavailable</h2>
              <p className="mt-1 text-sm text-slate-600">{error?.response?.data?.message || error?.message || "The security service is unavailable."}</p>
              <button type="button" onClick={() => refetch()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60" disabled={isFetching}><RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const data = response?.data || response || {};
  const authenticationStatus = typeof data.authentication === "object" ? data.authentication.status : data.authentication;
  const authorization = typeof data.authorization === "object" ? data.authorization : {};
  const authorizationStatus = authorization.status || (authorization.roles > 0 && authorization.permissions > 0 ? "Active" : "Warning");
  const controls = Array.isArray(data.controls) ? data.controls : [];
  const score = typeof data.securityScore === "number" ? data.securityScore : null;
  const threat = normalizeStatus(data.threatLevel);
  const failedAttempts = typeof data.failedAttempts24h === "number" ? data.failedAttempts24h : null;
  const criticalEvents = typeof data.criticalEvents24h === "number" ? data.criticalEvents24h : null;
  const lastChecked = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const activeControls = controls.filter((control) => normalizeStatus(control.status) === "active").length;

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <PageHeader onRefresh={() => refetch()} refreshing={isFetching} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Security Score" value={score === null ? "—" : `${score}/100`} helper={score === null ? "Telemetry unavailable" : score >= 90 ? "Strong platform posture" : score >= 70 ? "Review recommended" : "Immediate review"} icon={ShieldCheck} tone={score === null ? "slate" : score >= 90 ? "emerald" : score >= 70 ? "amber" : "red"} />
        <MetricCard label="Threat Level" value={threat === "unknown" ? "—" : threat.toUpperCase()} helper="Calculated from critical events and failed attempts" icon={threat === "low" ? CheckCircle2 : ShieldAlert} tone={threat === "low" ? "emerald" : threat === "medium" ? "amber" : "red"} />
        <MetricCard label="Authentication" value={authenticationStatus || "—"} helper="JWT authentication service" icon={KeyRound} tone={normalizeStatus(authenticationStatus) === "active" ? "blue" : "amber"} />
        <MetricCard label="Authorization" value={authorizationStatus || "—"} helper={`${authorization.roles ?? "—"} roles · ${authorization.permissions ?? "—"} permissions`} icon={LockKeyhole} tone={normalizeStatus(authorizationStatus) === "active" ? "indigo" : "amber"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div><div className="flex items-center gap-2"><span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><ShieldCheck size={18} /></span><h2 className="text-lg font-bold text-slate-900">Security Controls</h2></div><p className="mt-1 text-sm text-slate-500">Platform protection modules currently reported by the security service.</p></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{activeControls}/{controls.length} active</span>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            {controls.length > 0 ? controls.map((control, index) => {
              const active = normalizeStatus(control.status) === "active";
              return <div key={control._id || control.name || index} className={`rounded-xl border p-4 transition ${active ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}`}><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className={`rounded-lg p-2 ${active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{active ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}</span><div className="min-w-0"><p className="font-semibold text-slate-900">{control.name || "Unnamed control"}</p><p className="mt-1 text-xs leading-5 text-slate-500">Security module protection</p></div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{control.status || "unknown"}</span></div></div>;
            }) : <EmptyState text="No security controls were returned by the security service." />}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6"><div className="flex items-center gap-2"><span className="rounded-lg bg-sky-50 p-2 text-sky-600"><Activity size={18} /></span><h2 className="text-lg font-bold text-slate-900">Protection Snapshot</h2></div><p className="mt-1 text-sm text-slate-500">Current platform security telemetry.</p></div>
          <div className="divide-y divide-slate-100">
            <SnapshotRow label="Authentication Service" value={authenticationStatus} status={authenticationStatus} />
            <SnapshotRow label="Authorization Service" value={authorizationStatus} status={authorizationStatus} />
            <SnapshotRow label="Database" value={data.database} status={data.database} />
            <SnapshotRow label="Failed Attempts · 24h" value={failedAttempts} numeric />
            <SnapshotRow label="Critical Events · 24h" value={criticalEvents} numeric critical={criticalEvents > 0} />
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:px-6"><span className="font-semibold text-slate-700">Last checked:</span> {lastChecked} · refreshes automatically every 30 seconds</div>
        </section>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={Users} label="Platform Users" value={data.users} />
        <InfoCard icon={LockKeyhole} label="Defined Roles" value={authorization.roles} />
        <InfoCard icon={KeyRound} label="Active Permissions" value={authorization.permissions} />
        <InfoCard icon={Database} label="Database" value={data.database} />
      </section>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm"><span className="font-semibold text-slate-700">Operational note:</span> security score and threat level are calculated from the backend security service; they are not client-side estimates. Failed attempts and critical events represent the preceding 24-hour window.</div>
    </div>
  );
}

function PageHeader({ onRefresh, refreshing }) { return <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-5 py-6 text-white shadow-lg sm:px-7 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200"><ShieldCheck size={14} /> Platform security</div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Security Center</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Platform authentication, authorization and threat monitoring with live backend security telemetry.</p></div><button type="button" onClick={onRefresh} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw size={17} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Refreshing..." : "Refresh status"}</button></div>; }
function MetricCard({ label, value, helper, icon: Icon, tone }) { const tones = { emerald: "border-emerald-200 bg-emerald-50 text-emerald-700", amber: "border-amber-200 bg-amber-50 text-amber-700", red: "border-red-200 bg-red-50 text-red-700", blue: "border-sky-200 bg-sky-50 text-sky-700", indigo: "border-indigo-200 bg-indigo-50 text-indigo-700", slate: "border-slate-200 bg-slate-100 text-slate-600" }; return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p></div><span className={`rounded-xl border p-2.5 ${tones[tone] || tones.slate}`}><Icon size={19} /></span></div><p className="mt-3 text-xs leading-5 text-slate-500">{helper}</p></div>; }
function InfoCard({ icon: Icon, label, value }) { return <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><span className="rounded-lg bg-slate-100 p-2.5 text-slate-600"><Icon size={18} /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 truncate text-lg font-bold text-slate-900">{value === undefined || value === null || value === "" ? "—" : String(value)}</p></div></div>; }
function SnapshotRow({ label, value, status, numeric = false, critical = false }) { const normalized = normalizeStatus(status); const good = normalized === "active" || normalized === "connected"; const display = numeric ? (typeof value === "number" ? String(value) : "—") : (value || "—"); const tone = critical ? "bg-red-50 text-red-700" : good ? "bg-emerald-50 text-emerald-700" : normalized === "unknown" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"; return <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"><span className="text-sm font-medium text-slate-600">{label}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{display}</span></div>; }
function EmptyState({ text }) { return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 sm:col-span-2">{text}</div>; }
function SecurityLoading() { return <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="h-40 animate-pulse rounded-2xl bg-slate-200" /><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-200" />)}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]"><div className="h-96 animate-pulse rounded-2xl bg-slate-200" /><div className="h-96 animate-pulse rounded-2xl bg-slate-200" /></div></div>; }
