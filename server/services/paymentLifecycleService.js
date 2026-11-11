/**
 * Purpose: payment Lifecycle Service business-logic service. Main declarations: normalizePaymentMethod, getRequesterRole, isStaffUser, userOwnsBooking, canAccessBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
/*
|--------------------------------------------------------------------------
| PAYMENT LIFECYCLE SERVICE
|--------------------------------------------------------------------------
| Central source of truth for:
| - Booking ownership
| - Payment amount calculation
| - Payment method normalization
| - Payment status synchronization
| - Idempotent payment completion
|--------------------------------------------------------------------------
*/

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ./emailService.js so this module can use its exported dependencies.
import { sendPaymentConfirmationEmail, sendBookingStatusEmail, sendEmailBestEffort } from "./emailService.js";

// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ./operationalAccountingService.js so this module can use its exported dependencies.
import { postPaymentToLedger, postPaymentRefundToLedger } from "./operationalAccountingService.js";

// Load ../constants/bookingConstants.js so this module can use its exported dependencies.
import {
  BOOKING_PAYMENT_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "../constants/bookingConstants.js";


/*
|--------------------------------------------------------------------------
| NORMALIZE PAYMENT METHOD
|--------------------------------------------------------------------------
*/

// Declare normalizePaymentMethod for use by the surrounding module or function.
export const normalizePaymentMethod = (method) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

  // Declare value for use by the surrounding module or function.
  const value =
    String(method || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

  // Declare aliases for use by the surrounding module or function.
  const aliases = {
    MPESA: PAYMENT_METHODS.MPESA,
    M_PESA: PAYMENT_METHODS.MPESA,

    CARD: PAYMENT_METHODS.CARD,

    PAYPAL: PAYMENT_METHODS.PAYPAL,

    BANK: PAYMENT_METHODS.BANK_TRANSFER,
    BANK_TRANSFER: PAYMENT_METHODS.BANK_TRANSFER,

    CASH: PAYMENT_METHODS.CASH,
  };

  // Return the expression shown below to the caller.
  return aliases[value] || null;
};


/*
|--------------------------------------------------------------------------
| GET REQUESTER ROLE
|--------------------------------------------------------------------------
*/

// Declare getRequesterRole for use by the surrounding module or function.
export const getRequesterRole = (user) => {

  // Return the result of String(     user?.roleId?.name ||     user?.role ||     user?.legacyRole ||     ""   )     .trim()     .toLowerCase()     .replace() to the caller.
  return String(
    user?.roleId?.name ||
    user?.role ||
    user?.legacyRole ||
    ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
};


/*
|--------------------------------------------------------------------------
| STAFF ROLES
|--------------------------------------------------------------------------
*/

// Declare isStaffUser for use by the surrounding module or function.
export const isStaffUser = (user) => {

  // Declare role for use by the surrounding module or function.
  const role = getRequesterRole(user);

  // Return the result of [     "admin",     "super_admin",     "administrator",     "manager",     "tourmanager",     "guide",     "tourguide",     "agent",     "travelagent",   ].includes() to the caller.
  return [
    "admin",
    "super_admin",
    "administrator",
    "manager",
    "tourmanager",
    "guide",
    "tourguide",
    "agent",
    "travelagent",
  ].includes(role);
};


/*
|--------------------------------------------------------------------------
| BOOKING OWNERSHIP
|--------------------------------------------------------------------------
*/

// Declare userOwnsBooking for use by the surrounding module or function.
export const userOwnsBooking = (booking, user) => {

  // Check the condition (!booking || !user?._id) and run the matching branch.
  if (!booking || !user?._id) {
    // Return the expression shown below to the caller.
    return false;
  }

  // Declare userId for use by the surrounding module or function.
  const userId =
    user._id.toString();

  // Declare bookingUserId for use by the surrounding module or function.
  const bookingUserId =
    booking.user?.toString();

  // Declare bookingCustomerId for use by the surrounding module or function.
  const bookingCustomerId =
    booking.customer?.toString();

  // Declare snapshotEmail for use by the surrounding module or function.
  const snapshotEmail =
    String(
      booking.customerSnapshot?.email || ""
    )
      .trim()
      .toLowerCase();

  // Declare userEmail for use by the surrounding module or function.
  const userEmail =
    String(user.email || "")
      .trim()
      .toLowerCase();

  // Return the expression shown below to the caller.
  return (
    bookingUserId === userId ||
    bookingCustomerId === userId ||
    (
      snapshotEmail &&
      userEmail &&
      snapshotEmail === userEmail
    )
  );
};


/*
|--------------------------------------------------------------------------
| AUTHORIZE BOOKING ACCESS
|--------------------------------------------------------------------------
*/

// Declare canAccessBooking for use by the surrounding module or function.
export const canAccessBooking = (booking, user) => {

  // Check the condition (!booking || !user) and run the matching branch.
  if (!booking || !user) {
    // Return the expression shown below to the caller.
    return false;
  }

  // Return the expression shown below to the caller.
  return (
    isStaffUser(user) ||
    userOwnsBooking(booking, user)
  );
};


/*
|--------------------------------------------------------------------------
| SERVER AUTHORITATIVE PAYMENT AMOUNT
|--------------------------------------------------------------------------
| IMPORTANT:
| Never trust req.body.amount.
|--------------------------------------------------------------------------
*/

// Declare getPayableBookingAmount for use by the surrounding module or function.
export const getPayableBookingAmount = (booking) => {

  // Check the condition (!booking) and run the matching branch.
  if (!booking) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Booking is required.");
  }

  // Declare totalAmount for use by the surrounding module or function.
  const totalAmount =
    Number(booking.totalAmount || 0);

  // Declare balanceAmount for use by the surrounding module or function.
  const balanceAmount =
    Number(booking.balanceAmount || 0);

  // Declare depositDue for use by the surrounding module or function.
  const depositDue = Number(booking.depositAmount || 0);
  // Declare amountPaid for use by the surrounding module or function.
  const amountPaid = Number(booking.amountPaid || 0);

  // Check the condition (totalAmount <= 0) and run the matching branch.
  if (totalAmount <= 0) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Booking has an invalid total amount.");
  }

  /*
   * If there is an outstanding balance, pay the balance.
   * Otherwise pay the configured deposit/total.
   */

  // Check the condition (balanceAmount > 0 && amountPaid > 0) and run the matching branch.
  if (balanceAmount > 0 && amountPaid > 0) {
    // Return the result of Math.round() to the caller.
    return Math.round(balanceAmount);
  }

  // Check the condition (amountPaid === 0 && depositDue > 0) and run the matching branch.
  if (amountPaid === 0 && depositDue > 0) {
    // Return the result of Math.round() to the caller.
    return Math.round(Math.min(depositDue, totalAmount));
  }

  // Return the result of Math.round() to the caller.
  return Math.round(totalAmount);
};


/*
|--------------------------------------------------------------------------
| VALIDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/

// Declare validatePaymentStatus for use by the surrounding module or function.
export const validatePaymentStatus = (status) => {

  // Check the condition (!PAYMENT_STATUSES.includes(status)) and run the matching branch.
  if (!PAYMENT_STATUSES.includes(status)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(
      `Invalid payment transaction status: ${status}`
    );
  }

  // Return the expression shown below to the caller.
  return true;
};


/*
|--------------------------------------------------------------------------
| VALIDATE BOOKING PAYMENT STATUS
|--------------------------------------------------------------------------
*/

// Declare validateBookingPaymentStatus for use by the surrounding module or function.
export const validateBookingPaymentStatus = (status) => {

  // Check the condition (!BOOKING_PAYMENT_STATUSES.includes(status)) and run the matching branch.
  if (!BOOKING_PAYMENT_STATUSES.includes(status)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(
      `Invalid booking payment status: ${status}`
    );
  }

  // Return the expression shown below to the caller.
  return true;
};


/*
|--------------------------------------------------------------------------
| FIND PENDING PAYMENT
|--------------------------------------------------------------------------
*/

// Declare findPendingBookingPayment for use by the surrounding module or function.
export const findPendingBookingPayment = async (
  bookingId
) => {

  // Return the result of Payment.findOne(     mergeTenantFilter({       booking: bookingId,       status: {         $in: [           "pending",           "processing",         ],       },     })   ).sort() to the caller.
  return Payment.findOne(
    mergeTenantFilter({
      booking: bookingId,
      status: {
        $in: [
          "pending",
          "processing",
        ],
      },
    })
  ).sort({
    createdAt: -1,
  });
};


/*
|--------------------------------------------------------------------------
| FAIL PAYMENT + BOOKING
|--------------------------------------------------------------------------
| Idempotent:
| Repeated M-Pesa failure callbacks must not create inconsistent
| payment or booking state.
|--------------------------------------------------------------------------
*/

// Declare failBookingPayment for use by the surrounding module or function.
export const failBookingPayment = async ({
  payment,
  booking,
  failureReason = "",
  paymentData = {},
}) => {

  // Check the condition (!payment || !booking) and run the matching branch.
  if (!payment || !booking) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(
      "Payment and booking are required."
    );
  }

  // Declare session for use by the surrounding module or function.
  const session =
    await mongoose.startSession();

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare result for use by the surrounding module or function.
    let result;

    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {

      // Declare paymentDoc for use by the surrounding module or function.
      const paymentDoc =
        await Payment.findOne({
          _id: payment._id,
          tenantId: payment.tenantId,
        }).session(session);

      // Declare bookingDoc for use by the surrounding module or function.
      const bookingDoc =
        await Booking.findOne({
          _id: booking._id,
          tenantId: payment.tenantId,
        }).session(session);

      // Check the condition (!paymentDoc) and run the matching branch.
      if (!paymentDoc) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(
          "Payment not found."
        );
      }

      // Check the condition (!bookingDoc) and run the matching branch.
      if (!bookingDoc) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(
          "Booking not found."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | IDEMPOTENCY
      |--------------------------------------------------------------------------
      */

      // Check the condition (paymentDoc.status === "completed" || bookingDoc.paymentStatus === "pai) and run the matching branch.
      if (
        paymentDoc.status === "completed" ||
        bookingDoc.paymentStatus === "paid"
      ) {
        // Perform the side effect or state update expressed on the following line.
        result = {
          payment: paymentDoc,
          booking: bookingDoc,
          alreadyCompleted: true,
        };

        // Return the result to the caller.
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE PAYMENT
      |--------------------------------------------------------------------------
      */

      // Perform the side effect or state update expressed on the following line.
      paymentDoc.status =
        "failed";

      // Perform the side effect or state update expressed on the following line.
      paymentDoc.failureReason =
        failureReason ||
        paymentDoc.failureReason ||
        "M-Pesa payment failed.";

      // Check the condition (paymentData.callbackResponse) and run the matching branch.
      if (paymentData.callbackResponse) {
        // Perform the side effect or state update expressed on the following line.
        paymentDoc.callbackResponse =
          paymentData.callbackResponse;
      }

      // Check the condition (paymentData.checkoutRequestID) and run the matching branch.
      if (paymentData.checkoutRequestID) {
        // Perform the side effect or state update expressed on the following line.
        paymentDoc.checkoutRequestID =
          paymentData.checkoutRequestID;
      }

      // Check the condition (paymentData.merchantRequestID) and run the matching branch.
      if (paymentData.merchantRequestID) {
        // Perform the side effect or state update expressed on the following line.
        paymentDoc.merchantRequestID =
          paymentData.merchantRequestID;
      }

      // Perform the side effect or state update expressed on the following line.
      paymentDoc.failedAt =
        new Date();

      // Perform the side effect or state update expressed on the following line.
      await paymentDoc.save({
        session,
      });

      /*
      |--------------------------------------------------------------------------
      | UPDATE BOOKING
      |--------------------------------------------------------------------------
      */

      // Check the condition (bookingDoc.paymentStatus !== "paid") and run the matching branch.
      if (
        bookingDoc.paymentStatus !== "paid"
      ) {
        // Perform the side effect or state update expressed on the following line.
        bookingDoc.paymentStatus =
          "failed";

        // Check the condition (bookingDoc.status !== "completed" && bookingDoc.status !== "cancelled") and run the matching branch.
        if (
          bookingDoc.status !== "completed" &&
          bookingDoc.status !== "cancelled" &&
          bookingDoc.status !== "refunded"
        ) {
          // Perform the side effect or state update expressed on the following line.
          bookingDoc.status =
            "cancelled";

          // Perform the side effect or state update expressed on the following line.
          bookingDoc.cancellationReason =
            bookingDoc.cancellationReason ||
            "M-Pesa payment failed.";

          // Perform the side effect or state update expressed on the following line.
          bookingDoc.cancelledAt =
            bookingDoc.cancelledAt || new Date();
        }
      }

      // Perform the side effect or state update expressed on the following line.
      await bookingDoc.save({
        session,
      });

      // Perform the side effect or state update expressed on the following line.
      result = {
        payment: paymentDoc,
        booking: bookingDoc,
        alreadyCompleted: false,
      };
    });

    // Return the value of result to the caller.
    return result;

  } finally {

    // Perform the side effect or state update expressed on the following line.
    await session.endSession();

  }
};


/*
|--------------------------------------------------------------------------
| COMPLETE PAYMENT + BOOKING
|--------------------------------------------------------------------------
| Idempotent:
| Calling this multiple times should not create duplicate
| commissions or repeatedly mutate financial totals.
|--------------------------------------------------------------------------
*/

// Declare completeBookingPayment for use by the surrounding module or function.
export const completeBookingPayment = async ({
  payment,
  booking,
  paymentData = {},
}) => {

  // Check the condition (!payment || !booking) and run the matching branch.
  if (!payment || !booking) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(
      "Payment and booking are required."
    );
  }

  // Declare session for use by the surrounding module or function.
  const session =
    await mongoose.startSession();

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare result for use by the surrounding module or function.
    let result;

    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {

      /*
      |--------------------------------------------------------------------------
      | LOAD FRESH DOCUMENTS INSIDE TRANSACTION
      |--------------------------------------------------------------------------
      */

      // Declare paymentDoc for use by the surrounding module or function.
      const paymentDoc =
        await Payment.findOne({
          _id: payment._id,
          tenantId: payment.tenantId,
        }).session(session);

      // Declare bookingDoc for use by the surrounding module or function.
      const bookingDoc =
        await Booking.findOne({
          _id: booking._id,
          tenantId: payment.tenantId,
        }).session(session);

      // Check the condition (!paymentDoc) and run the matching branch.
      if (!paymentDoc) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(
          "Payment not found."
        );
      }

      // Check the condition (!bookingDoc) and run the matching branch.
      if (!bookingDoc) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(
          "Booking not found."
        );
      }


      /*
      |--------------------------------------------------------------------------
      | IDEMPOTENCY
      |--------------------------------------------------------------------------
      |
      | A provider callback may be delivered more than once.
      |
      */

      // Check the condition (paymentDoc.status === "completed" || bookingDoc.paymentStatus === "pai) and run the matching branch.
      if (
        paymentDoc.status === "completed" ||
        bookingDoc.paymentStatus === "paid"
      ) {

        // Perform the side effect or state update expressed on the following line.
        result = {
          payment: paymentDoc,
          booking: bookingDoc,
          alreadyCompleted: true,
        };

        // Return the result to the caller.
        return;
      }


      /*
      |--------------------------------------------------------------------------
      | NORMALIZE PAYMENT METHOD BEFORE SAVING
      |--------------------------------------------------------------------------
      */

      // Declare canonicalPaymentMethod for use by the surrounding module or function.
      const canonicalPaymentMethod =
        normalizePaymentMethod(
          paymentData.paymentMethod ||
          paymentDoc.paymentMethod ||
          paymentDoc.method ||
          bookingDoc.paymentMethod ||
          "MPESA"
        );


      /*
      |--------------------------------------------------------------------------
      | VALIDATE PAYMENT AMOUNT
      |--------------------------------------------------------------------------
      |
      | The successful provider amount must be positive.
      |
      */

      // Declare paymentAmount for use by the surrounding module or function.
      const paymentAmount =
        Number(
          paymentData.amount ??
          paymentDoc.amount ??
          0
        );

      // Check the condition (!Number.isFinite(paymentAmount) || paymentAmount <= 0) and run the matching branch.
      if (
        !Number.isFinite(paymentAmount) ||
        paymentAmount <= 0
      ) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(
          "Completed payment has an invalid amount."
        );
      }


      /*
      |--------------------------------------------------------------------------
      | VALIDATE BOOKING TOTAL
      |--------------------------------------------------------------------------
      */

      // Declare totalAmount for use by the surrounding module or function.
      const totalAmount =
        Number(
          bookingDoc.totalAmount || 0
        );

      // Check the condition (!Number.isFinite(totalAmount) || totalAmount <= 0) and run the matching branch.
      if (
        !Number.isFinite(totalAmount) ||
        totalAmount <= 0
      ) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(
          "Booking has an invalid total amount."
        );
      }


      /*
      |--------------------------------------------------------------------------
      | UPDATE PAYMENT
      |--------------------------------------------------------------------------
      */

      // Perform the side effect or state update expressed on the following line.
      paymentDoc.status =
        "completed";

      // Perform the side effect or state update expressed on the following line.
      paymentDoc.paidAt =
        paymentDoc.paidAt ||
        new Date();

      // Perform the side effect or state update expressed on the following line.
      paymentDoc.amount =
        paymentAmount;


      /*
      |--------------------------------------------------------------------------
      | NEVER ALLOW OVERPAYMENT / DOUBLE CREDIT
      |--------------------------------------------------------------------------
      | The booking's remaining balance is the maximum amount that can be
      | credited by this payment event. Provider callbacks and manual bank
      | verification must not be able to inflate depositAmount.
      |--------------------------------------------------------------------------
      */
      // Declare currentPaidAmount for use by the surrounding module or function.
      const currentPaidAmount = Number(bookingDoc.amountPaid || 0);
      // Declare remainingDue for use by the surrounding module or function.
      const remainingDue = Math.max(0, totalAmount - currentPaidAmount);

      // Check the condition (paymentAmount > remainingDue) and run the matching branch.
      if (paymentAmount > remainingDue) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(
          `Payment amount ${paymentAmount} exceeds remaining booking balance ${remainingDue}.`
        );
      }

      // Check the condition (paymentAmount <= 0 || remainingDue <= 0) and run the matching branch.
      if (paymentAmount <= 0 || remainingDue <= 0) {
        // Stop the current operation by raising a new Error instance.
        throw new Error("No amount remains due for this booking.");
      }

      /*
      |--------------------------------------------------------------------------
      | PAYMENT METHOD
      |--------------------------------------------------------------------------
      */

      // Check the condition (canonicalPaymentMethod) and run the matching branch.
      if (canonicalPaymentMethod) {

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.paymentMethod =
          canonicalPaymentMethod;
      }


      /*
      |--------------------------------------------------------------------------
      | PHONE
      |--------------------------------------------------------------------------
      */

      // Check the condition (paymentData.phoneNumber) and run the matching branch.
      if (
        paymentData.phoneNumber
      ) {

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.phoneNumber =
          String(
            paymentData.phoneNumber
          ).trim();
      }


      /*
      |--------------------------------------------------------------------------
      | M-PESA RECEIPT
      |--------------------------------------------------------------------------
      */

      // Check the condition (paymentData.mpesaReceiptNumber) and run the matching branch.
      if (
        paymentData.mpesaReceiptNumber
      ) {

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.mpesaReceiptNumber =
          String(
            paymentData.mpesaReceiptNumber
          ).trim();

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.transactionId =
          paymentData.mpesaReceiptNumber;

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.transactionReference =
          paymentData.mpesaReceiptNumber;
      }


      /*
      |--------------------------------------------------------------------------
      | GENERIC TRANSACTION ID
      |--------------------------------------------------------------------------
      */

      // Check the condition (paymentData.transactionId) and run the matching branch.
      if (
        paymentData.transactionId
      ) {

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.transactionId =
          String(
            paymentData.transactionId
          ).trim();
      }

      // Check the condition (paymentData.providerOrderId) and run the matching branch.
      if (paymentData.providerOrderId) paymentDoc.providerOrderId = String(paymentData.providerOrderId).trim();
      // Check the condition (paymentData.providerCaptureId) and run the matching branch.
      if (paymentData.providerCaptureId) paymentDoc.providerCaptureId = String(paymentData.providerCaptureId).trim();
      // Check the condition (paymentData.providerEnvironment) and run the matching branch.
      if (paymentData.providerEnvironment) paymentDoc.providerEnvironment = String(paymentData.providerEnvironment).trim();


      /*
      |--------------------------------------------------------------------------
      | PAYMENT REFERENCE
      |--------------------------------------------------------------------------
      */

      // Check the condition (paymentData.paymentReference) and run the matching branch.
      if (
        paymentData.paymentReference
      ) {

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.transactionReference =
          String(
            paymentData.paymentReference
          ).trim();
      }


      /*
      |--------------------------------------------------------------------------
      | M-PESA REQUEST IDS
      |--------------------------------------------------------------------------
      */

      // Check the condition (paymentData.merchantRequestID) and run the matching branch.
      if (
        paymentData.merchantRequestID
      ) {

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.merchantRequestID =
          paymentData.merchantRequestID;
      }

      // Check the condition (paymentData.checkoutRequestID) and run the matching branch.
      if (
        paymentData.checkoutRequestID
      ) {

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.checkoutRequestID =
          paymentData.checkoutRequestID;
      }


      /*
      |--------------------------------------------------------------------------
      | TRANSACTION DATE
      |--------------------------------------------------------------------------
      */

      // Check the condition (paymentData.transactionDate) and run the matching branch.
      if (
        paymentData.transactionDate
      ) {

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.transactionDate =
          paymentData.transactionDate;
      }


      /*
      |--------------------------------------------------------------------------
      | CALLBACK DATA
      |--------------------------------------------------------------------------
      */

      // Check the condition (paymentData.callbackResponse) and run the matching branch.
      if (
        paymentData.callbackResponse
      ) {

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.callbackResponse =
          paymentData.callbackResponse;
      }


      /*
      |--------------------------------------------------------------------------
      | SAVE PAYMENT
      |--------------------------------------------------------------------------
      */

      // Perform the side effect or state update expressed on the following line.
      await paymentDoc.save({
        session,
      });

      // Financial posting participates in the same MongoDB transaction as
      // payment completion. The post-save hook remains as an idempotent
      // compatibility fallback for legacy write paths.
      // Perform the side effect or state update expressed on the following line.
      await postPaymentToLedger(paymentDoc, { session });


      /*
      |--------------------------------------------------------------------------
      | CALCULATE TOTAL PAID
      |--------------------------------------------------------------------------
      |
      | amountPaid represents the cumulative amount actually paid. depositAmount remains the configured deposit requirement.
      | this booking.
      |
      */

      // Declare newPaidAmount for use by the surrounding module or function.
      const newPaidAmount =
        Math.min(
          totalAmount,
          currentPaidAmount +
            paymentAmount
        );


      /*
      |--------------------------------------------------------------------------
      | UPDATE BOOKING FINANCIAL STATE
      |--------------------------------------------------------------------------
      */

      // Perform the side effect or state update expressed on the following line.
      bookingDoc.amountPaid =
        newPaidAmount;

      // Perform the side effect or state update expressed on the following line.
      bookingDoc.balanceAmount =
        Math.max(
          0,
          totalAmount -
            newPaidAmount
        );


      /*
      |--------------------------------------------------------------------------
      | FULL VS PARTIAL PAYMENT
      |--------------------------------------------------------------------------
      */

      // Check the condition (bookingDoc.balanceAmount === 0) and run the matching branch.
      if (
        bookingDoc.balanceAmount === 0
      ) {

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.paymentStatus =
          "paid";

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.paidAt =
          bookingDoc.paidAt ||
          new Date();

        /*
        | Only move a pending booking to confirmed
        | when the complete amount has been received.
        */

        // Check the condition (bookingDoc.status === "pending" || bookingDoc.status === "failed") and run the matching branch.
        if (
          bookingDoc.status === "pending" ||
          bookingDoc.status === "failed"
        ) {

          // Perform the side effect or state update expressed on the following line.
          bookingDoc.status =
            "confirmed";
        }

      } else {

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.paymentStatus =
          "partial";
      }


      /*
      |--------------------------------------------------------------------------
      | BOOKING PAYMENT REFERENCES
      |--------------------------------------------------------------------------
      */

      // Check the condition (paymentData.mpesaReceiptNumber) and run the matching branch.
      if (
        paymentData.mpesaReceiptNumber
      ) {

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.mpesaReceipt =
          paymentData.mpesaReceiptNumber;

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.transactionId =
          paymentData.mpesaReceiptNumber;
      }

      // Check the condition (paymentData.transactionId) and run the matching branch.
      if (
        paymentData.transactionId
      ) {

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.transactionId =
          paymentData.transactionId;
      }

      // Check the condition (paymentData.paymentReference) and run the matching branch.
      if (
        paymentData.paymentReference
      ) {

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.paymentReference =
          paymentData.paymentReference;
      }

      // Check the condition (canonicalPaymentMethod) and run the matching branch.
      if (
        canonicalPaymentMethod
      ) {

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.paymentMethod =
          canonicalPaymentMethod;
      }


      /*
      |--------------------------------------------------------------------------
      | ATTACH PAYMENT TO BOOKING
      |--------------------------------------------------------------------------
      */

      // Declare alreadyAttached for use by the surrounding module or function.
      const alreadyAttached =
        Array.isArray(
          bookingDoc.payments
        ) &&
        bookingDoc.payments.some(
          (id) =>
            id.toString() ===
            paymentDoc._id.toString()
        );


      // Check the condition (!alreadyAttached) and run the matching branch.
      if (!alreadyAttached) {

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.payments =
          bookingDoc.payments || [];

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.payments.push(
          paymentDoc._id
        );
      }


      /*
      |--------------------------------------------------------------------------
      | SAVE BOOKING
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      | depositAmount is updated BEFORE save().
      |
      | Therefore Booking.pre("save") will calculate:
      |
      | balanceAmount =
      | totalAmount - depositAmount
      |
      | without destroying the payment state.
      |
      */

      // Perform the side effect or state update expressed on the following line.
      await bookingDoc.save({
        session,
      });


      /*
      |--------------------------------------------------------------------------
      | COMMISSION
      |--------------------------------------------------------------------------
      |
      | Create commission only once and only after the booking
      | has been fully paid.
      |
      */

      // Check the condition (bookingDoc.agent && bookingDoc.paymentStatus === "paid") and run the matching branch.
      if (
        bookingDoc.agent &&
        bookingDoc.paymentStatus === "paid"
      ) {

        // Declare existingCommission for use by the surrounding module or function.
        const existingCommission =
          await Commission.findOne({
            booking:
              bookingDoc._id,

            agent:
              bookingDoc.agent,
          }).session(session);


        // Check the condition (!existingCommission) and run the matching branch.
        if (!existingCommission) {

          // Declare agentRate for use by the surrounding module or function.
          const agentRate =
            Number(
              bookingDoc.commissionRate ||
              0
            );


          // Declare commissionAmount for use by the surrounding module or function.
          const commissionAmount =
            Number(
              bookingDoc.commissionAmount ||
              (
                Number(
                  bookingDoc.totalAmount || 0
                ) *
                agentRate
              ) / 100
            );


          // Check the condition (commissionAmount > 0) and run the matching branch.
          if (
            commissionAmount > 0
          ) {

            // Perform the side effect or state update expressed on the following line.
            await Commission.create(
              [{
                agent:
                  bookingDoc.agent,

                booking:
                  bookingDoc._id,

                customer:
                  bookingDoc.customer ||
                  bookingDoc.user ||
                  null,

                tour:
                  bookingDoc.tour ||
                  null,

                bookingAmount:
                  bookingDoc.totalAmount,

                rate:
                  agentRate,

                amount:
                  commissionAmount,

                status:
                  "pending",

                paymentMethod:
                  canonicalPaymentMethod ||
                  PAYMENT_METHODS.MPESA,

                paymentReference:
                  paymentData.mpesaReceiptNumber ||
                  paymentData.paymentReference ||
                  paymentData.transactionId ||
                  "",
              }],
              {
                session,
              }
            );
          }
        }
      }


      /*
      |--------------------------------------------------------------------------
      | RETURN RESULT
      |--------------------------------------------------------------------------
      */

      // Perform the side effect or state update expressed on the following line.
      result = {
        payment:
          paymentDoc,

        booking:
          bookingDoc,

        alreadyCompleted:
          false,
      };
    });

    // Check the condition (result && !result.alreadyCompleted) and run the matching branch.
    if (result && !result.alreadyCompleted) {
      // Perform the side effect or state update expressed on the following line.
      await sendEmailBestEffort(() => sendPaymentConfirmationEmail(result.booking, result.payment), "Payment confirmation");
    }
    // Return the value of result to the caller.
    return result;

  } finally {

    // Perform the side effect or state update expressed on the following line.
    await session.endSession();

  }
};


/*
|--------------------------------------------------------------------------
| REFUND BOOKING PAYMENT
|--------------------------------------------------------------------------
|
| Central refund lifecycle.
|
| This function is the ONLY place where a completed refund is allowed
| to change the financial state of Payment and Booking.
|
|--------------------------------------------------------------------------
*/

// Declare refundBookingPayment for use by the surrounding module or function.
export const refundBookingPayment = async ({
  payment,
  booking = null,
  refundAmount = null,
  refundData = {},
}) => {

  // Check the condition (!payment) and run the matching branch.
  if (!payment) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(
      "Payment is required for refund lifecycle."
    );
  }

  // Declare session for use by the surrounding module or function.
  const session =
    await mongoose.startSession();

  // Declare result for use by the surrounding module or function.
  let result;

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(
      async () => {

        /*
        |--------------------------------------------------------------------------
        | LOAD FRESH DOCUMENTS
        |--------------------------------------------------------------------------
        */

        // Declare paymentDoc for use by the surrounding module or function.
        const paymentDoc =
          await Payment.findOne({
            _id: payment._id,
            tenantId: payment.tenantId,
          }).session(session);

        // Check the condition (!paymentDoc) and run the matching branch.
        if (!paymentDoc) {
          // Stop the current operation by raising a new Error instance.
          throw new Error(
            "Payment not found."
          );
        }

        // Declare bookingId for use by the surrounding module or function.
        const bookingId =
          booking?._id ||
          paymentDoc.booking;

        // Check the condition (!bookingId) and run the matching branch.
        if (!bookingId) {
          // Stop the current operation by raising a new Error instance.
          throw new Error(
            "Refund payment is not attached to a booking."
          );
        }

        // Declare bookingDoc for use by the surrounding module or function.
        const bookingDoc =
          await Booking.findOne({
            _id: bookingId,
            tenantId: paymentDoc.tenantId,
          }).session(session);

        // Check the condition (!bookingDoc) and run the matching branch.
        if (!bookingDoc) {
          // Stop the current operation by raising a new Error instance.
          throw new Error(
            "Booking not found."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | REFUND REFERENCE
        |--------------------------------------------------------------------------
        */

        // Declare refundReference for use by the surrounding module or function.
        const refundReference =
          String(
            refundData.refundReference ||
            paymentDoc.refundReference ||
            ""
          ).trim();

        /*
        |--------------------------------------------------------------------------
        | IDEMPOTENCY
        |--------------------------------------------------------------------------
        |
        | A successful M-Pesa refund callback can be delivered more than
        | once. If the same reference has already completed, do nothing.
        |--------------------------------------------------------------------------
        */

        // Check the condition (refundReference && paymentDoc.refundReference === refundReference && p) and run the matching branch.
        if (
          refundReference &&
          paymentDoc.refundReference ===
            refundReference &&
          paymentDoc.refundStatus ===
            "completed"
        ) {

          // Perform the side effect or state update expressed on the following line.
          result = {
            payment: paymentDoc,
            booking: bookingDoc,
            alreadyProcessed: true,
          };

          // Return the result to the caller.
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | DETERMINE REFUND AMOUNT
        |--------------------------------------------------------------------------
        */

        // Declare requestedRefund for use by the surrounding module or function.
        const requestedRefund =
          Number(
            refundAmount ??
            paymentDoc.refundRequestedAmount ??
            bookingDoc.refundAmount ??
            0
          );

        // Check the condition (!Number.isFinite( requestedRefund ) || requestedRefund <= 0) and run the matching branch.
        if (
          !Number.isFinite(
            requestedRefund
          ) ||
          requestedRefund <= 0
        ) {
          // Stop the current operation by raising a new Error instance.
          throw new Error(
            "Refund amount must be greater than zero."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | PAYMENT TOTAL
        |--------------------------------------------------------------------------
        */

        // Declare paymentTotal for use by the surrounding module or function.
        const paymentTotal =
          Number(
            paymentDoc.amount || 0
          );

        // Check the condition (!Number.isFinite( paymentTotal ) || paymentTotal <= 0) and run the matching branch.
        if (
          !Number.isFinite(
            paymentTotal
          ) ||
          paymentTotal <= 0
        ) {
          // Stop the current operation by raising a new Error instance.
          throw new Error(
            "Payment has an invalid amount."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | PREVIOUS REFUNDS
        |--------------------------------------------------------------------------
        */

        // Declare previousRefunded for use by the surrounding module or function.
        const previousRefunded =
          Number(
            paymentDoc.refundedAmount || 0
          );

        // Check the condition (!Number.isFinite( previousRefunded ) || previousRefunded < 0) and run the matching branch.
        if (
          !Number.isFinite(
            previousRefunded
          ) ||
          previousRefunded < 0
        ) {
          // Stop the current operation by raising a new Error instance.
          throw new Error(
            "Payment has an invalid refunded amount."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | REMAINING REFUNDABLE AMOUNT
        |--------------------------------------------------------------------------
        */

        // Declare refundableAmount for use by the surrounding module or function.
        const refundableAmount =
          Math.max(
            0,
            paymentTotal -
              previousRefunded
          );

        // Check the condition (requestedRefund > refundableAmount) and run the matching branch.
        if (
          requestedRefund >
          refundableAmount
        ) {
          // Stop the current operation by raising a new Error instance.
          throw new Error(
            `Refund amount ${requestedRefund} exceeds remaining refundable amount ${refundableAmount}.`
          );
        }

        /*
        |--------------------------------------------------------------------------
        | APPLY REFUND
        |--------------------------------------------------------------------------
        */

        // Declare newRefundedAmount for use by the surrounding module or function.
        const newRefundedAmount =
          previousRefunded +
          requestedRefund;

        // Declare fullyRefunded for use by the surrounding module or function.
        const fullyRefunded =
          newRefundedAmount >=
          paymentTotal;

        /*
        |--------------------------------------------------------------------------
        | PAYMENT REFUND STATE
        |--------------------------------------------------------------------------
        */

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.refundedAmount =
          newRefundedAmount;

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.refundRequestedAmount =
          0;

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.refundStatus =
          "completed";

        // Check the condition (refundReference) and run the matching branch.
        if (refundReference) {
          // Perform the side effect or state update expressed on the following line.
          paymentDoc.refundReference =
            refundReference;
        }

        // Perform the side effect or state update expressed on the following line.
        paymentDoc.refundedAt =
          new Date();

        // Check the condition (fullyRefunded) and run the matching branch.
        if (fullyRefunded) {

          // Perform the side effect or state update expressed on the following line.
          paymentDoc.status =
            "refunded";

        } else {

          /*
          | The original payment still exists as a completed payment
          | when only part of it has been refunded.
          */

          // Perform the side effect or state update expressed on the following line.
          paymentDoc.status =
            "completed";
        }

        // Check the condition (refundData.refundResponse) and run the matching branch.
        if (
          refundData.refundResponse
        ) {
          // Perform the side effect or state update expressed on the following line.
          paymentDoc.refundResponse =
            refundData.refundResponse;
        }

        // Perform the side effect or state update expressed on the following line.
        await paymentDoc.save({
          session,
        });

        // Perform the side effect or state update expressed on the following line.
        await postPaymentRefundToLedger(
          paymentDoc,
          requestedRefund,
          refundReference,
          { session },
        );

        /*
        |--------------------------------------------------------------------------
        | BOOKING FINANCIAL STATE
        |--------------------------------------------------------------------------
        */

        // Declare totalAmount for use by the surrounding module or function.
        const totalAmount =
          Number(
            bookingDoc.totalAmount || 0
          );

        // Declare currentPaid for use by the surrounding module or function.
        const currentPaid =
          Number(
            bookingDoc.amountPaid || 0
          );

        // Declare newPaid for use by the surrounding module or function.
        const newPaid = Math.max(0, currentPaid - requestedRefund);
        // Perform the side effect or state update expressed on the following line.
        bookingDoc.amountPaid = Math.min(totalAmount, newPaid);
        // Perform the side effect or state update expressed on the following line.
        bookingDoc.balanceAmount = Math.max(0, totalAmount - bookingDoc.amountPaid);

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.refundAmount =
          newRefundedAmount;

        // Perform the side effect or state update expressed on the following line.
        bookingDoc.refundStatus =
          "completed";

        /*
        |--------------------------------------------------------------------------
        | FULL REFUND
        |--------------------------------------------------------------------------
        */

        // Check the condition (fullyRefunded) and run the matching branch.
        if (fullyRefunded) {

          // Perform the side effect or state update expressed on the following line.
          bookingDoc.paymentStatus =
            "refunded";

          // Perform the side effect or state update expressed on the following line.
          bookingDoc.status =
            "refunded";

        } else {

          /*
          | Partial refund:
          |
          | Do NOT mark the booking refunded.
          |
          | Restore payment status based on the remaining balance.
          */

          // Check the condition (bookingDoc.balanceAmount <= 0) and run the matching branch.
          if (
            bookingDoc.balanceAmount <= 0
          ) {

            // Perform the side effect or state update expressed on the following line.
            bookingDoc.paymentStatus =
              "paid";

          } else if (
            bookingDoc.amountPaid > 0
          ) {

            // Perform the side effect or state update expressed on the following line.
            bookingDoc.paymentStatus =
              "partial";

          } else {

            // Perform the side effect or state update expressed on the following line.
            bookingDoc.paymentStatus =
              "pending";
          }
        }

        // Perform the side effect or state update expressed on the following line.
        await bookingDoc.save({
          session,
        });

        // Perform the side effect or state update expressed on the following line.
        result = {
          payment: paymentDoc,
          booking: bookingDoc,
          alreadyProcessed: false,
          refundAmount:
            requestedRefund,
          refundedAmount:
            newRefundedAmount,
          fullyRefunded,
        };
      }
    );

    // Check the condition (result && !result.alreadyProcessed && result.fullyRefunded) and run the matching branch.
    if (result && !result.alreadyProcessed && result.fullyRefunded) {
      // Perform the side effect or state update expressed on the following line.
      await sendEmailBestEffort(() => sendBookingStatusEmail(result.booking, "refunded"), "Refund notification");
    }
    // Return the value of result to the caller.
    return result;

  } finally {

    // Perform the side effect or state update expressed on the following line.
    await session.endSession();

  }
};
