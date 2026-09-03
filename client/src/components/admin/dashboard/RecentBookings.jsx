import { useSettings } from "../../../context/SettingsContext";

const customerName = (booking) => {
  const customer = booking?.customer;
  const snapshot = booking?.customerSnapshot;
  return customer?.name || snapshot?.name || booking?.contact?.name || booking?.user?.name || booking?.customerDisplayName || "Customer";
};

const tourName = (booking) => booking?.tour?.title || booking?.tourName || "Tour unavailable";

const statusText = (value) => {
  if (!value) return "pending";
  return typeof value === "string" ? value : value.status || value.paymentStatus || "pending";
};

const badgeClass = (value, type) => {
  const status = String(value || "pending").toLowerCase();
  if (type === "payment") {
    if (["paid", "completed"].includes(status)) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    if (["failed", "cancelled"].includes(status)) return "bg-red-50 text-red-700 ring-red-200";
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }
  if (status === "confirmed" || status === "completed") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "cancelled") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
};

export default function RecentBookings({ bookings = [] }) {
  const { settings = {} } = useSettings() || {};
  const list = Array.isArray(bookings) ? bookings : [];
  const companyName = String(settings.companyName || "").trim();
  const currency = String(settings.currencySymbol || settings.currency || "KSh").trim();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recent Bookings</h2>
          <p className="mt-1 text-sm text-slate-500">
            {companyName ? `Latest bookings for ${companyName}.` : "Latest tenant bookings."}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {list.length} recent
        </span>
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">No recent bookings available.</div>
      ) : (
        <div className="space-y-3">
          {list.map((booking, index) => {
            const bookingStatus = statusText(booking?.status);
            const paymentStatus = statusText(booking?.paymentStatus);
            return (
              <div key={booking?._id || booking?.bookingNumber || index} className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50/60">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{booking?.bookingNumber || "Booking"}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ${badgeClass(bookingStatus, "booking")}`}>
                        {bookingStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{customerName(booking)}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{tourName(booking)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ${badgeClass(paymentStatus, "payment")}`}>
                      {paymentStatus}
                    </span>
                    <p className="whitespace-nowrap text-base font-bold text-slate-900">
                      {currency} {Number(booking?.amount ?? booking?.totalAmount ?? booking?.subtotal ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
