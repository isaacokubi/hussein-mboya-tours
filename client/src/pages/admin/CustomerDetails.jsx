import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Star,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { getCustomerProfile } from "../../api/customerApi";

const money = (value) =>
  `KES ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const displayValue = (value) => (value ? String(value) : "—");

const titleCase = (value) =>
  String(value || "pending")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusTone = (status) => {
  const value = String(status || "").toLowerCase();
  if (["completed", "confirmed", "paid", "published"].includes(value)) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (["pending", "processing", "partial"].includes(value)) return "bg-amber-50 text-amber-700 ring-amber-100";
  if (["cancelled", "failed", "rejected", "refunded"].includes(value)) return "bg-red-50 text-red-700 ring-red-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

const successfulBookingStatuses = new Set(["confirmed", "assigned", "ongoing", "completed"]);

export default function CustomerDetails() {
  const { id } = useParams();
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["admin-customer", id],
    queryFn: () => getCustomerProfile(id),
    enabled: Boolean(id),
    staleTime: 15_000,
  });

  const profile = data?.data || {};
  const customer = profile.customer;
  const bookings = Array.isArray(profile.bookings) ? profile.bookings : [];
  const quotations = Array.isArray(profile.quotations) ? profile.quotations : [];
  const invoices = Array.isArray(profile.invoices) ? profile.invoices : [];
  const reviews = Array.isArray(profile.reviews) ? profile.reviews : [];
  const communications = Array.isArray(profile.communications) ? profile.communications : [];

  const metrics = useMemo(() => ({
    bookings: Number(profile.summary?.totalBookings ?? bookings.length ?? 0),
    paid: Number(profile.summary?.totalPaid || 0),
    spend: Number(profile.summary?.confirmedSpend ?? profile.summary?.totalSpent ?? 0),
    confirmed: Number(
      profile.summary?.confirmedBookings ??
      bookings.filter((booking) => successfulBookingStatuses.has(String(booking.status || "").toLowerCase())).length
    ),
  }), [profile.summary, bookings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-5">
          <div className="h-40 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-3"><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /></div>
          <div className="h-96 rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"><X size={22} /></div>
          <h2 className="text-lg font-bold text-slate-900">Unable to load customer profile</h2>
          <p className="mt-2 text-sm text-slate-500">{error?.response?.data?.message || error?.message || "Customer not found."}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/admin/customers" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"><ArrowLeft size={16} /> Customers</Link>
            <button type="button" onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"><RefreshCw size={16} /> Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"><ArrowLeft size={17} /> Back to customers</Link>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"><RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> Refresh</button>
        </div>

        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-700 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-black ring-1 ring-white/20">{String(customer.name || "C").trim().charAt(0).toUpperCase()}</div>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">Customer profile</div>
                <h1 className="mt-1 truncate text-2xl font-black sm:text-3xl">{displayValue(customer.name)}</h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-emerald-50/90">
                  <span className="inline-flex items-center gap-1.5"><Mail size={14} /> {displayValue(customer.email)}</span>
                  <span className="inline-flex items-center gap-1.5"><Phone size={14} /> {displayValue(customer.phone)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold ring-1 ring-white/15">{titleCase(customer.customerType || "individual")}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold ring-1 ring-white/15">{customer.isActive === false ? "Inactive" : "Active"}</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={CalendarDays} label="Total bookings" value={metrics.bookings.toLocaleString("en-KE")} />
          <Metric icon={CheckCircle2} label="Confirmed / completed bookings" value={metrics.confirmed.toLocaleString("en-KE")} />
          <Metric icon={WalletCards} label="Total paid" value={money(metrics.paid)} compact />
          <Metric icon={WalletCards} label="Confirmed spend" value={money(metrics.spend)} compact />
        </section>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <InfoPanel icon={FileText} title="Quotations" items={quotations} empty="No quotations yet." renderItem={(quotation) => <><span className="truncate font-semibold text-slate-800">{displayValue(quotation.quotationNumber)}</span><span className="font-bold text-slate-700">{money(quotation.grandTotal)}</span></>} />
          <InfoPanel icon={FileText} title="Invoices" items={invoices} empty="No invoices yet." renderItem={(invoice) => <><span className="truncate font-semibold text-slate-800">{displayValue(invoice.invoiceNumber)}</span><span className={`rounded-full px-2 py-1 text-xs font-bold ring-1 ${statusTone(invoice.status)}`}>{titleCase(invoice.status)}</span></>} />
          <InfoPanel icon={Star} title="Reviews & feedback" items={reviews} empty="No reviews yet." renderItem={(review) => <><span className="truncate font-semibold text-slate-800">{displayValue(review.tour?.title || review.title)}</span><span className="whitespace-nowrap text-xs font-bold text-amber-600">{Number(review.rating || 0)}/5 · {review.approved ? "Published" : "Pending"}</span></>} />
          <InfoPanel icon={MessageSquare} title="Communications" items={communications} empty="No communications yet." renderItem={(notification) => <><span className="truncate font-semibold text-slate-800">{displayValue(notification.title)}</span><span className={`whitespace-nowrap text-xs font-bold ${notification.read ? "text-slate-500" : "text-emerald-700"}`}>{notification.read ? "Read" : "Unread"}</span></>} />
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-black text-slate-900">Booking history</h2><p className="mt-1 text-sm text-slate-500">All tenant-scoped bookings associated with this customer.</p></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">{bookings.length} record{bookings.length === 1 ? "" : "s"}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50"><tr><Header>Booking</Header><Header>Tour</Header><Header>Date</Header><Header>Status</Header><Header>Amount</Header></tr></thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-slate-100 last:border-0 hover:bg-emerald-50/40">
                    <td className="p-4 font-bold text-slate-900">{displayValue(booking.bookingNumber || (booking._id ? `Booking ${String(booking._id).slice(-8)}` : ""))}</td>
                    <td className="p-4 text-sm font-medium text-slate-700">{displayValue(booking.tour?.title || booking.tour?.name)}</td>
                    <td className="p-4 text-sm font-medium text-slate-700">{formatDate(booking.travelDate || booking.date || booking.createdAt)}</td>
                    <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusTone(booking.status)}`}>{titleCase(booking.status)}</span></td>
                    <td className="p-4 font-black text-emerald-700">{money(booking.totalAmount)}</td>
                  </tr>
                ))}
                {!bookings.length && <tr><td colSpan="5" className="p-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><UserRound size={25} /></div><h3 className="mt-4 font-bold text-slate-900">No bookings found</h3><p className="mt-1 text-sm text-slate-500">This customer has no booking records in the current tenant.</p></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, compact = false }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className={`mt-2 font-black tracking-tight text-slate-900 ${compact ? "text-lg" : "text-2xl"}`}>{value}</p></div><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><Icon size={19} /></div></div></div>;
}

function InfoPanel({ icon: Icon, title, items, empty, renderItem }) {
  return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><Icon size={17} /></div><h2 className="font-black text-slate-900">{title}</h2></div><div className="mt-4 space-y-2">{items.slice(0, 8).map((item, index) => <div key={item._id || index} className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-100">{renderItem(item)}</div>)}{!items.length && <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">{empty}</p>}{items.length > 8 && <p className="pt-1 text-xs font-semibold text-slate-400">Showing the latest 8 records.</p>}</div></section>;
}

function Header({ children }) {
  return <th className="whitespace-nowrap p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">{children}</th>;
}
