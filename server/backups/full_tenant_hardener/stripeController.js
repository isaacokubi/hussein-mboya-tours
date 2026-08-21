/*
|--------------------------------------------------------------------------
| STRIPE PAYMENT CONTROLLER
|--------------------------------------------------------------------------
| Server-authoritative Stripe payment lifecycle.
|
| IMPORTANT:
| - Never trust client-supplied amount.
| - Never trust client-supplied currency.
| - Never trust client-supplied success/cancel origin.
| - Never directly mutate Booking payment state here.
| - All successful payments must pass through
|   completeBookingPayment().
|--------------------------------------------------------------------------
*/

import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

import {
  completeBookingPayment,
  getPayableBookingAmount,
  normalizePaymentMethod,
  userOwnsBooking,
} from "../services/paymentLifecycleService.js";

import { getSystemSettings } from "../services/settingsService.js";


/*
|--------------------------------------------------------------------------
| STRIPE REQUEST
|--------------------------------------------------------------------------
*/

const stripeRequest = async (
  path,
  body = {},
  method = "POST"
) => {

  const key =
    process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY to the server environment."
    );
  }

  const options = {
    method,

    headers: {
      Authorization:
        `Bearer ${key}`,
    },
  };

  if (
    method !== "GET" &&
    body &&
    Object.keys(body).length > 0
  ) {

    options.headers[
      "Content-Type"
    ] =
      "application/x-www-form-urlencoded";

    options.body =
      new URLSearchParams(body);
  }

  const response =
    await fetch(
      `https://api.stripe.com/v1/${path}`,
      options
    );

  const data =
    await response.json();

  if (!response.ok) {

    const message =
      data?.error?.message ||
      "Stripe request failed.";

    const error =
      new Error(message);

    error.status =
      response.status;

    error.stripeError =
      data?.error || null;

    throw error;
  }

  return data;
};


/*
|--------------------------------------------------------------------------
| NORMALIZE CURRENCY
|--------------------------------------------------------------------------
*/

const normalizeCurrency = (
  currency
) => {

  return String(
    currency || ""
  )
    .trim()
    .toUpperCase();
};


/*
|--------------------------------------------------------------------------
| GET SERVER CURRENCY
|--------------------------------------------------------------------------
| Currency comes from server configuration/settings.
| The frontend cannot override it.
|--------------------------------------------------------------------------
*/

const getServerCurrency = async () => {

  let configuredCurrency =
    process.env.DEFAULT_CURRENCY ||
    "";

  try {

    const settings =
      await getSystemSettings();

    configuredCurrency =
      settings?.currency ||
      configuredCurrency;

  } catch {
    /*
    |--------------------------------------------------------------------------
    | Settings failure
    |--------------------------------------------------------------------------
    | Environment configuration remains the fallback.
    |--------------------------------------------------------------------------
    */
  }

  const currency =
    normalizeCurrency(
      configuredCurrency || "KES"
    );

  if (!/^[A-Z]{3}$/.test(currency)) {

    throw new Error(
      "Invalid server payment currency configuration."
    );
  }

  return currency;
};


/*
|--------------------------------------------------------------------------
| GET TRUSTED CLIENT ORIGIN
|--------------------------------------------------------------------------
| Never trust req.body.origin.
|--------------------------------------------------------------------------
*/

const getTrustedClientOrigin = () => {

  const configured =
    String(
      process.env.CLIENT_URL || ""
    )
      .trim()
      .replace(/\/+$/, "");

  if (!configured) {

    throw new Error(
      "CLIENT_URL is not configured."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Basic URL validation
  |--------------------------------------------------------------------------
  */

  let parsed;

  try {

    parsed =
      new URL(configured);

  } catch {

    throw new Error(
      "CLIENT_URL is not a valid URL."
    );
  }

  if (
    parsed.protocol !== "http:" &&
    parsed.protocol !== "https:"
  ) {

    throw new Error(
      "CLIENT_URL must use HTTP or HTTPS."
    );
  }

  return configured;
};


/*
|--------------------------------------------------------------------------
| GET CUSTOMER BOOKING
|--------------------------------------------------------------------------
*/

const getCustomerBooking = async (
  bookingId,
  user
) => {

  if (!bookingId) {
    return null;
  }

  const booking =
    await Booking.findOne({
      _id: bookingId,
    });

  if (!booking) {
    return null;
  }

  if (
    !userOwnsBooking(
      booking,
      user
    )
  ) {
    return null;
  }

  return booking;
};


/*
|--------------------------------------------------------------------------
| CREATE STRIPE CHECKOUT SESSION
|--------------------------------------------------------------------------
*/

export const createStripeSession = async (
  req,
  res,
  next
) => {

  try {

    if (!req.user?._id) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication is required.",
      });
    }

    const bookingId =
      String(
        req.body?.bookingId || ""
      ).trim();

    if (!bookingId) {

      return res.status(400).json({
        success: false,
        message:
          "Booking ID is required.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | BOOKING OWNERSHIP
    |--------------------------------------------------------------------------
    */

    const booking =
      await getCustomerBooking(
        bookingId,
        req.user
      );

    if (!booking) {

      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | BOOKING STATE VALIDATION
    |--------------------------------------------------------------------------
    */

    if (booking.isDeleted) {

      return res.status(400).json({
        success: false,
        message:
          "This booking is no longer available for payment.",
      });
    }

    if (
      booking.status === "cancelled" ||
      booking.status === "refunded"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Cancelled or refunded bookings cannot be paid.",
      });
    }

    if (
      booking.paymentStatus === "paid" ||
      Number(booking.balanceAmount || 0) <= 0 &&
      Number(booking.depositAmount || 0) >=
        Number(booking.totalAmount || 0)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "No amount is due for this booking.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | SERVER-AUTHORITATIVE AMOUNT
    |--------------------------------------------------------------------------
    */

    const amount =
      getPayableBookingAmount(
        booking
      );

    if (!Number.isFinite(amount) || amount <= 0) {

      return res.status(400).json({
        success: false,
        message:
          "No valid payment amount is due for this booking.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | SERVER-AUTHORITATIVE CURRENCY
    |--------------------------------------------------------------------------
    */

    const currency =
      normalizeCurrency(
        await getServerCurrency()
      );


    /*
    |--------------------------------------------------------------------------
    | PREVENT DUPLICATE ACTIVE STRIPE SESSIONS
    |--------------------------------------------------------------------------
    */

    const existingPayment =
      await Payment.findOne({
        booking: booking._id,

        provider: "STRIPE",

        status: {
          $in: [
            "pending",
            "processing",
          ],
        },

        transactionReference: {
          $nin: [
            "",
            null,
          ],
        },
      })
        .sort({
          createdAt: -1,
        });


    if (existingPayment) {

      /*
      |--------------------------------------------------------------------------
      | Verify whether the existing Stripe session is still usable.
      |--------------------------------------------------------------------------
      */

      try {

        const existingSession =
          await stripeRequest(
            `checkout/sessions/${encodeURIComponent(
              existingPayment.transactionReference
            )}`,
            {},
            "GET"
          );

        if (
          existingSession?.status === "open" &&
          existingSession?.url
        ) {

          return res.status(200).json({
            success: true,
            sessionId:
              existingSession.id,
            url:
              existingSession.url,
            reused: true,
          });
        }

      } catch {
        /*
        |--------------------------------------------------------------------------
        | If the old session cannot be retrieved,
        | create a fresh session.
        |--------------------------------------------------------------------------
        */
      }
    }


    /*
    |--------------------------------------------------------------------------
    | TRUSTED REDIRECT ORIGIN
    |--------------------------------------------------------------------------
    */

    const origin =
      getTrustedClientOrigin();


    /*
    |--------------------------------------------------------------------------
    | CREATE STRIPE CHECKOUT SESSION
    |--------------------------------------------------------------------------
    */

    const session =
      await stripeRequest(
        "checkout/sessions",
        {
          mode:
            "payment",

          currency:
            currency.toLowerCase(),

          "line_items[0][price_data][currency]":
            currency.toLowerCase(),

          "line_items[0][price_data][product_data][name]":
            `Tour booking ${booking.bookingNumber}`,

          "line_items[0][price_data][unit_amount]":
            String(
              Math.round(
                amount * 100
              )
            ),

          "line_items[0][quantity]":
            "1",

          success_url:
            `${origin}/payment-status/${booking._id}?stripe_session={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${origin}/checkout/booking/${booking._id}`,

          "metadata[bookingId]":
            String(
              booking._id
            ),

          "metadata[userId]":
            String(
              req.user._id
            ),

          "metadata[bookingNumber]":
            String(
              booking.bookingNumber || ""
            ),
        }
      );


    /*
    |--------------------------------------------------------------------------
    | CREATE PAYMENT RECORD
    |--------------------------------------------------------------------------
    */

    const canonicalPaymentMethod =
      normalizePaymentMethod(
        "CARD"
      ) || "CARD";


    const payment =
      await Payment.create({

        customer:
          req.user._id,

        user:
          req.user._id,

        booking:
          booking._id,

        provider:
          "STRIPE",

        method:
          "card",

        paymentMethod:
          canonicalPaymentMethod,

        amount,

        currency,

        transactionReference:
          String(
            session.id
          ),

        notes:
          "Stripe Checkout session",

        status:
          "pending",
      });


    /*
    |--------------------------------------------------------------------------
    | ATTACH PAYMENT TO BOOKING
    |--------------------------------------------------------------------------
    */

    const paymentAlreadyAttached =
      Array.isArray(
        booking.payments
      ) &&
      booking.payments.some(
        (id) =>
          id.toString() ===
          payment._id.toString()
      );


    if (!paymentAlreadyAttached) {

      booking.payments =
        booking.payments || [];

      booking.payments.push(
        payment._id
      );

      await booking.save();
    }


    return res.status(201).json({
      success: true,

      sessionId:
        session.id,

      url:
        session.url,
    });

  } catch (error) {

    return next(error);
  }
};


/*
|--------------------------------------------------------------------------
| VERIFY STRIPE CHECKOUT SESSION
|--------------------------------------------------------------------------
| Stripe verification is authoritative only after:
|
| 1. Session belongs to this booking.
| 2. Session metadata belongs to this user.
| 3. Stripe reports paid.
| 4. Amount matches server-authoritative amount.
| 5. Currency matches server-authoritative currency.
| 6. Payment record matches the Stripe session.
| 7. completeBookingPayment() succeeds.
|--------------------------------------------------------------------------
*/

export const verifyStripeSession = async (
  req,
  res,
  next
) => {

  try {

    if (!req.user?._id) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication is required.",
      });
    }


    const sessionId =
      String(
        req.params?.sessionId || ""
      ).trim();

    if (!sessionId) {

      return res.status(400).json({
        success: false,
        message:
          "Stripe session ID is required.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | RETRIEVE STRIPE SESSION
    |--------------------------------------------------------------------------
    */

    const session =
      await stripeRequest(
        `checkout/sessions/${encodeURIComponent(
          sessionId
        )}`,
        {},
        "GET"
      );


    const bookingId =
      String(
        session?.metadata?.bookingId ||
        ""
      ).trim();

    const metadataUserId =
      String(
        session?.metadata?.userId ||
        ""
      ).trim();

    if (!bookingId) {

      return res.status(400).json({
        success: false,
        message:
          "Stripe session is missing booking metadata.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | METADATA USER VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      metadataUserId &&
      metadataUserId !==
        String(req.user._id)
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Stripe session does not belong to this user.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | BOOKING OWNERSHIP
    |--------------------------------------------------------------------------
    */

    const booking =
      await getCustomerBooking(
        bookingId,
        req.user
      );

    if (!booking) {

      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | SERVER-AUTHORITATIVE EXPECTED AMOUNT
    |--------------------------------------------------------------------------
    */

    const expectedAmount =
      getPayableBookingAmount(
        booking
      );

    const expectedCurrency =
      normalizeCurrency(
        await getServerCurrency()
      );


    /*
    |--------------------------------------------------------------------------
    | STRIPE AMOUNT VALIDATION
    |--------------------------------------------------------------------------
    */

    const stripeAmount =
      Number(
        session?.amount_total || 0
      );

    const stripeCurrency =
      normalizeCurrency(
        session?.currency
      );


    if (
      stripeAmount !==
      Math.round(
        expectedAmount * 100
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Stripe payment amount does not match the booking amount.",
      });
    }


    if (
      stripeCurrency !==
      expectedCurrency
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Stripe payment currency does not match the booking currency.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | PAYMENT RECORD
    |--------------------------------------------------------------------------
    */

    const payment =
      await Payment.findOne({
        booking:
          booking._id,

        provider:
          "STRIPE",

        transactionReference:
          session.id,
      });


    if (!payment) {

      return res.status(404).json({
        success: false,
        message:
          "Stripe payment record not found.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | OWNERSHIP OF PAYMENT
    |--------------------------------------------------------------------------
    */

    if (
      payment.customer &&
      payment.customer.toString() !==
        req.user._id.toString()
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Payment does not belong to this user.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | ALREADY COMPLETED
    |--------------------------------------------------------------------------
    */

    if (
      payment.status === "completed" &&
      booking.paymentStatus === "paid"
    ) {

      return res.status(200).json({
        success: true,
        paid: true,
        alreadyCompleted: true,

        session: {
          id:
            session.id,

          payment_status:
            session.payment_status,

          amount_total:
            session.amount_total,

          currency:
            session.currency,
        },
      });
    }


    /*
    |--------------------------------------------------------------------------
    | STRIPE PAYMENT STATUS
    |--------------------------------------------------------------------------
    */

    if (
      session.payment_status !==
      "paid"
    ) {

      return res.status(200).json({
        success: true,
        paid: false,

        session: {
          id:
            session.id,

          payment_status:
            session.payment_status,

          amount_total:
            session.amount_total,

          currency:
            session.currency,
        },
      });
    }


    /*
    |--------------------------------------------------------------------------
    | COMPLETE THROUGH CENTRAL LIFECYCLE
    |--------------------------------------------------------------------------
    */

    const result =
      await completeBookingPayment({
        payment,
        booking,

        paymentData: {

          amount:
            expectedAmount,

          paymentMethod:
            "CARD",

          paymentReference:
            session.id,

          transactionId:
            session.payment_intent
              ? String(
                  session.payment_intent
                )
              : session.id,

          callbackResponse: {
            stripeSessionId:
              session.id,

            paymentIntent:
              session.payment_intent ||
              null,

            paymentStatus:
              session.payment_status,

            amountTotal:
              session.amount_total,

            currency:
              session.currency,

            customerEmail:
              session.customer_details
                ?.email ||
              null,
          },
        },
      });


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      paid:
        result?.booking?.paymentStatus ===
        "paid",

      alreadyCompleted:
        result?.alreadyCompleted || false,

      booking:
        result?.booking,

      payment:
        result?.payment,

      session: {
        id:
          session.id,

        payment_status:
          session.payment_status,

        amount_total:
          session.amount_total,

        currency:
          session.currency,
      },
    });

  } catch (error) {

    return next(error);
  }
};


/*
|--------------------------------------------------------------------------
| CREATE BANK TRANSFER PAYMENT
|--------------------------------------------------------------------------
| Customer submits evidence/reference only.
|
| This does NOT mark the booking paid.
| Staff verification must call completeBookingPayment().
|--------------------------------------------------------------------------
*/

export const createBankTransferPayment = async (
  req,
  res,
  next
) => {

  try {

    if (!req.user?._id) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication is required.",
      });
    }


    const bookingId =
      String(
        req.body?.bookingId || ""
      ).trim();

    if (!bookingId) {

      return res.status(400).json({
        success: false,
        message:
          "Booking ID is required.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | OWNERSHIP
    |--------------------------------------------------------------------------
    */

    const booking =
      await getCustomerBooking(
        bookingId,
        req.user
      );

    if (!booking) {

      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | BOOKING STATE
    |--------------------------------------------------------------------------
    */

    if (
      booking.status === "cancelled" ||
      booking.status === "refunded"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "This booking cannot receive payment.",
      });
    }


    if (
      booking.paymentStatus === "paid"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "This booking is already fully paid.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | SERVER-AUTHORITATIVE AMOUNT
    |--------------------------------------------------------------------------
    */

    const amount =
      getPayableBookingAmount(
        booking
      );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "No valid amount is due for this booking.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | SERVER-AUTHORITATIVE CURRENCY
    |--------------------------------------------------------------------------
    */

    const currency =
      normalizeCurrency(
        await getServerCurrency()
      );


    /*
    |--------------------------------------------------------------------------
    | CUSTOMER-SUPPLIED REFERENCE
    |--------------------------------------------------------------------------
    */

    const reference =
      String(
        req.body?.reference || ""
      )
        .trim()
        .slice(
          0,
          200
        );

    const notes =
      String(
        req.body?.notes ||
        "Bank transfer payment awaiting administrator verification"
      )
        .trim()
        .slice(
          0,
          1000
        );


    /*
    |--------------------------------------------------------------------------
    | PREVENT DUPLICATE PENDING BANK TRANSFER
    |--------------------------------------------------------------------------
    */

    const existingPayment =
      await Payment.findOne({
        booking:
          booking._id,

        provider:
          "BANK",

        status: {
          $in: [
            "pending",
            "processing",
          ],
        },
      })
        .sort({
          createdAt: -1,
        });


    if (existingPayment) {

      return res.status(200).json({
        success: true,

        message:
          "A bank transfer payment is already awaiting verification.",

        payment:
          existingPayment,
      });
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE PENDING PAYMENT
    |--------------------------------------------------------------------------
    */

    const payment =
      await Payment.create({

        customer:
          req.user._id,

        user:
          req.user._id,

        booking:
          booking._id,

        provider:
          "BANK",

        method:
          "bank",

        paymentMethod:
          normalizePaymentMethod(
            "BANK"
          ) ||
          "BANK_TRANSFER",

        amount,

        currency,

        transactionReference:
          reference,

        notes,

        status:
          "pending",
      });


    /*
    |--------------------------------------------------------------------------
    | ATTACH TO BOOKING
    |--------------------------------------------------------------------------
    */

    const alreadyAttached =
      Array.isArray(
        booking.payments
      ) &&
      booking.payments.some(
        (id) =>
          id.toString() ===
          payment._id.toString()
      );


    if (!alreadyAttached) {

      booking.payments =
        booking.payments || [];

      booking.payments.push(
        payment._id
      );

      await booking.save();
    }


    return res.status(201).json({

      success:
        true,

      message:
        "Bank transfer recorded. The company will verify the transfer and confirm your booking.",

      payment,
    });

  } catch (error) {

    return next(error);
  }
};
