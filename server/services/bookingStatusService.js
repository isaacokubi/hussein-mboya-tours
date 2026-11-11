/**
 * Purpose: booking Status Service business-logic service. Main declarations: validateBookingStatus, transitionBookingStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../constants/bookingConstants.js so this module can use its exported dependencies.
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

// Declare validateBookingStatus for use by the surrounding module or function.
export const validateBookingStatus = (status) => {
  // Check the condition (!isValidBookingStatus(status)) and run the matching branch.
  if (!isValidBookingStatus(status)) {
    // Declare error for use by the surrounding module or function.
    const error = new Error(
      `Invalid booking status "${status}". Allowed statuses: ${BOOKING_STATUSES.join(", ")}`
    );

    // Perform the side effect or state update expressed on the following line.
    error.statusCode = 400;

    // Stop the current operation by raising the value of error.
    throw error;
  }

  // Return the expression shown below to the caller.
  return true;
};

// Declare transitionBookingStatus for use by the surrounding module or function.
export const transitionBookingStatus = (
  booking,
  nextStatus,
  options = {}
) => {
  // Declare { allowSame = false, allowRefund = true, } for use by the surrounding module or function.
  const {
    allowSame = false,
    allowRefund = true,
  } = options;

  // Perform the side effect or state update expressed on the following line.
  validateBookingStatus(nextStatus);

  // Declare currentStatus for use by the surrounding module or function.
  const currentStatus = booking.status;

  // Check the condition (currentStatus === nextStatus) and run the matching branch.
  if (currentStatus === nextStatus) {
    // Check the condition (allowSame) and run the matching branch.
    if (allowSame) {
      // Return the value of booking to the caller.
      return booking;
    }

    // Declare error for use by the surrounding module or function.
    const error = new Error(
      `Booking is already ${nextStatus}.`
    );

    // Perform the side effect or state update expressed on the following line.
    error.statusCode = 400;

    // Stop the current operation by raising the value of error.
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

  // Check the condition (allowRefund && nextStatus === "refunded") and run the matching branch.
  if (
    allowRefund &&
    nextStatus === "refunded"
  ) {
    // Perform the side effect or state update expressed on the following line.
    booking.status = "refunded";
    // Return the value of booking to the caller.
    return booking;
  }

  // Check the condition (!canTransitionBookingStatus( currentStatus, nextStatus )) and run the matching branch.
  if (
    !canTransitionBookingStatus(
      currentStatus,
      nextStatus
    )
  ) {
    // Declare error for use by the surrounding module or function.
    const error = new Error(
      `Booking cannot transition from "${currentStatus}" to "${nextStatus}".`
    );

    // Perform the side effect or state update expressed on the following line.
    error.statusCode = 400;

    // Stop the current operation by raising the value of error.
    throw error;
  }

  // Perform the side effect or state update expressed on the following line.
  booking.status = nextStatus;

  // Return the value of booking to the caller.
  return booking;
};

export default transitionBookingStatus;
