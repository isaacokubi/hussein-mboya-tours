import { useSettings } from "../context/SettingsContext";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createBooking,getBookingById } from "../api/bookingApi";
import { initiateMpesa } from "../api/mpesaApi";
import { getTourById } from "../api/tourApi";
import api from "../api/axios";
import { getPublicSettings } from "../api/settingsApi";

export default function Checkout(
) {
  const navigate = useNavigate();
  const { id } = useParams();

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id || "");

  const isBookingCheckout =
    window.location.pathname.includes("/checkout/booking/") ||
    (isMongoId && !window.location.pathname.includes("/checkout/tour/"));

  const isTourCheckout =
    window.location.pathname.includes("/checkout/tour/") ||
    (!isMongoId && Boolean(id));

  const [travelDate, setTravelDate] = useState("");
  const [travellerCount, setTravellerCount] = useState(1);
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentState, setPaymentState] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const { data: publicSettings } = useQuery({ queryKey:["public-settings"], queryFn:getPublicSettings });
  const siteSettings = publicSettings?.settings || publicSettings?.data || {};

  const { data:tourResponse, isLoading:tourLoading } = useQuery({
    queryKey:["tour", id],
    queryFn:()=>getTourById(id),
    enabled:Boolean(id) && isTourCheckout,
});

const { data:bookingResponse, isLoading:bookingLoading } = useQuery({
    queryKey:["checkout-booking", id],
    queryFn:()=>getBookingById(id),
    enabled:isBookingCheckout
});


const tour =
tourResponse?.tour ||
tourResponse?.data?.tour ||
tourResponse?.data ||
tourResponse;


const booking =
bookingResponse?.booking ||
bookingResponse?.data?.booking ||
bookingResponse?.data ||
bookingResponse;


const isCustomBooking =
Boolean(booking?.customTourRequest);

const customSnapshot =
  booking?.customTourSnapshot ||
  booking?.customTourRequest ||
  {};

useEffect(() => {
  if (!isCustomBooking) return;

  setTravelDate(customSnapshot.startDate || "");
  setTravellerCount(Number(customSnapshot.people || 1));
  setPickupLocation(customSnapshot.pickupLocation || "");
  setPickupTime(customSnapshot.pickupTime || "");
  setHotelName(customSnapshot.accommodationPreference || "");
  setSpecialRequests(customSnapshot.specialRequests || "");

}, [isCustomBooking, bookingResponse]);

  

console.log("CHECKOUT DEBUG FULL", JSON.stringify({
   id,
   idType: typeof id,
   tourResponse,
   bookingResponse,
   tour,
   booking,
   isCustomBooking
  }, null, 2));

const availableSlots = isCustomBooking
    ? 999
    : Number(
        tour?.availableSlots ??
          Math.max(
            Number(tour?.totalSlots ?? tour?.capacity ?? 0) -
              Number(tour?.bookedSlots ?? 0),
            0
          )
      );

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async (response) => {
      const booking = response?.data?.booking || response?.booking || response;

      try {
        if (!booking?._id) {
          throw new Error("Booking ID was not returned.");
        }

        if (paymentMethod === "stripe") {
          const stripe = await api.post("/payments/stripe/checkout", {
            bookingId: booking._id,
            amount: Number(booking.totalAmount || 0),
            origin: window.location.origin,
          });

          if (!stripe.data?.url) {
            throw new Error(stripe.data?.message || "Unable to start Stripe checkout.");
          }

          window.location.href = stripe.data.url;
          return;
        }

        if (paymentMethod === "bank") {
          await api.post("/payments/stripe/bank-transfer", {
            bookingId: booking._id,
            amount: Number(booking.totalAmount || 0),
          });

          toast.success("Booking created. Bank transfer instructions are available in your booking.");
          navigate("/my-bookings");
          return;
        }

        const paymentResponse = await initiateMpesa({
          bookingId: booking._id,
          phoneNumber: phone,
          amount: Number(booking.totalAmount || 0),
        });

        const checkoutRequestId =
          paymentResponse?.data?.CheckoutRequestID ||
          paymentResponse?.data?.checkoutRequestID ||
          paymentResponse?.CheckoutRequestID ||
          paymentResponse?.checkoutRequestID;

        if (!checkoutRequestId) {
          throw new Error("M-Pesa request was not accepted. Please try again.");
        }

        setPaymentState({
          bookingId: booking._id,
          checkoutRequestId,
          status: "pending",
          message: "M-Pesa prompt sent. Check your phone and enter your M-Pesa PIN.",
        });

        toast.success("M-Pesa prompt sent. Redirecting you to your bookings...");
        window.setTimeout(() => navigate("/my-bookings"), 1800);
      } catch (paymentError) {
        toast.error(
          paymentError?.response?.data?.message ||
            paymentError?.message ||
            "Booking created, but payment initiation failed. You can pay from My Bookings."
        );

        if (booking?._id) {
          navigate(`/bookings/${booking._id}`);
        } else {
          navigate("/my-bookings");
        }
      }
    },
    onError: (requestError) => {
      toast.error(
        requestError?.response?.data?.message || "Booking failed."
      );
    },
  });

  if (tourLoading || bookingLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading tour...</div>;
  }

  if ((!tour?._id && !booking?._id)) {
    return <div className="flex min-h-screen items-center justify-center text-red-600">Tour not found.</div>;
  }

const displayTravelDate =
  customSnapshot.startDate ||
  booking?.travelDate ||
  travelDate;

const displayTravellers =
  customSnapshot.people ||
  booking?.numberOfGuests ||
  travellerCount;

const displayPickupLocation =
  customSnapshot.pickupLocation ||
  booking?.pickupLocation ||
  pickupLocation;

const displayPickupTime =
  customSnapshot.pickupTime ||
  booking?.pickupTime ||
  pickupTime;

const displayHotel =
  customSnapshot.accommodationPreference ||
  booking?.hotelName ||
  hotelName;

const displayRoom =
  booking?.roomNumber ||
  roomNumber;

const displaySpecialRequests =
  customSnapshot.specialRequests ||
  customSnapshot.requirements ||
  booking?.specialRequests ||
  specialRequests;

const total =
isCustomBooking
?
Number(booking.totalAmount || 0)
:
Number(tour.price || 0) * Number(travellerCount);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!travelDate) return toast.error("Please select a travel date.");
    if (!phone) return toast.error("Please enter your phone number.");
    const finalPickupLocation =
      pickupLocation.trim() ||
      String(displayPickupLocation || "").trim();

    const finalPickupTime =
      pickupTime ||
      displayPickupTime;

    if (!finalPickupLocation) {
      return toast.error("Please enter the exact pickup location.");
    }

    if (!finalPickupTime) {
      return toast.error("Please select the pickup time.");
    }
    if (!isCustomBooking && (travellerCount < 1 || travellerCount > availableSlots)) {
      return toast.error(`Only ${availableSlots} slot(s) are currently available.`);
    }

    const travelers = Array.from({ length: Number(travellerCount) }, (_, index) => ({
      name: `Traveller ${index + 1}`,
      age: 0,
      passportNumber: "",
    }));

    bookingMutation.mutate({
      ...(isCustomBooking
        ? { customTourRequest: booking.customTourRequest?._id || booking.customTourRequest }
        : { tour: tour._id }),
      travelDate,
      travelers,
      numberOfGuests: Number(travellerCount),
      contact: { phone },
      pickupLocation: finalPickupLocation,
      pickupTime: finalPickupTime,
      hotelName: hotelName.trim(),
      roomNumber: roomNumber.trim(),
      specialRequests: specialRequests
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      paymentMethod: "MPESA",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">Complete Booking</h1>
        <p className="mb-6 text-gray-500">Provide your trip and pickup details so the operations team can prepare your tour.</p>

        <div className="mb-6 rounded-xl bg-gray-100 p-5">
          <h2 className="text-xl font-semibold">
{isCustomBooking
? booking.title || "Custom Tour"
: tour?.title || "Custom Tour"}
</h2>
          <p className="mt-2 text-gray-600">
{isCustomBooking
? booking?.customTourRequest?.requirements || "Custom tour package"
: tour?.description}
</p>
          <div className="mt-4 flex flex-wrap gap-5 font-semibold">
            <span className="text-green-700">
KES {Number(isCustomBooking ? booking?.totalAmount || 0 : tour?.price || 0).toLocaleString()}
</span>
            <span>Total slots: {isCustomBooking ? "Unlimited" : tour?.totalSlots ?? tour?.capacity ?? 0}</span>
            <span>Booked: {isCustomBooking ? 0 : tour?.bookedSlots ?? 0}</span>
            <span className={availableSlots > 0 ? "text-green-700" : "text-red-600"}>
Available: {isCustomBooking ? "Available" : availableSlots}
</span>
          </div>
        </div>

        {paymentState && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${paymentState.status === "completed" ? "bg-emerald-600 text-white" : paymentState.status === "failed" ? "bg-red-600 text-white" : "bg-amber-400 text-white"}`}>
                {paymentState.status === "completed" ? "✓" : paymentState.status === "failed" ? "!" : "M"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {paymentState.status === "completed" ? "Payment Confirmed" : paymentState.status === "failed" ? "Payment Not Completed" : "Check Your Phone"}
                </h2>
                <p className="mt-1 text-slate-700">{paymentState.message}</p>
                {paymentState.status !== "completed" && (
                  <p className="mt-2 text-sm font-semibold text-emerald-800">
                    An M-Pesa prompt should appear on {phone}. Enter your M-Pesa PIN to authorize the payment.
                  </p>
                )}
                {paymentState.status === "timeout" && (
                  <button type="button" onClick={() => navigate(`/bookings/${paymentState.bookingId}`)} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                    View Booking Status
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border bg-white p-4"><p className="mb-3 font-semibold">Payment method</p><div className="grid gap-3 sm:grid-cols-3">{[["mpesa","M-Pesa"],["stripe","Card / Stripe"],["bank","Bank transfer"]].map(([value,label])=><label key={value} className={`cursor-pointer rounded-xl border p-3 ${paymentMethod===value?"border-emerald-600 bg-emerald-50":""}`}><input type="radio" name="paymentMethod" value={value} checked={paymentMethod===value} onChange={e=>setPaymentMethod(e.target.value)} className="mr-2"/>{label}</label>)}</div></div>
{paymentMethod === "bank" && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"><p className="font-bold">Bank transfer instructions</p><p>Bank: {siteSettings.bankName || "Contact the company for bank details"}</p>{siteSettings.bankAccountName && <p>Account name: {siteSettings.bankAccountName}</p>}{siteSettings.bankAccountNumber && <p>Account number: {siteSettings.bankAccountNumber}</p>}{siteSettings.bankBranch && <p>Branch: {siteSettings.bankBranch}</p>}{siteSettings.bankSwiftCode && <p>SWIFT/BIC: {siteSettings.bankSwiftCode}</p>}<p className="mt-2">After transferring, the company will verify and confirm the payment.</p></div>}

<form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Travel date" required>
              <input type="date" value={travelDate || displayTravelDate} onChange={(e)=>setTravelDate(e.target.value)} className="w-full rounded-lg border p-3" required />
            </Field>

            <Field label="Number of travellers" required>
              <input type="number" min="1" max={Math.max(availableSlots, 1)} value={displayTravellers} className="w-full rounded-lg border p-3 bg-gray-100 cursor-not-allowed" readOnly required />
            </Field>
          </div>

          <Field label="Exact pickup location" required hint="Hotel, apartment, airport terminal, landmark or full address.">
            <input value={pickupLocation || displayPickupLocation} onChange={(e)=>setPickupLocation(e.target.value)} placeholder="e.g. Sarova Stanley, Nairobi CBD" className="w-full rounded-lg border p-3" required />
          </Field>

          <Field label="Pickup time" required>
            <input type="datetime-local" value={pickupTime || displayPickupTime} onChange={(e)=>setPickupTime(e.target.value)} className="w-full rounded-lg border p-3" required />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Hotel / accommodation">
              <input value={hotelName || displayHotel} onChange={(e)=>setHotelName(e.target.value)} placeholder="Hotel or accommodation name" className="w-full rounded-lg border p-3" />
            </Field>
            <Field label="Room number">
              <input value={roomNumber || displayRoom} onChange={(e)=>setRoomNumber(e.target.value)} placeholder="Optional" className="w-full rounded-lg border p-3" />
            </Field>
          </div>

          <Field label="M-Pesa phone number" required>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" className="w-full rounded-lg border p-3" required />
          </Field>

          <Field label="Special requests" hint="One request per line.">
            <textarea value={specialRequests || displaySpecialRequests} onChange={(e)=>setSpecialRequests(e.target.value)} rows={4} placeholder="Dietary needs, accessibility, celebration, child seat, etc." className="w-full rounded-lg border p-3" />
          </Field>

          <div className="rounded-xl bg-green-50 p-4 text-xl font-bold text-green-900">
            Total: KES {total.toLocaleString()}
          </div>

          <button type="submit" disabled={bookingMutation.isPending || availableSlots < 1} className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            {bookingMutation.isPending ? "Processing..." : availableSlots < 1 ? "Tour Fully Booked" : "Book & Continue to Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 block font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
