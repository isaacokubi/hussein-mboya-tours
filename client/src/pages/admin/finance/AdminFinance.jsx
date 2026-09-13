import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Activity, ArrowRight, Banknote, BarChart3, Building2, Calculator, CheckCircle2, CreditCard, FileBarChart, Landmark, Receipt, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { getFinanceStats } from "../../../api/financeApi";
import { getOperationsOverview } from "../../../api/operationsApi";
import { getSupplierPayables, getCorporateAccounts } from "../../../api/operationsModuleApi";
import { getLedgerSummary } from "../../../api/accountingApi";
import AccountingLedger from "../AccountingLedger";
import KenyaTaxCenter from "../../../components/admin/KenyaTaxCenter";
import FinanceLifecycleCenter from "../../../components/admin/FinanceLifecycleCenter";
import GoLiveReadiness from "../GoLiveReadiness";

const money = (value) => `KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const unwrap = (value) => value?.data?.data ?? value?.data ?? value ?? {};
const list = (value) => Array.isArray(value) ? value : value?.items || value?.data || [];
const pct = (a, b) => Number(b) ? `${((Number(a || 0) / Number(b)) * 100).toFixed(1)}%` : "0.0%";

const workspaceCards = [
  ["Finance Reports", "/admin/finance/reports", "P&L trends, revenue and transaction reporting", BarChart3],
  ["M-Pesa Transactions", "/admin/finance/transactions", "Payment activity, receipts and exceptions", CreditCard],
  ["Reconciliation", "/admin/finance/reconciliation", "Match collections and resolve exceptions", CheckCircle2],
  ["Compliance & eTIMS", "/admin/compliance", "Tax, eTIMS and statutory workflows", ShieldCheck],
  ["Operations & Procurement", "/admin/operations", "Suppliers, purchase orders and payables", Building2],
];

export default function AdminFinance() {
  const [financeQ, operationsQ, payablesQ, corporateQ] = useQueries({ queries: [
    { queryKey: ["admin-finance-accounting"], queryFn: getFinanceStats, staleTime: 30000, refetchInterval: 60000, retry: 2 },
    { queryKey: ["admin-finance-operations"], queryFn: getOperationsOverview, staleTime: 30000, refetchInterval: 60000, retry: 2 },
    { queryKey: ["admin-finance-payables"], queryFn: getSupplierPayables, staleTime: 30000, refetchInterval: 60000, retry: 2 },
    { queryKey: ["admin-finance-corporate"], queryFn: getCorporateAccounts, staleTime: 30000, refetchInterval: 60000, retry: 2 },
  ]});
  const ledgerQ = useQuery({ queryKey: ["accounting-summary"], queryFn: getLedgerSummary, staleTime: 30000, retry: 2 });
  const finance = unwrap(financeQ.data);
  const operations = unwrap(operationsQ.data);
  const payables = list(payablesQ.data);
  const corporate = list(corporateQ.data);
  const procurement = operations.procurement || {};
  const ledger = unwrap(ledgerQ.data);
  const outstandingPayables = payables.reduce((sum, item) => sum + Number(item.balance ?? item.outstanding ?? item.amount ?? 0), 0) || Number(procurement.outstandingPayables || 0);
  const corporateExposure = corporate.reduce((sum, item) => sum + Number(item.outstandingBalance ?? item.currentBalance ?? item.balance ?? 0), 0) || Number(procurement.corporateExposure || 0);
  const profit = Number(ledger.profitLoss?.netProfit || 0);
  const revenue = Number(finance.revenue || 0);
  const cashAccounts = useMemo(() => (ledger.accounts || []).filter((row) => ["cash", "bank", "mobile_money"].includes(row.account?.subtype)), [ledger.accounts]);
  const cashPosition = cashAccounts.reduce((sum, row) => sum + Number(row.balance || 0), 0);
  const cards = [
    ["Gross Revenue", money(finance.revenue), "Completed collections", Banknote, "text-sky-600"],
    ["Net Revenue", money(finance.netRevenue), `${pct(finance.netRevenue, revenue)} retained`, Wallet, "text-indigo-600"],
    ["Refunded", money(finance.refundedAmount), `${finance.refundedPayments || 0} refund records`, Receipt, "text-amber-600"],
    ["Cash Position", money(cashPosition), "Cash + bank + M-Pesa ledger", Landmark, "text-emerald-600"],
    ["Supplier Payables", money(outstandingPayables), "Outstanding supplier exposure", Building2, "text-violet-600"],
    ["Corporate Exposure", money(corporateExposure), "Receivable / credit exposure", CreditCard, "text-rose-600"],
  ];
  const queries = [financeQ, operationsQ, payablesQ, corporateQ, ledgerQ];
  const errors = queries.filter((q) => q.isError).length;
  const refreshing = queries.some((q) => q.isFetching);

  return <div className="space-y-8 pb-10">
    <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 p-7 text-white shadow-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-300">Finance & Accounting</p><h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Accounting & Finance Center</h1><p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">A tenant-scoped financial command center for collections, cash, receivables, supplier liabilities, tax controls, reconciliation and double-entry accounting.</p></div>
        <div className="flex items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300"><Activity size={14} className={refreshing ? "animate-pulse" : ""}/> {refreshing ? "Syncing" : "Live finance data"}</span><button onClick={() => queries.forEach((q) => q.refetch())} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 hover:bg-indigo-500"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""}/> Refresh</button></div>
      </div>
    </header>

    {errors > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{errors} finance data source{errors > 1 ? "s" : ""} could not be refreshed. Existing figures remain visible; retry after checking the affected service.</div>}

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(([title, value, hint, Icon, tone]) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></div><div className="rounded-xl bg-slate-100 p-2.5"><Icon size={20} className={tone}/></div></div></div>)}
    </section>

    <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Financial snapshot</p><h2 className="mt-1 text-xl font-black text-slate-950">Performance & exposure</h2></div><Link to="/admin/finance/reports" className="text-sm font-bold text-indigo-700 hover:text-indigo-500">Detailed reports <ArrowRight className="ml-1 inline" size={15}/></Link></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Posted revenue" value={money(ledger.profitLoss?.revenue)} /><Metric label="Posted expenses" value={money(ledger.profitLoss?.expenses)} /><Metric label="Net profit" value={money(profit)} emphasis={profit >= 0 ? "positive" : "negative"} /><Metric label="Collection rate" value={pct(finance.netRevenue, revenue)} /></div><div className="mt-5 grid gap-3 md:grid-cols-3"><Health label="Ledger" value={Math.abs(Number(ledger.totals?.debit || 0) - Number(ledger.totals?.credit || 0)) < 0.01 ? "Balanced" : "Review"} good={Math.abs(Number(ledger.totals?.debit || 0) - Number(ledger.totals?.credit || 0)) < 0.01}/><Health label="Payments" value={`${finance.completedPayments || 0} completed`} good/><Health label="Reconciliation" value="Open workspace" good={false}/></div></div>
      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-sky-300">Control posture</p><h2 className="mt-1 text-xl font-black">Production finance controls</h2><div className="mt-5 space-y-3"><Control text="Tenant-scoped ledger and financial data"/><Control text="Draft → post journal workflow"/><Control text="Refund, note and payment-link lifecycle"/><Control text="Configurable Kenya tax rules"/><Control text="eTIMS remains adapter-controlled"/></div><Link to="/admin/finance/reconciliation" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold hover:bg-indigo-500">Open reconciliation <ArrowRight size={15}/></Link></div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div><p className="text-xs font-bold uppercase tracking-wider text-sky-600">Finance workspace</p><h2 className="mt-1 text-xl font-black text-slate-950">Open finance modules</h2><p className="mt-1 text-sm text-slate-500">Move from management overview to the operational workflow you need.</p></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">{workspaceCards.map(([title,path,text,Icon])=><Link key={path} to={path} className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-md"><div className="flex items-center justify-between"><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700"><Icon size={19}/></span><ArrowRight size={16} className="text-slate-300 transition group-hover:text-indigo-600"/></div><h3 className="mt-4 font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{text}</p></Link>)}</div></section>

    <FinanceLifecycleCenter />
    <KenyaTaxCenter />
    <section id="general-ledger"><AccountingLedger /></section>
    <GoLiveReadiness />
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-50 p-2 text-indigo-700"><Calculator size={19}/></div><div><h2 className="text-xl font-black text-slate-950">Accounting control coverage</h2><p className="text-sm text-slate-500">Core SaaS accounting workflows available to the tenant.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{["Revenue, refunds and payment status","Accounts receivable and corporate exposure","Supplier payables and procurement costs","Commission tracking and settlement","Double-entry journal and trial balance","Configurable tax/VAT rules","Payment links and credit/debit notes","Reconciliation and finance reporting"].map((text)=><div key={text} className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700"><CheckCircle2 size={16} className="mr-2 inline text-emerald-600"/>{text}</div>)}</div></section>
  </div>;
}

function Metric({ label, value, emphasis }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-1 text-lg font-black ${emphasis === "negative" ? "text-rose-600" : emphasis === "positive" ? "text-emerald-700" : "text-slate-900"}`}>{value}</p></div>; }
function Health({ label, value, good }) { return <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><span className="text-sm text-slate-500">{label}</span><span className={`text-xs font-bold ${good ? "text-emerald-700" : "text-indigo-700"}`}>{value}</span></div>; }
function Control({ text }) { return <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"><CheckCircle2 size={16} className="shrink-0 text-emerald-400"/>{text}</div>; }
