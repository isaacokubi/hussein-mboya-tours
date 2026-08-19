import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { createReview } from "../api/reviewApi";
import { getUserRole } from "../utils/roleUtils";
import { cancelBooking, getMyBookings, initiatePayment, rescheduleBooking } from "../api/bookingApi";

const normalizeBookings = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.bookings)) return response.bookings;
  if (Array.isArray(response?.data?.bookings)) return response.data.bookings;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const paymentStatusOf = (booking) => String(
  typeof booking?.paymentStatus === "object"
    ? booking.paymentStatus?.paymentStatus || booking.paymentStatus?.status || "pending"
    : booking?.paymentStatus || "pending"
).toLowerCase();

const bookingStatusOf = (booking) => String(booking?.status || booking?.bookingStatus || "pending").toLowerCase();

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

const bookingReferenceOf = (booking) => firstValue(
  booking?.bookingReference,
  booking?.bookingRef,
  booking?.reference,
  booking?.bookingNumber,
  booking?.bookingCode,
  booking?.confirmationNumber,
  booking?._id ? String(booking._id).slice(-8).toUpperCase() : null,
  "N/A"
);

const tourNameOf = (booking) => firstValue(
  typeof booking?.tour === "object" ? booking.tour?.title || booking.tour?.name : booking?.tour,
  booking?.tourTitle,
  booking?.tourName,
  "Tour Package"
);

const pickupLocationOf = (booking) => firstValue(
  booking?.pickupLocation,
  booking?.pickup?.location,
  booking?.pickup?.address,
  booking?.pickupAddress,
  booking?.pickupPoint,
  booking?.pickup,
  "Not specified"
);

const pickupTimeOf = (booking) => firstValue(
  booking?.pickupTime,
  booking?.pickup?.time,
  booking?.pickup?.pickupTime,
  "Not specified"
);

const amountOf = (booking) => Number(firstValue(
  booking?.totalAmount,
  booking?.amount,
  booking?.total,
  booking?.pricing?.total,
  0
));

const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, {
  weekday: "short", year: "numeric", month: "short", day: "numeric",
}) : "Not specified";

export default function MyBookings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userRole = getUserRole(user);

  if (userRole !== "customer") return <Navigate to="/unauthorized" replace />;

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
    staleTime: 1000 * 60 * 5,
  });
  const bookings = normalizeBookings(data);

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      toast.success("Booking cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to cancel booking."),
  });

  const handleCancel = (booking) => {
    if (!window.confirm(`Cancel booking ${bookingReferenceOf(booking)}?`)) return;
    cancelMutation.mutate(booking._id);
  };

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
        <p className="text-lg font-semibold sm:text-xl">Loading your bookings...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center text-red-600 sm:p-10">
      <p className="font-semibold">{error?.response?.data?.message || "Unable to load your bookings."}</p>
      <button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ["my-bookings"] })} className="mt-4 rounded-lg bg-green-700 px-5 py-2 font-semibold text-white">Retry</button>
    </div>
  );

  const now = new Date();
  const upcomingTrips = bookings.filter((b) => b.travelDate && new Date(b.travelDate) >= now && bookingStatusOf(b) !== "cancelled");
  const paidTrips = bookings.filter((b) => ["paid", "completed"].includes(paymentStatusOf(b)));

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-900 to-yellow-600 p-5 text-white shadow-xl sm:mb-8 sm:rounded-3xl sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold sm:text-4xl">My Adventures</h1>
              <p className="mt-2 text-sm sm:mt-3 sm:text-base">Manage your bookings, payments and upcoming trips.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link to="/custom-tour" className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-green-900 shadow-md sm:px-5 sm:py-3 sm:text-base">Create Custom Tour</Link>
              <Link to="/my-custom-tours" className="rounded-xl border-2 border-white px-3 py-2 text-sm font-bold text-white sm:px-5 sm:py-3 sm:text-base">My Requests</Link>
            </div>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5 lg:mb-10 lg:gap-6">
          <SummaryCard title="Total Bookings" value={bookings.length} />
          <SummaryCard title="Upcoming Trips" value={upcomingTrips.length} />
          <SummaryCard title="Paid Trips" value={paidTrips.length} />
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl bg-white p-7 text-center shadow sm:p-10">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">No Bookings Yet</h2>
            <p className="mb-6 text-gray-600">Start exploring Kenya's best destinations.</p>
            <Link to="/tours" className="rounded-xl bg-green-700 px-6 py-3 font-bold text-white sm:px-8">Explore Tours</Link>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {bookings.map((booking) => {
              const status = bookingStatusOf(booking);
              const paymentStatus = paymentStatusOf(booking);
              return (
                <article key={booking._id || bookingReferenceOf(booking)} className="overflow-hidden rounded-2xl bg-white p-4 shadow sm:p-6">
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <h2 className="break-words text-xl font-bold text-green-800 sm:text-2xl">{tourNameOf(booking)}</h2>
                      <p className="mt-2 break-all text-sm text-gray-600">Booking Reference: <b>{bookingReferenceOf(booking)}</b></p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <StatusBadge value={status} label="Booking" />
                      <StatusBadge value={paymentStatus} label="Payment" payment />
                    </div>
                  </div>

                  <div className="my-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <BookingDetail label="Tour" value={tourNameOf(booking)} />
                    <BookingDetail label="Date" value={formatDate(booking.travelDate || booking.date)} />
                    <BookingDetail label="Pickup Location" value={pickupLocationOf(booking)} />
                    <BookingDetail label="Pickup Time" value={pickupTimeOf(booking)} />
                    <BookingDetail label="Amount" value={`KES ${amountOf(booking).toLocaleString()}`} emphasize />
                  </div>

                  <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                    <span>Travellers: <b>{booking.travelers?.length || booking.numberOfGuests || 1}</b></span>
                    <span>Booking Status: <b className="capitalize">{status}</b></span>
                    <span>Payment Status: <b className="capitalize">{paymentStatus}</b></span>
                  </div>

                  <div className="flex flex-col gap-4 border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {status === "completed" && <ReviewForm booking={booking} />}
                      {status !== "cancelled" && status !== "completed" && <RescheduleForm booking={booking} onDone={() => queryClient.invalidateQueries({ queryKey: ["my-bookings"] })} />}
                    </div>
                    <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                      <Link to={`/bookings/${booking._id}`} className="flex-1 rounded-xl bg-green-700 px-4 py-2 text-center text-sm font-semibold text-white sm:flex-none sm:px-5">View Trip</Link>
                      {status !== "cancelled" && status !== "completed" && paymentStatus !== "paid" && <PayNowButton booking={booking} user={user} />}
                      {status !== "cancelled" && status !== "completed" && (
                        <button type="button" disabled={cancelMutation.isPending} onClick={() => handleCancel(booking)} className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:flex-none sm:px-5">{cancelMutation.isPending ? "Cancelling..." : "Cancel"}</button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return <div className="min-w-0 rounded-2xl bg-white p-4 shadow sm:p-6"><p className="truncate text-sm text-gray-500 sm:text-base">{title}</p><h2 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">{value}</h2></div>;
}

function BookingDetail({ label, value, emphasize = false }) {
  return <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-3"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className={`break-words text-sm leading-5 ${emphasize ? "font-bold text-green-800" : "font-semibold text-gray-800"}`}>{value}</p></div>;
}

function StatusBadge({ value, label, payment = false }) {
  const styles = value === "completed" || value === "paid" ? "bg-green-100 text-green-700" : value === "cancelled" || value === "failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
  return <span className={`max-w-full break-words rounded-full px-3 py-1.5 text-xs font-bold capitalize sm:px-4 sm:py-2 sm:text-sm ${styles}`}>{label}: {value}</span>;
}

function PayNowButton({ booking, user }) {
  const [loading, setLoading] = useState(false);
  const handlePayment = async () => {
    const phone = booking.user?.phone || user?.phone || booking.customer?.phone || booking.customerSnapshot?.phone || booking.contact?.phone;
    const amount = Number(booking.balanceAmount ?? Math.max(0, amountOf(booking) - Number(booking.depositAmount || 0)));
    if (!phone) return toast.error("No phone number is available. Update your profile phone number first.");
    if (!amount || amount <= 0) return toast.info("There is no outstanding balance to pay.");
    try {
      setLoading(true);
      await initiatePayment({ bookingId: booking._id, phone, phoneNumber: phone, amount });
      toast.success("M-Pesa payment request sent.");
      window.location.href = `/payment-status/${booking._id}`;
    } catch (error) {
      console.error("MPESA ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Unable to start M-Pesa payment. Please try again.");
    } finally { setLoading(false); }
  };
  return <button type="button" onClick={handlePayment} disabled={loading} className="flex-1 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:flex-none sm:px-5">{loading ? "Sending..." : "Pay Now"}</button>;
}

function RescheduleForm({ booking, onDone }) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  const mutation = useMutation({
    mutationFn: () => rescheduleBooking(booking._id, { newTravelDate: date, reason }),
    onSuccess: () => { toast.success("Booking rescheduled."); setOpen(false); onDone(); },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to reschedule booking."),
  });
  return <div className="w-full min-w-0 rounded-xl border border-sky-100 bg-sky-50 p-3 sm:p-4"><button type="button" onClick={() => setOpen((v) => !v)} className="font-semibold text-sky-800">{open ? "Close reschedule" : "Postpone / reschedule"}</button>{open && <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-[1fr_2fr_auto]"><input type="date" min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="min-w-0 rounded-lg border p-2" /><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" className="min-w-0 rounded-lg border p-2" /><button type="button" disabled={!date || mutation.isPending} onClick={() => mutation.mutate()} className="rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{mutation.isPending ? "Saving..." : "Reschedule"}</button></div>}</div>;
}

function ReviewForm({ booking }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const mutation = useMutation({
    mutationFn: () => createReview({ tour: booking.tour?._id || booking.tour, rating, title, comment }),
    onSuccess: () => { toast.success("Review submitted for admin approval."); setOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to submit review."),
  });
  return <div className="w-full min-w-0 rounded-xl border border-amber-100 bg-amber-50 p-3 sm:p-4"><button type="button" onClick={() => setOpen((v) => !v)} className="font-semibold text-amber-800">{open ? "Close review" : "Leave a review"}</button>{open && <div className="mt-3 min-w-0 space-y-3"><div className="flex gap-2">{[1,2,3,4,5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-amber-500" : "text-slate-300"}`}>★</button>)}</div><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title" className="w-full min-w-0 rounded-lg border p-2" /><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us about your experience" rows={3} className="w-full min-w-0 rounded-lg border p-2" /><button type="button" disabled={!comment.trim() || mutation.isPending} onClick={() => mutation.mutate()} className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{mutation.isPending ? "Submitting..." : "Submit review"}</button></div>}</div>;
}
