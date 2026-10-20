/*
 * Booking and payment lifecycle constants.
 * These arrays and transition maps are the shared vocabulary for validation
 * across controllers, services and models. Keep them aligned with persisted data.
 */

// Allowed overall booking lifecycle states, from creation through completion/cancellation.
export const BOOKING_STATUSES = [
  "pending", // Booking exists but has not yet been confirmed.
  "failed", // Booking attempt could not be completed.
  "confirmed", // Booking is accepted and confirmed.
  "assigned", // Staff/resources have been assigned to the booking.
  "ongoing", // The tour or service has started.
  "completed", // The booked service has finished.
  "cancelled", // The booking was cancelled.
  "refunded", // The booking has reached the refunded state.
];

// Allowed states for the amount paid against a booking.
export const BOOKING_PAYMENT_STATUSES = [
  "pending", // No successful payment has been recorded yet.
  "partial", // Some, but not all, of the amount due has been paid.
  "paid", // The required amount has been paid.
  "failed", // A payment attempt failed.
  "cancelled", // The payment attempt was cancelled.
  "refunded", // Paid funds have been refunded according to policy.
];

// Allowed states for an individual payment transaction.
export const PAYMENT_STATUSES = [
  "pending", // Payment record exists but processing is not complete.
  "processing", // A provider or payment workflow is processing the request.
  "completed", // The payment has been confirmed by a trusted source.
  "failed", // The provider confirmed that the attempt failed.
  "cancelled", // The attempt was cancelled.
  "refunded", // The completed payment was refunded.
];

// Canonical payment method values accepted by booking/payment workflows.
export const PAYMENT_METHODS = {
  MPESA: "MPESA", // Mobile money through M-Pesa.
  CARD: "CARD", // Card payment.
  PAYPAL: "PAYPAL", // PayPal payment.
  BANK_TRANSFER: "BANK_TRANSFER", // Bank transfer.
  CASH: "CASH", // Cash received and recorded by an authorized user.
};

// Define which overall booking state changes are allowed from each current state.
export const BOOKING_STATUS_TRANSITIONS = {
  pending: ["confirmed", "failed", "cancelled"], // A new booking can be confirmed, fail, or be cancelled.
  failed: ["pending", "confirmed", "cancelled"], // A failed attempt may be retried or resolved.
  confirmed: ["assigned", "cancelled", "refunded"], // A confirmed booking can be assigned or closed under policy.
  assigned: ["ongoing", "completed", "cancelled", "refunded"], // Assigned work can start, finish or be cancelled.
  ongoing: ["completed", "cancelled", "refunded"], // Work in progress can finish or be stopped.
  completed: [], // Completed bookings are terminal in this transition map.
  cancelled: [], // Cancelled bookings are terminal in this transition map.
  refunded: [], // Refunded bookings are terminal in this transition map.
};

// Define permitted changes to the amount-paid state of a booking.
export const BOOKING_PAYMENT_STATUS_TRANSITIONS = {
  pending: ["partial", "paid", "failed", "cancelled"], // Pending payment may progress or end unsuccessfully.
  partial: ["paid", "failed", "cancelled", "refunded"], // A partial balance may be settled or closed/refunded.
  paid: ["refunded"], // A paid booking may transition to refunded under refund rules.
  failed: ["pending", "partial", "paid"], // A retry or later verified payment can resolve a failure.
  cancelled: ["pending", "partial", "paid"], // A permitted retry may reopen payment processing.
  refunded: [], // Refunded payment state is terminal in this map.
};

// Define permitted changes to an individual payment transaction's state.
export const PAYMENT_STATUS_TRANSITIONS = {
  pending: ["processing", "completed", "failed", "cancelled"], // A new attempt can start, succeed or end.
  processing: ["completed", "failed", "cancelled"], // Processing must resolve to a final result.
  completed: ["refunded"], // A confirmed payment can later be refunded.
  failed: ["pending", "processing", "completed"], // Retry/reconciliation may resolve a failed state.
  cancelled: ["pending", "processing"], // A cancelled attempt may be replaced by a new attempt.
  refunded: [], // Refunded transactions are terminal in this transition map.
};

// Check whether a value is one of the supported overall booking states.
export const isValidBookingStatus = (status) =>
  BOOKING_STATUSES.includes(status);

// Check whether a value is one of the supported booking payment states.
export const isValidBookingPaymentStatus = (status) =>
  BOOKING_PAYMENT_STATUSES.includes(status);

// Check whether a value is one of the supported payment transaction states.
export const isValidPaymentStatus = (status) =>
  PAYMENT_STATUSES.includes(status);

// Check whether a value matches one of the canonical payment method values.
export const isValidPaymentMethod = (method) =>
  Object.values(PAYMENT_METHODS).includes(method);

// Check whether the booking can move from its current state to the requested state.
export const canTransitionBookingStatus = (
  currentStatus, // Current persisted booking status.
  newStatus // Proposed next booking status.
) =>
  BOOKING_STATUS_TRANSITIONS[
    currentStatus // Look up the transitions allowed from the current state.
  ]?.includes(newStatus) ?? false; // Safely return false if the current state is unknown.

// Check whether the booking's payment state can move to the proposed state.
export const canTransitionBookingPaymentStatus = (
  currentStatus, // Current booking payment status.
  newStatus // Proposed booking payment status.
) =>
  BOOKING_PAYMENT_STATUS_TRANSITIONS[
    currentStatus // Find the transition list for the current payment state.
  ]?.includes(newStatus) ?? false; // Unknown states cannot transition by default.

// Check whether an individual payment transaction can move to the proposed state.
export const canTransitionPaymentStatus = (
  currentStatus, // Current payment transaction status.
  newStatus // Proposed payment transaction status.
) =>
  PAYMENT_STATUS_TRANSITIONS[
    currentStatus // Find allowed transitions from the current transaction state.
  ]?.includes(newStatus) ?? false; // Return false if no transition is defined.
