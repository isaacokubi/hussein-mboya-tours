/**
 * Purpose: Mpesa Transactions page-level UI component. Main declarations: money, displayValue, getStatus, StatusBadge, MetricCard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileWarning,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  WalletCards,
  XCircle,
} from "lucide-react";
// Load ../../../api/financeApi so this module can use its exported dependencies.
import { getMpesaTransactions } from "../../../api/financeApi";

// Declare STATUS_META for use by the surrounding module or function.
const STATUS_META = {
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", icon: CheckCircle2 },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-600/20", icon: Clock3 },
  failed: { label: "Failed", className: "bg-rose-50 text-rose-700 ring-rose-600/20", icon: XCircle },
  refunded: { label: "Refunded", className: "bg-slate-100 text-slate-700 ring-slate-500/20", icon: RefreshCw },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-600 ring-slate-500/20", icon: XCircle },
};

// Declare money for use by the surrounding module or function.
const money = (value) =>
  Number.isFinite(Number(value))
    ? `KES ${Number(value).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "Unavailable";

// Declare displayValue for use by the surrounding module or function.
const displayValue = (value, fallback = "Unavailable") => {
  // Check the condition (value === null || value === undefined || value === "") and run the matching branch.
  if (value === null || value === undefined || value === "") return fallback;
  // Return the result of String() to the caller.
  return String(value);
};

// Declare getStatus for use by the surrounding module or function.
const getStatus = (status) => String(status || "pending").toLowerCase();

// Define StatusBadge; its parameters and body implement this operation.
function StatusBadge({ status }) {
  // Declare normalized for use by the surrounding module or function.
  const normalized = getStatus(status);
  // Declare meta for use by the surrounding module or function.
  const meta = STATUS_META[normalized] || {
    label: displayValue(status, "Unknown"),
    className: "bg-slate-100 text-slate-600 ring-slate-500/20",
    icon: AlertCircle,
  };
  // Declare Icon for use by the surrounding module or function.
  const Icon = meta.icon;

  // Return the expression shown below to the caller.
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}>
      <Icon size={13} />
      {meta.label}
    </span>
  );
}

// Define MetricCard; its parameters and body implement this operation.
function MetricCard({ label, value, hint, icon: Icon, tone = "emerald" }) {
  // Declare tones for use by the surrounding module or function.
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  // Return the expression shown below to the caller.
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <div className={`rounded-xl p-3 ${tones[tone] || tones.emerald}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

// Define MpesaTransactions; its parameters and body implement this operation.
export default function MpesaTransactions() {
  // Declare [search, setSearch] for use by the surrounding module or function.
  const [search, setSearch] = useState("");
  // Declare [status, setStatus] for use by the surrounding module or function.
  const [status, setStatus] = useState("");

  // Declare { data, isLoading, isError, refetch, isFetching } for use by the surrounding module or function.
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["mpesaTransactions", search, status],
    queryFn: () => getMpesaTransactions({ search, status }),
  });

  // Declare payments for use by the surrounding module or function.
  const payments = useMemo(() => {
    // Check the condition (Array.isArray(data?.data)) and run the matching branch.
    if (Array.isArray(data?.data)) return data.data;
    // Check the condition (Array.isArray(data?.payments)) and run the matching branch.
    if (Array.isArray(data?.payments)) return data.payments;
    // Check the condition (Array.isArray(data?.data?.payments)) and run the matching branch.
    if (Array.isArray(data?.data?.payments)) return data.data.payments;
    // Return the collection assembled below to the caller.
    return [];
  }, [data]);

  // Declare stats for use by the surrounding module or function.
  const stats = useMemo(() => {
    // Declare completed for use by the surrounding module or function.
    const completed = payments.filter((t) => getStatus(t.status) === "completed");
    // Declare refunded for use by the surrounding module or function.
    const refunded = payments.filter((t) => getStatus(t.status) === "refunded");
    // Declare failed for use by the surrounding module or function.
    const failed = payments.filter((t) => getStatus(t.status) === "failed");
    // Declare pending for use by the surrounding module or function.
    const pending = payments.filter((t) => getStatus(t.status) === "pending");
    // Declare completedRevenue for use by the surrounding module or function.
    const completedRevenue = completed.reduce((sum, t) => {
      // Declare amount for use by the surrounding module or function.
      const amount = Number(t.amount);
      // Return the expression shown below to the caller.
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);

    // Return the object assembled below to the caller.
    return { completed, refunded, failed, pending, completedRevenue };
  }, [payments]);

  // Declare hasData for use by the surrounding module or function.
  const hasData = !isLoading && !isError && payments.length > 0;

  // Declare exportCsv for use by the surrounding module or function.
  const exportCsv = () => {
    // Check the condition (!payments.length) and run the matching branch.
    if (!payments.length) return;
    // Declare headers for use by the surrounding module or function.
    const headers = ["Receipt", "Customer", "Phone", "Booking", "Amount", "Method", "Status", "Date"];
    // Declare rows for use by the surrounding module or function.
    const rows = payments.map((payment) => [
      payment.mpesaReceiptNumber || payment.mpesaReceipt || payment.booking?.mpesaReceipt || payment.transactionId || payment.transactionReference || "",
      payment.customer?.name || "",
      payment.customer?.phone || "",
      payment.booking?.bookingNumber || "",
      payment.amount ?? "",
      payment.paymentMethod || "",
      payment.status || "",
      payment.createdAt ? new Date(payment.createdAt).toISOString() : "",
    ]);
    // Declare csv for use by the surrounding module or function.
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    // Declare blob for use by the surrounding module or function.
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    // Declare url for use by the surrounding module or function.
    const url = URL.createObjectURL(blob);
    // Declare anchor for use by the surrounding module or function.
    const anchor = document.createElement("a");
    // Perform the side effect or state update expressed on the following line.
    anchor.href = url;
    // Perform the side effect or state update expressed on the following line.
    anchor.download = "mpesa-transactions.csv";
    // Perform the side effect or state update expressed on the following line.
    anchor.click();
    // Perform the side effect or state update expressed on the following line.
    URL.revokeObjectURL(url);
  };

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-[70vh] bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-32 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-2xl bg-slate-200" />)}</div>
          <div className="h-96 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // Check the condition (isError) and run the matching branch.
  if (isError) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-[70vh] bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><FileWarning size={26} /></div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">M-Pesa transactions unavailable</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">The tenant payment ledger could not be loaded. No financial totals are being fabricated while the service is unavailable.</p>
          <button onClick={() => refetch()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"><RefreshCw size={16} /> Retry</button>
        </div>
      </div>
    );
  }

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-white/10"><Smartphone size={14} /> Payment operations</div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">M-Pesa Transactions</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Monitor payment receipts, settlement activity, exceptions, and tenant-scoped transaction records without masking missing financial data as zero.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"><RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> Refresh</button>
              <button onClick={exportCsv} disabled={!payments.length} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"><Download size={16} /> Export CSV</button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-300" /> Tenant scoped</span>
            <span className="inline-flex items-center gap-1.5"><WalletCards size={14} className="text-emerald-300" /> Payment ledger</span>
            <span className="inline-flex items-center gap-1.5"><CreditCard size={14} className="text-emerald-300" /> Reconciliation ready</span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Completed transactions" value={stats.completed.length} hint="Successfully completed payments" icon={CheckCircle2} tone="emerald" />
          <MetricCard label="Completed payment value" value={money(stats.completedRevenue)} hint="Completed transactions across payment methods" icon={WalletCards} tone="blue" />
          <MetricCard label="Refunded" value={stats.refunded.length} hint="Transactions marked as refunded" icon={RefreshCw} tone="amber" />
          <MetricCard label="Failed" value={stats.failed.length} hint="Transactions requiring attention" icon={XCircle} tone="rose" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">Payment ledger</h2>
              <p className="mt-1 text-xs text-slate-500">Search by receipt, transaction reference, customer, phone, or booking number.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-80">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payment records" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10" />
              </div>
              <div className="relative">
                <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 sm:w-44">
                  <option value="">All payments</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-950">Transaction records</h2>
              <p className="text-xs text-slate-500">{payments.length} record{payments.length === 1 ? "" : "s"} returned</p>
            </div>
            {stats.pending.length > 0 && <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"><Clock3 size={13} /> {stats.pending.length} pending</span>}
          </div>

          {!hasData ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><WalletCards size={25} /></div>
              <h3 className="mt-4 font-bold text-slate-900">No transactions found</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">There are no payment records matching the current tenant and filters. This is an empty ledger, not an assumed zero balance.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Receipt / reference</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Booking</th>
                    <th className="px-5 py-3 text-right font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Method</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment, index) => {
                    const receipt = payment.mpesaReceiptNumber || payment.mpesaReceipt || payment.booking?.mpesaReceipt || payment.transactionId || payment.transactionReference;
                    const customerName = payment.customer?.name;
                    const customerPhone = payment.customer?.phone;
                    const bookingNumber = payment.booking?.bookingNumber;
                    const amount = Number(payment.amount);
                    return (
                      <tr key={payment._id || payment.transactionId || `${receipt || "payment"}-${index}`} className="transition hover:bg-slate-50/80">
                        <td className="px-5 py-4"><div className="font-semibold text-slate-900">{displayValue(receipt)}</div><div className="mt-0.5 text-xs text-slate-400">Payment reference</div></td>
                        <td className="px-5 py-4"><div className="font-medium text-slate-800">{displayValue(customerName)}</div><div className="mt-0.5 text-xs text-slate-500">{displayValue(customerPhone, "Phone unavailable")}</div></td>
                        <td className="px-5 py-4 font-medium text-slate-700">{displayValue(bookingNumber)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-900">{Number.isFinite(amount) ? money(amount) : "Unavailable"}</td>
                        <td className="px-5 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{displayValue(payment.paymentMethod, "M-Pesa")}</span></td>
                        <td className="px-5 py-4"><StatusBadge status={payment.status} /></td>
                        <td className="px-5 py-4 text-slate-600">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-KE") : "Unavailable"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Tenant-scoped payment records • Missing values are shown as unavailable.</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600"><ShieldCheck size={14} className="text-emerald-600" /> Finance control surface</span>
        </footer>
      </div>
    </div>
  );
}
