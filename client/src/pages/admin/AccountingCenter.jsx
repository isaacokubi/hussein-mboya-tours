import { useQueries } from "@tanstack/react-query";
import { ArrowRight, Banknote, Building2, Calculator, CreditCard, FileBarChart, Receipt, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { getFinanceStats } from "../../api/financeApi";
import { getOperationsOverview } from "../../api/operationsApi";
import { getSupplierPayables, getCorporateAccounts } from "../../api/operationsModuleApi";

const money = (value) => `KES ${Number(value || 0).toLocaleString()}`;
const unwrap = (x) => x?.data?.data ?? x?.data ?? x ?? {};

export default function AccountingCenter() {
  const [financeQ, operationsQ, payablesQ, corporateQ] = useQueries({ queries: [
    { queryKey: ["accounting-finance"], queryFn: getFinanceStats, staleTime: 30000 },
    { queryKey: ["accounting-operations"], queryFn: getOperationsOverview, staleTime: 30000 },
    { queryKey: ["accounting-payables"], queryFn: getSupplierPayables, staleTime: 30000 },
    { queryKey: ["accounting-corporate"], queryFn: getCorporateAccounts, staleTime: 30000 },
  ]});
  const finance = unwrap(financeQ.data);
  const ops = unwrap(operationsQ.data);
  const payables = Array.isArray(payablesQ.data) ? payablesQ.data : payablesQ.data?.items || [];
  const corporate = Array.isArray(corporateQ.data) ? corporateQ.data : corporateQ.data?.items || [];
  const procurement = ops.procurement || {};
  const outstandingPayables = payables.reduce((sum, x) => sum + Number(x.balance ?? x.outstanding ?? x.amount ?? 0), 0);
  const corporateExposure = corporate.reduce((sum, x) => sum + Number(x.outstandingBalance ?? x.currentBalance ?? x.balance ?? 0), 0);
  const cards = [
    ["Gross revenue", money(finance.revenue), Banknote],
    ["Net revenue", money(finance.netRevenue), Wallet],
    ["Refunded", money(finance.refundedAmount), Receipt],
    ["Supplier payables", money(outstandingPayables || procurement.outstandingPayables), Building2],
    ["Corporate receivables", money(corporateExposure || procurement.corporateExposure), CreditCard],
    ["Commission exposure", money(finance.commission), Calculator],
  ];
  const loading = [financeQ, operationsQ, payablesQ, corporateQ].some((q) => q.isLoading);
  return <div className="space-y-8">
    <header><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Finance & Accounting</p><h1 className="text-3xl font-black text-slate-900">Accounting Center</h1><p className="mt-2 max-w-3xl text-slate-500">A single finance control surface for revenue, refunds, commissions, supplier liabilities and corporate receivables. Figures are tenant-scoped and pulled from the live finance and operations services.</p></header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, Icon]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon size={19} className="text-emerald-700"/></div><p className="mt-3 text-2xl font-black text-slate-900">{value}</p></div>)}</div>
    {loading && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading accounting data...</div>}
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{[
      ["Finance Dashboard", "/admin/finance", "Revenue, payments and refunds"],
      ["Finance Reports", "/admin/finance/reports", "Monthly financial reporting"],
      ["Reconciliation", "/admin/finance/reconciliation", "Match and review payment activity"],
      ["Compliance & Tax", "/admin/compliance", "KRA/eTIMS and compliance workflow"],
    ].map(([title, path, text]) => <Link key={path} to={path} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-emerald-300"><FileBarChart size={22} className="text-emerald-700"/><h2 className="mt-3 font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{text}</p><span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Open <ArrowRight size={15}/></span></Link>)}</div>
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-bold">Accounting scope</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Revenue, net revenue and refunds</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Payment transactions and reconciliation</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Supplier payables and procurement exposure</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Corporate receivable exposure</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Commission tracking</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Tax/compliance workflow and eTIMS adapter status</p></div><div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><strong>Accounting boundary:</strong> this center surfaces the implemented finance, procurement and receivable workflows. A full double-entry general ledger, trial balance and balance-sheet engine is not represented as complete until those accounting services are implemented.</div></section>
  </div>;
}
