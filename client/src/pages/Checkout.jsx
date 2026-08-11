import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createBooking } from "../api/bookingApi";
import { initiateMpesa } from "../api/mpesaApi";
import { getTourById } from "../api/tourApi";

export default function Checkout() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [travelDate, setTravelDate] = useState("");
  const [travellerCount, setTravellerCount] = useState(1);
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentState, setPaymentState] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tour", id],
    queryFn: () => getTourById(id),
    enabled: Boolean(id),
  });

  const tour = data?.tour || data?.data?.tour || data?.data || data;
  const availableSlots = Number(
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
      try {
        const booking = response?.data?.booking || response?.booking || response;
        if (!booking?._id) throw new Error("Booking ID was not returned.");

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

        // Payment confirmation continues through the M-Pesa callback; the customer is now on My Bookings.
        } catch (paymentError) {
        toast.error(
          paymentError?.response?.data?.message ||
            paymentError?.message ||
            "Booking created, but M-Pesa initiation failed. You can pay from My Bookings."
        );
        navigate(`/bookings/${response?.data?.booking?._id || response?.booking?._id}`);
      }
    },
    onError: (requestError) => {
      toast.error(
        requestError?.response?.data?.message || "Booking failed."
      );
    },
  });

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading tour...</div>;
  }

  if (error || !tour?._id) {
    return <div className="flex min-h-screen items-center justify-center text-red-600">Tour not found.</div>;
  }

  const total = Number(tour.price || 0) * Number(travellerCount);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!travelDate) return toast.error("Please select a travel date.");
    if (!phone) return toast.error("Please enter your phone number.");
    if (!pickupLocation.trim()) return toast.error("Please enter the exact pickup location.");
    if (!pickupTime) return toast.error("Please select the pickup time.");
    if (travellerCount < 1 || travellerCount > availableSlots) {
      return toast.error(`Only ${availableSlots} slot(s) are currently available.`);
    }

    const travelers = Array.from({ length: Number(travellerCount) }, (_, index) => ({
      name: `Traveller ${index + 1}`,
      age: 0,
      passportNumber: "",
    }));

    bookingMutation.mutate({
      tour: tour._id,
      travelDate,
      travelers,
      numberOfGuests: Number(travellerCount),
      contact: { phone },
      pickupLocation: pickupLocation.trim(),
      pickupTime,
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
          <h2 className="text-xl font-semibold">{tour.title}</h2>
          <p className="mt-2 text-gray-600">{tour.description}</p>
          <div className="mt-4 flex flex-wrap gap-5 font-semibold">
            <span className="text-green-700">KES {Number(tour.price || 0).toLocaleString()} / person</span>
            <span>Total slots: {tour.totalSlots ?? tour.capacity ?? 0}</span>
            <span>Booked: {tour.bookedSlots ?? 0}</span>
            <span className={availableSlots > 0 ? "text-green-700" : "text-red-600"}>Available: {availableSlots}</span>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Travel date" required>
              <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className="w-full rounded-lg border p-3" required />
            </Field>

            <Field label="Number of travellers" required>
              <input type="number" min="1" max={Math.max(availableSlots, 1)} value={travellerCount} onChange={(e) => setTravellerCount(Number(e.target.value))} className="w-full rounded-lg border p-3" required />
            </Field>
          </div>

          <Field label="Exact pickup location" required hint="Hotel, apartment, airport terminal, landmark or full address.">
            <input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g. Sarova Stanley, Nairobi CBD" className="w-full rounded-lg border p-3" required />
          </Field>

          <Field label="Pickup time" required>
            <input type="datetime-local" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full rounded-lg border p-3" required />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Hotel / accommodation">
              <input value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Hotel or accommodation name" className="w-full rounded-lg border p-3" />
            </Field>
            <Field label="Room number">
              <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="Optional" className="w-full rounded-lg border p-3" />
            </Field>
          </div>

          <Field label="M-Pesa phone number" required>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" className="w-full rounded-lg border p-3" required />
          </Field>

          <Field label="Special requests" hint="One request per line.">
            <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={4} placeholder="Dietary needs, accessibility, celebration, child seat, etc." className="w-full rounded-lg border p-3" />
          </Field>

          <div className="rounded-xl bg-green-50 p-4 text-xl font-bold text-green-900">
            Total: KES {total.toLocaleString()}
          </div>

          <button type="submit" disabled={bookingMutation.isPending || availableSlots < 1} className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            {bookingMutation.isPending ? "Processing..." : availableSlots < 1 ? "Tour Fully Booked" : "Book & Pay with M-Pesa"}
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
