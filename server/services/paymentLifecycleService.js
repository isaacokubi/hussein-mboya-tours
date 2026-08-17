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

import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Commission from "../models/Commission.js";

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

export const normalizePaymentMethod = (method) => {

  const value =
    String(method || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

  const aliases = {
    MPESA: PAYMENT_METHODS.MPESA,
    M_PESA: PAYMENT_METHODS.MPESA,

    CARD: PAYMENT_METHODS.CARD,

    PAYPAL: PAYMENT_METHODS.PAYPAL,

    BANK: PAYMENT_METHODS.BANK_TRANSFER,
    BANK_TRANSFER: PAYMENT_METHODS.BANK_TRANSFER,

    CASH: PAYMENT_METHODS.CASH,
  };

  return aliases[value] || null;
};


/*
|--------------------------------------------------------------------------
| GET REQUESTER ROLE
|--------------------------------------------------------------------------
*/

export const getRequesterRole = (user) => {

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

export const isStaffUser = (user) => {

  const role = getRequesterRole(user);

  return [
    "admin",
    "superadmin",
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

export const userOwnsBooking = (booking, user) => {

  if (!booking || !user?._id) {
    return false;
  }

  const userId =
    user._id.toString();

  const bookingUserId =
    booking.user?.toString();

  const bookingCustomerId =
    booking.customer?.toString();

  const snapshotEmail =
    String(
      booking.customerSnapshot?.email || ""
    )
      .trim()
      .toLowerCase();

  const userEmail =
    String(user.email || "")
      .trim()
      .toLowerCase();

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

export const canAccessBooking = (booking, user) => {

  if (!booking || !user) {
    return false;
  }

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

export const getPayableBookingAmount = (booking) => {

  if (!booking) {
    throw new Error("Booking is required.");
  }

  const totalAmount =
    Number(booking.totalAmount || 0);

  const balanceAmount =
    Number(booking.balanceAmount || 0);

  const depositAmount =
    Number(booking.depositAmount || 0);

  if (totalAmount <= 0) {
    throw new Error("Booking has an invalid total amount.");
  }

  /*
   * If there is an outstanding balance, pay the balance.
   * Otherwise pay the configured deposit/total.
   */

  if (balanceAmount > 0) {
    return Math.round(balanceAmount);
  }

  if (depositAmount > 0) {
    return Math.round(
      Math.min(depositAmount, totalAmount)
    );
  }

  return Math.round(totalAmount);
};


/*
|--------------------------------------------------------------------------
| VALIDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/

export const validatePaymentStatus = (status) => {

  if (!PAYMENT_STATUSES.includes(status)) {
    throw new Error(
      `Invalid payment transaction status: ${status}`
    );
  }

  return true;
};


/*
|--------------------------------------------------------------------------
| VALIDATE BOOKING PAYMENT STATUS
|--------------------------------------------------------------------------
*/

export const validateBookingPaymentStatus = (status) => {

  if (!BOOKING_PAYMENT_STATUSES.includes(status)) {
    throw new Error(
      `Invalid booking payment status: ${status}`
    );
  }

  return true;
};


/*
|--------------------------------------------------------------------------
| FIND PENDING PAYMENT
|--------------------------------------------------------------------------
*/

export const findPendingBookingPayment = async (
  bookingId
) => {

  return Payment.findOne({
    booking: bookingId,
    status: {
      $in: [
        "pending",
        "processing",
      ],
    },
  }).sort({
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

export const failBookingPayment = async ({
  payment,
  booking,
  failureReason = "",
  paymentData = {},
}) => {

  if (!payment || !booking) {
    throw new Error(
      "Payment and booking are required."
    );
  }

  const session =
    await mongoose.startSession();

  try {

    let result;

    await session.withTransaction(async () => {

      const paymentDoc =
        await Payment.findById(
          payment._id
        ).session(session);

      const bookingDoc =
        await Booking.findById(
          booking._id
        ).session(session);

      if (!paymentDoc) {
        throw new Error(
          "Payment not found."
        );
      }

      if (!bookingDoc) {
        throw new Error(
          "Booking not found."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | IDEMPOTENCY
      |--------------------------------------------------------------------------
      */

      if (
        paymentDoc.status === "completed" ||
        bookingDoc.paymentStatus === "paid"
      ) {
        result = {
          payment: paymentDoc,
          booking: bookingDoc,
          alreadyCompleted: true,
        };

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE PAYMENT
      |--------------------------------------------------------------------------
      */

      paymentDoc.status =
        "failed";

      paymentDoc.failureReason =
        failureReason ||
        paymentDoc.failureReason ||
        "M-Pesa payment failed.";

      if (paymentData.callbackResponse) {
        paymentDoc.callbackResponse =
          paymentData.callbackResponse;
      }

      if (paymentData.checkoutRequestID) {
        paymentDoc.checkoutRequestID =
          paymentData.checkoutRequestID;
      }

      if (paymentData.merchantRequestID) {
        paymentDoc.merchantRequestID =
          paymentData.merchantRequestID;
      }

      paymentDoc.failedAt =
        new Date();

      await paymentDoc.save({
        session,
      });

      /*
      |--------------------------------------------------------------------------
      | UPDATE BOOKING
      |--------------------------------------------------------------------------
      */

      if (
        bookingDoc.paymentStatus !== "paid"
      ) {
        bookingDoc.paymentStatus =
          "failed";

        if (
          bookingDoc.status !== "completed" &&
          bookingDoc.status !== "cancelled" &&
          bookingDoc.status !== "refunded"
        ) {
          bookingDoc.status =
            "pending";
        }
      }

      await bookingDoc.save({
        session,
      });

      result = {
        payment: paymentDoc,
        booking: bookingDoc,
        alreadyCompleted: false,
      };
    });

    return result;

  } finally {

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

export const completeBookingPayment = async ({
  payment,
  booking,
  paymentData = {},
}) => {

  if (!payment || !booking) {
    throw new Error(
      "Payment and booking are required."
    );
  }

  const session =
    await mongoose.startSession();

  try {

    let result;

    await session.withTransaction(async () => {

      /*
      |--------------------------------------------------------------------------
      | LOAD FRESH DOCUMENTS INSIDE TRANSACTION
      |--------------------------------------------------------------------------
      */

      const paymentDoc =
        await Payment.findById(
          payment._id
        ).session(session);

      const bookingDoc =
        await Booking.findById(
          booking._id
        ).session(session);

      if (!paymentDoc) {
        throw new Error(
          "Payment not found."
        );
      }

      if (!bookingDoc) {
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

      if (
        paymentDoc.status === "completed" &&
        bookingDoc.paymentStatus === "paid"
      ) {

        result = {
          payment: paymentDoc,
          booking: bookingDoc,
          alreadyCompleted: true,
        };

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | NORMALIZE PAYMENT METHOD BEFORE SAVING
      |--------------------------------------------------------------------------
      */

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

      const paymentAmount =
        Number(
          paymentData.amount ??
          paymentDoc.amount ??
          0
        );

      if (
        !Number.isFinite(paymentAmount) ||
        paymentAmount <= 0
      ) {
        throw new Error(
          "Completed payment has an invalid amount."
        );
      }


      /*
      |--------------------------------------------------------------------------
      | VALIDATE BOOKING TOTAL
      |--------------------------------------------------------------------------
      */

      const totalAmount =
        Number(
          bookingDoc.totalAmount || 0
        );

      if (
        !Number.isFinite(totalAmount) ||
        totalAmount <= 0
      ) {
        throw new Error(
          "Booking has an invalid total amount."
        );
      }


      /*
      |--------------------------------------------------------------------------
      | UPDATE PAYMENT
      |--------------------------------------------------------------------------
      */

      paymentDoc.status =
        "completed";

      paymentDoc.paidAt =
        paymentDoc.paidAt ||
        new Date();

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
      const currentPaidAmount = Number(bookingDoc.depositAmount || 0);
      const remainingDue = Math.max(0, totalAmount - currentPaidAmount);

      if (paymentAmount > remainingDue) {
        throw new Error(
          `Payment amount ${paymentAmount} exceeds remaining booking balance ${remainingDue}.`
        );
      }

      if (paymentAmount <= 0 || remainingDue <= 0) {
        throw new Error("No amount remains due for this booking.");
      }

      /*
      |--------------------------------------------------------------------------
      | PAYMENT METHOD
      |--------------------------------------------------------------------------
      */

      if (canonicalPaymentMethod) {

        paymentDoc.paymentMethod =
          canonicalPaymentMethod;
      }


      /*
      |--------------------------------------------------------------------------
      | PHONE
      |--------------------------------------------------------------------------
      */

      if (
        paymentData.phoneNumber
      ) {

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

      if (
        paymentData.mpesaReceiptNumber
      ) {

        paymentDoc.mpesaReceiptNumber =
          String(
            paymentData.mpesaReceiptNumber
          ).trim();

        paymentDoc.transactionId =
          paymentData.mpesaReceiptNumber;

        paymentDoc.transactionReference =
          paymentData.mpesaReceiptNumber;
      }


      /*
      |--------------------------------------------------------------------------
      | GENERIC TRANSACTION ID
      |--------------------------------------------------------------------------
      */

      if (
        paymentData.transactionId
      ) {

        paymentDoc.transactionId =
          String(
            paymentData.transactionId
          ).trim();
      }


      /*
      |--------------------------------------------------------------------------
      | PAYMENT REFERENCE
      |--------------------------------------------------------------------------
      */

      if (
        paymentData.paymentReference
      ) {

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

      if (
        paymentData.merchantRequestID
      ) {

        paymentDoc.merchantRequestID =
          paymentData.merchantRequestID;
      }

      if (
        paymentData.checkoutRequestID
      ) {

        paymentDoc.checkoutRequestID =
          paymentData.checkoutRequestID;
      }


      /*
      |--------------------------------------------------------------------------
      | TRANSACTION DATE
      |--------------------------------------------------------------------------
      */

      if (
        paymentData.transactionDate
      ) {

        paymentDoc.transactionDate =
          paymentData.transactionDate;
      }


      /*
      |--------------------------------------------------------------------------
      | CALLBACK DATA
      |--------------------------------------------------------------------------
      */

      if (
        paymentData.callbackResponse
      ) {

        paymentDoc.callbackResponse =
          paymentData.callbackResponse;
      }


      /*
      |--------------------------------------------------------------------------
      | SAVE PAYMENT
      |--------------------------------------------------------------------------
      */

      await paymentDoc.save({
        session,
      });


      /*
      |--------------------------------------------------------------------------
      | CALCULATE TOTAL PAID
      |--------------------------------------------------------------------------
      |
      | depositAmount represents the cumulative amount paid against
      | this booking.
      |
      */

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

      bookingDoc.depositAmount =
        newPaidAmount;

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

      if (
        bookingDoc.balanceAmount === 0
      ) {

        bookingDoc.paymentStatus =
          "paid";

        bookingDoc.paidAt =
          bookingDoc.paidAt ||
          new Date();

        /*
        | Only move a pending booking to confirmed
        | when the complete amount has been received.
        */

        if (
          bookingDoc.status === "pending"
        ) {

          bookingDoc.status =
            "confirmed";
        }

      } else {

        bookingDoc.paymentStatus =
          "partial";
      }


      /*
      |--------------------------------------------------------------------------
      | BOOKING PAYMENT REFERENCES
      |--------------------------------------------------------------------------
      */

      if (
        paymentData.mpesaReceiptNumber
      ) {

        bookingDoc.mpesaReceipt =
          paymentData.mpesaReceiptNumber;

        bookingDoc.transactionId =
          paymentData.mpesaReceiptNumber;
      }

      if (
        paymentData.transactionId
      ) {

        bookingDoc.transactionId =
          paymentData.transactionId;
      }

      if (
        paymentData.paymentReference
      ) {

        bookingDoc.paymentReference =
          paymentData.paymentReference;
      }

      if (
        canonicalPaymentMethod
      ) {

        bookingDoc.paymentMethod =
          canonicalPaymentMethod;
      }


      /*
      |--------------------------------------------------------------------------
      | ATTACH PAYMENT TO BOOKING
      |--------------------------------------------------------------------------
      */

      const alreadyAttached =
        Array.isArray(
          bookingDoc.payments
        ) &&
        bookingDoc.payments.some(
          (id) =>
            id.toString() ===
            paymentDoc._id.toString()
        );


      if (!alreadyAttached) {

        bookingDoc.payments =
          bookingDoc.payments || [];

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

      if (
        bookingDoc.agent &&
        bookingDoc.paymentStatus === "paid"
      ) {

        const existingCommission =
          await Commission.findOne({
            booking:
              bookingDoc._id,

            agent:
              bookingDoc.agent,
          }).session(session);


        if (!existingCommission) {

          const agentRate =
            Number(
              bookingDoc.commissionRate ||
              0
            );


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


          if (
            commissionAmount > 0
          ) {

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

      result = {
        payment:
          paymentDoc,

        booking:
          bookingDoc,

        alreadyCompleted:
          false,
      };
    });


    return result;

  } finally {

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

export const refundBookingPayment = async ({
  payment,
  booking = null,
  refundAmount = null,
  refundData = {},
}) => {

  if (!payment) {
    throw new Error(
      "Payment is required for refund lifecycle."
    );
  }

  const session =
    await mongoose.startSession();

  let result;

  try {

    await session.withTransaction(
      async () => {

        /*
        |--------------------------------------------------------------------------
        | LOAD FRESH DOCUMENTS
        |--------------------------------------------------------------------------
        */

        const paymentDoc =
          await Payment.findById(
            payment._id
          ).session(session);

        if (!paymentDoc) {
          throw new Error(
            "Payment not found."
          );
        }

        const bookingId =
          booking?._id ||
          paymentDoc.booking;

        if (!bookingId) {
          throw new Error(
            "Refund payment is not attached to a booking."
          );
        }

        const bookingDoc =
          await Booking.findById(
            bookingId
          ).session(session);

        if (!bookingDoc) {
          throw new Error(
            "Booking not found."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | REFUND REFERENCE
        |--------------------------------------------------------------------------
        */

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

        if (
          refundReference &&
          paymentDoc.refundReference ===
            refundReference &&
          paymentDoc.refundStatus ===
            "completed"
        ) {

          result = {
            payment: paymentDoc,
            booking: bookingDoc,
            alreadyProcessed: true,
          };

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | DETERMINE REFUND AMOUNT
        |--------------------------------------------------------------------------
        */

        const requestedRefund =
          Number(
            refundAmount ??
            paymentDoc.refundRequestedAmount ??
            bookingDoc.refundAmount ??
            0
          );

        if (
          !Number.isFinite(
            requestedRefund
          ) ||
          requestedRefund <= 0
        ) {
          throw new Error(
            "Refund amount must be greater than zero."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | PAYMENT TOTAL
        |--------------------------------------------------------------------------
        */

        const paymentTotal =
          Number(
            paymentDoc.amount || 0
          );

        if (
          !Number.isFinite(
            paymentTotal
          ) ||
          paymentTotal <= 0
        ) {
          throw new Error(
            "Payment has an invalid amount."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | PREVIOUS REFUNDS
        |--------------------------------------------------------------------------
        */

        const previousRefunded =
          Number(
            paymentDoc.refundedAmount || 0
          );

        if (
          !Number.isFinite(
            previousRefunded
          ) ||
          previousRefunded < 0
        ) {
          throw new Error(
            "Payment has an invalid refunded amount."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | REMAINING REFUNDABLE AMOUNT
        |--------------------------------------------------------------------------
        */

        const refundableAmount =
          Math.max(
            0,
            paymentTotal -
              previousRefunded
          );

        if (
          requestedRefund >
          refundableAmount
        ) {
          throw new Error(
            `Refund amount ${requestedRefund} exceeds remaining refundable amount ${refundableAmount}.`
          );
        }

        /*
        |--------------------------------------------------------------------------
        | APPLY REFUND
        |--------------------------------------------------------------------------
        */

        const newRefundedAmount =
          previousRefunded +
          requestedRefund;

        const fullyRefunded =
          newRefundedAmount >=
          paymentTotal;

        /*
        |--------------------------------------------------------------------------
        | PAYMENT REFUND STATE
        |--------------------------------------------------------------------------
        */

        paymentDoc.refundedAmount =
          newRefundedAmount;

        paymentDoc.refundRequestedAmount =
          0;

        paymentDoc.refundStatus =
          "completed";

        if (refundReference) {
          paymentDoc.refundReference =
            refundReference;
        }

        paymentDoc.refundedAt =
          new Date();

        if (fullyRefunded) {

          paymentDoc.status =
            "refunded";

        } else {

          /*
          | The original payment still exists as a completed payment
          | when only part of it has been refunded.
          */

          paymentDoc.status =
            "completed";
        }

        if (
          refundData.refundResponse
        ) {
          paymentDoc.refundResponse =
            refundData.refundResponse;
        }

        await paymentDoc.save({
          session,
        });

        /*
        |--------------------------------------------------------------------------
        | BOOKING FINANCIAL STATE
        |--------------------------------------------------------------------------
        */

        const totalAmount =
          Number(
            bookingDoc.totalAmount || 0
          );

        const currentDeposit =
          Number(
            bookingDoc.depositAmount || 0
          );

        const newDeposit =
          Math.max(
            0,
            currentDeposit -
              requestedRefund
          );

        bookingDoc.depositAmount =
          Math.min(
            totalAmount,
            newDeposit
          );

        bookingDoc.balanceAmount =
          Math.max(
            0,
            totalAmount -
              bookingDoc.depositAmount
          );

        bookingDoc.refundAmount =
          newRefundedAmount;

        bookingDoc.refundStatus =
          "completed";

        /*
        |--------------------------------------------------------------------------
        | FULL REFUND
        |--------------------------------------------------------------------------
        */

        if (fullyRefunded) {

          bookingDoc.paymentStatus =
            "refunded";

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

          if (
            bookingDoc.balanceAmount <= 0
          ) {

            bookingDoc.paymentStatus =
              "paid";

          } else if (
            bookingDoc.depositAmount > 0
          ) {

            bookingDoc.paymentStatus =
              "partial";

          } else {

            bookingDoc.paymentStatus =
              "pending";
          }
        }

        await bookingDoc.save({
          session,
        });

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

    return result;

  } finally {

    await session.endSession();

  }
};
