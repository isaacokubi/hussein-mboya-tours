/**
 * Purpose: Checkout page-level UI component. Main declarations: normalizePhone, validPhone, unwrapBooking, unwrapTour, unwrapCustomRequests.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useMemo, useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { useNavigate, useParams } from "react-router-dom";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery } from "@tanstack/react-query";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../api/bookingApi so this module can use its exported dependencies.
import { createBooking, getBookingById, updateBookingTravelDate } from "../api/bookingApi";
// Load ../api/customTourApi so this module can use its exported dependencies.
import { getMyCustomTourRequests } from "../api/customTourApi";
// Load ../api/mpesaApi so this module can use its exported dependencies.
import { initiateMpesa, checkPaymentStatus } from "../api/mpesaApi";
// Load ../api/tourApi so this module can use its exported dependencies.
import { getTourById } from "../api/tourApi";
// Load ../api/settingsApi so this module can use its exported dependencies.
import { getPublicSettings } from "../api/settingsApi";
// Load ../api/checkoutPaymentsApi so this module can use its exported dependencies.
import { createBankTransferPayment, createCashPayment, createPaypalOrder, createStripeCheckout } from "../api/checkoutPaymentsApi";
// Load ../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../context/AuthContext";
// Load ../lib/dateRange so this module can use its exported dependencies.
import { getCustomTourDateRange, getTourDateRange, isDateWithinRange, toDateInputValue } from "../lib/dateRange";

// Declare normalizePhone for use by the surrounding module or function.
const normalizePhone = (value) => {
  // Declare phone for use by the surrounding module or function.
  let phone = String(value || "").replace(/\D/g, "");
  // Check the condition (phone.startsWith("0")) and run the matching branch.
  if (phone.startsWith("0")) phone = `254${phone.slice(1)}`;
  // Check the condition (phone.startsWith("7") || phone.startsWith("1")) and run the matching branch.
  if (phone.startsWith("7") || phone.startsWith("1")) phone = `254${phone}`;
  // Return the value of phone to the caller.
  return phone;
};
// Declare validPhone for use by the surrounding module or function.
const validPhone = (value) => /^254[17]\d{8}$/.test(value);
// Declare unwrapBooking for use by the surrounding module or function.
const unwrapBooking = (response) => response?.data?.booking || response?.booking || response?.data || response || null;
// Declare unwrapTour for use by the surrounding module or function.
const unwrapTour = (response) => response?.data?.data || response?.data?.tour || response?.data || response?.tour || response || null;
// Declare unwrapCustomRequests for use by the surrounding module or function.
const unwrapCustomRequests = (response) => response?.data?.requests || response?.requests || response?.data || response || [];
// Declare unwrapSettings for use by the surrounding module or function.
const unwrapSettings = (response) => response?.settings || response?.data?.settings || response?.data || response || {};

// Declare toLocalDateTime for use by the surrounding module or function.
const toLocalDateTime = (value, dateFallback) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "";
  // Declare raw for use by the surrounding module or function.
  const raw = String(value).trim();
  // Declare timeOnly for use by the surrounding module or function.
  const timeOnly = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
  // Check the condition (timeOnly) and run the matching branch.
  if (timeOnly) {
    // Declare base for use by the surrounding module or function.
    const base = dateFallback ? new Date(dateFallback) : new Date();
    // Check the condition (Number.isNaN(base.getTime())) and run the matching branch.
    if (Number.isNaN(base.getTime())) return "";
    // Return the expression shown below to the caller.
    return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}T${String(Number(timeOnly[1])).padStart(2, "0")}:${timeOnly[2]}`;
  }
  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Check the condition (Number.isNaN(date.getTime())) and run the matching branch.
  if (Number.isNaN(date.getTime())) return "";
  // Return the expression shown below to the caller.
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// Define Checkout; its parameters and body implement this operation.
export default function Checkout() {
  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();
  // Declare { type, id } for use by the surrounding module or function.
  const { type, id } = useParams();
  // Declare { user } for use by the surrounding module or function.
  const { user } = useAuth();
  // Declare isBookingCheckout for use by the surrounding module or function.
  const isBookingCheckout = type === "booking";
  // Declare isTourCheckout for use by the surrounding module or function.
  const isTourCheckout = type === "tour";

  // Declare [travelDate, setTravelDate] for use by the surrounding module or function.
  const [travelDate, setTravelDate] = useState("");
  // Declare [travellers, setTravellers] for use by the surrounding module or function.
  const [travellers, setTravellers] = useState("1");
  // Declare [phone, setPhone] for use by the surrounding module or function.
  const [phone, setPhone] = useState("");
  // Declare [pickupLocation, setPickupLocation] for use by the surrounding module or function.
  const [pickupLocation, setPickupLocation] = useState("");
  // Declare [pickupTime, setPickupTime] for use by the surrounding module or function.
  const [pickupTime, setPickupTime] = useState("");
  // Declare [hotelName, setHotelName] for use by the surrounding module or function.
  const [hotelName, setHotelName] = useState("");
  // Declare [roomNumber, setRoomNumber] for use by the surrounding module or function.
  const [roomNumber, setRoomNumber] = useState("");
  // Declare [specialRequests, setSpecialRequests] for use by the surrounding module or function.
  const [specialRequests, setSpecialRequests] = useState("");
  // Declare [paymentAmount, setPaymentAmount] for use by the surrounding module or function.
  const [paymentAmount, setPaymentAmount] = useState("");
  // Declare [paymentState, setPaymentState] for use by the surrounding module or function.
  const [paymentState, setPaymentState] = useState(null);
  // Declare [selectedPaymentMethod, setSelectedPaymentMethod] for use by the surrounding module or function.
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("MPESA");

  // Declare { data: bookingResponse, isLoading: bookingLoading } for use by the surrounding module or function.
  const { data: bookingResponse, isLoading: bookingLoading } = useQuery({
    queryKey: ["checkout-booking", id],
    queryFn: () => getBookingById(id),
    enabled: isBookingCheckout && Boolean(id),
  });
  // Declare { data: tourResponse, isLoading: tourLoading } for use by the surrounding module or function.
  const { data: tourResponse, isLoading: tourLoading } = useQuery({
    queryKey: ["checkout-tour", id],
    queryFn: () => getTourById(id),
    enabled: isTourCheckout && Boolean(id),
  });
  // Declare { data: settingsResponse, isLoading: settingsLoading, isError: settingsError } for use by the surrounding module or function.
  const { data: settingsResponse, isLoading: settingsLoading, isError: settingsError } = useQuery({
    queryKey: ["public-system-settings", window.location.host],
    queryFn: getPublicSettings,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Declare booking for use by the surrounding module or function.
  const booking = useMemo(() => unwrapBooking(bookingResponse), [bookingResponse]);
  // Declare tour for use by the surrounding module or function.
  const tour = useMemo(() => unwrapTour(tourResponse), [tourResponse]);
  // Declare settings for use by the surrounding module or function.
  const settings = useMemo(() => unwrapSettings(settingsResponse), [settingsResponse]);
  // Declare availablePaymentMethods for use by the surrounding module or function.
  const availablePaymentMethods = useMemo(() => [
    settings?.enableMpesa === true && { id: "MPESA", label: "M-Pesa", detail: "Pay securely using an STK Push prompt." },
    settings?.enableStripe === true && { id: "CARD", label: "Card", detail: "Pay by card through secure Stripe Checkout." },
    settings?.enablePaypal === true && { id: "PAYPAL", label: "PayPal", detail: "Pay through PayPal's secure checkout. Currency support depends on the tenant account." },
    settings?.enableBankTransfer === true && { id: "BANK_TRANSFER", label: "Bank transfer", detail: "Transfer to the tenant account; staff will verify receipt." },
    settings?.enableCash === true && { id: "CASH", label: "Cash", detail: "Pay at the listed collection point. Staff confirmation is required." },
  ].filter(Boolean), [settings]);
  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (!availablePaymentMethods.some(({ id: method }) => method === selectedP) and run the matching branch.
    if (!availablePaymentMethods.some(({ id: method }) => method === selectedPaymentMethod) && availablePaymentMethods[0]) setSelectedPaymentMethod(availablePaymentMethods[0].id);
  }, [availablePaymentMethods, selectedPaymentMethod]);
  // Declare bookingDepositRate for use by the surrounding module or function.
  const bookingDepositRate = Math.min(100, Math.max(0, Number(settings?.bookingDepositPercentage ?? settings?.defaultBookingDepositPercentage ?? 0)));

  // Declare customRequestId for use by the surrounding module or function.
  const customRequestId = typeof booking?.customTourRequest === "string" ? booking.customTourRequest : booking?.customTourRequest?._id || "";
  // Declare { data: customRequestsResponse, isLoading: customRequestLoading } for use by the surrounding module or function.
  const { data: customRequestsResponse, isLoading: customRequestLoading } = useQuery({
    queryKey: ["checkout-custom-request", customRequestId],
    queryFn: getMyCustomTourRequests,
    enabled: isBookingCheckout && Boolean(customRequestId) && typeof booking?.customTourRequest !== "object",
  });
  // Declare customRequest for use by the surrounding module or function.
  const customRequest = useMemo(() => {
    // Check the condition (booking?.customTourRequest && typeof booking.customTourRequest === "ob) and run the matching branch.
    if (booking?.customTourRequest && typeof booking.customTourRequest === "object") return booking.customTourRequest;
    // Declare requests for use by the surrounding module or function.
    const requests = unwrapCustomRequests(customRequestsResponse);
    // Return the expression shown below to the caller.
    return Array.isArray(requests) ? requests.find((request) => String(request?._id || request?.id) === String(customRequestId)) || {} : {};
  }, [booking?.customTourRequest, customRequestsResponse, customRequestId]);
  // Declare custom for use by the surrounding module or function.
  const custom = booking?.customTourSnapshot || customRequest || {};

  // Declare dateRange for use by the surrounding module or function.
  const dateRange = useMemo(() => {
    // Check the condition (isTourCheckout) and run the matching branch.
    if (isTourCheckout) return getTourDateRange(tour);
    // Check the condition (isBookingCheckout && (booking?.customTourRequest || custom?.startDate)) and run the matching branch.
    if (isBookingCheckout && (booking?.customTourRequest || custom?.startDate)) return getCustomTourDateRange(custom);
    // Return the object assembled below to the caller.
    return { min: "", max: "" };
  }, [isTourCheckout, isBookingCheckout, tour, booking?.customTourRequest, custom]);

  // Declare baseTourPrice for use by the surrounding module or function.
  const baseTourPrice = Number(tour?.price ?? tour?.tourPrice ?? tour?.pricePerPerson ?? 0);
  // Declare total for use by the surrounding module or function.
  const total = isBookingCheckout ? Number(booking?.totalAmount || booking?.quotedAmount || 0) : baseTourPrice * Number(travellers || 0);
  // Declare storedPaid for use by the surrounding module or function.
  const storedPaid = Number(booking?.depositAmount ?? booking?.amountPaid ?? booking?.paidAmount ?? booking?.paymentSummary?.paid ?? 0);
  // Declare amountPaid for use by the surrounding module or function.
  const amountPaid = isBookingCheckout && String(booking?.paymentStatus || "").toLowerCase() === "pending" && storedPaid >= total && total > 0 ? 0 : storedPaid;
  // Declare balance for use by the surrounding module or function.
  const balance = Math.max(total - amountPaid, 0);
  // Declare configuredDeposit for use by the surrounding module or function.
  const configuredDeposit = Math.round((total * bookingDepositRate) / 100);
  // Declare minimumInitialPayment for use by the surrounding module or function.
  const minimumInitialPayment = Math.min(balance, configuredDeposit);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (isBookingCheckout && booking) and run the matching branch.
    if (isBookingCheckout && booking) {
      // Declare bookingTravelDate for use by the surrounding module or function.
      const bookingTravelDate = booking.travelDate || custom.startDate || dateRange.min || "";
      // Declare bookingPickupTime for use by the surrounding module or function.
      const bookingPickupTime = booking.pickupTime || custom.pickupTime || "";
      // Declare bookingPickupDate for use by the surrounding module or function.
      const bookingPickupDate = booking.pickupDate || custom.pickupDate || bookingTravelDate;
      // Perform the side effect or state update expressed on the following line.
      setTravelDate(toDateInputValue(bookingTravelDate));
      // Perform the side effect or state update expressed on the following line.
      setTravellers(String(Number(booking.numberOfGuests || custom.people || 1)));
      // Perform the side effect or state update expressed on the following line.
      setPhone(booking.contact?.phone || booking.phone || booking.customerSnapshot?.phone || booking.user?.phone || user?.phone || "");
      // Perform the side effect or state update expressed on the following line.
      setPickupLocation(booking.pickupLocation || custom.pickupLocation || "");
      // Perform the side effect or state update expressed on the following line.
      setPickupTime(toLocalDateTime(bookingPickupTime, bookingPickupDate));
      // Perform the side effect or state update expressed on the following line.
      setHotelName(booking.hotelName || custom.accommodationPreference || "");
      // Perform the side effect or state update expressed on the following line.
      setRoomNumber(booking.roomNumber || "");
      // Perform the side effect or state update expressed on the following line.
      setSpecialRequests(Array.isArray(booking.specialRequests) ? booking.specialRequests.join("\n") : booking.specialRequests || custom.specialRequests || custom.requirements || "");
      // Return the result to the caller.
      return;
    }
    // Check the condition (isTourCheckout && tour) and run the matching branch.
    if (isTourCheckout && tour) {
      // Declare scheduledDate for use by the surrounding module or function.
      const scheduledDate = tour.travelDate || tour.date || tour.startDate || tour.departureDate || tour.nextDepartureDate || tour.startDateTime || dateRange.min || "";
      // Declare scheduledPickupTime for use by the surrounding module or function.
      const scheduledPickupTime = tour.pickupTime || tour.departureTime || tour.startTime || tour.meetingTime || "";
      // Declare scheduledPickupLocation for use by the surrounding module or function.
      const scheduledPickupLocation = tour.pickupLocation || tour.meetingPoint || tour.meetingLocation || tour.departurePoint || "";
      // Declare tourDate for use by the surrounding module or function.
      const tourDate = toDateInputValue(scheduledDate);
      // Perform the side effect or state update expressed on the following line.
      setTravelDate(tourDate && dateRange.min && tourDate < dateRange.min ? dateRange.min : tourDate);
      // Perform the side effect or state update expressed on the following line.
      setTravellers("1");
      // Perform the side effect or state update expressed on the following line.
      setPhone(user?.phone || user?.contact?.phone || "");
      // Perform the side effect or state update expressed on the following line.
      setPickupLocation(scheduledPickupLocation);
      // Perform the side effect or state update expressed on the following line.
      setPickupTime(toLocalDateTime(scheduledPickupTime, tourDate || scheduledDate));
      // Perform the side effect or state update expressed on the following line.
      setHotelName(tour.hotelName || "");
      // Perform the side effect or state update expressed on the following line.
      setRoomNumber("");
      // Perform the side effect or state update expressed on the following line.
      setSpecialRequests("");
    }
  }, [isBookingCheckout, isTourCheckout, booking, custom, tour, user, dateRange.min]);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (!dateRange.min || !dateRange.max) and run the matching branch.
    if (!dateRange.min || !dateRange.max) return;
    // Perform the side effect or state update expressed on the following line.
    setTravelDate((current) => {
      // Check the condition (!current) and run the matching branch.
      if (!current) return dateRange.min;
      // Return the expression shown below to the caller.
      return isDateWithinRange(current, dateRange.min, dateRange.max) ? current : dateRange.min;
    });
  }, [dateRange.min, dateRange.max]);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (!travelDate) and run the matching branch.
    if (!travelDate) return;
    // Perform the side effect or state update expressed on the following line.
    setPickupTime((current) => {
      // Declare time for use by the surrounding module or function.
      const time = current?.includes("T") ? current.slice(11, 16) : "";
      // Return the expression shown below to the caller.
      return time ? `${travelDate}T${time}` : "";
    });
  }, [travelDate]);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (balance <= 0) and run the matching branch.
    if (balance <= 0) return setPaymentAmount("");
    // Perform the side effect or state update expressed on the following line.
    setPaymentAmount((current) => {
      // Declare value for use by the surrounding module or function.
      const value = Number(current);
      // Check the condition (value >= minimumInitialPayment && value <= balance) and run the matching branch.
      if (value >= minimumInitialPayment && value <= balance) return current;
      // Return the result of String() to the caller.
      return String(minimumInitialPayment || balance);
    });
  }, [balance, minimumInitialPayment]);

  // Declare paymentMutation for use by the surrounding module or function.
  const paymentMutation = useMutation({
    mutationFn: async ({ bookingId, phoneNumber, amount }) => {
      // Declare normalized for use by the surrounding module or function.
      const normalized = normalizePhone(phoneNumber);
      // Check the condition (!validPhone(normalized)) and run the matching branch.
      if (!validPhone(normalized)) throw new Error("Enter a valid Safaricom M-Pesa number, e.g. 0707476586.");
      // Declare response for use by the surrounding module or function.
      const response = await initiateMpesa({ bookingId, phoneNumber: normalized, amount: Number(amount) });
      // Declare data for use by the surrounding module or function.
      const data = response?.data || response || {};
      // Declare checkoutRequestId for use by the surrounding module or function.
      const checkoutRequestId = data.CheckoutRequestID || data.checkoutRequestID;
      // Check the condition (!checkoutRequestId) and run the matching branch.
      if (!checkoutRequestId) throw new Error(data.message || "M-Pesa checkout could not be started.");
      // Return the object assembled below to the caller.
      return { bookingId, checkoutRequestId, amount: Number(amount), status: "pending", message: `M-Pesa prompt sent for KES ${Number(amount).toLocaleString()}. Check your phone and enter your M-Pesa PIN.` };
    },
    onSuccess: (state) => { setPaymentState(state); toast.success("M-Pesa prompt sent. Enter your PIN on your phone."); },
    onError: (error) => toast.error(error?.response?.data?.message || error?.message || "Unable to start payment."),
  });

  // Declare otherPaymentMutation for use by the surrounding module or function.
  const otherPaymentMutation = useMutation({
    mutationFn: async ({ bookingId, method, amount }) => {
      // Check the condition (method === "CARD") and run the matching branch.
      if (method === "CARD") return { method, bookingId, response: await createStripeCheckout({ bookingId, amount }) };
      // Check the condition (method === "PAYPAL") and run the matching branch.
      if (method === "PAYPAL") return { method, bookingId, response: await createPaypalOrder({ bookingId }) };
      // Check the condition (method === "BANK_TRANSFER") and run the matching branch.
      if (method === "BANK_TRANSFER") return { method, bookingId, response: await createBankTransferPayment({ bookingId, amount }) };
      // Check the condition (method === "CASH") and run the matching branch.
      if (method === "CASH") return { method, bookingId, response: await createCashPayment({ bookingId, amount }) };
      // Stop the current operation by raising a new Error instance.
      throw new Error("Select a supported payment method.");
    },
    onSuccess: ({ method, bookingId, response }) => {
      // Check the condition (method === "CARD") and run the matching branch.
      if (method === "CARD") {
        // Declare redirect for use by the surrounding module or function.
        const redirect = response?.url || response?.data?.url;
        // Check the condition (!redirect) and run the matching branch.
        if (!redirect) { toast.error("Stripe did not return a checkout link. No payment was recorded as complete."); return; }
        // Perform the side effect or state update expressed on the following line.
        window.location.assign(redirect);
        // Return the result to the caller.
        return;
      }
      // Check the condition (method === "PAYPAL") and run the matching branch.
      if (method === "PAYPAL") {
        // Declare redirect for use by the surrounding module or function.
        const redirect = response?.url || response?.data?.url;
        // Check the condition (!redirect) and run the matching branch.
        if (!redirect) { toast.error("PayPal did not return an approval link. No payment was recorded as complete."); return; }
        // Perform the side effect or state update expressed on the following line.
        window.location.assign(redirect);
        // Return the result to the caller.
        return;
      }
      // Declare message for use by the surrounding module or function.
      const message = method === "BANK_TRANSFER"
        ? "Transfer payment is pending verification. Use the tenant bank details below and include your booking reference. The booking will remain unpaid until staff confirms the funds."
        : "Cash payment is pending staff confirmation. The booking will remain unpaid until receipt is confirmed.";
      // Perform the side effect or state update expressed on the following line.
      setPaymentState({ status: "pending", bookingId, message });
      // Perform the side effect or state update expressed on the following line.
      toast.info(message);
    },
    onError: (error) => toast.error(error?.response?.data?.message || error?.message || "Unable to start this payment method."),
  });

  // Declare startPayment for use by the surrounding module or function.
  const startPayment = ({ bookingId, phoneNumber, amount }) => {
    // Check the condition (selectedPaymentMethod === "MPESA") and run the matching branch.
    if (selectedPaymentMethod === "MPESA") return paymentMutation.mutateAsync({ bookingId, phoneNumber, amount });
    // Return the result of otherPaymentMutation.mutateAsync() to the caller.
    return otherPaymentMutation.mutateAsync({ bookingId, method: selectedPaymentMethod, amount });
  };

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (!paymentState?.checkoutRequestId || paymentState.status !== "pending") and run the matching branch.
    if (!paymentState?.checkoutRequestId || paymentState.status !== "pending") return;
    // Declare cancelled for use by the surrounding module or function.
    let cancelled = false;
    // Declare timer for use by the surrounding module or function.
    let timer;
    // Declare attempts for use by the surrounding module or function.
    let attempts = 0;
    // Declare poll for use by the surrounding module or function.
    const poll = async () => {
      // Check the condition (cancelled) and run the matching branch.
      if (cancelled) return;
      // Perform the side effect or state update expressed on the following line.
      attempts += 1;
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Declare response for use by the surrounding module or function.
        const response = await checkPaymentStatus(paymentState.checkoutRequestId);
        // Declare data for use by the surrounding module or function.
        const data = response?.data || response || {};
        // Declare payment for use by the surrounding module or function.
        const payment = data?.payment || {};
        // Declare status for use by the surrounding module or function.
        const status = String(data?.status || payment?.status || "pending").toLowerCase();
        // Check the condition (status === "completed") and run the matching branch.
        if (status === "completed") {
          // Perform the side effect or state update expressed on the following line.
          setPaymentState((current) => ({ ...current, status: "completed", bookingId: data?.booking?._id || current.bookingId, mpesaReceiptNumber: payment?.mpesaReceiptNumber || payment?.transactionId || "", message: "Payment confirmed successfully." }));
          // Perform the side effect or state update expressed on the following line.
          toast.success("Payment confirmed successfully.");
          // Return the result to the caller.
          return;
        }
        // Check the condition (status === "failed" || status === "cancelled") and run the matching branch.
        if (status === "failed" || status === "cancelled") {
          // Perform the side effect or state update expressed on the following line.
          setPaymentState((current) => ({ ...current, status, message: payment?.failureReason || data?.failureReason || "M-Pesa payment was not completed." }));
          // Return the result to the caller.
          return;
        }
      } catch (_) { /* continue polling */ }
      // Check the condition (!cancelled && attempts < 60) and run the matching branch.
      if (!cancelled && attempts < 60) timer = window.setTimeout(poll, 3000);
      // Check the condition (!cancelled && attempts >= 60) and run the matching branch.
      if (!cancelled && attempts >= 60) setPaymentState((current) => ({ ...current, status: "timeout", message: "Payment confirmation is taking longer than expected. Check your booking or retry." }));
    };
    // Perform the side effect or state update expressed on the following line.
    poll();
    // Return the expression shown below to the caller.
    return () => { cancelled = true; if (timer) window.clearTimeout(timer); };
  }, [paymentState?.checkoutRequestId, paymentState?.status]);

  // Declare createBookingMutation for use by the surrounding module or function.
  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async (response) => {
      // Declare created for use by the surrounding module or function.
      const created = unwrapBooking(response);
      // Check the condition (!created?._id) and run the matching branch.
      if (!created?._id) throw new Error("Booking was created without an ID.");
      // Perform the side effect or state update expressed on the following line.
      await startPayment({ bookingId: created._id, phoneNumber: phone, amount: Number(paymentAmount) });
    },
    onError: (error) => toast.error(error?.response?.data?.message || error?.message || "Unable to create booking."),
  });

  // Declare submit for use by the surrounding module or function.
  const submit = async (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();
    // Check the condition (isTourCheckout) and run the matching branch.
    if (isTourCheckout) {
      // Declare travellerCount for use by the surrounding module or function.
      const travellerCount = Number(travellers);
      // Check the condition (!Number.isInteger(travellerCount) || travellerCount < 1) and run the matching branch.
      if (!Number.isInteger(travellerCount) || travellerCount < 1) return toast.error("Enter at least 1 traveller.");
    }
    // Check the condition (!total || total <= 0) and run the matching branch.
    if (!total || total <= 0) return toast.error("This booking has no valid total cost. Please contact the tour operator.");
    // Check the condition (balance <= 0) and run the matching branch.
    if (balance <= 0) return toast.info("This booking is already fully paid.");
    // Declare amount for use by the surrounding module or function.
    const amount = Number(paymentAmount);
    // Check the condition (!Number.isInteger(amount) || amount < minimumInitialPayment || amount ) and run the matching branch.
    if (!Number.isInteger(amount) || amount < minimumInitialPayment || amount > balance) {
      // Return the result of toast.error() to the caller.
      return toast.error(`Enter an amount between KES ${minimumInitialPayment.toLocaleString()} and KES ${balance.toLocaleString()}.`);
    }
    // Check the condition (!travelDate) and run the matching branch.
    if (!travelDate) return toast.error("Please select a travel date.");
    // Check the condition (dateRange.min && dateRange.max && !isDateWithinRange(travelDate, dateR) and run the matching branch.
    if (dateRange.min && dateRange.max && !isDateWithinRange(travelDate, dateRange.min, dateRange.max)) return toast.error(`Select a travel date between ${dateRange.min} and ${dateRange.max}.`);
    // Check the condition (!pickupLocation.trim()) and run the matching branch.
    if (!pickupLocation.trim()) return toast.error("Please enter the pickup location.");
    // Check the condition (!pickupTime) and run the matching branch.
    if (!pickupTime) return toast.error("Please select the pickup date and time.");
    // Declare pickupDate for use by the surrounding module or function.
    const pickupDate = pickupTime.slice(0, 10);
    // Check the condition (!dateRange.min || !dateRange.max || !isDateWithinRange(pickupDate, dat) and run the matching branch.
    if (!dateRange.min || !dateRange.max || !isDateWithinRange(pickupDate, dateRange.min, dateRange.max)) {
      // Return the result of toast.error() to the caller.
      return toast.error(`Pickup date must be between ${dateRange.min} and ${dateRange.max}.`);
    }
    // Check the condition (pickupDate !== travelDate) and run the matching branch.
    if (pickupDate !== travelDate) {
      // Return the result of toast.error() to the caller.
      return toast.error("Pickup date must match the selected travel date.");
    }
    // Check the condition (selectedPaymentMethod === "MPESA" && !validPhone(normalizePhone(phone)) and run the matching branch.
    if (selectedPaymentMethod === "MPESA" && !validPhone(normalizePhone(phone))) return toast.error("Enter a valid Safaricom M-Pesa number.");

    // Check the condition (isBookingCheckout) and run the matching branch.
    if (isBookingCheckout) {
      // Check the condition (String(booking?.travelDate || "").slice(0, 10) !== travelDate) and run the matching branch.
      if (String(booking?.travelDate || "").slice(0, 10) !== travelDate) {
        // Run this operation with a dedicated error-handling path for failures.
        try { await updateBookingTravelDate(booking._id, travelDate); }
        // Handle the error raised by the preceding protected operation.
        catch (error) { return toast.error(error?.response?.data?.message || error?.message || "Unable to update the travel date."); }
      }
      // Perform the side effect or state update expressed on the following line.
      await startPayment({ bookingId: booking._id, phoneNumber: phone, amount });
      // Return the result to the caller.
      return;
    }

    // Declare count for use by the surrounding module or function.
    const count = Number(travellers);
    // Declare totalSlots for use by the surrounding module or function.
    const totalSlots = Number(tour?.availabilitySettings?.totalSlots ?? tour?.totalSlots ?? tour?.capacity ?? tour?.maxGuests ?? 0);
    // Declare bookedSlots for use by the surrounding module or function.
    const bookedSlots = Number(tour?.availabilitySettings?.bookedSlots ?? tour?.bookedSlots ?? 0);
    // Declare available for use by the surrounding module or function.
    const available = Math.max(totalSlots - bookedSlots, 0);
    // Check the condition (!Number.isInteger(count) || count < 1) and run the matching branch.
    if (!Number.isInteger(count) || count < 1) return toast.error("Enter at least 1 traveller.");
    // Check the condition (available > 0 && count > available) and run the matching branch.
    if (available > 0 && count > available) return toast.error(`Only ${available} slot(s) are available.`);

    // Declare travelers for use by the surrounding module or function.
    const travelers = Array.from({ length: count }, (_, index) => ({ name: `Traveller ${index + 1}`, age: 0, passportNumber: "" }));
    // Perform the side effect or state update expressed on the following line.
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
      paymentMethod: selectedPaymentMethod,
      normalizedPhone: normalizePhone(phone),
    });
  };

  // Check the condition (bookingLoading || tourLoading || customRequestLoading) and run the matching branch.
  if (bookingLoading || tourLoading || customRequestLoading) return <div className="flex min-h-screen items-center justify-center">Loading checkout...</div>;
  // Check the condition (isBookingCheckout && !booking?._id) and run the matching branch.
  if (isBookingCheckout && !booking?._id) return <div className="flex min-h-screen items-center justify-center text-red-600">Booking not found.</div>;
  // Check the condition (isTourCheckout && !tour?._id) and run the matching branch.
  if (isTourCheckout && !tour?._id) return <div className="flex min-h-screen items-center justify-center text-red-600">Tour not found.</div>;

  // Declare successful for use by the surrounding module or function.
  const successful = paymentState?.status === "completed";
  // Declare submitting for use by the surrounding module or function.
  const submitting = createBookingMutation.isPending || paymentMutation.isPending || otherPaymentMutation.isPending;
  // Declare priceIsSuspicious for use by the surrounding module or function.
  const priceIsSuspicious = isTourCheckout && baseTourPrice <= 1;
  // Declare showCheckoutForm for use by the surrounding module or function.
  const showCheckoutForm = !successful && (isTourCheckout ? baseTourPrice > 0 : balance > 0);
  // Declare bookingIsConfirmedPaid for use by the surrounding module or function.
  const bookingIsConfirmedPaid = isBookingCheckout && total > 0 && balance <= 0 && String(booking?.paymentStatus || "").toLowerCase() === "paid";
  // Declare dateRangeText for use by the surrounding module or function.
  const dateRangeText = dateRange.min && dateRange.max ? `${dateRange.min} to ${dateRange.max}` : "the tour dates";

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:py-10">
      <main className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Secure checkout</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Complete your booking</h1>
        <p className="mt-2 text-slate-500">Pay your required deposit or full balance. You can make additional payments later until the balance is cleared.</p>

        <section className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">
          <h2 className="text-2xl font-bold">{isBookingCheckout ? booking?.title || "Custom Tour Package" : tour?.title || "Tour Booking"}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Stat label="Total cost" value={`KES ${total.toLocaleString()}`} />
            <Stat label="Amount paid" value={`KES ${amountPaid.toLocaleString()}`} />
            <Stat label="Balance" value={`KES ${balance.toLocaleString()}`} />
          </div>
        </section>

        {priceIsSuspicious && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Check tour price:</strong> this tour is currently configured at KES {baseTourPrice.toLocaleString()} per traveller.</div>}

        <section className="mt-6 grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:grid-cols-2">
          <Detail label="Travel date" value={travelDate || "Select below"} />
          <Detail label="Allowed dates" value={dateRangeText} />
          <Detail label="Travellers" value={travellers} />
          <Detail label="Pickup" value={pickupLocation || "Enter below"} />
          <Detail label="Pickup time" value={pickupTime || "Select below"} />
        </section>

        {paymentState && <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-bold">{successful ? "Payment successful" : paymentState.status === "pending" ? selectedPaymentMethod === "MPESA" ? "Waiting for M-Pesa payment" : "Payment pending" : "Payment failed"}</h2><p className="mt-2 text-slate-700">{paymentState.message}</p>{paymentState.status === "pending" && selectedPaymentMethod === "MPESA" && <p className="mt-3 font-bold text-amber-800">Check your phone and enter your M-Pesa PIN.</p>}{paymentState.status === "pending" && selectedPaymentMethod === "BANK_TRANSFER" && settings.bankInstructions && <p className="mt-3 whitespace-pre-line text-amber-950">{settings.bankInstructions}</p>}{paymentState.status === "pending" && selectedPaymentMethod === "CASH" && <p className="mt-3 whitespace-pre-line text-amber-950">{settings.cashInstructions} {settings.cashCollectionLocation}</p>}{paymentState.mpesaReceiptNumber && <p className="mt-2 text-sm font-semibold">M-Pesa receipt: {paymentState.mpesaReceiptNumber}</p>}{paymentState.status === "pending" && paymentState.bookingId && <button type="button" onClick={() => navigate(`/bookings/${paymentState.bookingId}`)} className="mt-4 rounded-xl border border-amber-700 px-5 py-3 font-bold text-amber-900">View booking status</button>}{successful && <button type="button" onClick={() => navigate(`/bookings/${paymentState.bookingId}`)} className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">View Booking & Remaining Balance</button>}{["failed", "cancelled", "timeout"].includes(paymentState.status) && <button type="button" onClick={() => setPaymentState(null)} className="mt-4 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white">Retry Payment</button>}</section>}

        {showCheckoutForm && <form onSubmit={submit} className="mt-6 space-y-5">
          <Field label="Travel date" required><input type="date" value={travelDate} min={dateRange.min || undefined} max={dateRange.max || undefined} onChange={(e) => setTravelDate(e.target.value)} className="w-full rounded-xl border p-3 text-base touch-manipulation" required /></Field>
          <p className="-mt-3 text-sm text-slate-500">You can only select a date from {dateRange.min || "the tour start"} through {dateRange.max || "the tour end"}. Dates outside this period are disabled.</p>
          <Field label="Number of travellers" required={!isBookingCheckout}>
            <input
              type="number"
              min="1"
              step="1"
              value={travellers}
              onChange={(e) => setTravellers(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full rounded-xl border p-3 text-base touch-manipulation"
              required={!isBookingCheckout}
              aria-label="Number of travellers"
            />
          </Field>
          <fieldset className="rounded-2xl border border-slate-200 p-4"><legend className="px-2 font-bold text-slate-900">Payment method</legend>{availablePaymentMethods.length ? <div className="grid gap-3 sm:grid-cols-2">{availablePaymentMethods.map((method) => <label key={method.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${selectedPaymentMethod === method.id ? "border-emerald-600 bg-emerald-50" : "border-slate-200"}`}><input type="radio" name="paymentMethod" value={method.id} checked={selectedPaymentMethod === method.id} onChange={() => setSelectedPaymentMethod(method.id)} className="mt-1 accent-emerald-700"/><span><span className="block font-bold">{method.label}</span><span className="mt-1 block text-sm text-slate-600">{method.detail}</span></span></label>)}</div> : <p role="status" className="text-sm text-amber-900">{settingsLoading ? "Loading payment options…" : settingsError ? "Payment options could not be loaded. Refresh the page or contact the tour operator." : <>No payment methods are enabled for this tour operator. If you manage this tenant, enable and complete a payment method in Admin → Finance &amp; Insight → Payment gateways. Customers can contact the tour operator for help.</>}</p>}</fieldset>
          {availablePaymentMethods.some(({ id: method }) => method === "MPESA") && selectedPaymentMethod === "MPESA" && <Field label="M-Pesa phone number" required><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0707476586" autoComplete="tel" className="w-full rounded-xl border p-3 text-base touch-manipulation" required /></Field>}
          {selectedPaymentMethod === "BANK_TRANSFER" && <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><p className="font-bold">Bank transfer details</p><p>{settings.bankName} · {settings.bankAccountName} · {settings.bankAccountNumber}{settings.bankBranch ? ` · ${settings.bankBranch}` : ""}</p>{settings.bankSwiftCode && <p>SWIFT/BIC: {settings.bankSwiftCode}</p>}{settings.bankReferenceInstructions && <p className="mt-2">{settings.bankReferenceInstructions}</p>}<p className="mt-2">Your booking remains pending until staff verify receipt.</p></div>}
          {selectedPaymentMethod === "CASH" && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><p className="font-bold">Cash collection</p><p>{settings.cashCollectionLocation}</p><p className="mt-2 whitespace-pre-line">{settings.cashInstructions}</p><p className="mt-2">The booking is pending until staff confirm they received the cash.</p></div>}
          <Field label="Exact pickup location" required><input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g. Sarova Stanley, Nairobi" className="w-full rounded-xl border p-3 text-base touch-manipulation" required /></Field>
          <Field label="Pickup date & time" required><input type="datetime-local" value={pickupTime} min={dateRange.min ? `${dateRange.min}T00:00` : undefined} max={dateRange.max ? `${dateRange.max}T23:59` : undefined} onChange={(e) => { const value = e.target.value; setPickupTime(value ? `${travelDate || value.slice(0, 10)}T${value.slice(11, 16)}` : ""); }} className="w-full rounded-xl border p-3 text-base touch-manipulation" required /></Field>
          <p className="-mt-3 text-sm text-slate-500">Pickup must be on the selected travel date and within the tour dates: {dateRangeText}.</p>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Hotel / accommodation"><input value={hotelName} onChange={(e) => setHotelName(e.target.value)} className="w-full rounded-xl border p-3 text-base touch-manipulation" /></Field><Field label="Room number"><input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="w-full rounded-xl border p-3 text-base touch-manipulation" /></Field></div>
          <Field label="Special requests"><textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows="4" className="w-full rounded-xl border p-3 text-base touch-manipulation" /></Field>
          {availablePaymentMethods.length > 0 && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><label className="block text-sm font-bold">Pay now (KES)</label><input type="number" min={minimumInitialPayment || 1} max={balance} step="1" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} inputMode="numeric" pattern="[0-9]*" className="mt-2 w-full rounded-xl border border-emerald-300 p-3 text-base font-bold touch-manipulation sm:w-64" required /></div><button type="button" onClick={() => setPaymentAmount(String(balance))} className="rounded-xl border border-emerald-700 px-4 py-3 font-semibold text-emerald-800">Pay full balance</button></div>{bookingDepositRate > 0 ? <p className="mt-2 text-sm font-semibold text-emerald-900">Required initial deposit: {bookingDepositRate}% = KES {minimumInitialPayment.toLocaleString()}. You may pay more or the full balance.</p> : <p className="mt-2 text-sm text-slate-600">No minimum deposit is configured. You may pay any amount up to the remaining balance.</p>}<p className="mt-1 text-xs text-slate-600">The global deposit rate is controlled by SuperAdmin and applies to new payment requests.</p></div>}
          <button type="submit" disabled={submitting || !availablePaymentMethods.length} className="w-full rounded-xl bg-emerald-700 py-4 font-bold text-white disabled:opacity-50">{submitting ? "Starting…" : !availablePaymentMethods.length ? "Payment unavailable" : selectedPaymentMethod === "MPESA" ? `Pay KES ${Number(paymentAmount || 0).toLocaleString()} with M-Pesa` : selectedPaymentMethod === "CARD" ? `Continue to card payment · KES ${Number(paymentAmount || 0).toLocaleString()}` : selectedPaymentMethod === "PAYPAL" ? `Continue to PayPal · KES ${Number(paymentAmount || 0).toLocaleString()}` : selectedPaymentMethod === "BANK_TRANSFER" ? `Create pending bank transfer · KES ${Number(paymentAmount || 0).toLocaleString()}` : `Reserve with cash · KES ${Number(paymentAmount || 0).toLocaleString()}`}</button>
        </form>}

        {bookingIsConfirmedPaid && !paymentState && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 font-semibold text-emerald-900">This booking is fully paid. You are eligible to proceed with the trip once normal operational requirements are satisfied.</div>}
      </main>
    </div>
  );
}

// Define Stat; its parameters and body implement this operation.
function Stat({ label, value }) { return <div><p className="text-xs uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></div>; }
// Define Detail; its parameters and body implement this operation.
function Detail({ label, value }) { return <div><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>; }
// Define Field; its parameters and body implement this operation.
function Field({ label, required, children }) { return <label className="block"><span className="mb-2 block font-medium">{label}{required && <span className="text-red-600"> *</span>}</span>{children}</label>; }
