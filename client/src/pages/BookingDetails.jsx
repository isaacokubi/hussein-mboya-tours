/**
 * Purpose: Booking Details page-level UI component. Main declarations: toNumber, cleanText, displayName, getPaymentStatus, getPaidAmount.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useTenant } from "../context/TenantContext";
// Load ../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../context/SettingsContext";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";
// Load react-router-dom so this module can use its exported dependencies.
import { useNavigate, useParams } from "react-router-dom";
// Load ../components/reviews/ReviewForm so this module can use its exported dependencies.
import ReviewForm from "../components/reviews/ReviewForm";
// Load ../api/bookingApi so this module can use its exported dependencies.
import { getBooking, getMyBookings } from "../api/bookingApi";

// Declare toNumber for use by the surrounding module or function.
const toNumber = (value) => {
  // Declare parsed for use by the surrounding module or function.
  const parsed = Number(value);
  // Return the expression shown below to the caller.
  return Number.isFinite(parsed) ? parsed : 0;
};

// Declare cleanText for use by the surrounding module or function.
const cleanText = (value, fallback = "N/A") => {
  // Declare text for use by the surrounding module or function.
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  // Check the condition (!text || /^(undefined|null)(\s+(undefined|null))*$/i.test(text)) and run the matching branch.
  if (!text || /^(undefined|null)(\s+(undefined|null))*$/i.test(text)) return fallback;
  // Return the value of text to the caller.
  return text;
};

// Declare displayName for use by the surrounding module or function.
const displayName = (source) => {
  // Check the condition (!source) and run the matching branch.
  if (!source) return "";
  // Check the condition (typeof source === "string") and run the matching branch.
  if (typeof source === "string") return cleanText(source, "");
  // Declare direct for use by the surrounding module or function.
  const direct = cleanText(source.name, "");
  // Check the condition (direct) and run the matching branch.
  if (direct) return direct;
  // Return the result of cleanText() to the caller.
  return cleanText([source.firstName, source.lastName].filter(Boolean).join(" "), "");
};

// Declare getPaymentStatus for use by the surrounding module or function.
const getPaymentStatus = (booking) => {
  // Declare value for use by the surrounding module or function.
  const value = booking?.paymentStatus;
  // Check the condition (value && typeof value === "object") and run the matching branch.
  if (value && typeof value === "object") return value.paymentStatus || value.status || "pending";
  // Return the expression shown below to the caller.
  return value || "pending";
};

// Declare getPaidAmount for use by the surrounding module or function.
const getPaidAmount = (booking) => {
  // Declare direct for use by the surrounding module or function.
  const direct = [booking?.amountPaid, booking?.paidAmount, booking?.depositAmount, booking?.paymentSummary?.paid, booking?.payment?.amountPaid];
  // Repeat the enclosed work for each required iteration.
  for (const value of direct) {
    // Check the condition (value !== undefined && value !== null && value !== "") and run the matching branch.
    if (value !== undefined && value !== null && value !== "") return toNumber(value);
  }
  // Check the condition (Array.isArray(booking?.payments)) and run the matching branch.
  if (Array.isArray(booking?.payments)) {
    // Return the result of booking.payments.reduce() to the caller.
    return booking.payments.reduce((sum, payment) => {
      // Declare status for use by the surrounding module or function.
      const status = String(payment?.status || payment?.paymentStatus || "").toLowerCase();
      // Declare confirmed for use by the surrounding module or function.
      const confirmed = ["paid", "confirmed", "success", "successful", "completed"].includes(status);
      // Return the expression shown below to the caller.
      return confirmed ? sum + toNumber(payment?.amount || payment?.amountPaid || payment?.paidAmount) : sum;
    }, 0);
  }
  // Return a numeric value to the caller.
  return 0;
};

// Declare isCustomBooking for use by the surrounding module or function.
const isCustomBooking = (booking) => Boolean(booking?.customTourSnapshot || booking?.customTourRequest || booking?.customTour || booking?.isCustomTour);

// Declare statusLabel for use by the surrounding module or function.
const statusLabel = (value) => cleanText(value, "Pending").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
// Declare dateLabel for use by the surrounding module or function.
const dateLabel = (value) => value ? new Date(value).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" }) : "N/A";

// Define BookingDetails; its parameters and body implement this operation.
export default function BookingDetails() {
  // Declare { tenant } for use by the surrounding module or function.
  const { tenant } = useTenant();
  // Declare { settings } for use by the surrounding module or function.
  const { settings } = useSettings();
  // Declare { id } for use by the surrounding module or function.
  const { id } = useParams();
  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();
  // Declare query for use by the surrounding module or function.
  const query = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Return the completed the result of getBooking() operation to the caller.
        return await getBooking(id);
      } catch (requestError) {
        // Declare fallback for use by the surrounding module or function.
        const fallback = await getMyBookings();
        // Declare list for use by the surrounding module or function.
        const list = fallback?.bookings || fallback?.data?.bookings || fallback?.data || fallback || [];
        // Declare found for use by the surrounding module or function.
        const found = Array.isArray(list) ? list.find((item) => String(item?._id || item?.id) === String(id)) : null;
        // Check the condition (found) and run the matching branch.
        if (found) return { success: true, booking: found };
        // Stop the current operation by raising the value of requestError.
        throw requestError;
      }
    },
    enabled: Boolean(id),
  });

  // Declare { data, isLoading, isError, error, refetch, isFetching } for use by the surrounding module or function.
  const { data, isLoading, isError, error, refetch, isFetching } = query;
  // Declare booking for use by the surrounding module or function.
  const booking = data?.booking || data?.data?.booking || data?.data || data;

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) return <div className="p-10">Loading booking details...</div>;
  // Check the condition (isError || !booking) and run the matching branch.
  if (isError || !booking) return (
    <div className="p-10 text-center text-red-600">
      <p className="font-semibold">{error?.response?.data?.message || "Unable to load booking details."}</p>
      <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-4 rounded-lg bg-green-700 px-5 py-2 text-white disabled:opacity-50">{isFetching ? "Retrying..." : "Retry"}</button>
    </div>
  );

  // Declare custom for use by the surrounding module or function.
  const custom = booking.customTourSnapshot || booking.customTourRequest || {};
  // Declare customBooking for use by the surrounding module or function.
  const customBooking = isCustomBooking(booking);
  // Declare title for use by the surrounding module or function.
  const title = cleanText(booking.tour?.title || booking.title || custom.destination || custom.title, "Custom tour package");
  // Declare totalAmount for use by the surrounding module or function.
  const totalAmount = toNumber(booking.totalAmount ?? booking.quotedAmount ?? booking.quotedTotal);
  // Declare amountPaid for use by the surrounding module or function.
  const amountPaid = getPaidAmount(booking);
  // Declare storedBalance for use by the surrounding module or function.
  const storedBalance = booking.balanceAmount ?? booking.balance ?? booking.paymentSummary?.balance;
  // Declare balanceAmount for use by the surrounding module or function.
  const balanceAmount = Math.max(storedBalance !== undefined && storedBalance !== null ? toNumber(storedBalance) : totalAmount - amountPaid, 0);
  // Declare paymentStatus for use by the surrounding module or function.
  const paymentStatus = String(getPaymentStatus(booking)).toLowerCase();
  // Declare failedPayment for use by the surrounding module or function.
  const failedPayment = ["failed", "cancelled"].includes(paymentStatus);
  // Declare customerSources for use by the surrounding module or function.
  const customerSources = [booking.customerSnapshot, booking.customer, booking.user, booking.contact];
  // Declare customerName for use by the surrounding module or function.
  const customerName = customerSources.map(displayName).find(Boolean) || "Customer";
  // Declare customerPhone for use by the surrounding module or function.
  const customerPhone = customerSources.map((source) => cleanText(source?.phone, "")).find(Boolean) || "N/A";
  // Declare customerEmail for use by the surrounding module or function.
  const customerEmail = customerSources.map((source) => cleanText(source?.email, "")).find(Boolean) || "N/A";
  // Declare status for use by the surrounding module or function.
  const status = String(booking.status || booking.bookingStatus || "pending").toLowerCase();
  // Declare checkoutPath for use by the surrounding module or function.
  const checkoutPath = `/checkout/booking/${booking._id || id}`;

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-bold tracking-wide text-emerald-700">{cleanText(settings?.companyName || tenant?.name, "Your travel company")}</p>
          <h1 className="mt-1 text-4xl font-bold text-slate-900">Booking details</h1>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-slate-200">
          <div className="bg-slate-900 p-6 text-white">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{customBooking ? "Custom tour booking" : "Tour booking"}</span>
              {failedPayment && <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold">Payment failed — retry required</span>}
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-slate-300">Booking #{cleanText(booking.bookingNumber || booking._id, "N/A")}</p>
          </div>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Info label="Travel date" value={booking.travelDate ? dateLabel(booking.travelDate) : custom.startDate ? dateLabel(custom.startDate) : "N/A"} />
              <Info label="Total cost" value={`KES ${totalAmount.toLocaleString()}`} />
              <Info label="Amount paid" value={`KES ${amountPaid.toLocaleString()}`} />
              <Info label="Balance" value={`KES ${balanceAmount.toLocaleString()}`} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info label="Booking status" value={statusLabel(status)} />
              <Info label="Payment status" value={statusLabel(paymentStatus)} />
              <Info label="Travellers" value={String(booking.numberOfGuests ?? custom.people ?? booking.travelers?.length ?? 1)} />
              <Info label="Pickup" value={cleanText(booking.pickupLocation || custom.pickupLocation, "N/A")} />
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="font-bold text-slate-900">Payment summary</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Info label="Total" value={`KES ${totalAmount.toLocaleString()}`} />
                <Info label="Paid" value={`KES ${amountPaid.toLocaleString()}`} />
                <Info label="Outstanding" value={`KES ${balanceAmount.toLocaleString()}`} />
              </div>

              {balanceAmount > 0 && !["cancelled", "refunded"].includes(status) && (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => navigate(checkoutPath)} className={`rounded-xl px-5 py-3 font-bold text-white ${failedPayment ? "bg-red-600 hover:bg-red-700" : "bg-emerald-700 hover:bg-emerald-800"}`}>
                    {failedPayment ? "Retry failed payment" : amountPaid > 0 ? "Continue payment" : "Open checkout & pay"}
                  </button>
                  <p className="text-sm text-slate-600">Open checkout to review or update your phone and pickup details, then request a new M-Pesa prompt.</p>
                </div>
              )}

              {balanceAmount <= 0 && totalAmount > 0 && <p className="mt-4 font-semibold text-emerald-800">✓ This booking is fully paid.</p>}
            </div>

            <div className="mt-6 border-t pt-5">
              <h3 className="mb-3 text-lg font-bold">Customer information</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <Info label="Name" value={customerName} />
                <Info label="Phone" value={customerPhone} />
                <Info label="Email" value={customerEmail} />
              </div>
            </div>

            {(booking.completedAt || ["completed", "complete", "finished"].includes(status)) && booking.tour?._id && <div className="mt-8"><ReviewForm tourId={booking.tour._id} onSuccess={() => refetch()} /></div>}
          </div>
        </div>
      </main>
    </div>
  );
}

// Define Info; its parameters and body implement this operation.
function Info({ label, value }) {
  // Return the expression shown below to the caller.
  return <div><p className="text-xs font-semibold tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value || "N/A"}</p></div>;
}
