import { useQuery } from "@tanstack/react-query";
import { getAdminBookings } from "../../../api/adminApi";

const bookingIsPaid = (booking) => {
  const paymentStatus = typeof booking?.paymentStatus === "object"
    ? booking.paymentStatus?.paymentStatus || booking.paymentStatus?.status
    : booking?.paymentStatus;
  if (String(paymentStatus || "").toLowerCase() === "paid") return true;
  const deposit = Number(booking?.depositAmount || booking?.amountPaid || booking?.paidAmount || 0);
  const balance = Number(booking?.balanceAmount || 0);
  return deposit > 0 && balance <= 0;
};

const bookingTourId = (booking) => String(booking?.tour?._id || booking?.tour || "");
const unwrapBookings = (payload) => {
  const data = payload?.data ?? payload ?? {};
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.bookings)) return data.bookings;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

export default function PopularTours({ tours = [] }) {
  const list = Array.isArray(tours) ? tours : [];
  const { data: bookingsPayload } = useQuery({
    queryKey: ["admin-dashboard-popular-tour-bookings"],
    queryFn: () => getAdminBookings({ limit: 100 }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  const bookings = unwrapBookings(bookingsPayload);

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Top Performing Tours</h2>
        <p className="mt-1 text-sm text-gray-500">Ranked by booking activity and paid bookings.</p>
      </div>
      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">No tour booking data available yet.</div>
      ) : (
        <div className="space-y-3">
          {list.map((tour, index) => {
            const totalBookings = Number(tour?.totalBookings || 0);
            const serverPaidBookings = tour?.paidBookings ?? tour?.confirmedPaidBookings;
            const fallbackPaidBookings = bookings.filter(
              (booking) => bookingTourId(booking) === String(tour?._id || "") && bookingIsPaid(booking)
            ).length;
            const paidBookings = serverPaidBookings == null || (Number(serverPaidBookings) === 0 && fallbackPaidBookings > 0)
              ? fallbackPaidBookings
              : Number(serverPaidBookings);

            return (
              <div key={tour?._id || index} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{tour?.title || "Untitled tour"}</p>
                    <p className="text-xs text-slate-500">{paidBookings.toLocaleString()} paid {paidBookings === 1 ? "booking" : "bookings"}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-bold">{totalBookings.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{totalBookings === 1 ? "booking" : "bookings"}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
