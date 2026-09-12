import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Boxes, CheckCircle2, ClipboardCheck, FileText, RefreshCw, Truck, WalletCards, XCircle } from "lucide-react";
import { getOperationsOverview } from "../../api/operationsApi";
import { getSuppliers, getPurchaseOrders, getSupplierPayables, getCorporateAccounts } from "../../api/operationsModuleApi";
import OperationsActionCenter from "../../components/admin/OperationsActionCenter";

const money = (v) => `KES ${Number(v || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
const unwrap = (v) => Array.isArray(v) ? v : (v?.items || v?.data || []);
const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";
const statusClass = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "confirmed" || value === "completed") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (value === "ongoing" || value === "assigned") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (value === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (value === "cancelled" || value === "refunded") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
};

export default function OperationsProcurement() {
  const overview = useQuery({ queryKey: ["operations-overview"], queryFn: getOperationsOverview, staleTime: 15000 });
  const suppliers = useQuery({ queryKey: ["operations-suppliers"], queryFn: getSuppliers, staleTime: 15000 });
  const purchaseOrders = useQuery({ queryKey: ["operations-purchase-orders"], queryFn: getPurchaseOrders, staleTime: 15000 });
  const payables = useQuery({ queryKey: ["operations-payables"], queryFn: getSupplierPayables, staleTime: 15000 });
  const corporate = useQuery({ queryKey: ["operations-corporate"], queryFn: getCorporateAccounts, staleTime: 15000 });
  const queries = [overview, suppliers, purchaseOrders, payables, corporate];
  const refreshing = queries.some((q) => q.isFetching);
  const refresh = async () => { await Promise.all(queries.map((q) => q.refetch())); };
  const o = overview.data?.data || overview.data || {};
  const p = o.procurement || {};
  const po = unwrap(purchaseOrders.data);
  const ps = unwrap(suppliers.data);
  const payableRows = unwrap(payables.data);
  const corporateRows = unwrap(corporate.data);
  const upcoming = (Array.isArray(o.schedule) ? o.schedule : []).filter((b) => b?.tour?.title || b?.customTourRequest?.destination || b?.customTourRequest?.title);
  const loadError = queries.find((q) => q.isError)?.error;

  return <main className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100">
    <div className="mx-auto max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">Operations & procurement</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Operations Control Centre</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Manage suppliers, purchasing, tour costs, supplier payables, resource coverage and upcoming trip delivery from one tenant-scoped workspace.</p></div>
          <button type="button" onClick={refresh} disabled={refreshing} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black shadow-lg transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw size={16} className={`mr-2 inline ${refreshing ? "animate-spin" : ""}`}/>{refreshing ? "Refreshing…" : "Refresh data"}</button>
        </div>
      </header>

      {loadError && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><XCircle size={19} className="mt-0.5 shrink-0"/><div><p className="font-black">Some operational data could not be loaded.</p><p className="mt-1 text-xs text-rose-700">Refresh the workspace to retry. Data from failed requests is not substituted with unrelated records.</p></div></div>}

      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Boxes} label="Active suppliers" value={p.activeSuppliers ?? ps.length} tone="sky"/>
        <Kpi icon={FileText} label="Purchase orders" value={p.purchaseOrderCount ?? po.length} tone="indigo"/>
        <Kpi icon={WalletCards} label="Outstanding payables" value={money(p.outstandingPayables)} tone="violet"/>
        <Kpi icon={Truck} label="Resource coverage" value={`${o.stats?.resourceCoverage ?? 0}%`} tone="emerald"/>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Mini title="PO committed value" value={money(p.purchaseOrderValue)} tone="sky"/>
        <Mini title="Tour costs" value={money(p.totalTourCost)} tone="indigo"/>
        <Mini title="Corporate exposure" value={money(p.corporateExposure)} tone="violet"/>
        <Mini title="Upcoming trips" value={o.stats?.upcomingTrips ?? upcoming.length} tone="emerald"/>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className={`${card} overflow-hidden`}>
          <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-indigo-50 to-violet-50 px-5 py-4"><h2 className="flex items-center gap-2 text-base font-black text-slate-900"><ClipboardCheck size={19} className="text-indigo-600"/>Upcoming operational schedule</h2><p className="mt-1 text-xs font-medium text-slate-500">Only tenant-valid bookings with a resolvable tour are displayed.</p></div>
          <div className="overflow-x-auto"><table className="min-w-[720px] w-full text-sm"><thead><tr className="bg-slate-950 text-left text-[10px] font-black uppercase tracking-[.14em] text-slate-300"><th className="px-4 py-3">Date</th><th className="px-4 py-3">Tour</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Coverage</th></tr></thead><tbody>{upcoming.map((b, index) => <tr key={b._id || `schedule-${index}`} className="border-b border-slate-100 transition hover:bg-sky-50/60"><td className="px-4 py-3 font-semibold text-slate-600">{b.travelDate ? new Date(b.travelDate).toLocaleDateString("en-KE") : "—"}</td><td className="px-4 py-3 font-black text-slate-900">{b.tour?.title || b.customTourRequest?.title || b.customTourRequest?.destination || "—"}</td><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ring-1 ${statusClass(b.status)}`}>{b.status || "unknown"}</span></td><td className="px-4 py-3">{(b.assignedDriver || b.driver || b.assignedGuide || b.guide || b.assignedVehicle) ? <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700"><CheckCircle2 size={15}/>Assigned</span> : <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700"><AlertTriangle size={15}/>Needs assignment</span>}</td></tr>)}{!upcoming.length && <tr><td colSpan="4" className="p-10 text-center"><p className="font-black text-slate-700">No valid upcoming trips</p><p className="mt-1 text-xs text-slate-500">Tenant-isolated bookings with complete tour data will appear here.</p></td></tr>}</tbody></table></div>
        </div>
        <div className={`${card} overflow-hidden`}>
          <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-5 py-4"><h2 className="flex items-center gap-2 text-base font-black text-slate-900"><Activity size={19} className="text-emerald-600"/>Resource readiness</h2><p className="mt-1 text-xs font-medium text-slate-500">Live operational capacity for this tenant.</p></div>
          <div className="space-y-3 p-5"><Readiness label="Vehicles available" value={o.stats?.availableVehicles ?? 0} tone="sky"/><Readiness label="Guides available" value={o.stats?.availableGuides ?? 0} tone="cyan"/><Readiness label="Drivers available" value={o.stats?.availableDrivers ?? 0} tone="orange"/><Readiness label="Confirmed bookings" value={o.stats?.confirmedBookings ?? 0} tone="indigo"/></div>
          {(o.stats?.resourceCoverage ?? 0) < 100 && <div className="mx-5 mb-5 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800"><AlertTriangle size={16} className="shrink-0"/>Some valid bookings still need operational resource assignment.</div>}
        </div>
      </section>

      <div className="mt-5"><OperationsActionCenter suppliers={ps} purchaseOrders={po} payables={payableRows} corporate={corporateRows}/></div>
    </div>
  </main>;
}

const Kpi = ({ icon: Icon, label, value, tone }) => { const tones = { sky: "border-sky-200 bg-gradient-to-br from-sky-50 to-white text-sky-700", indigo: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-white text-indigo-700", violet: "border-violet-200 bg-gradient-to-br from-violet-50 to-white text-violet-700", emerald: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-700" }; return <div className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tones[tone]}`}><Icon size={18}/><p className="mt-3 text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-500">{label}</p></div>; };
const Mini = ({ title, value, tone }) => { const tones = { sky: "ring-sky-200", indigo: "ring-indigo-200", violet: "ring-violet-200", emerald: "ring-emerald-200" }; return <div className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ${tones[tone]}`}><p className="text-[10px] font-black uppercase tracking-[.13em] text-slate-400">{title}</p><p className="mt-1 text-lg font-black text-slate-900">{value}</p></div>; };
const Readiness = ({ label, value, tone }) => { const tones = { sky: "bg-sky-50 text-sky-700 ring-sky-100", cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100", orange: "bg-orange-50 text-orange-700 ring-orange-100", indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100" }; return <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"><span className="text-sm font-semibold text-slate-600">{label}</span><b className={`rounded-lg px-2.5 py-1 text-sm font-black ring-1 ${tones[tone]}`}>{value}</b></div>; };
