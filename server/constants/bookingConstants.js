/**
 * Purpose: booking Constants server application module. Main declarations: isValidBookingStatus, isValidBookingPaymentStatus, isValidPaymentStatus, isValidPaymentMethod, canTransitionBookingStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
/*
|--------------------------------------------------------------------------
| BOOKING CONSTANTS
|--------------------------------------------------------------------------
| Single source of truth for booking lifecycle, booking payment state,
| payment transaction state, and payment methods.
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| BOOKING STATUS
|--------------------------------------------------------------------------
*/

// Declare BOOKING_STATUSES for use by the surrounding module or function.
export const BOOKING_STATUSES = [
  "pending",
  "failed",
  "confirmed",
  "assigned",
  "ongoing",
  "completed",
  "cancelled",
  "refunded",
];


/*
|--------------------------------------------------------------------------
| BOOKING PAYMENT STATUS
|--------------------------------------------------------------------------
| This belongs to Booking.paymentStatus.
|--------------------------------------------------------------------------
*/

// Declare BOOKING_PAYMENT_STATUSES for use by the surrounding module or function.
export const BOOKING_PAYMENT_STATUSES = [
  "pending",
  "partial",
  "paid",
  "failed",
  "cancelled",
  "refunded",
];


/*
|--------------------------------------------------------------------------
| PAYMENT TRANSACTION STATUS
|--------------------------------------------------------------------------
| This belongs to Payment.status.
|--------------------------------------------------------------------------
*/

// Declare PAYMENT_STATUSES for use by the surrounding module or function.
export const PAYMENT_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
  "refunded",
];


/*
|--------------------------------------------------------------------------
| PAYMENT METHODS
|--------------------------------------------------------------------------
*/

// Declare PAYMENT_METHODS for use by the surrounding module or function.
export const PAYMENT_METHODS = {
  MPESA: "MPESA",
  CARD: "CARD",
  PAYPAL: "PAYPAL",
  BANK_TRANSFER: "BANK_TRANSFER",
  CASH: "CASH",
};


/*
|--------------------------------------------------------------------------
| BOOKING STATUS TRANSITIONS
|--------------------------------------------------------------------------
*/

// Declare BOOKING_STATUS_TRANSITIONS for use by the surrounding module or function.
export const BOOKING_STATUS_TRANSITIONS = {
  pending: [
    "confirmed",
    "failed",
    "cancelled",
  ],

  failed: [
    "pending",
    "confirmed",
    "cancelled",
  ],

  confirmed: [
    "assigned",
    "cancelled",
    "refunded",
  ],

  assigned: [
    "ongoing",
    "completed",
    "cancelled",
    "refunded",
  ],

  ongoing: [
    "completed",
    "cancelled",
    "refunded",
  ],

  completed: [],

  cancelled: [],

  refunded: [],
};


/*
|--------------------------------------------------------------------------
| BOOKING PAYMENT STATUS TRANSITIONS
|--------------------------------------------------------------------------
*/

// Declare BOOKING_PAYMENT_STATUS_TRANSITIONS for use by the surrounding module or function.
export const BOOKING_PAYMENT_STATUS_TRANSITIONS = {
  pending: [
    "partial",
    "paid",
    "failed",
    "cancelled",
  ],

  partial: [
    "paid",
    "failed",
    "cancelled",
    "refunded",
  ],

  paid: [
    "refunded",
  ],

  failed: [
    "pending",
    "partial",
    "paid",
  ],

  cancelled: [
    "pending",
    "partial",
    "paid",
  ],

  refunded: [],
};


/*
|--------------------------------------------------------------------------
| PAYMENT TRANSACTION STATUS TRANSITIONS
|--------------------------------------------------------------------------
*/

// Declare PAYMENT_STATUS_TRANSITIONS for use by the surrounding module or function.
export const PAYMENT_STATUS_TRANSITIONS = {
  pending: [
    "processing",
    "completed",
    "failed",
    "cancelled",
  ],

  processing: [
    "completed",
    "failed",
    "cancelled",
  ],

  completed: [
    "refunded",
  ],

  failed: [
    "pending",
    "processing",
    "completed",
  ],

  cancelled: [
    "pending",
    "processing",
  ],

  refunded: [],
};


/*
|--------------------------------------------------------------------------
| VALIDATION HELPERS
|--------------------------------------------------------------------------
*/

// Declare isValidBookingStatus for use by the surrounding module or function.
export const isValidBookingStatus = (status) =>
  BOOKING_STATUSES.includes(status);


// Declare isValidBookingPaymentStatus for use by the surrounding module or function.
export const isValidBookingPaymentStatus = (status) =>
  BOOKING_PAYMENT_STATUSES.includes(status);


// Declare isValidPaymentStatus for use by the surrounding module or function.
export const isValidPaymentStatus = (status) =>
  PAYMENT_STATUSES.includes(status);


// Declare isValidPaymentMethod for use by the surrounding module or function.
export const isValidPaymentMethod = (method) =>
  Object.values(PAYMENT_METHODS).includes(method);


/*
|--------------------------------------------------------------------------
| TRANSITION HELPERS
|--------------------------------------------------------------------------
*/

// Declare canTransitionBookingStatus for use by the surrounding module or function.
export const canTransitionBookingStatus = (
  currentStatus,
  newStatus
) =>
  BOOKING_STATUS_TRANSITIONS[
    currentStatus
  ]?.includes(newStatus) ?? false;


// Declare canTransitionBookingPaymentStatus for use by the surrounding module or function.
export const canTransitionBookingPaymentStatus = (
  currentStatus,
  newStatus
) =>
  BOOKING_PAYMENT_STATUS_TRANSITIONS[
    currentStatus
  ]?.includes(newStatus) ?? false;


// Declare canTransitionPaymentStatus for use by the surrounding module or function.
export const canTransitionPaymentStatus = (
  currentStatus,
  newStatus
) =>
  PAYMENT_STATUS_TRANSITIONS[
    currentStatus
  ]?.includes(newStatus) ?? false;
