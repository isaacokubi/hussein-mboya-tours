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

export default function RecentBookings({ bookings = [] }) {
  const { settings = {} } = useSettings() || {};
  const list = Array.isArray(bookings) ? bookings : [];
  const companyName = String(settings.companyName || "").trim();
  const currency = String(settings.currencySymbol || settings.currency || "KSh").trim();

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Recent Bookings</h2>
        <p className="mt-1 text-sm text-gray-500">
          {companyName ? `Latest bookings for ${companyName}.` : "Latest tenant bookings."}
        </p>
      </div>
      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">No recent bookings available.</div>
      ) : (
        <div className="space-y-3">
          {list.map((booking, index) => (
            <div key={booking?._id || booking?.bookingNumber || index} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{booking?.bookingNumber || "Booking"}</h3>
                  <p className="mt-1 text-sm text-slate-600">{customerName(booking)}</p>
                  <p className="mt-1 text-xs text-slate-400">{tourName(booking)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{currency} {Number(booking?.amount ?? booking?.totalAmount ?? booking?.subtotal ?? 0).toLocaleString()}</p>
                  <p className="mt-1 text-xs capitalize text-slate-500">Status: {statusText(booking?.status)}</p>
                  <p className="text-xs capitalize text-slate-500">Payment: {statusText(booking?.paymentStatus)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
