import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  ChevronDown,
  Database,
  Download,
  HardDrive,
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import axios from "../../api/axios";
import { getDatabaseStatus } from "../../api/superAdminApi";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const valueOrDash = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

export default function SuperAdminDatabase() {
  const [busyAction, setBusyAction] = useState("");
  const [actionError, setActionError] = useState("");

  const databaseQuery = useQuery({
    queryKey: ["database-status"],
    queryFn: getDatabaseStatus,
    refetchInterval: 30000,
    retry: 1,
  });

  const backupsQuery = useQuery({
    queryKey: ["database-backups"],
    queryFn: async () => (await axios.get("/superadmin/maintenance/backups")).data,
    refetchInterval: 30000,
    retry: 1,
  });

  const backups = useMemo(() => {
    const rows = Array.isArray(backupsQuery.data?.backups)
      ? backupsQuery.data.backups
      : [];

    return [...rows].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }, [backupsQuery.data]);

  const database = databaseQuery.data?.database || {};
  const connected = String(database.status || "").toLowerCase() === "connected";
  const loading = databaseQuery.isLoading;
  const hasError = databaseQuery.isError || backupsQuery.isError;

  const runAction = async (url, label) => {
    setBusyAction(label);
    setActionError("");

    try {
      const response = await axios.post(url);
      await Promise.all([databaseQuery.refetch(), backupsQuery.refetch()]);
      window.alert(response.data?.message || `${label} completed successfully.`);
    } catch (error) {
      const message =
        error.response?.data?.message || `Unable to ${label.toLowerCase()}.`;
      setActionError(message);
    } finally {
      setBusyAction("");
    }
  };

  const removeBackup = async (id) => {
    if (!id || !window.confirm("Delete this database backup permanently?")) return;

    setBusyAction(`delete:${id}`);
    setActionError("");

    try {
      await axios.delete(`/superadmin/maintenance/backups/${id}`);
      await backupsQuery.refetch();
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Unable to delete the selected backup.",
      );
    } finally {
      setBusyAction("");
    }
  };

  const downloadBackup = async (backup) => {
    if (!backup?._id) return;

    setBusyAction(`download:${backup._id}`);
    setActionError("");

    try {
      const response = await axios.get(
        `/superadmin/database/backup/${backup._id}/download`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = backup.file || `database-backup-${backup._id}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Unable to download the selected backup.",
      );
    } finally {
      setBusyAction("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-indigo-400/30 bg-white/10 p-3 shadow-lg shadow-black/20">
                <Database className="h-7 w-7 text-indigo-200" />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
                  <span>Platform Governance</span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 tracking-normal">
                    Restricted
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Database Management
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Monitor the platform database connection and manage verified database backups.
                  Destructive operations are intentionally isolated from routine monitoring.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                databaseQuery.refetch();
                backupsQuery.refetch();
              }}
              disabled={databaseQuery.isFetching || backupsQuery.isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${databaseQuery.isFetching || backupsQuery.isFetching ? "animate-spin" : ""}`}
              />
              Refresh status
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        {hasError && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold">Database management telemetry is incomplete</p>
              <p className="mt-1 text-sm text-rose-800">
                One or more platform endpoints could not be read. Missing telemetry is not treated as a healthy or empty value.
              </p>
            </div>
          </div>
        )}

        {actionError && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="min-w-0">
              <p className="font-semibold">Operation not completed</p>
              <p className="mt-1 text-sm text-amber-900">{actionError}</p>
            </div>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            icon={connected ? CheckCircle2 : XCircle}
            label="Connection status"
            value={loading ? "Checking…" : valueOrDash(database.status)}
            tone={connected ? "emerald" : "rose"}
            detail={connected ? "Database connection is reporting healthy." : "Connection state requires attention."}
          />
          <StatusCard
            icon={Server}
            label="Database host"
            value={loading ? "Loading…" : valueOrDash(database.host)}
            tone="indigo"
            detail="Reported by the protected database status endpoint."
            compact
          />
          <StatusCard
            icon={HardDrive}
            label="Database name"
            value={loading ? "Loading…" : valueOrDash(database.name)}
            tone="blue"
            detail="Current database identity returned by the backend."
          />
          <StatusCard
            icon={Archive}
            label="Available backups"
            value={backupsQuery.isLoading ? "Checking…" : String(backups.length)}
            tone={backups.length ? "violet" : "amber"}
            detail={backups.length ? "Backup records currently available." : "No backup records are currently reported."}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Database controls</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">Operational actions</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Create a point-in-time backup before high-risk maintenance. Cache clearing is kept separate because it does not create a database backup.
                </p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={Boolean(busyAction)}
                onClick={() => runAction("/superadmin/database/backup", "Create backup")}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyAction === "Create backup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                {busyAction === "Create backup" ? "Creating backup…" : "Create backup"}
              </button>

              <button
                type="button"
                disabled={Boolean(busyAction)}
                onClick={() => runAction("/superadmin/database/cache-clear", "Clear cache")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyAction === "Clear cache" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {busyAction === "Clear cache" ? "Clearing cache…" : "Clear cache"}
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-amber-950">Privileged operations</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900">
                    These controls execute against the platform backend. Verify the target environment before performing maintenance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">Connection snapshot</p>
            <h2 className="mt-1 text-xl font-bold">Database identity</h2>

            <div className="mt-6 space-y-4">
              <IdentityRow label="Status" value={valueOrDash(database.status)} />
              <IdentityRow label="Host" value={valueOrDash(database.host)} />
              <IdentityRow label="Database" value={valueOrDash(database.name)} />
              {databaseQuery.data?.timestamp && (
                <IdentityRow label="Last checked" value={formatDate(databaseQuery.data.timestamp)} />
              )}
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-300">
              Connection telemetry is read from the protected platform API. This screen does not infer connectivity from browser state.
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/60 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Recovery assets</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">Database backups</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Backup records returned by the platform maintenance service.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                <Archive className="h-3.5 w-3.5" />
                {backups.length} recorded
              </span>
            </div>
          </div>

          {backupsQuery.isLoading ? (
            <div className="space-y-4 p-6">
              {[1, 2].map((item) => (
                <div key={item} className="animate-pulse rounded-xl border border-slate-200 p-5">
                  <div className="h-5 w-2/5 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-3/5 rounded bg-slate-100" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : backups.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Archive className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">No backups available</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                The maintenance service currently reports no backup records. This is not treated as a successful backup state.
              </p>
              <button
                type="button"
                disabled={Boolean(busyAction)}
                onClick={() => runAction("/superadmin/database/backup", "Create backup")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Archive className="h-4 w-4" />
                Create first backup
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {backups.map((backup, index) => (
                <BackupRow
                  key={backup._id || backup.file || index}
                  backup={backup}
                  latest={index === 0}
                  busyAction={busyAction}
                  onDownload={downloadBackup}
                  onDelete={removeBackup}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, detail, tone, compact = false }) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
    rose: "border-rose-200 bg-rose-50/70 text-rose-700",
    indigo: "border-indigo-200 bg-indigo-50/70 text-indigo-700",
    blue: "border-blue-200 bg-blue-50/70 text-blue-700",
    violet: "border-violet-200 bg-violet-50/70 text-violet-700",
    amber: "border-amber-200 bg-amber-50/70 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className={`mt-2 break-words font-bold text-slate-950 ${compact ? "text-base" : "text-2xl"}`}>
            {value}
          </p>
        </div>
        <div className={`rounded-xl border p-2.5 ${tones[tone] || tones.indigo}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function IdentityRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <span className="max-w-[65%] break-all text-right text-sm font-semibold text-slate-100">{value}</span>
    </div>
  );
}

function BackupRow({ backup, latest, busyAction, onDownload, onDelete }) {
  const collections = Array.isArray(backup.collections) ? backup.collections : [];
  const isDownloading = busyAction === `download:${backup._id}`;
  const isDeleting = busyAction === `delete:${backup._id}`;

  return (
    <article className="p-6 transition hover:bg-slate-50/70">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Archive className="h-5 w-5 shrink-0 text-indigo-600" />
              <h3 className="truncate font-bold text-slate-950">{valueOrDash(backup.file)}</h3>
            </div>
            {latest && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                Latest
              </span>
            )}
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <Meta label="Size" value={valueOrDash(backup.size)} />
            <Meta label="Database" value={valueOrDash(backup.databaseName)} />
            <Meta label="Environment" value={valueOrDash(backup.environment)} />
            <Meta label="Created by" value={valueOrDash(backup.createdBy)} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span>Created: {formatDate(backup.createdAt)}</span>
            <span>Collections: {collections.length || "—"}</span>
          </div>

          {collections.length > 0 && (
            <details className="group mt-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800">
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                View collections
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {collections.map((collection) => (
                  <span key={collection} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                    {collection}
                  </span>
                ))}
              </div>
            </details>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col">
          <button
            type="button"
            disabled={Boolean(busyAction)}
            onClick={() => onDownload(backup)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isDownloading ? "Preparing…" : "Download"}
          </button>
          <button
            type="button"
            disabled={Boolean(busyAction)}
            onClick={() => onDelete(backup._id)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-700">{value}</p>
    </div>
  );
}
