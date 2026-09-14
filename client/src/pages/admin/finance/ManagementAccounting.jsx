import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Landmark,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";
import api from "../../../api/axios";

const money = (value) => {
  const n = Number(value);
  return Number.isFinite(n)
    ? new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 2,
      }).format(n)
    : "—";
};

const finite = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;
const messageOf = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const asArray = (value) => (Array.isArray(value) ? value : null);

export default function ManagementAccounting() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [assets, setAssets] = useState(null);
  const [budgets, setBudgets] = useState(null);
  const [periods, setPeriods] = useState(null);
  const [variance, setVariance] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [a, b, p, v] = await Promise.all([
        api.get("/admin/finance/accounting/assets"),
        api.get(`/admin/finance/accounting/budgets?fiscalYear=${year}`),
        api.get("/admin/finance/accounting/periods"),
        api.get(`/admin/finance/accounting/budgets-vs-actual?fiscalYear=${year}`),
      ]);

      setAssets(asArray(unwrap(a)) ?? []);
      setBudgets(asArray(unwrap(b)) ?? []);
      setPeriods(asArray(unwrap(p)) ?? []);
      const varianceData = unwrap(v);
      setVariance(asArray(varianceData?.rows) ?? []);
    } catch (e) {
      setError(messageOf(e, "Unable to load management accounting data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [year]);

  const run = async (key, fn, successMessage = "Accounting operation completed successfully.") => {
    setBusy(key);
    setError("");
    setNotice("");
    try {
      await fn();
      setNotice(successMessage);
      await load();
    } catch (e) {
      setError(messageOf(e, "Accounting operation failed."));
    } finally {
      setBusy("");
    }
  };

  const totals = useMemo(() => {
    const sum = (rows, selector) =>
      rows === null
        ? null
        : rows.reduce((total, row) => total + (finite(selector(row)) ?? 0), 0);

    return {
      assets: sum(assets, (a) => a.acquisitionCost),
      budget: sum(budgets, (b) => b.amount),
      actual: sum(variance, (b) => b.actual),
    };
  }, [assets, budgets, variance]);

  const depreciate = (asset) => {
    const months = Number(window.prompt("Number of depreciation months", "1"));
    if (!Number.isInteger(months) || months < 1) return;
    const period = window.prompt(
      "Depreciation period (YYYY-MM)",
      new Date().toISOString().slice(0, 7),
    );
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period || "")) return;
    return run(
      `dep-${asset._id}`,
      () =>
        api.post(`/admin/finance/accounting/assets/${asset._id}/depreciate`, {
          months,
          period,
        }),
      `Depreciation posted for ${asset.assetNumber}.`,
    );
  };

  const dispose = (asset) => {
    const proceeds = Number(window.prompt("Disposal proceeds (KES)", "0"));
    if (!Number.isFinite(proceeds) || proceeds < 0) return;
    const reference =
      window.prompt("Disposal reference", `DISP-${asset.assetNumber}`) ||
      `DISP-${asset.assetNumber}`;
    return run(
      `disp-${asset._id}`,
      () =>
        api.post(`/admin/finance/accounting/assets/${asset._id}/dispose`, {
          proceeds,
          reference,
        }),
      `Asset ${asset.assetNumber} was disposed successfully.`,
    );
  };

  const approveBudget = (budget) =>
    run(
      `budget-${budget._id}`,
      () => api.post(`/admin/finance/accounting/budgets/${budget._id}/approve`),
      "Budget approved successfully.",
    );

  const closePeriod = (period) =>
    run(
      `close-${period}`,
      () =>
        api.post(`/admin/finance/accounting/periods/${period}/close`, {
          note: "Closed from Management Accounting.",
        }),
      `Accounting period ${period} closed successfully.`,
    );

  const reopenPeriod = (period) =>
    run(
      `reopen-${period}`,
      () => api.post(`/admin/finance/accounting/periods/${period}/reopen`),
      `Accounting period ${period} reopened successfully.`,
    );

  const closeYear = () => {
    if (
      !window.confirm(
        `Close fiscal year ${year} and transfer the calculated profit/loss to retained earnings?`,
      )
    )
      return;
    return run(
      `year-${year}`,
      () => api.post(`/admin/finance/accounting/periods/${year}/year-end-close`),
      `Financial year ${year} closed successfully.`,
    );
  };

  const hasDataError = Boolean(error);
  const dataReady = !loading && !hasDataError;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <header className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white shadow-xl">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                  Finance & Accounting
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                  Management Accounting
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Management Accounting
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                  Control fixed assets, depreciation, approved budgets, budget-vs-actual performance,
                  and accounting-period close activities for the tenant ledger.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  <span className="mr-2 text-xs font-medium text-slate-300">Reporting year</span>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value) || new Date().getFullYear())}
                    className="w-20 bg-transparent text-sm font-bold text-white outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={load}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <Link
                  to="/admin/finance"
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-emerald-50"
                >
                  Back to Finance
                </Link>
              </div>
            </div>
          </div>
          <div className="grid border-t border-white/10 sm:grid-cols-3">
            <StatusStrip icon={Landmark} label="Ledger" value="Tenant scoped" />
            <StatusStrip icon={FileCheck2} label="Budget control" value="Approved only" />
            <StatusStrip icon={LockKeyhole} label="Period control" value="Explicit close" />
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Management accounting data is unavailable</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}
        {notice && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">{notice}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            icon={Landmark}
            title="Fixed asset cost"
            value={loading ? "Loading…" : hasDataError ? "Unavailable" : money(totals.assets)}
            tone="emerald"
          />
          <Metric
            icon={WalletCards}
            title={`${year} approved & draft budgets`}
            value={loading ? "Loading…" : hasDataError ? "Unavailable" : money(totals.budget)}
            tone="blue"
          />
          <Metric
            icon={CircleDollarSign}
            title={`${year} budget actuals`}
            value={loading ? "Loading…" : hasDataError ? "Unavailable" : money(totals.actual)}
            tone="amber"
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            icon={Landmark}
            title="Fixed assets & depreciation"
            description="Asset acquisitions and depreciation post directly to the tenant general ledger."
          />
          <DataState ready={dataReady} loading={loading} empty={!assets?.length} emptyText="No fixed assets have been recorded for this tenant." error={hasDataError}>
            <Table
              headers={["Asset", "Category", "Cost", "Accumulated depreciation", "Status", "Actions"]}
              rows={(assets || []).map((asset) => [
                <div>
                  <p className="font-semibold text-slate-900">{asset.assetNumber} · {asset.name}</p>
                  <p className="text-xs text-slate-500">{asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString("en-KE") : "Acquisition date unavailable"}</p>
                </div>,
                asset.category || "—",
                money(asset.acquisitionCost),
                money(asset.accumulatedDepreciation),
                <StatusBadge status={asset.status} />,
                asset.status === "active" ? (
                  <div className="flex flex-wrap gap-2">
                    <ActionButton disabled={!!busy} onClick={() => depreciate(asset)} loading={busy === `dep-${asset._id}`}>
                      Depreciate
                    </ActionButton>
                    <ActionButton variant="secondary" disabled={!!busy} onClick={() => dispose(asset)} loading={busy === `disp-${asset._id}`}>
                      Dispose
                    </ActionButton>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No action</span>
                ),
              ])}
            />
          </DataState>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            icon={WalletCards}
            title="Budgets"
            description="Only approved budgets feed budget-vs-actual reporting. Draft budgets remain subject to finance approval."
          />
          <DataState ready={dataReady} loading={loading} empty={!budgets?.length} emptyText={`No budgets have been configured for ${year}.`} error={hasDataError}>
            <Table
              headers={["Budget", "Account", "Month", "Amount", "Status", "Actions"]}
              rows={(budgets || []).map((budget) => [
                <span className="font-semibold">{budget.name}</span>,
                budget.accountCode || "—",
                budget.month ? String(budget.month).padStart(2, "0") : "Annual",
                money(budget.amount),
                <StatusBadge status={budget.status} />,
                budget.status === "draft" ? (
                  <ActionButton disabled={!!busy} onClick={() => approveBudget(budget)} loading={busy === `budget-${budget._id}`}>
                    Approve
                  </ActionButton>
                ) : (
                  <span className="text-xs text-slate-400">Approved</span>
                ),
              ])}
            />
          </DataState>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            icon={CircleDollarSign}
            title={`Budget vs actual — ${year}`}
            description="Actuals come from posted tenant journals. Missing API data is shown as unavailable rather than being converted into a synthetic zero."
          />
          <DataState ready={dataReady} loading={loading} empty={!variance?.length} emptyText={`No approved budget lines are available for ${year}.`} error={hasDataError}>
            <Table
              headers={["Account", "Budget", "Actual", "Variance", "Utilization"]}
              rows={(variance || []).map((row) => [
                <span className="font-semibold">{row.accountCode || "—"}</span>,
                money(row.amount),
                money(row.actual),
                <span className={Number(row.variance) < 0 ? "font-semibold text-red-700" : "font-semibold text-emerald-700"}>
                  {money(row.variance)}
                </span>,
                row.utilizationPercent == null ? "—" : `${row.utilizationPercent}%`,
              ])}
            />
          </DataState>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-slate-900 p-2.5 text-white"><LockKeyhole className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Accounting periods</h2>
                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
                  Closed periods reject new automatic journal postings. Reopening is an explicit finance action.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={!!busy || loading}
              onClick={closeYear}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === `year-${year}` ? "Closing year…" : `Close ${year}`}
            </button>
          </div>

          <DataState ready={dataReady} loading={loading} empty={!periods?.length} emptyText="No periods have been closed yet. Open periods accept normal postings." error={hasDataError}>
            <Table
              headers={["Period", "Status", "Closed at", "Actions"]}
              rows={(periods || []).map((period) => [
                <span className="font-semibold">{period.period}</span>,
                <StatusBadge status={period.status} />,
                period.closedAt ? new Date(period.closedAt).toLocaleString("en-KE") : "Open",
                period.status === "closed" ? (
                  <ActionButton variant="secondary" disabled={!!busy} onClick={() => reopenPeriod(period.period)} loading={busy === `reopen-${period.period}`}>
                    Reopen
                  </ActionButton>
                ) : (
                  <ActionButton disabled={!!busy} onClick={() => closePeriod(period.period)} loading={busy === `close-${period.period}`}>
                    Close
                  </ActionButton>
                ),
              ])}
            />
          </DataState>
        </section>

        <footer className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span>Reporting year: <strong className="text-slate-700">{year}</strong></span>
            <span>Tenant-scoped ledger controls • Missing data is never presented as KES 0.00.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function StatusStrip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-white/10 px-6 py-4 sm:border-r last:border-r-0">
      <Icon className="h-4 w-4 text-emerald-300" />
      <div><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-semibold text-white">{value}</p></div>
    </div>
  );
}

function Metric({ icon: Icon, title, value, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 p-5 md:p-6">
      <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Icon className="h-5 w-5" /></div>
      <div><h2 className="text-xl font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{description}</p></div>
    </div>
  );
}

function DataState({ ready, loading, empty, emptyText, error, children }) {
  if (loading) return <div className="p-8 text-center text-sm font-medium text-slate-500">Loading accounting data…</div>;
  if (error || !ready) return <div className="p-8 text-center text-sm font-semibold text-red-600">Data unavailable. Check the accounting API response above.</div>;
  if (empty) return <div className="p-8 text-center text-sm text-slate-500">{emptyText}</div>;
  return children;
}

function StatusBadge({ status }) {
  const normalized = String(status || "unknown").toLowerCase();
  const styles = normalized === "approved" || normalized === "active" || normalized === "open"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : normalized === "closed" || normalized === "fully_depreciated"
      ? "bg-slate-100 text-slate-700 ring-slate-200"
      : normalized === "disposed"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-slate-50 text-slate-600 ring-slate-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${styles}`}>{normalized.replaceAll("_", " ")}</span>;
}

function ActionButton({ children, variant = "primary", disabled, onClick, loading }) {
  const base = variant === "secondary"
    ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    : "bg-slate-950 text-white hover:bg-slate-800";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${base}`}
    >
      {loading ? "Working…" : children}
    </button>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs uppercase tracking-wide text-slate-500">
            {headers.map((header) => <th key={header} className="whitespace-nowrap px-5 py-3 font-bold">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
              {row.map((value, cellIndex) => <td key={cellIndex} className="px-5 py-4 align-middle text-slate-700">{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
