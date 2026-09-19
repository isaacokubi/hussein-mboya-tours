import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ShieldCheck, AlertTriangle, FileBarChart2, Wallet, ReceiptText } from "lucide-react";
import { getReports, getFinancialStatements, getArAging, getApAging, getCashFlow, reconcileOperationalAccounting } from "../../../api/financeApi";

const isFiniteNumber = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
const numericValue = (value) => (isFiniteNumber(value) ? Number(value) : null);
const money = (value) => {
  const number = numericValue(value);
  return number === null ? "Unavailable" : `KES ${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const statusTone = {
  reconciled: "border-emerald-200 bg-emerald-50 text-emerald-800",
  review_required: "border-amber-200 bg-amber-50 text-amber-800",
  unavailable: "border-slate-200 bg-slate-100 text-slate-700",
};

const Card = ({ title, value, hint, icon: Icon = Wallet }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p></div><span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Icon size={20} /></span></div>
    {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
  </div>
);

const Rows = ({ rows = [], empty = "No posted activity in this period" }) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Code</th><th className="p-3 text-left">Account</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{safeRows.length ? safeRows.map((row, index) => <tr key={`${row.code || "account"}-${row.name || index}`} className="border-t border-slate-100 hover:bg-slate-50/70"><td className="p-3 font-mono text-xs text-slate-500">{row.code || "Unavailable"}</td><td className="p-3 text-slate-800">{row.name || "Unavailable"}</td><td className="p-3 text-right font-semibold text-slate-900">{money(row.amount)}</td></tr>) : <tr><td colSpan="3" className="p-7 text-center text-slate-500">{empty}</td></tr>}</tbody></table></div>;
};

const Aging = ({ buckets }) => {
  const safe = buckets && typeof buckets === "object" ? buckets : {};
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[["Current", "current"], ["1–30 days", "1_30"], ["31–60 days", "31_60"], ["61–90 days", "61_90"], ["90+ days", "90_plus"]].map(([label, key]) => <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{money(safe[key])}</p></div>)}</div>;
};

function ReconciliationCard({ title, item }) {

  if (!item) return null;
  const tone = statusTone[item.status] || statusTone.unavailable;
  const label = item.status === "reconciled" ? "Reconciled" : item.status === "review_required" ? "Review required" : "Unavailable";
  return <div className={`rounded-2xl border p-4 ${tone}`}><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{title}</h3><span className="rounded-full border px-2.5 py-1 text-xs font-semibold">{label}</span></div><div className="mt-4 grid gap-3 text-sm md:grid-cols-3"><div><p className="text-xs opacity-70">Control account {item.controlAccount}</p><p className="mt-1 font-semibold">{money(item.controlBalance)}</p></div><div><p className="text-xs opacity-70">Operational outstanding</p><p className="mt-1 font-semibold">{money(item.operationalOutstanding)}</p></div><div><p className="text-xs opacity-70">Variance</p><p className="mt-1 font-semibold">{money(item.variance)}</p></div></div>{item.status === "review_required" && <p className="mt-3 text-xs font-medium">The operational balance does not agree with the posted control account. Reconciliation will post missing invoices/payments and reverse known duplicate operational postings idempotently; it never edits the control balance directly.</p>}</div>;
}

export default function FinanceReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reconcileMessage, setReconcileMessage] = useState("");
  const [showDemoData, setShowDemoData] = useState(true);
  const params = useMemo(() => ({ ...(from ? { from } : {}), ...(to ? { to } : {}) }), [from, to]);
  const queryClient = useQueryClient();
  const statements = useQuery({ queryKey: ["financialStatements", params], queryFn: () => getFinancialStatements(params), retry: 1 });
  const ar = useQuery({ queryKey: ["arAging", params], queryFn: () => getArAging(params), retry: 1 });
  const ap = useQuery({ queryKey: ["apAging", params], queryFn: () => getApAging(params), retry: 1 });
  const cash = useQuery({ queryKey: ["cashFlow", params], queryFn: () => getCashFlow(params), retry: 1 });
  const reports = useQuery({ queryKey: ["financeReports", params], queryFn: () => getReports(params), retry: 1 });
  const reconcile = useMutation({
    mutationFn: reconcileOperationalAccounting,
    onSuccess: async (result) => {
      const summary = result?.summary || {};
      const posted = Object.values(summary.posted || {}).reduce((sum, value) => sum + Number(value || 0), 0);
      const errors = Array.isArray(summary.errors) ? summary.errors.length : 0;
      setReconcileMessage(errors ? `Reconciliation completed with ${errors} posting error${errors === 1 ? "" : "s"}. Review the accounting reconciliation results.` : `Operational accounting synchronized. ${posted} missing posting${posted === 1 ? " was" : "s were"} created or repaired.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["financialStatements"] }),
        queryClient.invalidateQueries({ queryKey: ["arAging"] }),
        queryClient.invalidateQueries({ queryKey: ["apAging"] }),
        queryClient.invalidateQueries({ queryKey: ["cashFlow"] }),
        queryClient.invalidateQueries({ queryKey: ["financeReports"] }),
      ]);
    },
    onError: (error) => setReconcileMessage(error?.response?.data?.message || error?.message || "Operational accounting reconciliation failed."),
  });
  const refresh = () => Promise.all([statements.refetch(), ar.refetch(), ap.refetch(), cash.refetch(), reports.refetch()]);

  const data = statements.data?.data || {};
  const pnl = data.profitAndLoss || {};
  const bs = data.balanceSheet || {};
  const cashData = cash.data?.data || {};
  const visibleMovements = useMemo(() => {
    const movements = Array.isArray(cashData.movements) ? cashData.movements : [];
    return movements.filter((m) => showDemoData || !/DEMO|TEST/i.test(`${m.reference || ""} ${m.description || ""}`));
  }, [cashData.movements, showDemoData]);
  const arData = ar.data?.data || {};
  const apData = ap.data?.data || {};
  const monthly = reports.data?.monthlyRevenue || reports.data?.data?.monthlyRevenue || [];
  const findAccount = (rows, code) => (Array.isArray(rows) ? rows : []).find((row) => String(row.code) === String(code));
  const arControl = findAccount(bs.assets, "1100");
  const apControl = findAccount(bs.liabilities, "2000");
  const arOutstanding = ar.isSuccess ? numericValue(arData.totalOutstanding) : null;
  const apOutstanding = ap.isSuccess ? numericValue(apData.totalOutstanding) : null;
  const arControlBalance = arControl ? numericValue(arControl.amount) : null;
  const apControlBalance = apControl ? numericValue(apControl.amount) : null;
  const reconciliation = {
    accountsReceivable: { controlAccount: "1100", controlBalance: arControlBalance, operationalOutstanding: arOutstanding, variance: arControlBalance !== null && arOutstanding !== null ? arControlBalance - arOutstanding : null, status: arControlBalance === null || arOutstanding === null ? "unavailable" : Math.abs(arControlBalance - arOutstanding) <= 0.01 ? "reconciled" : "review_required" },
    accountsPayable: { controlAccount: "2000", controlBalance: apControlBalance, operationalOutstanding: apOutstanding, variance: apControlBalance !== null && apOutstanding !== null ? apControlBalance - apOutstanding : null, status: apControlBalance === null || apOutstanding === null ? "unavailable" : Math.abs(apControlBalance - apOutstanding) <= 0.01 ? "reconciled" : "review_required" },
  };
  const loading = statements.isLoading || ar.isLoading || ap.isLoading || cash.isLoading || reports.isLoading;
  const error = statements.isError || ar.isError || ap.isError || cash.isError || reports.isError;
  const hasReview = reconciliation.accountsReceivable.status === "review_required" || reconciliation.accountsPayable.status === "review_required" || bs.balanced === false;
  const balanceStatus = bs.balanced === true ? "Balanced within KES 0.01 tolerance" : bs.balanced === false ? "Out of balance — investigate before close" : "Balance status unavailable";
  const periodLabel = data.period?.from || data.period?.to ? `${data.period?.from || "start"} to ${data.period?.to || "present"}` : "Current posted accounting activity";

  return <div className="min-h-full space-y-6 bg-slate-50 p-4 md:p-6">
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-lg"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><div className="mb-3 flex items-center gap-2 text-emerald-300"><FileBarChart2 size={18} /><span className="text-sm font-semibold">Finance · Reporting</span></div><h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1><p className="mt-2 max-w-3xl text-sm text-slate-300">Production P&amp;L, balance sheet, cash flow, receivables and supplier liabilities using tenant-scoped posted accounting activity.</p><p className="mt-3 text-xs font-medium text-slate-400">Report basis: posted journals · {periodLabel}</p></div><div className="flex flex-wrap items-end gap-2"><label className="text-xs font-medium text-slate-300">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded-lg border border-slate-600 bg-white p-2 text-sm text-slate-900" /></label><label className="text-xs font-medium text-slate-300">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded-lg border border-slate-600 bg-white p-2 text-sm text-slate-900" /></label><button onClick={() => { setFrom(""); setTo(""); }} className="rounded-lg border border-slate-600 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20">Clear</button><button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Refresh</button></div></div><div className="mt-5 flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5">Tenant scoped</span><span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">Posted journals</span><span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">Control reconciliation</span><span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">Missing data ≠ zero</span><label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5"><input type="checkbox" checked={showDemoData} onChange={(e) => setShowDemoData(e.target.checked)} />Include test/demo activity</label></div></div>
    {loading && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading accounting reports…</div>}
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p className="font-semibold">Accounting data could not be fully loaded.</p><p className="mt-1">Unavailable values are shown as unavailable. API failures are never converted into KES 0.00.</p></div>}
    {hasReview && <div className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 md:flex-row md:items-center md:justify-between"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0" size={19} /><div><p className="font-semibold">Accounting control review required</p><p className="mt-1">A control-account variance exists. The controlled reconciliation action posts missing operational accounting entries idempotently; it does not edit the control balance or hide the variance.</p></div></div><button onClick={() => reconcile.mutate()} disabled={reconcile.isPending} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw size={16} className={reconcile.isPending ? "animate-spin" : ""} />{reconcile.isPending ? "Synchronizing…" : "Reconcile operational accounting"}</button></div>}
    {reconcileMessage && <div className={`rounded-xl border p-4 text-sm ${reconcile.isError ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><p className="font-semibold">{reconcile.isError ? "Reconciliation failed" : "Reconciliation result"}</p><p className="mt-1">{reconcileMessage}</p></div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Card title="Revenue" value={money(pnl.totalRevenue)} hint="Posted revenue, not cash collected" icon={ReceiptText} /><Card title="Expenses" value={money(pnl.totalExpenses)} hint="Posted expense activity" icon={FileBarChart2} /><Card title="Net profit" value={money(pnl.netProfit)} hint="Revenue less posted expenses" icon={ShieldCheck} /><Card title="Cash position" value={money(data.cash?.position)} hint="Cash, bank, M-Pesa and gateway clearing" icon={Wallet} /></div>
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="text-xl font-semibold text-slate-900">Profit &amp; Loss</h2><p className="text-sm text-slate-500">Posted accounting activity for the selected period. Revenue is not the same as cash collected.</p></div><div className="p-5"><Rows rows={pnl.revenue} empty="No posted revenue in this period" /><div className="my-4 border-t pt-4"><Rows rows={pnl.expenses} empty="No posted expenses in this period" /></div><div className="flex flex-col gap-2 border-t pt-4 text-sm sm:flex-row sm:justify-end sm:gap-8"><span>Total revenue <b>{money(pnl.totalRevenue)}</b></span><span>Total expenses <b>{money(pnl.totalExpenses)}</b></span><span>Net profit <b>{money(pnl.netProfit)}</b></span></div></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="text-xl font-semibold text-slate-900">Balance Sheet</h2><p className="text-sm text-slate-500">Posted assets, liabilities and equity, with current-year result shown separately.</p></div><div className="grid gap-6 p-5 lg:grid-cols-2"><div><h3 className="mb-3 font-semibold text-slate-800">Assets</h3><Rows rows={bs.assets} empty="No posted asset balances are available" /><p className="mt-3 text-right font-bold text-slate-900">Total assets: {money(bs.totalAssets)}</p></div><div><h3 className="mb-3 font-semibold text-slate-800">Liabilities &amp; equity</h3><Rows rows={[...(Array.isArray(bs.liabilities) ? bs.liabilities : []), ...(Array.isArray(bs.equity) ? bs.equity : []), { code: "CURRENT", name: "Current-year result", amount: bs.currentYearResult }]} empty="No posted liability or equity balances are available" /><p className="mt-3 text-right font-bold text-slate-900">Liabilities + equity: {money(bs.liabilitiesAndEquity)}</p><p className={`mt-1 text-right text-sm font-semibold ${bs.balanced === true ? "text-emerald-700" : bs.balanced === false ? "text-red-700" : "text-slate-500"}`}>{balanceStatus}</p></div></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4"><h2 className="text-xl font-semibold text-slate-900">Control Reconciliation</h2><p className="text-sm text-slate-500">Operational aging is compared with the corresponding posted control account. A variance is a control issue, not a missing zero.</p></div><div className="grid gap-4 lg:grid-cols-2"><ReconciliationCard title="Accounts Receivable" item={reconciliation.accountsReceivable} /><ReconciliationCard title="Accounts Payable" item={reconciliation.accountsPayable} /></div></section>
    <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold text-slate-900">Accounts Receivable Aging</h2><p className="mb-4 text-sm text-slate-500">Outstanding customer and corporate invoices from the operational invoice ledger.</p><Aging buckets={arData.buckets} /><p className="mt-4 text-right font-bold text-slate-900">Outstanding: {money(arData.totalOutstanding)}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold text-slate-900">Accounts Payable Aging</h2><p className="mb-4 text-sm text-slate-500">Outstanding supplier liabilities from supplier payables and approved supplier-backed expenses.</p><Aging buckets={apData.buckets} /><p className="mt-4 text-right font-bold text-slate-900">Outstanding: {money(apData.totalOutstanding)}</p></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="text-xl font-semibold text-slate-900">Cash Flow</h2><p className="text-sm text-slate-500">Posted movements through cash, bank, M-Pesa and gateway-clearing accounts. This is cash movement, not revenue.</p></div><div className="grid gap-4 p-5 md:grid-cols-3"><Card title="Inflows" value={money(cashData.inflows)} /><Card title="Outflows" value={money(cashData.outflows)} /><Card title="Net movement" value={money(cashData.netMovement)} /></div><div className="overflow-x-auto px-5 pb-5"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Account</th><th className="p-3 text-left">Description</th><th className="p-3 text-right">Movement</th></tr></thead><tbody>{visibleMovements.slice(-100).reverse().map((m, i) => <tr key={`${m.date}-${i}`} className="border-t border-slate-100"><td className="p-3">{m.date ? new Date(m.date).toLocaleDateString() : "Unavailable"}</td><td className="p-3 font-mono text-xs">{m.accountCode || "Unavailable"}</td><td className="p-3">{m.description || "Unavailable"}{m.reference && /DEMO|TEST/i.test(m.reference) && <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">TEST/DEMO</span>}</td><td className={`p-3 text-right font-medium ${Number(m.amount) >= 0 ? "text-emerald-700" : "text-red-700"}`}>{money(m.amount)}</td></tr>)}</tbody></table>{!visibleMovements.length && !cash.isLoading && <p className="py-8 text-center text-sm text-slate-500">No posted cash movements are available for this period.</p>}</div></section>
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="text-xl font-semibold text-slate-900">Monthly Posted Revenue</h2><p className="text-sm text-slate-500">Revenue recognized from posted journal entries on revenue accounts. Cash collections are reported separately and are not used as revenue.</p></div><div className="p-5">{monthly.length ? <div className="grid gap-3 md:grid-cols-3">{monthly.map((r, i) => <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">{r?._id?.month || "—"}/{r?._id?.year || "—"}</p><p className="mt-1 text-lg font-semibold text-slate-900">{money(r.revenue)}</p>{isFiniteNumber(r.transactions) && <p className="mt-1 text-xs text-slate-500">{r.transactions} posted journal entr{Number(r.transactions) === 1 ? "y" : "ies"}</p>}</div>)}</div> : <p className="text-sm text-slate-500">No monthly posted revenue records are available.</p>}</div></section>
  </div>;
}
