import { useSettings } from "../context/SettingsContext";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createBooking,getBookingById,cancelBooking } from "../api/bookingApi";
import { initiateMpesa, checkPaymentStatus } from "../api/mpesaApi";
import { getTourById } from "../api/tourApi";
import api from "../api/axios";
import { getPublicSettings } from "../api/settingsApi";

export default function Checkout(
) {
  const navigate = useNavigate();
  const { id } = useParams();

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id || "");

  const isBookingCheckout =
    window.location.pathname.includes("/checkout/booking/");

  const isTourCheckout =
    window.location.pathname.includes("/checkout/tour/") ||
    Boolean(id);

  const [travelDate, setTravelDate] = useState("");
  const [travellerCount, setTravellerCount] = useState(1);
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentState, setPaymentState] = useState(null);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [createdBookingId, setCreatedBookingId] = useState(null);
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
    enabled:isBookingCheckout && Boolean(id)
});


const rawTour =
  tourResponse?.data?.data ||
  tourResponse?.data?.tour ||
  tourResponse?.data ||
  tourResponse?.tour ||
  tourResponse ||
  null;


const sourceTour =
  rawTour ||
  bookingResponse?.data?.booking?.tour ||
  bookingResponse?.booking?.tour ||
  null;


const tour = sourceTour
  ? {
      ...sourceTour,

      price:
        sourceTour?.price ??
        sourceTour?.tourPrice ??
        0,

      totalSlots:
        sourceTour?.availabilitySettings?.totalSlots ??
        sourceTour?.totalSlots ??
        sourceTour?.capacity ??
        0,

      bookedSlots:
        sourceTour?.availabilitySettings?.bookedSlots ??
        sourceTour?.bookedSlots ??
        0,

      availableSlots:
        Math.max(
          Number(
            sourceTour?.availabilitySettings?.totalSlots ??
            sourceTour?.totalSlots ??
            sourceTour?.capacity ??
            0
          )
          -
          Number(
            sourceTour?.availabilitySettings?.bookedSlots ??
            sourceTour?.bookedSlots ??
            0
          ),
          0
        )
    }
  : null;


const booking =
bookingResponse?.booking ||
bookingResponse?.data?.booking ||
bookingResponse?.data ||
bookingResponse;


console.log("AI CHECKOUT DATA", {
  url: window.location.pathname,
  id,
  isTourCheckout,
  isBookingCheckout,
  tourResponse,
  tour,
  slots: tour?.availabilitySettings
});


const isCustomBooking =
  isBookingCheckout &&
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
  : Number(tour?.availableSlots ?? 0);

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async (response, variables) => {
      const booking = response?.data?.booking || response?.booking || response;
      const selectedPaymentMethod = String(
        variables?.paymentMethod || paymentMethod || ""
      ).toLowerCase();

      const normalizedPhone = variables?.normalizedPhone;

      setCreatedBookingId(booking?._id);

      try {
        if (!booking?._id) {
          throw new Error("Booking ID was not returned.");
        }

        if (selectedPaymentMethod === "stripe") {
          const stripe = await api.post("/payments/stripe/checkout", {
            bookingId: booking._id,
            origin: window.location.origin,
          });

          if (!stripe.data?.url) {
            throw new Error(stripe.data?.message || "Unable to start Stripe checkout.");
          }

          window.location.href = stripe.data.url;
          return;
        }

        if (selectedPaymentMethod === "bank") {
          await api.post("/payments/stripe/bank-transfer", {
            bookingId: booking._id,
          });

          toast.success("Booking created. Bank transfer instructions are available in your booking.");
          navigate("/my-bookings");
          return;
        }

        if (!normalizedPhone) {
          throw new Error("M-Pesa phone number is missing.");
        }

        console.log(
          "M-PESA PAYMENT PHONE:",
          normalizedPhone
        );

        const paymentResponse = await initiateMpesa({
          bookingId: booking._id,
          phoneNumber: normalizedPhone,
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
    onError: async (requestError) => {

      try {

        const bookingId =
          createdBookingId ||
          requestError?.bookingId ||
          requestError?.response?.data?.bookingId;

        if (bookingId) {
          await cancelBooking(bookingId);
        }

      } catch (cancelError) {

        console.error(
          "Failed to cancel booking:",
          cancelError
        );

      }

      toast.error(
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Payment failed. Booking cancelled."
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
Number(tour?.price || 0) * Number(travellerCount);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!travelDate) return toast.error("Please select a travel date.");

    let normalizedPhone = "";
    let rawPhone = String(phone || "").trim();

    if (paymentMethod === "mpesa") {
      if (!rawPhone) {
        return toast.error("Please enter your M-Pesa phone number.");
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE AND NORMALIZE M-PESA PHONE NUMBER
      |--------------------------------------------------------------------------
      |
      | Accepted:
      | 0707476586
      | 0700000000
      | 0100000000
      | 0110000000
      | +254707476586
      | 254707476586
      |
      | Backend receives:
      | 254707476586
      |--------------------------------------------------------------------------
      */

      normalizedPhone = rawPhone.replace(/\D/g, "");

      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = `254${normalizedPhone.substring(1)}`;
      }

      if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
        return toast.error(
          "Enter a valid Safaricom phone number, e.g. 0707476586."
        );
      }
    }

    if (!total || Number(total) <= 0) {
      return toast.error("Invalid booking amount.");
    }
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
      subtotal: Number(total),
      totalAmount: Number(total),
      contact: {
        ...(paymentMethod === "mpesa" && {
          phone: rawPhone,
        }),
      },
      pickupLocation: finalPickupLocation,
      pickupTime: finalPickupTime,
      hotelName: hotelName.trim(),
      roomNumber: roomNumber.trim(),
      specialRequests: specialRequests
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      paymentMethod:
        paymentMethod === "mpesa"
          ? "MPESA"
          : paymentMethod === "stripe"
          ? "CARD"
          : "BANK_TRANSFER",
      ...(paymentMethod === "mpesa" && {
        normalizedPhone,
      }),
    });
  };


  /*
  |--------------------------------------------------------------------------
  | M-PESA PAYMENT STATUS POLLING
  |--------------------------------------------------------------------------
  |
  | The M-Pesa callback on the server is the authoritative source.
  | The browser simply polls the server until that callback updates
  | the Payment document.
  |
  */

  useEffect(() => {

    if (
      !paymentState?.checkoutRequestId ||
      !paymentState?.bookingId ||
      paymentState.status !== "pending"
    ) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const maxAttempts = 60;
    const intervalMs = 3000;

    setPaymentPolling(true);

    const pollPayment = async () => {

      if (cancelled) {
        return;
      }

      attempts += 1;

      try {

        const response = await checkPaymentStatus(
          paymentState.checkoutRequestId
        );

        const data =
          response?.data ||
          response ||
          {};

        const payment =
          data?.payment ||
          response?.payment ||
          null;

        const booking =
          data?.booking ||
          response?.booking ||
          payment?.booking ||
          null;

        const status = String(
          data?.status ||
          payment?.status ||
          "pending"
        ).toLowerCase();

        const failureReason =
          payment?.failureReason ||
          data?.failureReason ||
          "M-Pesa payment was not completed.";

        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        if (status === "completed") {

          if (cancelled) {
            return;
          }

          setPaymentPolling(false);

          setPaymentState((current) => ({
            ...current,
            status: "completed",
            bookingId:
              booking?._id ||
              current?.bookingId,
            message:
              "Payment received successfully. Your booking has been confirmed.",
            mpesaReceiptNumber:
              payment?.mpesaReceiptNumber ||
              payment?.transactionId ||
              "",
          }));

          toast.success(
            "M-Pesa payment confirmed successfully."
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | FAILED
        |--------------------------------------------------------------------------
        */

        if (
          status === "failed" ||
          status === "cancelled"
        ) {

          if (cancelled) {
            return;
          }

          setPaymentPolling(false);

          setPaymentState((current) => ({
            ...current,
            status,
            message:
              failureReason ||
              "M-Pesa payment was not completed.",
            failureReason,
          }));

          toast.error(
            failureReason ||
            "M-Pesa payment failed."
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | TIMEOUT
        |--------------------------------------------------------------------------
        */

        if (attempts >= maxAttempts) {

          setPaymentPolling(false);

          setPaymentState((current) => ({
            ...current,
            status: "timeout",
            message:
              "We have not received M-Pesa confirmation yet. You can check the booking status or retry the payment.",
          }));

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | CONTINUE POLLING
        |--------------------------------------------------------------------------
        */

        if (!cancelled) {
          window.setTimeout(
            pollPayment,
            intervalMs
          );
        }

      } catch (error) {

        console.warn(
          "M-Pesa status polling error:",
          error
        );

        if (attempts >= maxAttempts) {

          setPaymentPolling(false);

          setPaymentState((current) => ({
            ...current,
            status: "timeout",
            message:
              "We could not receive M-Pesa confirmation. Please check your booking status.",
          }));

          return;
        }

        if (!cancelled) {
          window.setTimeout(
            pollPayment,
            intervalMs
          );
        }
      }
    };

    pollPayment();

    return () => {

      cancelled = true;

    };

  }, [
    paymentState?.checkoutRequestId,
    paymentState?.bookingId,
    paymentState?.status,
  ]);

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
KES {Number(
  tour?.price ||
  booking?.totalAmount ||
  0
).toLocaleString()}
</span>
            <span>
Total slots: {
  tour?.totalSlots ?? 0
}
</span>
            <span>
Booked: {
  tour?.bookedSlots ?? 0
}
</span>
            <span className={availableSlots > 0 ? "text-green-700" : "text-red-600"}>
Available: {availableSlots}
</span>
          </div>
        </div>

        {paymentState && (
          <div
            className={`mb-6 rounded-2xl border p-5 shadow-sm ${
              paymentState.status === "completed"
                ? "border-emerald-200 bg-emerald-50"
                : paymentState.status === "failed" ||
                  paymentState.status === "cancelled"
                ? "border-red-200 bg-red-50"
                : paymentState.status === "timeout"
                ? "border-orange-200 bg-orange-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex items-start gap-4">

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${
                  paymentState.status === "completed"
                    ? "bg-emerald-600 text-white"
                    : paymentState.status === "failed" ||
                      paymentState.status === "cancelled"
                    ? "bg-red-600 text-white"
                    : paymentState.status === "timeout"
                    ? "bg-orange-500 text-white"
                    : "bg-amber-400 text-white"
                }`}
              >
                {paymentState.status === "completed"
                  ? "✓"
                  : paymentState.status === "failed" ||
                    paymentState.status === "cancelled"
                  ? "!"
                  : paymentState.status === "timeout"
                  ? "?"
                  : "M"}
              </div>

              <div className="min-w-0 flex-1">

                <h2 className="text-lg font-bold text-slate-900">

                  {paymentState.status === "completed"
                    ? "Payment Successful"
                    : paymentState.status === "failed" ||
                      paymentState.status === "cancelled"
                    ? "Payment Failed"
                    : paymentState.status === "timeout"
                    ? "Payment Verification Taking Too Long"
                    : "Waiting for M-Pesa Payment"}

                </h2>

                <p className="mt-1 text-slate-700">
                  {paymentState.message}
                </p>

                {paymentState.status === "pending" && (
                  <div className="mt-4">

                    <p className="text-sm font-semibold text-amber-800">
                      Check your phone and enter your M-Pesa PIN.
                    </p>

                    {paymentPolling && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
                        <span>
                          Waiting for M-Pesa confirmation...
                        </span>
                      </div>
                    )}

                  </div>
                )}

                {paymentState.failureReason && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-white p-3 text-sm">
                    <p className="font-bold text-red-700">
                      M-Pesa response
                    </p>

                    <p className="mt-1 text-slate-700">
                      {paymentState.failureReason}
                    </p>
                  </div>
                )}

                {paymentState.status === "completed" && (
                  <div className="mt-4">

                    {paymentState.mpesaReceiptNumber && (
                      <p className="text-sm text-slate-600">
                        M-Pesa Receipt:{" "}
                        <strong>
                          {paymentState.mpesaReceiptNumber}
                        </strong>
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/bookings/${paymentState.bookingId}`
                        )
                      }
                      className="mt-4 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                      View Booking
                    </button>

                  </div>
                )}

                {(paymentState.status === "failed" ||
                  paymentState.status === "cancelled") && (
                  <div className="mt-4 flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentState(null);
                        setPaymentPolling(false);
                      }}
                      className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
                    >
                      Retry Payment
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/bookings/${paymentState.bookingId}`
                        )
                      }
                      className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      View Booking
                    </button>

                  </div>
                )}

                {paymentState.status === "timeout" && (
                  <div className="mt-4 flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/bookings/${paymentState.bookingId}`
                        )
                      }
                      className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      View Booking Status
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentState(null);
                        setPaymentPolling(false);
                      }}
                      className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
                    >
                      Retry Payment
                    </button>

                  </div>
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
              <input
  type="number"
  min="1"
  max={Math.max(availableSlots, 1)}
  value={travellerCount}
  onChange={(e)=>setTravellerCount(Number(e.target.value))}
  className="w-full rounded-lg border p-3"
  required
/>
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

          {paymentMethod === "mpesa" && (
            <Field
              label="M-Pesa phone number"
              required
              hint="Use a Safaricom number registered for M-Pesa."
            >
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678"
                className="w-full rounded-lg border p-3"
                required
                autoComplete="tel"
              />
            </Field>
          )}

          <Field label="Special requests" hint="One request per line.">
            <textarea value={specialRequests || displaySpecialRequests} onChange={(e)=>setSpecialRequests(e.target.value)} rows={4} placeholder="Dietary needs, accessibility, celebration, child seat, etc." className="w-full rounded-lg border p-3" />
          </Field>

          <div className="rounded-xl bg-green-50 p-4 text-xl font-bold text-green-900">
            Total: KES {total.toLocaleString()}
          </div>

          <button type="submit" disabled={
  bookingMutation.isPending ||
  (!isCustomBooking && availableSlots < 1)
} className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
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
