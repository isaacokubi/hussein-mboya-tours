import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Boxes, ClipboardCheck, FileText, RefreshCw, Truck, WalletCards } from "lucide-react";
import { getOperationsOverview } from "../../api/operationsApi";
import { getSuppliers, getPurchaseOrders, getSupplierPayables, getCorporateAccounts } from "../../api/operationsModuleApi";
import OperationsActionCenter from "../../components/admin/OperationsActionCenter";

const money = (v) => `KES ${Number(v || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
const unwrap = (v) => Array.isArray(v) ? v : (v?.items || v?.data || []);
const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function OperationsProcurement() {
  const overview = useQuery({ queryKey: ["operations-overview"], queryFn: getOperationsOverview, staleTime: 15000 });
  const suppliers = useQuery({ queryKey: ["operations-suppliers"], queryFn: getSuppliers, staleTime: 15000 });
  const purchaseOrders = useQuery({ queryKey: ["operations-purchase-orders"], queryFn: getPurchaseOrders, staleTime: 15000 });
  const payables = useQuery({ queryKey: ["operations-payables"], queryFn: getSupplierPayables, staleTime: 15000 });
  const corporate = useQuery({ queryKey: ["operations-corporate"], queryFn: getCorporateAccounts, staleTime: 15000 });
  const refresh = () => [overview, suppliers, purchaseOrders, payables, corporate].forEach(q => q.refetch());
  const o = overview.data?.data || overview.data || {};
  const p = o.procurement || {};
  const po = unwrap(purchaseOrders.data);
  const ps = unwrap(suppliers.data);
  const payableRows = unwrap(payables.data);
  const corporateRows = unwrap(corporate.data);
  const upcoming = o.schedule || [];
  return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8">
    <header className="rounded-[28px] bg-slate-950 p-6 text-white shadow-xl sm:p-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Operations & procurement</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Operations control centre</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Manage suppliers, purchasing, tour costs, supplier payables, resource coverage and upcoming trip delivery from one tenant-scoped workspace.</p></div><button onClick={refresh} className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black"><RefreshCw size={16} className="mr-2 inline"/>Refresh data</button></div></header>
    <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Kpi icon={Boxes} label="Active suppliers" value={p.activeSuppliers ?? ps.length}/><Kpi icon={FileText} label="Purchase orders" value={p.purchaseOrderCount ?? po.length}/><Kpi icon={WalletCards} label="Outstanding payables" value={money(p.outstandingPayables)}/><Kpi icon={Truck} label="Resource coverage" value={`${o.stats?.resourceCoverage ?? 0}%`}/></section>
    <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Mini title="PO committed value" value={money(p.purchaseOrderValue)}/><Mini title="Tour costs" value={money(p.totalTourCost)}/><Mini title="Corporate exposure" value={money(p.corporateExposure)}/><Mini title="Upcoming trips" value={o.stats?.upcomingTrips ?? upcoming.length}/></section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><div className={card}><h2 className="flex items-center gap-2 text-lg font-black"><ClipboardCheck size={19} className="text-emerald-600"/>Upcoming operational schedule</h2><div className="mt-4 overflow-x-auto"><table className="min-w-[720px] w-full text-sm"><thead><tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400"><th className="p-3">Date</th><th className="p-3">Tour</th><th className="p-3">Status</th><th className="p-3">Coverage</th></tr></thead><tbody>{upcoming.map(b=><tr key={b._id} className="border-b border-slate-100"><td className="p-3">{b.travelDate ? new Date(b.travelDate).toLocaleDateString("en-KE") : "—"}</td><td className="p-3 font-bold">{b.tour?.title || "Tour unavailable"}</td><td className="p-3">{b.status || "—"}</td><td className="p-3">{(b.assignedDriver || b.driver || b.assignedGuide || b.guide) ? "Assigned" : "Needs assignment"}</td></tr>)}{!upcoming.length&&<tr><td colSpan="4" className="p-8 text-center text-slate-500">No upcoming trips require display.</td></tr>}</tbody></table></div></div><div className={card}><h2 className="flex items-center gap-2 text-lg font-black"><Activity size={19} className="text-emerald-600"/>Resource readiness</h2><div className="mt-4 space-y-3"><Readiness label="Vehicles available" value={o.stats?.availableVehicles ?? 0}/><Readiness label="Guides available" value={o.stats?.availableGuides ?? 0}/><Readiness label="Drivers available" value={o.stats?.availableDrivers ?? 0}/><Readiness label="Confirmed bookings" value={o.stats?.confirmedBookings ?? 0}/></div>{(o.stats?.resourceCoverage ?? 0) < 100 && <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800"><AlertTriangle size={16}/> Some bookings still need operational resource assignment.</div>}</div></section>
    <OperationsActionCenter suppliers={ps} purchaseOrders={po} payables={payableRows} corporate={corporateRows}/>
  </div></main>;
}
const Kpi=({icon:Icon,label,value})=><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon size={18} className="text-emerald-600"/><p className="mt-3 text-2xl font-black text-slate-900">{value}</p><p className="mt-1 text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</p></div>;
const Mini=({title,value})=><div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</p><p className="mt-1 text-lg font-black">{value}</p></div>;
const Readiness=({label,value})=><div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-600">{label}</span><b>{value}</b></div>;
