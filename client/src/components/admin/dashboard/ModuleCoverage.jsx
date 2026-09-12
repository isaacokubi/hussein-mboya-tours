import { Link } from "react-router-dom";
import { Building2, FileCheck2, Receipt, ShieldCheck, Wallet } from "lucide-react";

const modules = [
  ["Accounting & Finance", "/admin/finance", "Revenue, refunds, commissions, payables and corporate exposure.", Wallet],
  ["Operations & Procurement", "/admin/operations", "Suppliers, purchase orders, tour costs, payables and resource conflicts.", FileCheck2],
  ["Compliance & eTIMS", "/admin/compliance", "KRA/eTIMS adapter workflow, TRA, ODPC and compliance records.", ShieldCheck],
  ["Corporate Accounts", "/admin/corporate-accounts", "Corporate credit exposure, PO controls and receivable reconciliation.", Building2],
  ["Reconciliation", "/admin/finance/reconciliation", "Payment matching and finance exception review.", Receipt],
];

export default function ModuleCoverage() {
  return <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Platform modules</p><h2 className="text-xl font-bold text-slate-900">Implemented business modules</h2><p className="mt-1 text-sm text-slate-500">The commercial, finance, operations and compliance capabilities are accessible directly from the dashboard.</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">{modules.map(([title,path,text,Icon])=><Link key={title} to={path} className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/30"><Icon size={21} className="text-emerald-700"/><h3 className="mt-3 font-bold text-slate-900">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p><span className="mt-3 inline-block text-xs font-semibold text-emerald-700">Open module →</span></Link>)}</div></section>;
}
