import { useQueries } from "@tanstack/react-query";
import { Building2, Car, CircleDollarSign, FileCheck2, Handshake, Receipt, ShieldAlert, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getCorporateAccounts, getPurchaseOrders, getResourceConflicts, getSupplierPayables, getSuppliers, getTourCosts } from "../../api/operationsModuleApi";

const modules = [
  ["Suppliers", "Manage hotels, transport providers, guides, activities and other suppliers.", "/admin/operations/modules/suppliers", Handshake],
  ["Purchase Orders", "Track procurement requests, approvals, receiving and supplier commitments.", "/admin/operations/modules/purchase-orders", FileCheck2],
  ["Tour Costing", "Track active tour costs and compare operational costs with selling revenue.", "/admin/operations/modules/tour-costs", CircleDollarSign],
  ["Supplier Payables", "Monitor supplier liabilities, balances and payment exposure.", "/admin/operations/modules/payables", Receipt],
  ["Corporate Accounts", "Manage B2B clients, credit exposure and corporate booking relationships.", "/admin/operations/modules/corporate", Building2],
  ["Resource Conflicts", "Detect guide, driver and vehicle scheduling conflicts before they become operational failures.", "/admin/operations/modules/conflicts", ShieldAlert],
];

const list = (value) => Array.isArray(value) ? value : value?.items || value?.data || [];
const money = (value) => `KES ${Number(value || 0).toLocaleString()}`;

export default function OperationsModules() {
  const results = useQueries({ queries: [
    { queryKey: ["module-suppliers"], queryFn: getSuppliers, staleTime: 30000 },
    { queryKey: ["module-purchase-orders"], queryFn: getPurchaseOrders, staleTime: 30000 },
    { queryKey: ["module-tour-costs"], queryFn: getTourCosts, staleTime: 30000 },
    { queryKey: ["module-payables"], queryFn: getSupplierPayables, staleTime: 30000 },
    { queryKey: ["module-corporate"], queryFn: getCorporateAccounts, staleTime: 30000 },
    { queryKey: ["module-conflicts"], queryFn: getResourceConflicts, staleTime: 30000 },
  ]});
  const [suppliers, purchaseOrders, tourCosts, payables, corporate, conflicts] = results.map((r) => list(r.data));
  const loading = results.some((r) => r.isLoading);
  const errorCount = results.filter((r) => r.isError).length;
  const stats = [
    ["Active suppliers", suppliers.filter((x) => x.status !== "inactive").length, Handshake],
    ["Purchase orders", purchaseOrders.length, FileCheck2],
    ["Recorded tour costs", money(tourCosts.reduce((sum, x) => sum + Number(x.amount || x.totalCost || 0), 0)), CircleDollarSign],
    ["Outstanding payables", money(payables.reduce((sum, x) => sum + Number(x.balance ?? x.outstanding ?? x.amount || 0), 0)), Receipt],
    ["Corporate accounts", corporate.length, Users],
    ["Resource conflicts", conflicts.length, ShieldAlert],
  ];
  return <div className="space-y-8">
    <header><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Operations ERP</p><h1 className="text-3xl font-black text-slate-900">Operations Modules</h1><p className="mt-2 max-w-3xl text-slate-500">The operational modules added to the platform are now surfaced here with live tenant-scoped data. Use the dedicated sections to manage procurement, costing, suppliers and corporate operations.</p></header>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stats.map(([label, value, Icon]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon size={19} className="text-emerald-700" /></div><p className="mt-3 text-2xl font-black text-slate-900">{value}</p></div>)}</div>
    {loading && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Refreshing operational module data...</div>}
    {errorCount > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{errorCount} module endpoint{errorCount > 1 ? "s" : ""} could not be loaded. The available modules remain accessible below.</div>}
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{modules.map(([name, description, path, Icon]) => <Link key={path} to={path} className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-emerald-300"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={22}/></div><h2 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-emerald-700">{name}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><span className="mt-4 inline-block text-sm font-semibold text-emerald-700">Open module →</span></Link>)}</div>
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-bold">Operational coverage</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Supplier management and procurement lifecycle</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Tour cost and profitability records</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Supplier payable exposure and payment tracking</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Corporate credit exposure and reconciliation</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Guide, driver and vehicle conflict monitoring</p><p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">✓ Finance, reconciliation and compliance centers</p></div></section>
  </div>;
}
