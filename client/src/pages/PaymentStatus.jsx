import { useSettings } from "../context/SettingsContext";
import { useParams, useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { toast } from "react-toastify";

import { getBooking } from "../api/bookingApi";

export default function PaymentStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const { data, isLoading, error } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => getBooking(id),
    refetchInterval: 5000,
    enabled: !!id,
  });

  const booking = data?.booking || data;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="text-center"><div className="animate-spin h-12 w-12 border-4 border-green-700 border-t-transparent rounded-full mx-auto mb-5" /><h2 className="text-xl font-semibold">Checking M-Pesa payment...</h2></div></div>;
  }

  if (error || !booking) {
    toast.error("Unable to verify payment");
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="bg-white shadow rounded-xl p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Payment Verification Failed</h1><p className="mt-3">We could not find your booking.</p><button onClick={() => navigate("/my-bookings")} className="mt-5 bg-green-700 text-white px-6 py-3 rounded-lg">View My Bookings</button></div></div>;
  }

  const status = (typeof booking.paymentStatus === "object" ? (booking.paymentStatus.paymentStatus || booking.paymentStatus.status || "pending") : booking.paymentStatus || "pending").toLowerCase();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
        {status === "paid" || status === "completed" ? (
          <>
            <div className="text-6xl mb-5">🎉</div>
            <h1 className="text-4xl font-bold text-green-600">Payment Successful</h1>
            <p className="mt-4 text-gray-600">Your {settings?.companyName || "Company"} booking has been confirmed.</p>
            <div className="bg-green-50 rounded-xl p-5 mt-6 text-left">
              <p>Booking Number: <strong>{booking.bookingNumber || booking._id?.slice(-8)}</strong></p>
              <p className="mt-2">Tour: {booking.tour?.title || "Tour Package"}</p>
            </div>
            <button onClick={() => navigate("/my-bookings")} className="mt-6 bg-green-700 text-white px-8 py-3 rounded-xl font-bold">View My Trips</button>
          </>
        ) : status === "failed" || status === "cancelled" ? (
          <>
            <div className="text-6xl mb-5">❌</div>
            <h1 className="text-3xl font-bold text-red-600">Payment Failed</h1>
            <p className="mt-4 text-gray-600">Your payment was not completed.</p>
            <button onClick={() => navigate("/my-bookings")} className="mt-6 bg-gray-800 text-white px-8 py-3 rounded-xl font-bold">View My Bookings</button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-5">⏳</div>
            <h1 className="text-3xl font-bold text-yellow-600">Payment Pending</h1>
            <p className="mt-4 text-gray-600">We are still waiting for payment confirmation.</p>
            <button onClick={() => navigate("/my-bookings")} className="mt-6 bg-green-700 text-white px-8 py-3 rounded-xl font-bold">View My Bookings</button>
          </>
        )}
      </div>
    </div>
  );
}
