import { mergeTenantFilter } from "../tenancy/context.js";
import {
  BOOKING_STATUSES,
  isValidBookingStatus,
  canTransitionBookingStatus,
} from "../constants/bookingConstants.js";

/*
|--------------------------------------------------------------------------
| BOOKING STATUS SERVICE
|--------------------------------------------------------------------------
| Central validation for booking lifecycle transitions.
|--------------------------------------------------------------------------
*/

export const validateBookingStatus = (status) => {
  if (!isValidBookingStatus(status)) {
    const error = new Error(
      `Invalid booking status "${status}". Allowed statuses: ${BOOKING_STATUSES.join(", ")}`
    );

    error.statusCode = 400;

    throw error;
  }

  return true;
};

export const transitionBookingStatus = (
  booking,
  nextStatus,
  options = {}
) => {
  const {
    allowSame = false,
    allowRefund = true,
  } = options;

  validateBookingStatus(nextStatus);

  const currentStatus = booking.status;

  if (currentStatus === nextStatus) {
    if (allowSame) {
      return booking;
    }

    const error = new Error(
      `Booking is already ${nextStatus}.`
    );

    error.statusCode = 400;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | REFUNDS
  |--------------------------------------------------------------------------
  |
  | A refund is a financial lifecycle event and may legitimately move
  | a completed/cancelled booking into refunded.
  |--------------------------------------------------------------------------
  */

  if (
    allowRefund &&
    nextStatus === "refunded"
  ) {
    booking.status = "refunded";
    return booking;
  }

  if (
    !canTransitionBookingStatus(
      currentStatus,
      nextStatus
    )
  ) {
    const error = new Error(
      `Booking cannot transition from "${currentStatus}" to "${nextStatus}".`
    );

    error.statusCode = 400;

    throw error;
  }

  booking.status = nextStatus;

  return booking;
};

export default transitionBookingStatus;
