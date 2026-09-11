import { useSettings } from "../context/SettingsContext";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getBooking } from "../api/bookingApi";
import { getHospitalityPayments } from "../api/hospitalityPaymentApi";

export default function PaymentStatus() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const hospitalityType = searchParams.get("hospitalityType") || searchParams.get("type");
  const stripeSession = searchParams.get("stripe_session");
  const { settings = {} } = useSettings() || {};
  const navigate = useNavigate();
  const hospitality = !!hospitalityType;
  const { data, isLoading, error } = useQuery({ queryKey: [hospitality ? "hospitality-payment" : "payment", id, hospitalityType, stripeSession], queryFn: async () => hospitality ? getHospitalityPayments({ bookingId: id, type: hospitalityType }) : getBooking(id), refetchInterval: 5000, enabled: !!id });
  const booking = hospitality ? data?.data?.booking : (data?.booking || data);
  const invoice = hospitality ? data?.data?.invoice : null;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="text-center"><div className="animate-spin h-12 w-12 border-4 border-green-700 border-t-transparent rounded-full mx-auto mb-5" /><h2 className="text-xl font-semibold">Checking payment status...</h2></div></div>;
  if (error || !booking) { toast.error("Unable to verify payment"); return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="bg-white shadow rounded-xl p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Payment Verification Failed</h1><p className="mt-3">We could not find your reservation.</p><button onClick={() => navigate(hospitality ? "/hotels" : "/my-bookings")} className="mt-5 bg-green-700 text-white px-6 py-3 rounded-lg">Continue</button></div></div>; }
  const status = (typeof booking.paymentStatus === "object" ? (booking.paymentStatus.paymentStatus || booking.paymentStatus.status || "pending") : booking.paymentStatus || "pending").toLowerCase();
  const label = hospitalityType === "hotel" ? "hotel reservation" : hospitalityType === "airport_transfer" ? "airport transfer" : "tour booking";
  return <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6"><div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
    {status === "paid" || status === "completed" ? <><div className="text-6xl mb-5">🎉</div><h1 className="text-4xl font-bold text-green-600">Payment Successful</h1><p className="mt-4 text-gray-600">Your {settings.companyName || "Company"} {label} is financially settled.</p><div className="bg-green-50 rounded-xl p-5 mt-6 text-left"><p>Reference: <strong>{booking.reference || booking.bookingNumber || booking._id?.slice(-8)}</strong></p>{invoice?.invoiceNumber && <p className="mt-2">Invoice: <strong>{invoice.invoiceNumber}</strong></p>}<p className="mt-2">Paid: <strong>KES {Number(data?.data?.paidAmount || 0).toLocaleString()}</strong></p></div><button onClick={() => navigate(hospitality ? (hospitalityType === "hotel" ? "/hotels" : "/airport-transfers") : "/my-bookings")} className="mt-6 bg-green-700 text-white px-8 py-3 rounded-xl font-bold">Continue</button></>
      : status === "failed" || status === "cancelled" ? <><div className="text-6xl mb-5">❌</div><h1 className="text-3xl font-bold text-red-600">Payment Failed</h1><p className="mt-3 text-gray-600">The payment was not completed. You can retry using another payment method.</p><button onClick={() => navigate(hospitality ? (hospitalityType === "hotel" ? "/hotels" : "/airport-transfers") : `/checkout/booking/${booking._id}`)} className="mt-6 bg-yellow-600 text-white px-6 py-3 rounded-xl">Retry</button></>
      : <><div className="text-6xl mb-5">⏳</div><h1 className="text-3xl font-bold">Payment Pending</h1><p className="mt-4 text-gray-600">Your {label} payment is still being processed or awaiting bank verification.</p><div className="mt-6 bg-yellow-50 rounded-xl p-4"><p className="font-semibold">Payment Status</p><p className="capitalize text-yellow-700 font-bold">{status}</p><p className="mt-2 text-sm text-gray-600">Balance: KES {Number(data?.data?.balance ?? invoice?.balance ?? booking.totalAmount || 0).toLocaleString()}</p></div></>}
  </div></div>;
}
