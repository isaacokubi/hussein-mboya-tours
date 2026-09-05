import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import ReviewForm from "../components/reviews/ReviewForm";
import { getBooking, getMyBookings, rescheduleBooking } from "../api/bookingApi";
import { toast } from "react-toastify";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getPaymentStatus = (booking) => {
  const value = booking?.paymentStatus;
  if (value && typeof value === "object") return value.paymentStatus || value.status || "pending";
  return value || "pending";
};

const getPaidAmount = (booking) => {
  const direct = [booking?.amountPaid, booking?.paidAmount, booking?.depositAmount, booking?.paymentSummary?.paid, booking?.payment?.amountPaid];
  for (const value of direct) {
    if (value !== undefined && value !== null && value !== "") return toNumber(value);
  }
  if (Array.isArray(booking?.payments)) {
    return booking.payments.reduce((sum, payment) => {
      const status = String(payment?.status || payment?.paymentStatus || "").toLowerCase();
      const confirmed = ["paid", "confirmed", "success", "successful", "completed"].includes(status);
      return confirmed ? sum + toNumber(payment?.amount || payment?.amountPaid || payment?.paidAmount) : sum;
    }, 0);
  }
  return 0;
};

const isCustomBooking = (booking) => Boolean(booking?.customTourSnapshot || booking?.customTourRequest || booking?.customTour || booking?.isCustomTour);

export default function BookingDetails() {
  const { tenant } = useTenant();
  const { settings } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      try {
        return await getBooking(id);
      } catch (requestError) {
        const fallback = await getMyBookings();
        const list = fallback?.bookings || fallback?.data?.bookings || fallback?.data || fallback || [];
        const found = Array.isArray(list) ? list.find((item) => String(item?._id || item?.id) === String(id)) : null;
        if (found) return { success: true, booking: found };
        throw requestError;
      }
    },
    enabled: Boolean(id),
  });

  const { data, isLoading, isError, error, refetch, isFetching } = query;
  const booking = data?.booking || data?.data?.booking || data?.data || data;

  if (isLoading) return <div className="p-10">Loading booking details...</div>;
  if (isError || !booking) return (
    <div className="p-10 text-center text-red-600">
      <p className="font-semibold">{error?.response?.data?.message || "Unable to load booking details."}</p>
      <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-4 rounded-lg bg-green-700 px-5 py-2 text-white disabled:opacity-50">{isFetching ? "Retrying..." : "Retry"}</button>
    </div>
  );

  const custom = booking.customTourSnapshot || booking.customTourRequest || {};
  const customBooking = isCustomBooking(booking);
  const title = booking.tour?.title || booking.title || custom.destination || custom.title || "Custom Tour Package";
  const totalAmount = toNumber(booking.totalAmount ?? booking.quotedAmount ?? booking.quotedTotal);
  const amountPaid = getPaidAmount(booking);
  const storedBalance = booking.balanceAmount ?? booking.balance ?? booking.paymentSummary?.balance;
  const balanceAmount = Math.max(storedBalance !== undefined && storedBalance !== null ? toNumber(storedBalance) : totalAmount - amountPaid, 0);
  const paymentStatus = String(getPaymentStatus(booking)).toLowerCase();
  const failedPayment = ["failed", "cancelled"].includes(paymentStatus);
  const customerName = booking.customerSnapshot?.name || booking.customer?.name || booking.user?.name || booking.contact?.name || "Customer";
  const customerPhone = booking.customerSnapshot?.phone || booking.customer?.phone || booking.user?.phone || booking.contact?.phone || "N/A";
  const customerEmail = booking.customerSnapshot?.email || booking.customer?.email || booking.user?.email || booking.contact?.email || "N/A";
  const status = booking.status || booking.bookingStatus || "pending";
  const canPostpone = !["cancelled", "completed", "refunded"].includes(String(status).toLowerCase()) && booking.travelDate;
  const checkoutPath = `/checkout/booking/${booking._id || id}`;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">{settings?.companyName || tenant?.name || "Your Travel Company"}</p>
          <h1 className="mt-1 text-4xl font-bold text-slate-900">Booking Details</h1>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-slate-200">
          <div className="bg-slate-900 p-6 text-white">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{customBooking ? "Custom Tour Booking" : "Normal Tour Booking"}</span>
              {failedPayment && <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold">Payment failed — retry required</span>}
            </div>
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

            {canPostpone && <PostponeBooking booking={booking} onSuccess={() => refetch()} queryClient={queryClient} />}

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="font-bold text-slate-900">Payment summary</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Info label="Total" value={`KES ${totalAmount.toLocaleString()}`} />
                <Info label="Paid" value={`KES ${amountPaid.toLocaleString()}`} />
                <Info label="Outstanding" value={`KES ${balanceAmount.toLocaleString()}`} />
              </div>

              {balanceAmount > 0 && !["cancelled", "refunded"].includes(String(status).toLowerCase()) && (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => navigate(checkoutPath)} className={`rounded-xl px-5 py-3 font-bold text-white ${failedPayment ? "bg-red-600 hover:bg-red-700" : "bg-emerald-700 hover:bg-emerald-800"}`}>
                    {failedPayment ? "Retry Failed Payment" : amountPaid > 0 ? "Continue Payment" : "Open Checkout & Pay"}
                  </button>
                  <p className="text-sm text-slate-600">Open the full checkout, review or update your phone and pickup details, then request a new M-Pesa prompt and enter the PIN on the customer's phone.</p>
                </div>
              )}

              {balanceAmount <= 0 && totalAmount > 0 && <p className="mt-4 font-semibold text-emerald-800">✓ This booking is fully paid.</p>}
            </div>

            <div className="mt-6 border-t pt-5">
              <h3 className="mb-3 text-lg font-bold">Customer Information</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <Info label="Name" value={customerName} />
                <Info label="Phone" value={customerPhone} />
                <Info label="Email" value={customerEmail} />
              </div>
            </div>

            {(booking.completedAt || ["completed", "complete", "finished"].includes(String(status).toLowerCase())) && booking.tour?._id && <div className="mt-8"><ReviewForm tourId={booking.tour._id} onSuccess={() => refetch()} /></div>}
          </div>
        </div>
      </main>
    </div>
  );
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function PostponeBooking({ booking, onSuccess, queryClient }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState("");
  const mutation = useMutation({
    mutationFn: ({ newTravelDate, reason: nextReason }) => rescheduleBooking(booking._id, { newTravelDate, reason: nextReason }),
    onSuccess: () => {
      toast.success("Booking postponed successfully.");
      setOpen(false);
      setDate("");
      setReason("");
      setValidationError("");
      queryClient.invalidateQueries({ queryKey: ["booking", String(booking._id)] });
      onSuccess();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to postpone booking."),
  });

  const minDate = getLocalDateString(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const reasonValid = reason.trim().length >= 5 && reason.trim().length <= 500;
  const dateValid = Boolean(date) && date >= minDate;

  const handleSubmit = (event) => {
    event.preventDefault();
    setValidationError("");
    if (!dateValid) {
      setValidationError("Choose a travel date from tomorrow onward.");
      return;
    }
    if (!reasonValid) {
      setValidationError("Please provide a meaningful reason of at least 5 characters.");
      return;
    }
    mutation.mutate({ newTravelDate: date, reason: reason.trim() });
  };

  return (
    <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Need to postpone this trip?</h3>
          <p className="mt-1 text-sm text-slate-600">Choose a new future travel date and provide a reason. Your postponement will be recorded with the booking.</p>
        </div>
        <button type="button" onClick={() => { setOpen((value) => !value); setValidationError(""); }} className="rounded-xl bg-sky-700 px-5 py-3 font-bold text-white hover:bg-sky-800">
          {open ? "Close" : "Postpone Booking"}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} noValidate className="mt-5 grid gap-4 rounded-xl border border-sky-100 bg-white p-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-slate-800">New travel date *</span>
            <input type="date" min={minDate} value={date} onChange={(event) => { setDate(event.target.value); setValidationError(""); }} className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-slate-800">Reason for postponement *</span>
            <textarea value={reason} onChange={(event) => { setReason(event.target.value); setValidationError(""); }} minLength={5} maxLength={500} rows={3} placeholder="Please explain why you need to postpone this trip." className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100" required />
            <span className="mt-1 block text-right text-xs text-slate-500">{reason.length}/500</span>
          </label>
          <div className="md:col-span-2 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
            {validationError && <p role="alert" className="text-sm font-semibold text-red-600 sm:mr-auto">{validationError}</p>}
            <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-sky-700 px-5 py-3 font-bold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50">
              {mutation.isPending ? "Postponing..." : "Confirm Postponement"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold capitalize text-slate-900">{value || "N/A"}</p></div>;
}
