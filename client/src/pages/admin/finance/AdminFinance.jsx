/**
 * Purpose: Admin Finance page-level UI component. Main declarations: money, unwrap, list, pct, displayAmount.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQueries, useQuery } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import { Activity, ArrowRight, Banknote, BarChart3, Building2, Calculator, CheckCircle2, CreditCard, Landmark, Receipt, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
// Load react-router-dom so this module can use its exported dependencies.
import { Link } from "react-router-dom";
// Load ../../../api/financeApi so this module can use its exported dependencies.
import { getFinanceStats } from "../../../api/financeApi";
// Load ../../../api/operationsModuleApi so this module can use its exported dependencies.
import { getSupplierPayables, getCorporateAccounts } from "../../../api/operationsModuleApi";
// Load ../../../api/accountingApi so this module can use its exported dependencies.
import { getLedgerSummary } from "../../../api/accountingApi";
// Load ../AccountingLedger so this module can use its exported dependencies.
import AccountingLedger from "../AccountingLedger";
// Load ../../../components/admin/KenyaTaxCenter so this module can use its exported dependencies.
import KenyaTaxCenter from "../../../components/admin/KenyaTaxCenter";
// Load ../../../components/admin/FinanceLifecycleCenter so this module can use its exported dependencies.
import FinanceLifecycleCenter from "../../../components/admin/FinanceLifecycleCenter";
// Load ../GoLiveReadiness so this module can use its exported dependencies.
import GoLiveReadiness from "../GoLiveReadiness";
// Load ../../../api/tenantSubscriptionApi so this module can use its exported dependencies.
import { getTenantSubscription } from "../../../api/tenantSubscriptionApi";
// Load ../../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../../context/AuthContext";
// Load ../../../utils/roleUtils so this module can use its exported dependencies.
import { getUserRole } from "../../../utils/roleUtils";

// Declare money for use by the surrounding module or function.
const money = (value) => `KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// Declare unwrap for use by the surrounding module or function.
const unwrap = (value) => value?.data?.data ?? value?.data ?? value ?? {};
// Declare list for use by the surrounding module or function.
const list = (value) => Array.isArray(value) ? value : value?.items || value?.data || [];
// Declare pct for use by the surrounding module or function.
const pct = (a, b) => Number(b) ? `${((Number(a || 0) / Number(b)) * 100).toFixed(1)}%` : "—";
// Declare displayAmount for use by the surrounding module or function.
const displayAmount = (value, label = "Amount") => Number(value || 0) === 0 ? `KES 0.00 · ${label === "Expenses" ? "no posted expense journals" : "none recorded"}` : money(value);
// Declare errorMessage for use by the surrounding module or function.
const errorMessage = (query) => query?.error?.response?.data?.message || query?.error?.message || "The service did not respond successfully.";
// Declare workspaceCards for use by the surrounding module or function.
const workspaceCards = [["Finance Reports", "/admin/finance/reports", "P&L trends, revenue and transaction reporting", BarChart3], ["M-Pesa Transactions", "/admin/finance/transactions", "Payment activity, receipts and exceptions", CreditCard], ["Reconciliation", "/admin/finance/reconciliation", "Match collections and resolve exceptions", CheckCircle2], ["Compliance & eTIMS", "/admin/compliance", "Tax, eTIMS and statutory workflows", ShieldCheck], ["Operations & Procurement", "/admin/operations", "Suppliers, purchase orders and payables", Building2]];

// Define AdminFinance; its parameters and body implement this operation.
export default function AdminFinance() {
  // Declare { user } for use by the surrounding module or function.
  const { user } = useAuth();
  // Declare role for use by the surrounding module or function.
  const role = getUserRole(user);
  // Declare isSuperAdmin for use by the surrounding module or function.
  const isSuperAdmin = ["super_admin", "superadmin"].includes(String(role || "").toLowerCase());
  // Declare subscriptionQ for use by the surrounding module or function.
  const subscriptionQ = useQuery({ queryKey: ["tenant-subscription"], queryFn: getTenantSubscription, staleTime: 30000, retry: 2, enabled: Boolean(user) && !isSuperAdmin });
  // Declare planFeatures for use by the surrounding module or function.
  const planFeatures = subscriptionQ.data?.features;
  // Declare canUseFeature for use by the surrounding module or function.
  const canUseFeature = (feature) => isSuperAdmin || subscriptionQ.isError || (Array.isArray(planFeatures) && planFeatures.includes(feature));
  // Declare [refreshError, setRefreshError] for use by the surrounding module or function.
  const [refreshError, setRefreshError] = useState("");
  // Declare [financeQ, payablesQ, corporateQ] for use by the surrounding module or function.
  const [financeQ, payablesQ, corporateQ] = useQueries({ queries: [{ queryKey: ["admin-finance-accounting"], queryFn: getFinanceStats, staleTime: 30000, refetchInterval: false, refetchOnWindowFocus: false, retry: 3 }, { queryKey: ["admin-finance-payables"], queryFn: getSupplierPayables, staleTime: 30000, refetchInterval: false, refetchOnWindowFocus: false, retry: 3 }, { queryKey: ["admin-finance-corporate"], queryFn: getCorporateAccounts, staleTime: 30000, refetchInterval: false, refetchOnWindowFocus: false, retry: 3 }] });
  // Declare ledgerQ for use by the surrounding module or function.
  const ledgerQ = useQuery({ queryKey: ["accounting-summary"], queryFn: getLedgerSummary, staleTime: 30000, refetchInterval: false, refetchOnWindowFocus: false, retry: 3 });
  // Declare finance for use by the surrounding module or function.
  const finance = unwrap(financeQ.data); const payables = list(payablesQ.data); const corporate = list(corporateQ.data); const ledger = unwrap(ledgerQ.data);
  // Declare outstandingPayables for use by the surrounding module or function.
  const outstandingPayables = payables.reduce((sum, item) => sum + Number(item.balance ?? item.outstanding ?? item.amount ?? 0), 0); const corporateExposure = corporate.reduce((sum, item) => sum + Number(item.outstandingBalance ?? item.currentBalance ?? item.balance ?? 0), 0);
  // Declare profit for use by the surrounding module or function.
  const profit = Number(ledger.profitLoss?.netProfit || 0); const revenue = Number(finance.revenue || 0); const postedRevenue = Number(ledger.profitLoss?.revenue || 0); const cashAccounts = useMemo(() => (ledger.accounts || []).filter((row) => ["cash", "bank", "mobile_money"].includes(row.account?.subtype)), [ledger.accounts]); const cashPosition = cashAccounts.reduce((sum, row) => sum + Number(row.balance || 0), 0); const postedExpenses = Number(ledger.profitLoss?.expenses || 0);
  // Declare cards for use by the surrounding module or function.
  const cards = [["Completed collections", money(finance.revenue), "Completed payment value, including later-refunded payments", Banknote, "text-sky-600"], ["Net collections", money(finance.netRevenue), `${pct(finance.netRevenue, revenue)} retained after refunds`, Wallet, "text-indigo-600"], ["Refunded", money(finance.refundedAmount), `${finance.refundedPayments || 0} refund records`, Receipt, "text-amber-600"], ["Ledger cash position", money(cashPosition), "Posted cash + bank + M-Pesa ledger balances", Landmark, "text-emerald-600"], ["Supplier payables", money(outstandingPayables), "Operational supplier exposure; posting to AP is a separate accounting step", Building2, "text-violet-600"], ["Corporate exposure", money(corporateExposure), "Receivable / credit exposure from corporate accounts", CreditCard, "text-rose-600"]];
  // Declare queries for use by the surrounding module or function.
  const queries = [financeQ, payablesQ, corporateQ, ledgerQ]; const initialErrors = queries.filter((q) => q.isError && !q.data); const refreshing = queries.some((q) => q.isFetching);
  // Declare refreshFinance for use by the surrounding module or function.
  const refreshFinance = async () => { setRefreshError(""); const results = []; for (const [label, query] of [["Finance totals", financeQ], ["Supplier payables", payablesQ], ["Corporate accounts", corporateQ], ["General ledger", ledgerQ]]) { try { await query.refetch({ throwOnError: true }); } catch (error) { results.push(`${label}: ${error?.response?.data?.message || error?.message || "refresh failed"}`); } } if (results.length) setRefreshError(results.join(" • ")); };
  // Return the expression shown below to the caller.
  return <div className="space-y-8 pb-10">
    <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 p-7 text-white shadow-xl"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-300">Finance & Accounting</p><h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Accounting & Finance Center</h1><p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">Tenant-scoped financial command center for collections, invoiced revenue, receivables, supplier liabilities, tax controls, reconciliation and double-entry accounting.</p></div><div className="flex items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300"><Activity size={14} className={refreshing ? "animate-pulse" : ""}/> {refreshing ? "Syncing" : "Demo + live tenant data"}</span><button onClick={refreshFinance} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""}/> {refreshing ? "Refreshing" : "Refresh"}</button></div></div></header>
    {(initialErrors.length > 0 || refreshError) && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-bold">Finance refresh needs attention</p><p className="mt-1">{refreshError || `${initialErrors.length} finance data source${initialErrors.length > 1 ? "s" : ""} could not be loaded.`}</p>{initialErrors.length > 0 && <div className="mt-2 space-y-1 text-xs">{initialErrors.map((q, index) => <p key={`${q.queryKey?.join("-") || "finance"}-${index}`}>{errorMessage(q)}</p>)}</div>}</div>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([title, value, hint, Icon, tone]) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></div><div className="rounded-xl bg-slate-100 p-2.5"><Icon size={20} className={tone}/></div></div></div>)}</section>
    <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Financial snapshot</p><h2 className="mt-1 text-xl font-black text-slate-950">Performance & exposure</h2><p className="mt-1 text-xs text-slate-400">Collections are cash received; posted revenue is the accounting value of posted invoices/journals. Dashboard figures include configured demonstration and live tenant data.</p></div><Link to="/admin/finance/reports" className="text-sm font-bold text-indigo-700 hover:text-indigo-500">Detailed reports <ArrowRight className="ml-1 inline" size={15}/></Link></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Posted revenue" value={displayAmount(postedRevenue, "Revenue")} /><Metric label="Posted expenses" value={displayAmount(postedExpenses, "Expenses")} /><Metric label="Net profit" value={displayAmount(profit, "Profit")} emphasis={profit > 0 ? "positive" : profit < 0 ? "negative" : "neutral"} /><Metric label="Invoice collection rate" value={pct(finance.netRevenue, postedRevenue)} /></div><div className="mt-2 text-xs text-slate-400">Invoice collection rate = refund-adjusted collections ÷ posted accounting revenue.</div><div className="mt-5 grid gap-3 md:grid-cols-3"><Health label="Ledger" value={Math.abs(Number(ledger.totals?.debit || 0) - Number(ledger.totals?.credit || 0)) < 0.01 ? "Balanced" : "Review"} good={Math.abs(Number(ledger.totals?.debit || 0) - Number(ledger.totals?.credit || 0)) < 0.01}/><Health label="Payments" value={`${finance.completedPayments || 0} completed`} good/><Health label="Reconciliation" value="Open workspace" good={false}/></div></div><div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-sky-300">Control posture</p><h2 className="mt-1 text-xl font-black">Production finance controls</h2><div className="mt-5 space-y-3"><Control text="Tenant-scoped ledger and financial data"/><Control text="Demo and live transaction visibility"/><Control text="Draft → post journal workflow"/><Control text="Refund, note and payment-link lifecycle"/><Control text="Configurable Kenya tax rules"/><Control text="eTIMS remains adapter-controlled"/></div><Link to="/admin/finance/reconciliation" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold hover:bg-indigo-500">Open reconciliation <ArrowRight size={15}/></Link></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div><p className="text-xs font-bold uppercase tracking-wider text-sky-600">Finance workspace</p><h2 className="mt-1 text-xl font-black text-slate-950">Open finance modules</h2><p className="mt-1 text-sm text-slate-500">Move from management overview to the operational workflow you need.</p></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">{workspaceCards.map(([title,path,text,Icon])=><Link key={path} to={path} className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-md"><div className="flex items-center justify-between"><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700"><Icon size={19}/></span><ArrowRight size={16} className="text-slate-300 transition group-hover:text-indigo-600"/></div><h3 className="mt-4 font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{text}</p></Link>)}</div></section>
    {canUseFeature("payment_links") && <FinanceLifecycleCenter enableCreditDebitNotes={canUseFeature("credit_debit_notes")} />}{canUseFeature("tax") && <KenyaTaxCenter />}<section id="general-ledger"><AccountingLedger /></section><GoLiveReadiness />
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-50 p-2 text-indigo-700"><Calculator size={19}/></div><div><h2 className="text-xl font-black text-slate-950">Accounting control coverage</h2><p className="text-sm text-slate-500">Core SaaS accounting workflows available to the tenant.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{["Revenue, refunds and payment status","Accounts receivable and corporate exposure","Supplier payables and procurement costs","Commission tracking and settlement","Double-entry journal and trial balance","Configurable tax/VAT rules","Payment links and credit/debit notes","Reconciliation and finance reporting"].map((text)=><div key={text} className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700"><CheckCircle2 size={16} className="mr-2 inline text-emerald-600"/>{text}</div>)}</div></section>
  </div>;
}
// Define Metric; its parameters and body implement this operation.
function Metric({ label, value, emphasis }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-1 text-lg font-black ${emphasis === "negative" ? "text-rose-600" : emphasis === "positive" ? "text-emerald-700" : "text-slate-900"}`}>{value}</p></div>; }
// Define Health; its parameters and body implement this operation.
function Health({ label, value, good }) { return <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><span className="text-sm text-slate-500">{label}</span><span className={`text-xs font-bold ${good ? "text-emerald-700" : "text-indigo-700"}`}>{value}</span></div>; }
// Define Control; its parameters and body implement this operation.
function Control({ text }) { return <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"><CheckCircle2 size={16} className="shrink-0 text-emerald-400"/>{text}</div>; }
