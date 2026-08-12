import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { createReview } from "../api/reviewApi";

import {
  cancelBooking,
  getMyBookings,
  initiatePayment,
  rescheduleBooking,
} from "../api/bookingApi";

const normalizeBookings = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.bookings)) return response.bookings;
  if (Array.isArray(response?.data?.bookings)) return response.data.bookings;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const paymentStatusOf = (booking) =>
  String(
    typeof booking?.paymentStatus === "object"
      ? booking.paymentStatus?.paymentStatus ||
          booking.paymentStatus?.status ||
          "pending"
      : booking?.paymentStatus || "pending"
  ).toLowerCase();

const bookingStatusOf = (booking) =>
  String(booking?.status || booking?.bookingStatus || "pending").toLowerCase();

export default function MyBookings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
    onError: (requestError) => {
      toast.error(
        requestError?.response?.data?.message || "Unable to cancel booking."
      );
    },
  });

  const handleCancel = (booking) => {
    if (
      !window.confirm(
        `Cancel booking ${booking.bookingNumber || booking._id}?`
      )
    ) {
      return;
    }

    cancelMutation.mutate(booking._id);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
          <p className="text-xl font-semibold">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        <p className="font-semibold">
          {error?.response?.data?.message || "Unable to load your bookings."}
        </p>
        <button
          type="button"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] })
          }
          className="mt-4 rounded-lg bg-green-700 px-5 py-2 font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const now = new Date();
  const upcomingTrips = bookings.filter(
    (booking) =>
      booking.travelDate &&
      new Date(booking.travelDate) >= now &&
      bookingStatusOf(booking) !== "cancelled"
  );

  const paidTrips = bookings.filter((booking) =>
    ["paid", "completed"].includes(paymentStatusOf(booking))
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-green-900 to-yellow-600 p-8 text-white shadow-xl">
          <h1 className="text-4xl font-bold">My Adventures</h1>
          <p className="mt-3">
            Manage your bookings, payments and upcoming trips.
          </p>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <SummaryCard title="Total Bookings" value={bookings.length} />
          <SummaryCard title="Upcoming Trips" value={upcomingTrips.length} />
          <SummaryCard title="Paid Trips" value={paidTrips.length} />
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="mb-4 text-3xl font-bold">No Bookings Yet</h2>
            <p className="mb-6 text-gray-600">
              Start exploring Kenya's best destinations.
            </p>
            <Link
              to="/tours"
              className="rounded-xl bg-green-700 px-8 py-3 font-bold text-white"
            >
              Explore Tours
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const status = bookingStatusOf(booking);
              const paymentStatus = paymentStatusOf(booking);

              return (
                <article
                  key={booking._id || booking.bookingNumber}
                  className="rounded-2xl bg-white p-6 shadow"
                >
                  <div className="flex flex-wrap justify-between gap-5">
                    <div>
                      <h2 className="text-2xl font-bold text-green-800">
                        {booking.tour?.title || "Tour Package"}
                      </h2>

                      <p className="mt-2 text-gray-600">
                        Booking Number:{" "}
                        <b>
                          {booking.bookingNumber ||
                            booking._id?.slice?.(-8) ||
                            "N/A"}
                        </b>
                      </p>

                      <p className="text-gray-600">
                        Travel Date:{" "}
                        {booking.travelDate
                          ? new Date(booking.travelDate).toDateString()
                          : "N/A"}
                      </p>

                      <p className="text-gray-600">
                        Travellers:{" "}
                        {booking.travelers?.length ||
                          booking.numberOfGuests ||
                          1}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <StatusBadge value={status} />
                      <StatusBadge value={paymentStatus} payment />
                    </div>
                  </div>

                  <hr className="my-6" />

                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div>
                      <p className="text-gray-500">Total Amount</p>
                      <h3 className="text-xl font-bold">
                        KES{" "}
                        {Number(booking.totalAmount || 0).toLocaleString()}
                      </h3>
                    </div>

                    {status === "completed" && <ReviewForm booking={booking} />}
                    {status !== "cancelled" && status !== "completed" && <RescheduleForm booking={booking} onDone={() => queryClient.invalidateQueries({ queryKey:["my-bookings"] })} />}

                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/bookings/${booking._id}`}
                        className="rounded-xl bg-green-700 px-5 py-2 text-white"
                      >
                        View Trip
                      </Link>

                      {status !== "cancelled" &&
                        status !== "completed" &&
                        paymentStatus !== "paid" && (
                          <PayNowButton booking={booking} user={user} />
                        )}

                      {status !== "cancelled" && status !== "completed" && (
                        <button
                          type="button"
                          disabled={cancelMutation.isPending}
                          onClick={() => handleCancel(booking)}
                          className="rounded-xl bg-red-600 px-5 py-2 text-white disabled:opacity-50"
                        >
                          {cancelMutation.isPending
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
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
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="mt-2 text-4xl font-bold">{value}</h2>
    </div>
  );
}

function StatusBadge({ value, payment = false }) {
  const styles =
    value === "completed" || value === "paid"
      ? "bg-green-100 text-green-700"
      : value === "cancelled" || value === "failed"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`rounded-full px-4 py-2 font-bold capitalize ${styles}`}>
      {payment ? "Payment: " : ""}
      {value}
    </span>
  );
}

function PayNowButton({ booking, user }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    const phone =
      booking.user?.phone ||
      user?.phone ||
      booking.customer?.phone ||
      booking.customerSnapshot?.phone ||
      booking.contact?.phone;

    const amount = Number(
      booking.balanceAmount ??
        Math.max(
          0,
          Number(booking.totalAmount || 0) -
            Number(booking.depositAmount || 0)
        )
    );

    if (!phone) {
      toast.error(
        "No phone number is available. Update your profile phone number first."
      );
      return;
    }

    if (!amount || amount <= 0) {
      toast.info("There is no outstanding balance to pay.");
      return;
    }

    try {
      setLoading(true);

      await initiatePayment({
        bookingId: booking._id,
        phone,
        phoneNumber: phone,
        amount,
      });

      toast.success("M-Pesa payment request sent.");
      window.location.href = `/payment-status/${booking._id}`;
    } catch (error) {
      console.error("MPESA ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "Unable to start M-Pesa payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className="rounded-xl bg-black px-5 py-2 text-white disabled:opacity-50"
    >
      {loading ? "Sending..." : "Pay Now"}
    </button>
  );
}


function RescheduleForm({booking,onDone}){const [date,setDate]=useState("");const [reason,setReason]=useState("");const [open,setOpen]=useState(false);const mutation=useMutation({mutationFn:()=>rescheduleBooking(booking._id,{newTravelDate:date,reason}),onSuccess:()=>{toast.success("Booking rescheduled.");setOpen(false);onDone();},onError:e=>toast.error(e?.response?.data?.message||"Unable to reschedule booking.")});return <div className="w-full rounded-xl border border-sky-100 bg-sky-50 p-4"><button type="button" onClick={()=>setOpen(v=>!v)} className="font-semibold text-sky-800">{open?"Close reschedule":"Postpone / reschedule"}</button>{open&&<div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr_auto]"><input type="date" min={new Date(new Date().setDate(new Date().getDate()+1)).toISOString().slice(0,10)} value={date} onChange={e=>setDate(e.target.value)} className="rounded-lg border p-2"/><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason (optional)" className="rounded-lg border p-2"/><button disabled={!date||mutation.isPending} onClick={()=>mutation.mutate()} className="rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{mutation.isPending?"Saving...":"Reschedule"}</button></div>}</div>}
function ReviewForm({booking}){const [open,setOpen]=useState(false);const [rating,setRating]=useState(5);const [comment,setComment]=useState("");const [title,setTitle]=useState("");const mutation=useMutation({mutationFn:()=>createReview({tour:booking.tour?._id||booking.tour,rating,title,comment}),onSuccess:()=>{toast.success("Review submitted for admin approval.");setOpen(false);},onError:e=>toast.error(e?.response?.data?.message||"Unable to submit review.")});return <div className="w-full rounded-xl border border-amber-100 bg-amber-50 p-4"><button type="button" onClick={()=>setOpen(v=>!v)} className="font-semibold text-amber-800">{open?"Close review":"Leave a review"}</button>{open&&<div className="mt-3 space-y-3"><div className="flex gap-2">{[1,2,3,4,5].map(n=><button type="button" key={n} onClick={()=>setRating(n)} className={`text-2xl ${n<=rating?"text-amber-500":"text-slate-300"}`}>★</button>)}</div><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Review title" className="w-full rounded-lg border p-2"/><textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Tell us about your experience" rows={3} className="w-full rounded-lg border p-2"/><button disabled={!comment.trim()||mutation.isPending} onClick={()=>mutation.mutate()} className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{mutation.isPending?"Submitting...":"Submit review"}</button></div>}</div>}
