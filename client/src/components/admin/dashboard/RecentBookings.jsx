import { useSettings } from "../../../context/SettingsContext";

const clean = (value) => {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text && !/^undefined( undefined)?$/i.test(text) && !/^null( null)?$/i.test(text) ? text : "";
};
const customerName = (booking) => {
  const customer = booking?.customer || {};
  const snapshot = booking?.customerSnapshot || {};
  const direct = clean(customer.name) || clean(snapshot.name) || clean(booking?.contact?.name) || clean(booking?.user?.name) || clean(booking?.customerDisplayName);
  if (direct) return direct;
  const combined = `${clean(customer.firstName) || clean(snapshot.firstName)} ${clean(customer.lastName) || clean(snapshot.lastName)}`.trim();
  return combined || "Customer";
};
const tourName = (booking) => booking?.tour?.title || booking?.tourName || "";
const statusText = (value) => { if (!value) return "pending"; return typeof value === "string" ? value.toLowerCase() : String(value.status || value.paymentStatus || "pending").toLowerCase(); };
const badgeClass = (value, type) => {
  const status = String(value || "pending").toLowerCase();
  if (type === "payment") {
    if (["paid", "completed", "success"].includes(status)) return "bg-emerald-100 text-emerald-800 ring-emerald-300";
    if (["failed", "cancelled"].includes(status)) return "bg-red-100 text-red-800 ring-red-300";
    return "bg-amber-100 text-amber-800 ring-amber-300";
  }
  if (["confirmed", "completed"].includes(status)) return "bg-emerald-100 text-emerald-800 ring-emerald-300";
  if (["cancelled"].includes(status)) return "bg-red-100 text-red-800 ring-red-300";
  if (["refunded"].includes(status)) return "bg-violet-100 text-violet-800 ring-violet-300";
  if (["ongoing"].includes(status)) return "bg-indigo-100 text-indigo-800 ring-indigo-300";
  return "bg-amber-100 text-amber-800 ring-amber-300";
};

export default function RecentBookings({ bookings = [] }) {
  const { settings = {} } = useSettings() || {};
  const companyName = String(settings.companyName || "").trim();
  const currency = String(settings.currencySymbol || settings.currency || "KSh").trim() || "KSh";
  // Never display orphaned/stray records that survived tenant cleanup. A dashboard
  // booking must have a resolved customer identity and a resolved tour identity.
  const list = (Array.isArray(bookings) ? bookings : []).filter((booking) => {
    const hasCustomer = Boolean(clean(booking?.customer?.name) || clean(booking?.customer?.email) || clean(booking?.customerSnapshot?.name) || clean(booking?.customerSnapshot?.email) || clean(booking?.contact?.name) || clean(booking?.contact?.email) || clean(booking?.user?.name) || clean(booking?.user?.email));
    const hasTour = Boolean(tourName(booking));
    return hasCustomer && hasTour;
  });

  return <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm sm:p-6">
    <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">Recent bookings</h2><p className="mt-1 text-sm text-slate-600">{companyName ? `Latest valid bookings for ${companyName}.` : "Latest valid tenant bookings."}</p></div><span className="shrink-0 rounded-full bg-sky-600 px-3 py-1 text-xs font-bold text-white shadow-sm">{list.length} recent</span></div>
    {list.length === 0 ? <div className="rounded-xl border border-dashed border-sky-300 bg-white/70 p-8 text-center text-slate-500">No valid recent bookings available.</div> : <div className="space-y-3">{list.map((booking, index) => { const bookingStatus = statusText(booking?.status); const paymentStatus = statusText(booking?.paymentStatus); return <div key={booking?._id || booking?.bookingNumber || index} className="rounded-xl border border-sky-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{booking?.bookingNumber || "Booking"}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${badgeClass(bookingStatus, "booking")}`}>{bookingStatus}</span></div><p className="mt-1 text-sm font-medium text-slate-700">{customerName(booking)}</p><p className="mt-1 truncate text-xs text-slate-600">{tourName(booking)}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${badgeClass(paymentStatus, "payment")}`}>{paymentStatus}</span><p className="whitespace-nowrap text-base font-extrabold text-indigo-900">{currency} {Number(booking?.amount ?? booking?.totalAmount ?? booking?.subtotal ?? 0).toLocaleString()}</p></div></div></div>; })}</div>}
  </section>;
}
