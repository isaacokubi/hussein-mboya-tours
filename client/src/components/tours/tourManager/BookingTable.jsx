import { CalendarDays, ChevronRight, CircleAlert, CreditCard, UserRound } from "lucide-react";

const clean = (value) => String(value ?? "").trim().replace(/\s+/g, " ");
const validText = (value) => {
  const text = clean(value);
  return text && !/^undefined(?:\s+undefined)?$/i.test(text) && !/^null(?:\s+null)?$/i.test(text) ? text : "";
};

const customerName = (booking) => {
  const customer = booking.customer || {};
  const user = booking.user || {};
  const snapshot = booking.customerSnapshot || {};
  const contact = booking.contact || {};
  const candidates = [
    customer.fullName,
    customer.name,
    [customer.firstName, customer.lastName].filter(Boolean).join(" "),
    user.name,
    [user.firstName, user.lastName].filter(Boolean).join(" "),
    snapshot.name,
    [snapshot.firstName, snapshot.lastName].filter(Boolean).join(" "),
    contact.name,
    booking.passengerName,
  ];
  return candidates.map(validText).find(Boolean) || "Customer record unavailable";
};

const tourName = (booking) => {
  const tour = booking.tour || {};
  return [tour.title, tour.name, booking.tourTitle].map(validText).find(Boolean) || (booking.customTourRequest ? "Custom Tour Package" : "Tour record unavailable");
};

const statusClass = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "completed": return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "confirmed": return "bg-sky-50 text-sky-700 ring-sky-200";
    case "ongoing":
    case "assigned": return "bg-violet-50 text-violet-700 ring-violet-200";
    case "pending": return "bg-amber-50 text-amber-700 ring-amber-200";
    case "cancelled":
    case "failed":
    case "refunded": return "bg-rose-50 text-rose-700 ring-rose-200";
    default: return "bg-slate-100 text-slate-700 ring-slate-200";
  }
};

const formatDate = (value) => {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not set" : date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

export default function BookingTable({ bookings = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2"><CreditCard size={18} className="text-emerald-700" /><h2 className="text-lg font-bold text-slate-950">Recent Bookings</h2></div>
          <p className="mt-1 text-sm text-slate-500">Latest tenant booking activity and travel dates</p>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{bookings.length} records</span>
      </div>

      {bookings.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Customer</th>
                <th className="px-4 py-3 font-bold">Tour</th>
                <th className="px-4 py-3 font-bold">Travel date</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-6 py-3" aria-label="Open" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => {
                const status = typeof booking.status === "object"
                  ? booking.status?.status || booking.status?.bookingStatus || booking.paymentStatus || "pending"
                  : booking.status || booking.paymentStatus || "pending";
                const bookingNumber = validText(booking.bookingNumber) || (booking._id ? `BK-${String(booking._id).slice(-6).toUpperCase()}` : "Booking");
                const customer = customerName(booking);
                const tour = tourName(booking);
                const travelDate = booking.travelDate || booking.date || booking.createdAt;
                const customerUnavailable = customer === "Customer record unavailable";
                return (
                  <tr key={booking._id || booking.id || bookingNumber} className="transition hover:bg-emerald-50/40">
                    <td className="px-6 py-4"><span className="font-mono text-sm font-semibold text-slate-800">{bookingNumber}</span></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"><UserRound size={16} /></div>
                        <div><p className={`text-sm font-semibold ${customerUnavailable ? "text-slate-500" : "text-slate-900"}`}>{customer}</p>{customerUnavailable && <p className="mt-0.5 flex items-center gap-1 text-[11px] text-amber-600"><CircleAlert size={11} />Identity not supplied by booking record</p>}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><p className="max-w-[250px] truncate text-sm font-medium text-slate-800" title={tour}>{tour}</p></td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-slate-600"><CalendarDays size={14} />{formatDate(travelDate)}</span></td>
                    <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${statusClass(status)}`}>{String(status).replace(/_/g, " ")}</span></td>
                    <td className="px-6 py-4 text-right"><ChevronRight size={17} className="ml-auto text-slate-400" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><CreditCard size={22} /></div><p className="mt-4 font-semibold text-slate-800">No recent bookings</p><p className="mt-1 text-sm text-slate-500">New tenant bookings will appear here when available.</p></div>
      )}
    </section>
  );
}
