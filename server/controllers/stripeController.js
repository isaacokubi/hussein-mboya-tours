import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
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
import StripeWebhookEvent from "../models/StripeWebhookEvent.js";
import { runWithTenant } from "../tenancy/context.js";
import { verifyStripeWebhookSignature } from "../services/stripeWebhookSecurity.js";

import {
  completeBookingPayment,
  getPayableBookingAmount,
  normalizePaymentMethod,
  userOwnsBooking,
} from "../services/paymentLifecycleService.js";

import { getSystemSettings } from "../services/settingsService.js";
import { isTenantPaymentMethodAvailable, isStripeRuntimeEnvironmentValid } from "../services/tenantPaymentMethods.js";


/*
|--------------------------------------------------------------------------
| STRIPE REQUEST
|--------------------------------------------------------------------------
*/

const stripeRequest = async (
  path,
  body = {},
  method = "POST",
  idempotencyKey = ""
) => {

  const key =
    process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY to the server environment."
    );
  }
  if (!isStripeRuntimeEnvironmentValid(process.env)) throw new Error("Stripe credentials do not match the server environment.");

  const options = {
    method,

    headers: {
      Authorization:
        `Bearer ${key}`,
      ...(idempotencyKey ? { "Idempotency-Key": String(idempotencyKey).slice(0, 255) } : {}),
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
      { ...options, signal: AbortSignal.timeout(15000), redirect: "error" }
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

const getServerCurrency = async (source = {}) => {

  let configuredCurrency =
    process.env.DEFAULT_CURRENCY ||
    "";

  try {

    const settings =
      await getSystemSettings(source);

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
    await Booking.findOne(
      mergeTenantFilter({
        _id: bookingId,
      })
    );

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
  requireTenantId();
  let initiatingPayment = null;

  try {

    const tenantSettings = await getSystemSettings(req);
    if (!isTenantPaymentMethodAvailable(tenantSettings, "CARD")) return res.status(409).json({ success: false, message: "Card payments are disabled or not configured for this tenant." });

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

    const payableAmount = getPayableBookingAmount(booking);
    const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {

      return res.status(400).json({
        success: false,
        message:
          "No valid payment amount is due for this booking.",
      });
    }
    if (amount > payableAmount) return res.status(400).json({ success: false, message: "Payment amount cannot exceed the booking balance." });


    /*
    |--------------------------------------------------------------------------
    | SERVER-AUTHORITATIVE CURRENCY
    |--------------------------------------------------------------------------
    */

    const currency =
      normalizeCurrency(
        await getServerCurrency(req)
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

        activeAttempt: true,

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

      if (!existingPayment.transactionReference) return res.status(409).json({ success: false, message: "A Stripe checkout request is processing or uncertain. Refresh payment status before retrying." });

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
        if (existingSession?.status === "expired") {
          existingPayment.status = "cancelled";
          await existingPayment.save();
        } else {
          return res.status(409).json({ success: false, message: "A Stripe checkout is already active or its status is uncertain. Refresh payment status before retrying." });
        }

      } catch {
        return res.status(409).json({ success: false, message: "The existing Stripe checkout status could not be verified. Refresh payment status before retrying." });
      }
    }


    /*
    |--------------------------------------------------------------------------
    | TRUSTED REDIRECT ORIGIN
    |--------------------------------------------------------------------------
    */

    const origin =
      getTrustedClientOrigin();

    const canonicalPaymentMethod = normalizePaymentMethod("CARD") || "CARD";
    initiatingPayment = await Payment.create({ tenantId: booking.tenantId, customer: req.user._id, user: req.user._id, booking: booking._id, provider: "STRIPE", method: "card", paymentMethod: canonicalPaymentMethod, amount, currency, status: "processing", activeAttempt: true, notes: "Stripe Checkout creation pending." });


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

          "metadata[tenantId]": String(booking.tenantId),

          "metadata[paymentId]": String(initiatingPayment._id),

          "metadata[userId]":
            String(
              req.user._id
            ),

          "metadata[bookingNumber]":
            String(
              booking.bookingNumber || ""
            ),
        },
        "POST",
        `stripe-checkout-${initiatingPayment._id}`
      );


    /*
    |--------------------------------------------------------------------------
    | CREATE PAYMENT RECORD
    |--------------------------------------------------------------------------
    */

    const payment = initiatingPayment;
    payment.providerOrderId = String(session.id);
    payment.providerApprovalUrl = String(session.url || "");
    payment.transactionReference = String(session.id);
    payment.status = "pending";
    payment.notes = "Stripe Checkout session awaiting customer payment.";
    await payment.save();


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
      booking.payments = booking.payments || [];
      booking.payments.push(payment._id);
    }
    booking.paymentMethod = "CARD";
    booking.paymentStatus = "pending";
    await booking.save();


    return res.status(201).json({
      success: true,

      sessionId:
        session.id,

      url:
        session.url,
    });

  } catch (error) {

    if (initiatingPayment && error?.status >= 400 && error?.status < 500) {
      initiatingPayment.status = "failed";
      initiatingPayment.failureReason = "Stripe rejected the checkout request.";
      initiatingPayment.failedAt = new Date();
      await initiatingPayment.save().catch(() => {});
    }

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

    const payment = await Payment.findOne(mergeTenantFilter(req, { booking: booking._id, provider: "STRIPE", transactionReference: session.id }));
    if (!payment) return res.status(404).json({ success: false, message: "Stripe payment record not found." });
    if (payment.customer && String(payment.customer) !== String(req.user._id)) return res.status(403).json({ success: false, message: "Payment does not belong to this user." });
    const expectedAmount = Number(payment.amount);

    const expectedCurrency =
      normalizeCurrency(
        await getServerCurrency(req)
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

    const tenantSettings = await getSystemSettings(req);
    if (!isTenantPaymentMethodAvailable(tenantSettings, "BANK_TRANSFER")) return res.status(409).json({ success: false, message: "Bank transfer is disabled or not configured for this tenant." });

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

    const payableAmount = getPayableBookingAmount(booking);
    const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);

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
    if (amount > payableAmount) return res.status(400).json({ success: false, message: "Payment amount cannot exceed the booking balance." });


    /*
    |--------------------------------------------------------------------------
    | SERVER-AUTHORITATIVE CURRENCY
    |--------------------------------------------------------------------------
    */

    const currency =
      normalizeCurrency(
        await getServerCurrency(req)
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
      booking.payments = booking.payments || [];
      booking.payments.push(payment._id);
    }
    booking.paymentMethod = "BANK_TRANSFER";
    booking.paymentStatus = "pending";
    await booking.save();


    return res.status(201).json({

      success:
        true,

      message:
        "Bank transfer recorded. The company will verify the transfer and confirm your booking.",

      payment: { id: payment._id, status: payment.status, amount: payment.amount, currency: payment.currency, transactionReference: payment.transactionReference },
    });

  } catch (error) {

    return next(error);
  }
};

export const stripeWebhook = async (req, res) => {
  const secret = String(process.env.STRIPE_WEBHOOK_SECRET || "");
  if (!secret) return res.status(503).json({ success: false, message: "Stripe webhook verification is not configured." });
  if (!verifyStripeWebhookSignature({ payload: req.rawBody, signature: req.get("stripe-signature"), secret })) return res.status(400).json({ success: false, message: "Stripe webhook signature verification failed." });
  const eventPayload = req.body || {};
  const eventId = String(eventPayload.id || "").trim();
  const eventType = String(eventPayload.type || "").trim();
  const sessionObject = eventPayload?.data?.object || {};
  const tenantId = String(sessionObject?.metadata?.tenantId || "");
  if (!/^\w{24}$/.test(tenantId) || !eventId || !eventType) return res.status(400).json({ success: false, message: "Stripe event is missing payment correlation metadata." });
  const leaseCutoff = new Date(Date.now() - 5 * 60 * 1000);
  let event;
  try {
    event = await StripeWebhookEvent.findOneAndUpdate(
      { tenantId, eventId, $or: [{ status: { $in: ["received", "failed"] } }, { status: "processing", updatedAt: { $lt: leaseCutoff } }] },
      { $set: { eventType, status: "processing" } },
      { new: true },
    );
    if (!event) {
      try { event = await StripeWebhookEvent.create({ tenantId, eventId, eventType, status: "processing" }); }
      catch (error) {
        if (error?.code !== 11000) throw error;
        const existing = await StripeWebhookEvent.findOne({ tenantId, eventId }).lean();
        if (existing?.status === "processed" || existing?.status === "ignored" || existing?.status === "processing") return res.status(200).json({ success: true, duplicate: true });
        event = await StripeWebhookEvent.findOneAndUpdate({ tenantId, eventId, status: { $in: ["received", "failed"] } }, { $set: { status: "processing" } }, { new: true });
      }
    }
    if (!event) return res.status(200).json({ success: true, duplicate: true });
    const successful = ["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(eventType);
    const failed = ["checkout.session.async_payment_failed", "checkout.session.expired"].includes(eventType);
    if (!successful && !failed) { event.status = "ignored"; await event.save(); return res.status(200).json({ success: true, ignored: true }); }
    await runWithTenant({ tenantId, role: "stripe_webhook", bypass: false }, async () => {
      const session = sessionObject;
      if (!session.id || String(session.metadata?.tenantId) !== tenantId) throw new Error("Stripe session tenant does not match the payment event.");
      const payment = await Payment.findOne({ tenantId, provider: "STRIPE", transactionReference: String(session.id) });
      if (!payment) throw new Error("Stripe payment record is not available yet.");
      if (String(session.metadata?.paymentId || "") !== String(payment._id)) throw new Error("Stripe payment correlation does not match the saved attempt.");
      const booking = await Booking.findOne({ tenantId, _id: payment.booking });
      if (!booking) throw new Error("Stripe booking is not available.");
      event.payment = payment._id;
      if (failed) {
        if (payment.status === "pending" || payment.status === "processing") {
          const { failBookingPayment } = await import("../services/paymentLifecycleService.js");
          await failBookingPayment({ payment, booking, failureReason: eventType === "checkout.session.expired" ? "Stripe Checkout session expired." : "Stripe reported asynchronous payment failure.", paymentData: { callbackResponse: { eventId, type: eventType, sessionId: session.id } } });
        }
        return;
      }
      if (session.payment_status !== "paid") throw new Error("Stripe event does not confirm a paid Checkout session.");
      const expectedAmount = Math.round(Number(payment.amount) * 100);
      if (!Number.isFinite(expectedAmount) || Number(session.amount_total) !== expectedAmount || String(session.currency || "").toUpperCase() !== String(payment.currency || "").toUpperCase()) throw new Error("Stripe amount or currency does not match the saved payment.");
      await completeBookingPayment({ payment, booking, paymentData: { amount: payment.amount, paymentMethod: "CARD", transactionId: String(session.payment_intent || session.id), paymentReference: String(session.id), callbackResponse: { provider: "stripe", eventId, type: eventType, sessionId: session.id, paymentStatus: session.payment_status, amountTotal: session.amount_total, currency: session.currency } } });
    });
    event.status = "processed";
    event.processedAt = new Date();
    await event.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    if (event) { event.status = "failed"; await event.save().catch(() => {}); }
    console.error("Stripe webhook processing failed:", { code: error?.code || "STRIPE_WEBHOOK_FAILED" });
    return res.status(500).json({ success: false });
  }
};
