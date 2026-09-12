import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Search, Download, Eye, RotateCcw, CreditCard, CheckCircle2, Clock3, XCircle, WalletCards } from "lucide-react";
import {
  getAdminPayments,
  getPaymentStats,
  updatePaymentStatus,
  refundPayment,
  exportPaymentsCSV,
  exportPaymentsPDF,
} from "../../../api/admin/adminPaymentApi";

const money = (value) => `KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const clean = (value) => (value === null || value === undefined ? "" : String(value).trim());
const statusOf = (payment) => clean(payment?.status || payment?.paymentStatus || "pending").toLowerCase();
const customerOf = (payment) => clean(payment?.customer?.name || payment?.customer?.fullName || payment?.customerName || "Guest");
const bookingOf = (payment) => clean(payment?.booking?.bookingNumber || payment?.bookingNumber || payment?.booking?.reference || "—");
const phoneOf = (payment) => clean(payment?.phoneNumber || payment?.phone || payment?.customer?.phone || "—");
const receiptOf = (payment) => clean(payment?.mpesaReceiptNumber || payment?.mpesaReceipt || payment?.receiptNumber || "—");

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-sky-50 text-sky-700 ring-sky-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  cancelled: "bg-slate-100 text-slate-700 ring-slate-200",
  refunded: "bg-violet-50 text-violet-700 ring-violet-200",
};

function Metric({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-xl p-2.5 ${accent}`}><Icon className="h-5 w-5" /></div>
        <span className="text-right text-2xl font-extrabold tracking-tight text-slate-900">{value}</span>
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  );
}

export default function AdminPayments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundingPaymentId, setRefundingPaymentId] = useState(null);

  const paymentsQuery = useQuery({ queryKey: ["adminPayments"], queryFn: getAdminPayments, staleTime: 15_000 });
  const statsQuery = useQuery({ queryKey: ["paymentStats"], queryFn: getPaymentStats, staleTime: 15_000 });

  const payments = useMemo(() => {
    const value = paymentsQuery.data;
    return Array.isArray(value?.payments) ? value.payments : Array.isArray(value?.data?.payments) ? value.data.payments : Array.isArray(value?.data) ? value.data : Array.isArray(value) ? value : [];
  }, [paymentsQuery.data]);

  const stats = useMemo(() => {
    const value = statsQuery.data;
    return Array.isArray(value?.stats) ? value.stats : Array.isArray(value?.data?.stats) ? value.data.stats : Array.isArray(value) ? value : [];
  }, [statsQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["adminPayments"] });
    queryClient.invalidateQueries({ queryKey: ["paymentStats"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updatePaymentStatus(id, { status }),
    onSuccess: () => { invalidate(); toast.success("Payment status updated."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to update payment status."),
  });

  const refundMutation = useMutation({
    mutationFn: (id) => refundPayment(id),
    onMutate: (id) => setRefundingPaymentId(id),
    onSuccess: () => { invalidate(); toast.success("Refund request submitted."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Refund failed."),
    onSettled: () => setRefundingPaymentId(null),
  });

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const haystack = [customerOf(payment), bookingOf(payment), receiptOf(payment), phoneOf(payment)].join(" ").toLowerCase();
      return (!term || haystack.includes(term)) && (statusFilter === "all" || statusOf(payment) === statusFilter);
    });
  }, [payments, search, statusFilter]);

  const statCount = (name) => Number(stats.find((item) => String(item?._id || item?.status).toLowerCase() === name)?.count || 0);
  const revenue = stats.filter((item) => ["completed", "paid"].includes(String(item?._id || item?.status).toLowerCase())).reduce((sum, item) => sum + Number(item?.amount || 0), 0);

  if (paymentsQuery.isLoading || statsQuery.isLoading) {
    return <div className="min-h-[60vh] bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-4 sm:p-6"><div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">Loading payment management…</div></div>;
  }

  if (paymentsQuery.error) {
    return <div className="min-h-[60vh] bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-4 sm:p-6"><div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><h1 className="text-lg font-bold">Unable to load payments</h1><p className="mt-1 text-sm">{paymentsQuery.error?.message || "Please try again."}</p><button onClick={invalidate} className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white">Retry</button></div></div>;
  }

  return (
    <div className="min-h-full space-y-6 bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-4 sm:p-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 p-5 text-white shadow-lg sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100">Administration · Finance</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Payment Management</h1>
            <p className="mt-1 max-w-2xl text-sm text-indigo-100">Monitor collections, payment lifecycle, M-Pesa receipts and refund activity from one control center.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={invalidate} disabled={paymentsQuery.isFetching} className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-bold ring-1 ring-white/30 hover:bg-white/25 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${paymentsQuery.isFetching ? "animate-spin" : ""}`} />{paymentsQuery.isFetching ? "Refreshing…" : "Refresh"}</button>
            <button type="button" onClick={() => exportPaymentsCSV()} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm hover:bg-sky-50"><Download className="h-4 w-4" />Export CSV</button>
            <button type="button" onClick={() => exportPaymentsPDF()} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold ring-1 ring-white/30 hover:bg-white/20"><Download className="h-4 w-4" />PDF</button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={WalletCards} label="Total payments" value={payments.length} accent="bg-sky-100 text-sky-700" />
        <Metric icon={CheckCircle2} label="Completed revenue" value={money(revenue)} accent="bg-emerald-100 text-emerald-700" />
        <Metric icon={Clock3} label="Pending" value={statCount("pending")} accent="bg-amber-100 text-amber-700" />
        <Metric icon={XCircle} label="Failed" value={statCount("failed")} accent="bg-rose-100 text-rose-700" />
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="font-bold text-slate-900">Payment ledger</h2><p className="text-xs text-slate-500">Search, review and safely update payment lifecycle status.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{filteredPayments.length} records</span></div>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" autoComplete="off" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Customer, booking, receipt or phone…" className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" /></div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"><option value="all">All statuses</option>{["pending", "processing", "completed", "failed", "cancelled", "refunded"].map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr className="border-b border-slate-200"><th className="px-5 py-4 text-left font-bold">Customer</th><th className="px-5 py-4 text-left font-bold">Booking</th><th className="px-5 py-4 text-left font-bold">Amount</th><th className="px-5 py-4 text-left font-bold">Receipt</th><th className="px-5 py-4 text-left font-bold">Phone</th><th className="px-5 py-4 text-left font-bold">Status</th><th className="px-5 py-4 text-right font-bold">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => {
                const status = statusOf(payment);
                const canRefund = !["refunded"].includes(status) && !["processing", "completed"].includes(clean(payment.refundStatus).toLowerCase());
                return <tr key={payment._id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4 font-semibold text-slate-900">{customerOf(payment)}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{bookingOf(payment)}</td>
                  <td className="px-5 py-4 font-extrabold text-slate-900">{money(payment.amount)}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{receiptOf(payment)}</td>
                  <td className="px-5 py-4 text-slate-600">{phoneOf(payment)}</td>
                  <td className="px-5 py-4"><select aria-label={`Payment status for ${customerOf(payment)}`} value={status} onChange={(event) => statusMutation.mutate({ id: payment._id, status: event.target.value })} className={`rounded-full border-0 px-3 py-1.5 text-xs font-bold capitalize ring-1 outline-none ${statusStyles[status] || statusStyles.pending}`} disabled={statusMutation.isPending && statusMutation.variables?.id === payment._id}>{status}</select></td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelectedPayment(payment)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"><Eye className="h-3.5 w-3.5" />View</button><button type="button" disabled={!canRefund || refundMutation.isPending} onClick={() => { if (window.confirm(`Start a refund for ${customerOf(payment)} — ${money(payment.amount)}?`)) refundMutation.mutate(payment._id); }} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"><RotateCcw className="h-3.5 w-3.5" />{refundingPaymentId === payment._id ? "Refunding…" : "Refund"}</button></div></td>
                </tr>;
              })}
              {!filteredPayments.length && <tr><td colSpan="7" className="px-6 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><CreditCard className="h-6 w-6" /></div><h3 className="mt-3 font-bold text-slate-900">No payments found</h3><p className="mt-1 text-sm text-slate-500">Try changing the search or status filter.</p></td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {selectedPayment && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPayment(null); }}><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-white/20"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Payment record</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">Transaction details</h2></div><button type="button" onClick={() => setSelectedPayment(null)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">Close</button></div><dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">{[["Customer", customerOf(selectedPayment)], ["Booking", bookingOf(selectedPayment)], ["Amount", money(selectedPayment.amount)], ["Phone", phoneOf(selectedPayment)], ["Receipt", receiptOf(selectedPayment)], ["Status", statusOf(selectedPayment)]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100"><dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold capitalize text-slate-900">{value || "—"}</dd></div>)}</dl></div></div>}
    </div>
  );
}
