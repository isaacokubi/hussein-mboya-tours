import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createBooking, getBookingById } from "../api/bookingApi";
import { initiateMpesa, checkPaymentStatus } from "../api/mpesaApi";
import { getTourById } from "../api/tourApi";

const normalizePhone = (value) => {
  let phone = String(value || "").replace(/\D/g, "");
  if (phone.startsWith("0")) phone = `254${phone.slice(1)}`;
  if (phone.startsWith("7") || phone.startsWith("1")) phone = `254${phone}`;
  return phone;
};

const validPhone = (value) => /^254[17]\d{8}$/.test(value);

const unwrapBooking = (response) =>
  response?.data?.booking || response?.booking || response?.data || response || null;

const unwrapTour = (response) =>
  response?.data?.data || response?.data?.tour || response?.data || response?.tour || response || null;

// Booking pickupTime is stored as a Date, while older/custom-tour requests may
// contain a time-only string such as "10:30". Normalize both representations
// into the value expected by a datetime-local input instead of silently showing
// "Not specified".
const toLocalDateTime = (value, dateFallback) => {
  if (!value) return "";

  const raw = String(value).trim();
  const timeOnly = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
  if (timeOnly) {
    const base = dateFallback ? new Date(dateFallback) : new Date();
    if (Number.isNaN(base.getTime())) return "";
    const hours = String(Number(timeOnly[1])).padStart(2, "0");
    const minutes = timeOnly[2];
    return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}T${hours}:${minutes}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const isBookingCheckout = type === "booking";
  const isTourCheckout = type === "tour";

  const [travelDate, setTravelDate] = useState("");
  const [travellers, setTravellers] = useState(1);
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentState, setPaymentState] = useState(null);

  const { data: bookingResponse, isLoading: bookingLoading } = useQuery({
    queryKey: ["checkout-booking", id],
    queryFn: () => getBookingById(id),
    enabled: isBookingCheckout && Boolean(id),
  });

  const { data: tourResponse, isLoading: tourLoading } = useQuery({
    queryKey: ["checkout-tour", id],
    queryFn: () => getTourById(id),
    enabled: isTourCheckout && Boolean(id),
  });

  const booking = useMemo(() => unwrapBooking(bookingResponse), [bookingResponse]);
  const tour = useMemo(() => unwrapTour(tourResponse), [tourResponse]);
  const custom = booking?.customTourSnapshot || booking?.customTourRequest || {};

  const total = isBookingCheckout
    ? Number(booking?.totalAmount || booking?.quotedAmount || 0)
    : Number(tour?.price || tour?.tourPrice || 0) * Number(travellers || 1);

  const storedPaid = Number(
    booking?.depositAmount ?? booking?.amountPaid ?? booking?.paidAmount ?? booking?.paymentSummary?.paid ?? 0
  );

  // Legacy bookings could contain depositAmount=total while still being pending.
  // Pending means no confirmed provider payment, so show the real payable balance.
  const amountPaid =
    isBookingCheckout &&
    String(booking?.paymentStatus || "").toLowerCase() === "pending" &&
    storedPaid >= total &&
    total > 0
      ? 0
      : storedPaid;

  const balance = Math.max(total - amountPaid, 0);

  useEffect(() => {
    if (!booking) return;

    const bookingTravelDate = booking.travelDate || custom.startDate || "";
    const bookingPickupTime = booking.pickupTime || custom.pickupTime || "";
    const bookingPickupDate = booking.pickupDate || custom.pickupDate || bookingTravelDate;

    setTravelDate(bookingTravelDate);
    setTravellers(Number(booking.numberOfGuests || custom.people || 1));
    setPhone(booking.contact?.phone || booking.phone || booking.customerSnapshot?.phone || booking.user?.phone || "");
    setPickupLocation(booking.pickupLocation || custom.pickupLocation || "");
    setPickupTime(toLocalDateTime(bookingPickupTime, bookingPickupDate));
    setHotelName(booking.hotelName || custom.accommodationPreference || "");
    setRoomNumber(booking.roomNumber || "");
    setSpecialRequests(
      Array.isArray(booking.specialRequests)
        ? booking.specialRequests.join("\n")
        : booking.specialRequests || custom.specialRequests || custom.requirements || ""
    );
  }, [booking, custom]);

  useEffect(() => {
    if (balance <= 0) {
      setPaymentAmount("");
      return;
    }
    setPaymentAmount((current) => {
      const value = Number(current);
      return value > 0 && value <= balance ? current : String(balance);
    });
  }, [balance]);

  const paymentMutation = useMutation({
    mutationFn: async ({ bookingId, phoneNumber, amount }) => {
      const normalized = normalizePhone(phoneNumber);
      if (!validPhone(normalized)) {
        throw new Error("Enter a valid Safaricom M-Pesa number, e.g. 0707476586.");
      }
      const response = await initiateMpesa({
        bookingId,
        phoneNumber: normalized,
        amount: Number(amount),
      });
      const data = response?.data || response || {};
      const checkoutRequestId = data.CheckoutRequestID || data.checkoutRequestID;
      if (!checkoutRequestId) {
        throw new Error(data.message || "M-Pesa checkout could not be started.");
      }
      return {
        bookingId,
        checkoutRequestId,
        amount: Number(amount),
        status: "pending",
        message: `M-Pesa prompt sent for KES ${Number(amount).toLocaleString()}. Check your phone and enter your M-Pesa PIN.`,
      };
    },
    onSuccess: (state) => {
      setPaymentState(state);
      toast.success("M-Pesa prompt sent. Enter your PIN on your phone.");
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

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const response = await checkPaymentStatus(paymentState.checkoutRequestId);
        const data = response?.data || response || {};
        const payment = data?.payment || {};
        const status = String(data?.status || payment?.status || "pending").toLowerCase();

        if (status === "completed") {
          setPaymentState((current) => ({
            ...current,
            status: "completed",
            bookingId: data?.booking?._id || current.bookingId,
            mpesaReceiptNumber: payment?.mpesaReceiptNumber || payment?.transactionId || "",
            message: "Payment confirmed successfully.",
          }));
          toast.success("Payment confirmed successfully.");
          return;
        }

        if (status === "failed" || status === "cancelled") {
          setPaymentState((current) => ({
            ...current,
            status,
            message: payment?.failureReason || data?.failureReason || "M-Pesa payment was not completed.",
          }));
          return;
        }
      } catch (_) {
        // Continue polling while Safaricom processes the request.
      }

      if (!cancelled && attempts < 60) timer = window.setTimeout(poll, 3000);
      if (!cancelled && attempts >= 60) {
        setPaymentState((current) => ({
          ...current,
          status: "timeout",
          message: "Payment confirmation is taking longer than expected. Check your booking or retry.",
        }));
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
    onSuccess: async (response) => {
      const created = unwrapBooking(response);
      if (!created?._id) throw new Error("Booking was created without an ID.");
      await paymentMutation.mutateAsync({
        bookingId: created._id,
        phoneNumber: phone,
        amount: Number(paymentAmount),
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Unable to create booking.");
    },
  });

  const submit = async (event) => {
    event.preventDefault();

    if (!total || total <= 0) return toast.error("This booking has no valid total cost.");
    if (balance <= 0) return toast.info("This booking is already fully paid.");

    const amount = Number(paymentAmount);
    if (!Number.isInteger(amount) || amount < 1 || amount > balance) {
      return toast.error(`Enter an amount between KES 1 and KES ${balance.toLocaleString()}.`);
    }
    if (!travelDate) return toast.error("Please select a travel date.");
    if (!pickupLocation.trim()) return toast.error("Please enter the pickup location.");
    if (!pickupTime) return toast.error("Please select the pickup time.");
    if (!validPhone(normalizePhone(phone))) return toast.error("Enter a valid Safaricom M-Pesa number.");

    if (isBookingCheckout) {
      await paymentMutation.mutateAsync({
        bookingId: booking._id,
        phoneNumber: phone,
        amount,
      });
      return;
    }

    const count = Number(travellers);
    const totalSlots = Number(tour?.availabilitySettings?.totalSlots ?? tour?.totalSlots ?? tour?.capacity ?? 0);
    const bookedSlots = Number(tour?.availabilitySettings?.bookedSlots ?? tour?.bookedSlots ?? 0);
    const available = Math.max(totalSlots - bookedSlots, 0);
    if (count < 1 || (available > 0 && count > available)) {
      return toast.error(`Only ${available} slot(s) are available.`);
    }

    const travelers = Array.from({ length: count }, (_, index) => ({
      name: `Traveller ${index + 1}`,
      age: 0,
      passportNumber: "",
    }));

    createBookingMutation.mutate({
      tour: tour._id,
      travelDate,
      travelers,
      numberOfGuests: count,
      subtotal: total,
      totalAmount: total,
      contact: { phone },
      pickupLocation: pickupLocation.trim(),
      pickupTime,
      hotelName: hotelName.trim(),
      roomNumber: roomNumber.trim(),
      specialRequests: specialRequests.split("\n").map((item) => item.trim()).filter(Boolean),
      paymentMethod: "MPESA",
      normalizedPhone: normalizePhone(phone),
    });
  };

  if (bookingLoading || tourLoading) return <div className="flex min-h-screen items-center justify-center">Loading checkout...</div>;
  if (isBookingCheckout && !booking?._id) return <div className="flex min-h-screen items-center justify-center text-red-600">Booking not found.</div>;
  if (isTourCheckout && !tour?._id) return <div className="flex min-h-screen items-center justify-center text-red-600">Tour not found.</div>;

  const successful = paymentState?.status === "completed";
  const submitting = createBookingMutation.isPending || paymentMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:py-10">
      <main className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Secure checkout</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Complete your booking</h1>
        <p className="mt-2 text-slate-500">Pay in one or multiple installments. Your booking remains active until the full balance is cleared.</p>

        <section className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">
          <h2 className="text-2xl font-bold">{isBookingCheckout ? booking?.title || "Custom Tour Package" : tour?.title || "Tour Booking"}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Stat label="Total cost" value={`KES ${total.toLocaleString()}`} />
            <Stat label="Amount paid" value={`KES ${amountPaid.toLocaleString()}`} />
            <Stat label="Balance" value={`KES ${balance.toLocaleString()}`} />
          </div>
        </section>

        <section className="mt-6 grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:grid-cols-2">
          <Detail label="Travel date" value={travelDate || "Not specified"} />
          <Detail label="Travellers" value={travellers} />
          <Detail label="Pickup" value={pickupLocation || "Not specified"} />
          <Detail label="Pickup time" value={pickupTime || "Not specified"} />
        </section>

        {paymentState && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-bold">{successful ? "Payment successful" : paymentState.status === "pending" ? "Waiting for M-Pesa payment" : "Payment failed"}</h2>
            <p className="mt-2 text-slate-700">{paymentState.message}</p>
            {paymentState.status === "pending" && <p className="mt-3 font-bold text-amber-800">Check your phone and enter your M-Pesa PIN.</p>}
            {paymentState.mpesaReceiptNumber && <p className="mt-2 text-sm font-semibold">M-Pesa receipt: {paymentState.mpesaReceiptNumber}</p>}
            {successful && <button type="button" onClick={() => navigate(`/bookings/${paymentState.bookingId}`)} className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">View Booking & Remaining Balance</button>}
            {["failed", "cancelled", "timeout"].includes(paymentState.status) && <button type="button" onClick={() => setPaymentState(null)} className="mt-4 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white">Retry Payment</button>}
          </section>
        )}

        {balance > 0 && !successful && (
          <form onSubmit={submit} className="mt-6 space-y-5">
            <Field label="Travel date" required><input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className="w-full rounded-xl border p-3" required /></Field>
            <Field label="Number of travellers"><input type="number" min="1" value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} className="w-full rounded-xl border p-3" disabled={isBookingCheckout} /></Field>
            <Field label="M-Pesa phone number" required><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0707476586" autoComplete="tel" className="w-full rounded-xl border p-3" required /></Field>
            <Field label="Exact pickup location" required><input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g. Sarova Stanley, Nairobi" className="w-full rounded-xl border p-3" required /></Field>
            <Field label="Pickup time" required><input type="datetime-local" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full rounded-xl border p-3" required /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Hotel / accommodation"><input value={hotelName} onChange={(e) => setHotelName(e.target.value)} className="w-full rounded-xl border p-3" /></Field><Field label="Room number"><input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="w-full rounded-xl border p-3" /></Field></div>
            <Field label="Special requests"><textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows="4" className="w-full rounded-xl border p-3" /></Field>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div><label className="block text-sm font-bold">Pay now (KES)</label><input type="number" min="1" max={balance} step="1" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="mt-2 w-full rounded-xl border border-emerald-300 p-3 text-lg font-bold sm:w-64" required /></div>
                <button type="button" onClick={() => setPaymentAmount(String(balance))} className="rounded-xl border border-emerald-700 px-4 py-3 font-semibold text-emerald-800">Pay full balance</button>
              </div>
              <p className="mt-2 text-xs text-slate-600">You can return later and make another payment until the balance reaches KES 0.</p>
            </div>

            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-emerald-700 py-4 font-bold text-white disabled:opacity-50">{submitting ? "Starting M-Pesa..." : `Pay KES ${Number(paymentAmount || 0).toLocaleString()} with M-Pesa`}</button>
          </form>
        )}

        {balance <= 0 && !paymentState && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 font-semibold text-emerald-900">This booking is fully paid. You are eligible to proceed with the trip once normal operational requirements are satisfied.</div>}
      </main>
    </div>
  );
}

function Stat({ label, value }) { return <div><p className="text-xs uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></div>; }
function Detail({ label, value }) { return <div><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>; }
function Field({ label, required, children }) { return <label className="block"><span className="mb-2 block font-medium">{label}{required && <span className="text-red-600"> *</span>}</span>{children}</label>; }
