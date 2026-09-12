import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WalletCards, CheckCircle2, Clock3, CircleDollarSign, Search, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { getCommissions, approveCommission, payCommission } from "../../../api/commissionApi";

const money = (value) => `KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const titleCase = (value) => String(value || "pending").replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const statusClass = (status) => ({
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-blue-50 text-blue-800 ring-blue-200",
  processing: "bg-violet-50 text-violet-800 ring-violet-200",
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 ring-slate-200",
  rejected: "bg-red-50 text-red-800 ring-red-200",
}[status] || "bg-slate-100 text-slate-700 ring-slate-200");

export default function Commissions() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["commissions"],
    queryFn: getCommissions,
  });

  const approve = useMutation({
    mutationFn: approveCommission,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["commissions"] }); toast.success("Commission approved."); },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to approve commission."),
  });

  const pay = useMutation({
    mutationFn: ({ id, payload }) => payCommission(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["commissions"] }); toast.success("Commission payment recorded."); },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to confirm commission payment."),
  });

  const summary = useMemo(() => {
    const active = data.filter((c) => !["cancelled", "rejected"].includes(String(c.status).toLowerCase()));
    const accrued = active.reduce((sum, c) => sum + Number(c.netAmount ?? c.amount ?? 0), 0);
    const paid = data.filter((c) => c.status === "paid").reduce((sum, c) => sum + Number(c.netAmount ?? c.amount ?? 0), 0);
    return { accrued, paid, outstanding: Math.max(0, accrued - paid) };
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((c) => {
      const status = String(c.status || "pending").toLowerCase();
      if (filter !== "all" && status !== filter) return false;
      if (!q) return true;
      return [
        c.agent?.displayName, c.agent?.companyName, c.agent?.displayEmail, c.agent?.email,
        c.booking?.displayNumber, c.booking?.bookingNumber, c.paymentReference, c.transactionId,
      ].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [data, filter, search]);

  const confirmPayment = (commission) => {
    const reference = window.prompt(`Enter the actual payment reference for ${money(commission.netAmount ?? commission.amount)}:`, "");
    if (reference === null) return;
    if (!reference.trim()) { toast.error("Payment reference is required."); return; }
    const method = window.prompt("Payment method (MPESA, BANK_TRANSFER, CASH, CHEQUE):", "MPESA")?.trim().toUpperCase() || "MPESA";
    if (!["MPESA", "BANK_TRANSFER", "CASH", "CHEQUE"].includes(method)) { toast.error("Invalid payment method."); return; }
    pay.mutate({ id: commission._id, payload: { paymentMethod: method, paymentReference: reference.trim(), transactionId: reference.trim() } });
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 text-slate-600 shadow-sm ring-1 ring-slate-200">Loading commission ledger…</div></div>;
  if (isError) return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-white p-8 text-red-700 shadow-sm"><div className="flex items-center gap-3"><AlertCircle size={20} /> Failed to load commissions.</div><button onClick={() => refetch()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Retry</button></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Finance · Partner network</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Agent Commissions</h1><p className="mt-2 max-w-2xl text-sm text-emerald-100 sm:text-base">Review earned commissions, approve payable amounts, and record the exact funds transferred to each travel partner.</p></div>
            <button onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/15 disabled:opacity-60"><RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> Refresh</button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {[["Total accrued", summary.accrued, WalletCards, "All active commission obligations"], ["Paid", summary.paid, CheckCircle2, "Confirmed completed payouts"], ["Outstanding", summary.outstanding, Clock3, "Still payable to agents"]].map(([label, value, Icon, hint]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{money(value)}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></div><span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Icon size={20} /></span></div></div>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agent, email, booking or payment reference…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" /></div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="processing">Processing</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option><option value="rejected">Rejected</option></select>
          </div>
          <p className="mt-3 text-xs text-slate-400">Showing {filtered.length} of {data.length} commission records</p>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto"><table className="min-w-[1050px] w-full text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4 text-left font-semibold">Agent</th><th className="px-5 py-4 text-left font-semibold">Booking</th><th className="px-5 py-4 text-right font-semibold">Booking value</th><th className="px-5 py-4 text-right font-semibold">Commission</th><th className="px-5 py-4 text-center font-semibold">Rate</th><th className="px-5 py-4 text-left font-semibold">Status</th><th className="px-5 py-4 text-right font-semibold">Control</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => { const status = String(c.status || "pending").toLowerCase(); const agentName = c.agent?.displayName || c.agent?.user?.name || c.agent?.companyName || c.agent?.displayEmail || "Agent account"; const email = c.agent?.displayEmail || c.agent?.user?.email || c.agent?.email || ""; const booking = c.booking?.displayNumber || c.booking?.bookingNumber || (c.booking?._id ? `Booking ${String(c.booking._id).slice(-8).toUpperCase()}` : "Unlinked booking"); const commission = Number(c.netAmount ?? c.amount ?? 0); const bookingValue = Number(c.bookingValue ?? c.bookingAmount ?? c.booking?.totalAmount ?? 0); return <tr key={c._id} className="transition hover:bg-emerald-50/40"><td className="px-5 py-4"><div className="font-semibold text-slate-900">{agentName}</div><div className="mt-0.5 text-xs text-slate-500">{email || "No email on agent profile"}</div></td><td className="px-5 py-4 font-medium text-slate-700">{booking}</td><td className="px-5 py-4 text-right font-medium text-slate-700">{money(bookingValue)}</td><td className="px-5 py-4 text-right font-bold text-slate-900">{money(commission)}</td><td className="px-5 py-4 text-center font-semibold text-slate-600">{Number(c.rate ?? 0)}%</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusClass(status)}`}>{titleCase(status)}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{status === "pending" && <button onClick={() => approve.mutate(c._id)} disabled={approve.isPending || pay.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"><CheckCircle2 size={14} /> Approve</button>}{["pending", "approved", "processing"].includes(status) && <button onClick={() => confirmPayment(c)} disabled={pay.isPending || approve.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"><CircleDollarSign size={14} /> Confirm funds</button>}</div></td></tr>; })}
              {!filtered.length && <tr><td colSpan="7" className="px-5 py-12 text-center"><div className="mx-auto max-w-sm"><WalletCards className="mx-auto text-slate-300" size={36} /><p className="mt-3 font-semibold text-slate-700">No commission records match</p><p className="mt-1 text-sm text-slate-400">Try clearing the search or selecting a different status.</p></div></td></tr>}
            </tbody></table></div>
        </section>
      </div>
    </div>
  );
}
