import { useQueries } from "@tanstack/react-query";
import { ArrowRight, Banknote, Building2, Calculator, CreditCard, FileBarChart, Receipt, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { getFinanceStats } from "../../../api/financeApi";
import { getOperationsOverview } from "../../../api/operationsApi";
import { getSupplierPayables, getCorporateAccounts } from "../../../api/operationsModuleApi";
import AccountingLedger from "../AccountingLedger";

const money = (value) => `KES ${Number(value || 0).toLocaleString()}`;
const unwrap = (value) => value?.data?.data ?? value?.data ?? value ?? {};
const list = (value) => Array.isArray(value) ? value : value?.items || value?.data || [];

export default function AdminFinance() {
  const [financeQ, operationsQ, payablesQ, corporateQ] = useQueries({ queries: [
    { queryKey: ["admin-finance-accounting"], queryFn: getFinanceStats, staleTime: 30000, refetchInterval: 60000 },
    { queryKey: ["admin-finance-operations"], queryFn: getOperationsOverview, staleTime: 30000, refetchInterval: 60000 },
    { queryKey: ["admin-finance-payables"], queryFn: getSupplierPayables, staleTime: 30000, refetchInterval: 60000 },
    { queryKey: ["admin-finance-corporate"], queryFn: getCorporateAccounts, staleTime: 30000, refetchInterval: 60000 },
  ]});
  const finance = unwrap(financeQ.data); const operations = unwrap(operationsQ.data); const payables = list(payablesQ.data); const corporate = list(corporateQ.data);
  const procurement = operations.procurement || {};
  const outstandingPayables = payables.reduce((sum, item) => sum + Number(item.balance ?? item.outstanding ?? item.amount ?? 0), 0);
  const corporateExposure = corporate.reduce((sum, item) => sum + Number(item.outstandingBalance ?? item.currentBalance ?? item.balance ?? 0), 0);
  const cards = [["Gross Revenue", money(finance.revenue), Banknote],["Net Revenue", money(finance.netRevenue), Wallet],["Refunded", money(finance.refundedAmount), Receipt],["Supplier Payables", money(outstandingPayables || procurement.outstandingPayables), Building2],["Corporate Exposure", money(corporateExposure || procurement.corporateExposure), CreditCard],["Commissions", money(finance.commission), Calculator]];
  const loading = [financeQ, operationsQ, payablesQ, corporateQ].some((query) => query.isLoading);
  const errors = [financeQ, operationsQ, payablesQ, corporateQ].filter((query) => query.isError).length;
  return <div className="space-y-8">
    <header><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Finance & Accounting</p><h1 className="text-3xl font-black text-slate-900">Accounting & Finance Center</h1><p className="mt-2 max-w-3xl text-slate-500">Revenue, payments, reconciliation, supplier liabilities, corporate exposure, tax workflows and the tenant-scoped general ledger in one workspace.</p></header>
    {errors > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{errors} finance data source{errors > 1 ? "s" : ""} could not be loaded. Available figures are still displayed.</div>}
    {loading && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Refreshing accounting data...</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([title, value, Icon]) => <div key={title} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{title}</span><Icon size={19} className="text-emerald-700"/></div><p className="mt-3 text-2xl font-black text-slate-900">{value}</p></div>)}</div>
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Accounting workspaces</p><h2 className="text-xl font-bold">Open finance modules</h2></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">{[["Finance Reports","/admin/finance/reports","Revenue and financial reports"],["M-Pesa Transactions","/admin/finance/transactions","Payment and M-Pesa activity"],["Reconciliation","/admin/finance/reconciliation","Payment matching and exceptions"],["Compliance & eTIMS","/admin/compliance","KRA/eTIMS, TRA and ODPC workflow"],["Operations & Procurement","/admin/operations","Suppliers, POs, costing and payables"]].map(([title,path,text])=><Link key={path} to={path} className="rounded-xl border border-slate-200 p-5 transition hover:border-emerald-300 hover:bg-emerald-50/30"><FileBarChart size={21} className="text-emerald-700"/><h3 className="mt-3 font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p><span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Open <ArrowRight size={14}/></span></Link>)}</div></section>
    <section id="general-ledger"><AccountingLedger /></section>
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-bold">Operational accounting controls</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Revenue, net revenue, refunds and payment status</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Supplier payables and procurement exposure</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Corporate receivable exposure and credit controls</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Tour costing and profitability records</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Commission tracking and reconciliation</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Tax profile, invoice eTIMS status and compliance workflow</p></div></section>
  </div>;
}
