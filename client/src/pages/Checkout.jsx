import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createBooking, getBookingById } from "../api/bookingApi";
import { initiateMpesa, checkPaymentStatus } from "../api/mpesaApi";
import { getTourById } from "../api/tourApi";
import api from "../api/axios";
import { getPublicSettings } from "../api/settingsApi";

const normalize = (value) => String(value || "").trim();

const normalizeMpesaPhone = (value) => {
  let phone = String(value || "").replace(/\D/g, "");
  if (phone.startsWith("0")) phone = `254${phone.slice(1)}`;
  if (phone.startsWith("7") || phone.startsWith("1")) phone = `254${phone}`;
  return phone;
};

const isValidMpesaPhone = (value) => /^254[17]\d{8}$/.test(value);

const extractBooking = (response) =>
  response?.data?.booking ||
  response?.booking ||
  response?.data ||
  response ||
  null;

const extractTour = (response) =>
  response?.data?.data ||
  response?.data?.tour ||
  response?.data ||
  response?.tour ||
  response ||
  null;

export default function Checkout() {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const isBookingCheckout = type === "booking";
  const isTourCheckout = type === "tour";

  const [travelDate, setTravelDate] = useState("");
  const [travellerCount, setTravellerCount] = useState(1);
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentState, setPaymentState] = useState(null);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);

  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: getPublicSettings,
  });

  const siteSettings = publicSettings?.settings || publicSettings?.data || {};

  const { data: tourResponse, isLoading: tourLoading } = useQuery({
    queryKey: ["checkout-tour", id],
    queryFn: () => getTourById(id),
    enabled: isTourCheckout && Boolean(id),
  });

  const { data: bookingResponse, isLoading: bookingLoading } = useQuery({
    queryKey: ["checkout-booking", id],
    queryFn: () => getBookingById(id),
    enabled: isBookingCheckout && Boolean(id),
  });

  const tour = useMemo(() => {
    const source = extractTour(tourResponse);
    if (!source?._id) return null;
    const totalSlots = Number(
      source?.availabilitySettings?.totalSlots ?? source?.totalSlots ?? source?.capacity ?? 0
    );
    const bookedSlots = Number(
      source?.availabilitySettings?.bookedSlots ?? source?.bookedSlots ?? 0
    );
    return {
      ...source,
      price: Number(source?.price ?? source?.tourPrice ?? 0),
      totalSlots,
      bookedSlots,
      availableSlots: Math.max(totalSlots - bookedSlots, 0),
    };
  }, [tourResponse]);

  const booking = useMemo(() => extractBooking(bookingResponse), [bookingResponse]);
  const customSnapshot = booking?.customTourSnapshot || booking?.customTourRequest || {};
  const isCustomBooking = isBookingCheckout && Boolean(booking?.customTourRequest);

  const total = isCustomBooking
    ? Number(booking?.totalAmount ?? booking?.quotedAmount ?? booking?.quotedTotal ?? 0)
    : Number(tour?.price ?? 0) * Number(travellerCount);

  const amountPaid = isBookingCheckout
    ? Number(
        booking?.amountPaid ??
          booking?.paidAmount ??
          booking?.depositAmount ??
          booking?.paymentSummary?.paid ??
          0
      )
    : 0;

  const balance = Math.max(total - amountPaid, 0);

  useEffect(() => {
    if (!booking) return;
    setTravelDate(booking?.travelDate || customSnapshot?.startDate || "");
    setTravellerCount(Number(booking?.numberOfGuests || customSnapshot?.people || 1));
    setPhone(
      booking?.contact?.phone ||
        booking?.phone ||
        booking?.customer?.phone ||
        booking?.user?.phone ||
        ""
    );
    setPickupLocation(booking?.pickupLocation || customSnapshot?.pickupLocation || "");
    setPickupTime(booking?.pickupTime || customSnapshot?.pickupTime || "");
    setHotelName(booking?.hotelName || customSnapshot?.accommodationPreference || "");
    setRoomNumber(booking?.roomNumber || "");
    setSpecialRequests(
      Array.isArray(booking?.specialRequests)
        ? booking.specialRequests.join("\n")
        : booking?.specialRequests || customSnapshot?.specialRequests || customSnapshot?.requirements || ""
    );
  }, [booking, customSnapshot]);

  useEffect(() => {
    if (balance <= 0) {
      setPaymentAmount("");
      return;
    }
    setPaymentAmount((current) => {
      const numeric = Number(current);
      return numeric > 0 && numeric <= balance ? String(numeric) : String(balance);
    });
  }, [balance]);

  const startMpesa = async (bookingId, rawPhone, requestedAmount) => {
    const normalizedPhone = normalizeMpesaPhone(rawPhone);
    if (!isValidMpesaPhone(normalizedPhone)) {
      throw new Error("Enter a valid Safaricom M-Pesa number, e.g. 0707476586.");
    }

    const amount = Number(requestedAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > balance) {
      throw new Error(`Enter an amount between KES 1 and KES ${balance.toLocaleString()}.`);
    }

    const response = await initiateMpesa({
      bookingId,
      phoneNumber: normalizedPhone,
      amount,
    });

    const checkoutRequestId =
      response?.data?.CheckoutRequestID ||
      response?.data?.checkoutRequestID ||
      response?.CheckoutRequestID ||
      response?.checkoutRequestID;

    if (!checkoutRequestId) {
      throw new Error(response?.data?.message || "M-Pesa checkout could not be started.");
    }

    setPaymentState({
      bookingId,
      checkoutRequestId,
      amount,
      status: "pending",
      message: `M-Pesa prompt sent for KES ${amount.toLocaleString()}. Check your phone and enter your M-Pesa PIN.`,
    });
    toast.success(`M-Pesa prompt sent for KES ${amount.toLocaleString()}. Enter your PIN on your phone.`);
  };

  const paymentMutation = useMutation({
    mutationFn: async ({ bookingId, method, phoneNumber, amount }) => {
      if (method === "mpesa") {
        await startMpesa(bookingId, phoneNumber, amount);
        return { bookingId };
      }

      if (method === "stripe") {
        const response = await api.post("/payments/stripe/checkout", {
          bookingId,
          amount,
          origin: window.location.origin,
        });
        if (!response.data?.url) {
          throw new Error(response.data?.message || "Unable to start card checkout.");
        }
        window.location.href = response.data.url;
        return { bookingId };
      }

      await api.post("/payments/stripe/bank-transfer", { bookingId, amount });
      return { bookingId };
    },
    onSuccess: ({ bookingId }) => {
      if (paymentMethod === "bank") {
        toast.success("Payment instruction recorded. Your booking remains active until the balance is fully paid.");
        navigate(`/bookings/${bookingId}`);
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Unable to start payment.");
    },
  });

  useEffect(() => {
    if (!paymentState?.checkoutRequestId || paymentState.status !== "pending") return;

    let cancelled = false;
    let timer;
    let attempts = 0;
    const maxAttempts = 60;

    setPaymentPolling(true);

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const response = await checkPaymentStatus(paymentState.checkoutRequestId);
        const data = response?.data || response || {};
        const payment = data?.payment || response?.payment || {};
        const returnedBooking = data?.booking || response?.booking || payment?.booking;
        const status = String(data?.status || payment?.status || "pending").toLowerCase();

        if (status === "completed") {
          setPaymentPolling(false);
          setPaymentState((current) => ({
            ...current,
            status: "completed",
            bookingId: returnedBooking?._id || current.bookingId,
            message: "Payment received successfully. Your payment history and remaining balance have been updated.",
            mpesaReceiptNumber: payment?.mpesaReceiptNumber || payment?.transactionId || "",
          }));
          toast.success("Payment confirmed successfully.");
          return;
        }

        if (status === "failed" || status === "cancelled") {
          const reason = payment?.failureReason || data?.failureReason || "M-Pesa payment was not completed.";
          setPaymentPolling(false);
          setPaymentState((current) => ({ ...current, status, message: reason, failureReason: reason }));
          toast.error(reason);
          return;
        }

        if (attempts >= maxAttempts) {
          setPaymentPolling(false);
          setPaymentState((current) => ({
            ...current,
            status: "timeout",
            message: "Payment confirmation is taking longer than expected. You can check the booking status or retry.",
          }));
          return;
        }

        timer = window.setTimeout(poll, 3000);
      } catch (error) {
        if (attempts >= maxAttempts) {
          setPaymentPolling(false);
          setPaymentState((current) => ({
            ...current,
            status: "timeout",
            message: "We could not confirm the payment yet. Please check your booking status.",
          }));
          return;
        }
        timer = window.setTimeout(poll, 3000);
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [paymentState?.checkoutRequestId, paymentState?.status]);

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async (response, variables) => {
      const newBooking = extractBooking(response);
      if (!newBooking?._id) throw new Error("Booking was created without an ID.");
      setCreatedBookingId(newBooking._id);
      const initialAmount = Number(paymentAmount) > 0 ? Number(paymentAmount) : Number(total);
      await paymentMutation.mutateAsync({
        bookingId: newBooking._id,
        method: paymentMethod,
        phoneNumber: variables?.normalizedPhone || phone,
        amount: initialAmount,
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Unable to create booking.");
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!total || total <= 0) {
      toast.error("This booking does not have a valid total cost. Please contact Coherent Tours.");
      return;
    }

    if (balance <= 0) {
      toast.info("This booking is already fully paid.");
      return;
    }

    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount < 1 || amount > balance) {
      toast.error(`Enter a payment amount between KES 1 and KES ${balance.toLocaleString()}.`);
      return;
    }

    if (!travelDate) return toast.error("Please select a travel date.");

    const finalPickupLocation = normalize(pickupLocation);
    const finalPickupTime = normalize(pickupTime);
    if (!finalPickupLocation) return toast.error("Please enter the exact pickup location.");
    if (!finalPickupTime) return toast.error("Please select the pickup time.");

    if (paymentMethod === "mpesa" && !isValidMpesaPhone(normalizeMpesaPhone(phone))) {
      toast.error("Enter a valid Safaricom M-Pesa number, e.g. 0707476586.");
      return;
    }

    if (isCustomBooking) {
      await paymentMutation.mutateAsync({
        bookingId: booking._id,
        method: paymentMethod,
        phoneNumber: phone,
        amount,
      });
      return;
    }

    if (isBookingCheckout) {
      await paymentMutation.mutateAsync({
        bookingId: booking._id,
        method: paymentMethod,
        phoneNumber: phone,
        amount,
      });
      return;
    }

    const availableSlots = Number(tour?.availableSlots || 0);
    if (travellerCount < 1 || travellerCount > availableSlots) {
      toast.error(`Only ${availableSlots} slot(s) are currently available.`);
      return;
    }

    const normalizedPhone = normalizeMpesaPhone(phone);
    const travelers = Array.from({ length: Number(travellerCount) }, (_, index) => ({
      name: `Traveller ${index + 1}`,
      age: 0,
      passportNumber: "",
    }));

    createBookingMutation.mutate({
      tour: tour._id,
      travelDate,
      travelers,
      numberOfGuests: Number(travellerCount),
      subtotal: total,
      totalAmount: total,
      contact: paymentMethod === "mpesa" ? { phone } : {},
      pickupLocation: finalPickupLocation,
      pickupTime: finalPickupTime,
      hotelName: normalize(hotelName),
      roomNumber: normalize(roomNumber),
      specialRequests: specialRequests.split("\n").map((item) => item.trim()).filter(Boolean),
      paymentMethod: paymentMethod === "mpesa" ? "MPESA" : paymentMethod === "stripe" ? "CARD" : "BANK_TRANSFER",
      ...(paymentMethod === "mpesa" ? { normalizedPhone } : {}),
    });
  };

  if (tourLoading || bookingLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading checkout...</div>;
  }

  if (isBookingCheckout && !booking?._id) {
    return <div className="flex min-h-screen items-center justify-center text-red-600">Booking not found.</div>;
  }

  if (isTourCheckout && !tour?._id) {
    return <div className="flex min-h-screen items-center justify-center text-red-600">Tour not found.</div>;
  }

  const isSubmitting = createBookingMutation.isPending || paymentMutation.isPending;
  const successfulPayment = paymentState?.status === "completed";
  const alreadyPaid = balance <= 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:py-10">
      <main className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200 md:p-8">
          <div className="mb-7">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Secure checkout</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Complete your booking</h1>
            <p className="mt-2 text-slate-500">Pay in one or multiple installments. Your booking remains active until the full balance is cleared.</p>
          </div>

          <section className="mb-6 rounded-2xl bg-slate-900 p-6 text-white">
            <h2 className="text-2xl font-bold">{isCustomBooking ? booking?.title || customSnapshot?.destination || "Custom Tour Package" : tour?.title || "Tour Booking"}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Summary label="Total cost" value={`KES ${total.toLocaleString()}`} />
              <Summary label="Amount paid" value={`KES ${amountPaid.toLocaleString()}`} />
              <Summary label="Balance" value={`KES ${balance.toLocaleString()}`} />
              <Summary label="Travellers" value={String(travellerCount)} />
            </div>
          </section>

          {isCustomBooking && (
            <div className="mb-6 grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-slate-700 md:grid-cols-2">
              <Detail label="Travel date" value={travelDate || "Not specified"} />
              <Detail label="Pickup" value={pickupLocation || "Not specified"} />
              <Detail label="Pickup time" value={pickupTime || "Not specified"} />
              <Detail label="Accommodation" value={hotelName || "Not specified"} />
              <Detail label="Booking status" value={booking?.status || "pending"} />
              <Detail label="Payment status" value={booking?.paymentStatus || (alreadyPaid ? "paid" : "pending")} />
            </div>
          )}

          {paymentState && (
            <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                {successfulPayment ? "Payment successful" : paymentState.status === "failed" || paymentState.status === "cancelled" ? "Payment failed" : "Waiting for M-Pesa payment"}
              </h2>
              <p className="mt-1 text-slate-700">{paymentState.message}</p>
              {paymentState.status === "pending" && (
                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="font-bold text-amber-800">Check your phone and enter your M-Pesa PIN.</p>
                  <p className="mt-1 text-sm text-slate-600">Payment amount: KES {Number(paymentState.amount || 0).toLocaleString()}</p>
                  {paymentPolling && <p className="mt-2 text-sm text-slate-500">Waiting for confirmation...</p>}
                </div>
              )}
              {paymentState.mpesaReceiptNumber && <p className="mt-3 text-sm font-semibold">M-Pesa receipt: {paymentState.mpesaReceiptNumber}</p>}
              {successfulPayment && (
                <button type="button" onClick={() => navigate(`/bookings/${paymentState.bookingId}`)} className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">View Booking & Remaining Balance</button>
              )}
              {(paymentState.status === "failed" || paymentState.status === "cancelled" || paymentState.status === "timeout") && (
                <button type="button" onClick={() => setPaymentState(null)} className="mt-4 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white">Retry Payment</button>
              )}
            </section>
          )}

          {!alreadyPaid && !successfulPayment && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Travel date" required>
                  <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className="w-full rounded-xl border p-3" required />
                </Field>
                <Field label="Number of travellers" required>
                  <input type="number" min="1" max={Math.max(isCustomBooking ? 999 : Number(tour?.availableSlots || 1), 1)} value={travellerCount} onChange={(e) => setTravellerCount(Number(e.target.value))} className="w-full rounded-xl border p-3" required disabled={isCustomBooking || isBookingCheckout} />
                </Field>
              </div>

              <Field label="Exact pickup location" required>
                <input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g. Sarova Stanley, Nairobi CBD" className="w-full rounded-xl border p-3" required />
              </Field>

              <Field label="Pickup time" required>
                <input type="datetime-local" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full rounded-xl border p-3" required />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Hotel / accommodation">
                  <input value={hotelName} onChange={(e) => setHotelName(e.target.value)} className="w-full rounded-xl border p-3" />
                </Field>
                <Field label="Room number">
                  <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="w-full rounded-xl border p-3" />
                </Field>
              </div>

              <Field label="M-Pesa phone number" required={paymentMethod === "mpesa"}>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0707476586" className="w-full rounded-xl border p-3" autoComplete="tel" />
              </Field>

              <Field label="Special requests">
                <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={4} className="w-full rounded-xl border p-3" />
              </Field>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-slate-700">Payment amount</span>
                    <p className="mt-1 text-xs text-slate-500">Choose any amount up to your current balance. You can return later and make another payment.</p>
                  </div>
                  <span className="font-bold text-emerald-900">Balance: KES {balance.toLocaleString()}</span>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Pay now (KES)</label>
                    <input
                      type="number"
                      min="1"
                      max={balance}
                      step="1"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full rounded-xl border border-emerald-300 bg-white p-3 text-lg font-bold"
                      required
                    />
                  </div>
                  <button type="button" onClick={() => setPaymentAmount(String(balance))} className="rounded-xl border border-emerald-700 px-4 py-3 font-semibold text-emerald-800 hover:bg-white">Pay full balance</button>
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="mb-3 font-bold">Payment method</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[["mpesa", "M-Pesa"], ["stripe", "Card / Stripe"], ["bank", "Bank transfer"]].map(([value, label]) => (
                    <label key={value} className={`cursor-pointer rounded-xl border p-3 ${paymentMethod === value ? "border-emerald-600 bg-emerald-50" : ""}`}>
                      <input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-2" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {paymentMethod === "bank" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                  <p className="font-bold">Bank transfer instructions</p>
                  <p>Bank: {siteSettings.bankName || "Contact Coherent Tours for bank details"}</p>
                  {siteSettings.bankAccountName && <p>Account name: {siteSettings.bankAccountName}</p>}
                  {siteSettings.bankAccountNumber && <p>Account number: {siteSettings.bankAccountNumber}</p>}
                  {siteSettings.bankBranch && <p>Branch: {siteSettings.bankBranch}</p>}
                </div>
              )}

              <button type="submit" disabled={isSubmitting || (!isCustomBooking && isTourCheckout && Number(tour?.availableSlots || 0) < 1)} className="w-full rounded-xl bg-emerald-700 py-4 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? "Starting payment..." : paymentMethod === "mpesa" ? `Pay KES ${Number(paymentAmount || 0).toLocaleString()} with M-Pesa` : paymentMethod === "stripe" ? `Pay KES ${Number(paymentAmount || 0).toLocaleString()} by Card` : "Record Bank Payment"}
              </button>
            </form>
          )}

          {alreadyPaid && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 font-semibold text-emerald-900">This booking is fully paid. You are eligible to proceed with the trip once normal operational requirements are satisfied.</div>}
        </div>
      </main>
    </div>
  );
}

function Summary({ label, value }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></div>;
}

function Detail({ label, value }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>;
}

function Field({ label, required, children }) {
  return <label className="block"><span className="mb-2 block font-medium">{label} {required && <span className="text-red-600">*</span>}</span>{children}</label>;
}
