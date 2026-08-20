import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getBooking, getMyBookings } from "../api/bookingApi";
import ReviewForm from "../components/reviews/ReviewForm";

const number = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const paymentStatusOf = (booking) => {
  const value = booking?.paymentStatus;
  if (typeof value === "object") return value?.paymentStatus || value?.status || "pending";
  return value || "pending";
};

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      try {
        return await getBooking(id);
      } catch (requestError) {
        const fallback = await getMyBookings();
        const list = fallback?.bookings || fallback?.data?.bookings || fallback?.data || fallback || [];
        const found = Array.isArray(list)
          ? list.find((item) => String(item?._id || item?.id) === String(id))
          : null;
        if (found) return { success: true, booking: found };
        throw requestError;
      },
    },
  });

  const booking = data?.booking || data?.data?.booking || data?.data || data;

  if (isLoading) return <div className="p-10">Loading booking details...</div>;

  if (isError || !booking) {
    return (
      <div className="p-10 text-center text-red-600">
        <p className="font-semibold">{error?.response?.data?.message || "Unable to load booking details."}</p>
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-4 rounded-lg bg-green-700 px-5 py-2 text-white disabled:opacity-50">
          {isFetching ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  const custom = booking.customTourSnapshot || booking.customTourRequest || {};
  const title = booking.tour?.title || booking.title || custom.destination || custom.title || "Custom Tour Package";
  const totalAmount = number(booking.totalAmount ?? booking.quotedAmount ?? booking.quotedTotal);
  const amountPaid = number(
    booking.amountPaid ??
      booking.paidAmount ??
      booking.depositAmount ??
      booking.paymentSummary?.paid ??
      booking.payment?.amountPaid
  );
  const balanceAmount = Math.max(
    number(booking.balanceAmount ?? booking.balance ?? booking.paymentSummary?.balance ?? totalAmount - amountPaid),
    0
  );
  const paymentStatus = String(paymentStatusOf(booking)).toLowerCase();
  const customerName = booking.customerSnapshot?.name || booking.customer?.name || booking.user?.name || booking.contact?.name || "Customer";
  const customerPhone = booking.customerSnapshot?.phone || booking.customer?.phone || booking.user?.phone || booking.contact?.phone || "N/A";
  const customerEmail = booking.customerSnapshot?.email || booking.customer?.email || booking.user?.email || booking.contact?.email || "N/A";
  const status = booking.status || booking.bookingStatus || "pending";

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Coherent Tours</p>
          <h1 className="mt-1 text-4xl font-bold text-slate-900">Booking Details</h1>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-slate-200">
          <div className="bg-slate-900 p-6 text-white">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-slate-300">Booking #{booking.bookingNumber || booking._id || "N/A"}</p>
          </div>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Info label="Travel date" value={booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : custom.startDate ? new Date(custom.startDate).toLocaleDateString() : "N/A"} />
              <Info label="Total cost" value={`KES ${totalAmount.toLocaleString()}`} />
              <Info label="Amount paid" value={`KES ${amountPaid.toLocaleString()}`} />
              <Info label="Balance" value={`KES ${balanceAmount.toLocaleString()}`} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info label="Booking status" value={status} />
              <Info label="Payment status" value={paymentStatus} />
              <Info label="Travellers" value={String(booking.numberOfGuests ?? custom.people ?? booking.travelers?.length ?? 1)} />
              <Info label="Pickup" value={booking.pickupLocation || custom.pickupLocation || "N/A"} />
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="font-bold text-slate-900">Payment summary</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Info label="Total" value={`KES ${totalAmount.toLocaleString()}`} />
                <Info label="Paid" value={`KES ${amountPaid.toLocaleString()}`} />
                <Info label="Outstanding" value={`KES ${balanceAmount.toLocaleString()}`} />
              </div>
              {balanceAmount > 0 && !["cancelled", "refunded"].includes(String(status).toLowerCase()) && (
                <button type="button" onClick={() => navigate(`/checkout/booking/${booking._id}`)} className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">
                  Pay Outstanding Balance
                </button>
              )}
              {balanceAmount <= 0 && totalAmount > 0 && (
                <p className="mt-4 font-semibold text-emerald-800">✓ This booking is fully paid.</p>
              )}
            </div>

            <div className="mt-6 border-t pt-5">
              <h3 className="mb-3 text-lg font-bold">Customer Information</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <Info label="Name" value={customerName} />
                <Info label="Phone" value={customerPhone} />
                <Info label="Email" value={customerEmail} />
              </div>
            </div>

            {(booking.completedAt || ["completed", "complete", "finished"].includes(String(status).toLowerCase())) && booking.tour?._id && (
              <div className="mt-8">
                <ReviewForm tourId={booking.tour._id} onSuccess={() => refetch()} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold capitalize text-slate-900">{value || "N/A"}</p></div>;
}
