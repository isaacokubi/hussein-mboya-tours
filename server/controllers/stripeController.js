/**
 * Purpose: stripe Controller HTTP controller. Main declarations: stripeRequest, normalizeCurrency, getServerCurrency, getTrustedClientOrigin, getCustomerBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
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

// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/StripeWebhookEvent.js so this module can use its exported dependencies.
import StripeWebhookEvent from "../models/StripeWebhookEvent.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../services/stripeWebhookSecurity.js so this module can use its exported dependencies.
import { verifyStripeWebhookSignature } from "../services/stripeWebhookSecurity.js";

// Load ../services/paymentLifecycleService.js so this module can use its exported dependencies.
import {
  completeBookingPayment,
  getPayableBookingAmount,
  normalizePaymentMethod,
  userOwnsBooking,
} from "../services/paymentLifecycleService.js";

// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ../services/tenantPaymentMethods.js so this module can use its exported dependencies.
import { isTenantPaymentMethodAvailable, isStripeRuntimeEnvironmentValid } from "../services/tenantPaymentMethods.js";


/*
|--------------------------------------------------------------------------
| STRIPE REQUEST
|--------------------------------------------------------------------------
*/

// Declare stripeRequest for use by the surrounding module or function.
const stripeRequest = async (
  path,
  body = {},
  method = "POST",
  idempotencyKey = ""
) => {

  // Declare key for use by the surrounding module or function.
  const key =
    process.env.STRIPE_SECRET_KEY;

  // Check the condition (!key) and run the matching branch.
  if (!key) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY to the server environment."
    );
  }
  // Check the condition (!isStripeRuntimeEnvironmentValid(process.env)) and run the matching branch.
  if (!isStripeRuntimeEnvironmentValid(process.env)) throw new Error("Stripe credentials do not match the server environment.");

  // Declare options for use by the surrounding module or function.
  const options = {
    method,

    headers: {
      Authorization:
        `Bearer ${key}`,
      ...(idempotencyKey ? { "Idempotency-Key": String(idempotencyKey).slice(0, 255) } : {}),
    },
  };

  // Check the condition (method !== "GET" && body && Object.keys(body).length > 0) and run the matching branch.
  if (
    method !== "GET" &&
    body &&
    Object.keys(body).length > 0
  ) {

    // Perform the side effect or state update expressed on the following line.
    options.headers[
      "Content-Type"
    ] =
      "application/x-www-form-urlencoded";

    // Perform the side effect or state update expressed on the following line.
    options.body =
      new URLSearchParams(body);
  }

  // Declare response for use by the surrounding module or function.
  const response =
    await fetch(
      `https://api.stripe.com/v1/${path}`,
      { ...options, signal: AbortSignal.timeout(15000), redirect: "error" }
    );

  // Declare data for use by the surrounding module or function.
  const data =
    await response.json();

  // Check the condition (!response.ok) and run the matching branch.
  if (!response.ok) {

    // Declare message for use by the surrounding module or function.
    const message =
      data?.error?.message ||
      "Stripe request failed.";

    // Declare error for use by the surrounding module or function.
    const error =
      new Error(message);

    // Perform the side effect or state update expressed on the following line.
    error.status =
      response.status;

    // Perform the side effect or state update expressed on the following line.
    error.stripeError =
      data?.error || null;

    // Stop the current operation by raising the value of error.
    throw error;
  }

  // Return the value of data to the caller.
  return data;
};


/*
|--------------------------------------------------------------------------
| NORMALIZE CURRENCY
|--------------------------------------------------------------------------
*/

// Declare normalizeCurrency for use by the surrounding module or function.
const normalizeCurrency = (
  currency
) => {

  // Return the result of String(     currency || ""   )     .trim()     .toUpperCase() to the caller.
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

// Declare getServerCurrency for use by the surrounding module or function.
const getServerCurrency = async (source = {}) => {

  // Declare configuredCurrency for use by the surrounding module or function.
  let configuredCurrency =
    process.env.DEFAULT_CURRENCY ||
    "";

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare settings for use by the surrounding module or function.
    const settings =
      await getSystemSettings(source);

    // Perform the side effect or state update expressed on the following line.
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

  // Declare currency for use by the surrounding module or function.
  const currency =
    normalizeCurrency(
      configuredCurrency || "KES"
    );

  // Check the condition (!/^[A-Z]{3}$/.test(currency)) and run the matching branch.
  if (!/^[A-Z]{3}$/.test(currency)) {

    // Stop the current operation by raising a new Error instance.
    throw new Error(
      "Invalid server payment currency configuration."
    );
  }

  // Return the value of currency to the caller.
  return currency;
};


/*
|--------------------------------------------------------------------------
| GET TRUSTED CLIENT ORIGIN
|--------------------------------------------------------------------------
| Never trust req.body.origin.
|--------------------------------------------------------------------------
*/

// Declare getTrustedClientOrigin for use by the surrounding module or function.
const getTrustedClientOrigin = () => {

  // Declare configured for use by the surrounding module or function.
  const configured =
    String(
      process.env.CLIENT_URL || ""
    )
      .trim()
      .replace(/\/+$/, "");

  // Check the condition (!configured) and run the matching branch.
  if (!configured) {

    // Stop the current operation by raising a new Error instance.
    throw new Error(
      "CLIENT_URL is not configured."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Basic URL validation
  |--------------------------------------------------------------------------
  */

  // Declare parsed for use by the surrounding module or function.
  let parsed;

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Perform the side effect or state update expressed on the following line.
    parsed =
      new URL(configured);

  } catch {

    // Stop the current operation by raising a new Error instance.
    throw new Error(
      "CLIENT_URL is not a valid URL."
    );
  }

  // Check the condition (parsed.protocol !== "http:" && parsed.protocol !== "https:") and run the matching branch.
  if (
    parsed.protocol !== "http:" &&
    parsed.protocol !== "https:"
  ) {

    // Stop the current operation by raising a new Error instance.
    throw new Error(
      "CLIENT_URL must use HTTP or HTTPS."
    );
  }

  // Return the value of configured to the caller.
  return configured;
};


/*
|--------------------------------------------------------------------------
| GET CUSTOMER BOOKING
|--------------------------------------------------------------------------
*/

// Declare getCustomerBooking for use by the surrounding module or function.
const getCustomerBooking = async (
  bookingId,
  user
) => {

  // Check the condition (!bookingId) and run the matching branch.
  if (!bookingId) {
    // Return the expression shown below to the caller.
    return null;
  }

  // Declare booking for use by the surrounding module or function.
  const booking =
    await Booking.findOne(
      mergeTenantFilter({
        _id: bookingId,
      })
    );

  // Check the condition (!booking) and run the matching branch.
  if (!booking) {
    // Return the expression shown below to the caller.
    return null;
  }

  // Check the condition (!userOwnsBooking( booking, user )) and run the matching branch.
  if (
    !userOwnsBooking(
      booking,
      user
    )
  ) {
    // Return the expression shown below to the caller.
    return null;
  }

  // Return the value of booking to the caller.
  return booking;
};


/*
|--------------------------------------------------------------------------
| CREATE STRIPE CHECKOUT SESSION
|--------------------------------------------------------------------------
*/

// Declare createStripeSession for use by the surrounding module or function.
export const createStripeSession = async (
  req,
  res,
  next
) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare initiatingPayment for use by the surrounding module or function.
  let initiatingPayment = null;

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare tenantSettings for use by the surrounding module or function.
    const tenantSettings = await getSystemSettings(req);
    // Check the condition (!isTenantPaymentMethodAvailable(tenantSettings, "CARD")) and run the matching branch.
    if (!isTenantPaymentMethodAvailable(tenantSettings, "CARD")) return res.status(409).json({ success: false, message: "Card payments are disabled or not configured for this tenant." });

    // Check the condition (!req.user?._id) and run the matching branch.
    if (!req.user?._id) {

      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required.",
      });
    }

    // Declare bookingId for use by the surrounding module or function.
    const bookingId =
      String(
        req.body?.bookingId || ""
      ).trim();

    // Check the condition (!bookingId) and run the matching branch.
    if (!bookingId) {

      // Return the result of res.status(400).json() to the caller.
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

    // Declare booking for use by the surrounding module or function.
    const booking =
      await getCustomerBooking(
        bookingId,
        req.user
      );

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {

      // Return the result of res.status(404).json() to the caller.
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

    // Check the condition (booking.isDeleted) and run the matching branch.
    if (booking.isDeleted) {

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          "This booking is no longer available for payment.",
      });
    }

    // Check the condition (booking.status === "cancelled" || booking.status === "refunded") and run the matching branch.
    if (
      booking.status === "cancelled" ||
      booking.status === "refunded"
    ) {

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          "Cancelled or refunded bookings cannot be paid.",
      });
    }

    // Check the condition (booking.paymentStatus === "paid" || Number(booking.balanceAmount || 0)) and run the matching branch.
    if (
      booking.paymentStatus === "paid" ||
      Number(booking.balanceAmount || 0) <= 0 &&
      Number(booking.depositAmount || 0) >=
        Number(booking.totalAmount || 0)
    ) {

      // Return the result of res.status(400).json() to the caller.
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

    // Declare payableAmount for use by the surrounding module or function.
    const payableAmount = getPayableBookingAmount(booking);
    // Declare amount for use by the surrounding module or function.
    const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);

    // Check the condition (!Number.isFinite(amount) || amount <= 0) and run the matching branch.
    if (!Number.isFinite(amount) || amount <= 0) {

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          "No valid payment amount is due for this booking.",
      });
    }
    // Check the condition (amount > payableAmount) and run the matching branch.
    if (amount > payableAmount) return res.status(400).json({ success: false, message: "Payment amount cannot exceed the booking balance." });


    /*
    |--------------------------------------------------------------------------
    | SERVER-AUTHORITATIVE CURRENCY
    |--------------------------------------------------------------------------
    */

    // Declare currency for use by the surrounding module or function.
    const currency =
      normalizeCurrency(
        await getServerCurrency(req)
      );


    /*
    |--------------------------------------------------------------------------
    | PREVENT DUPLICATE ACTIVE STRIPE SESSIONS
    |--------------------------------------------------------------------------
    */

    // Declare existingPayment for use by the surrounding module or function.
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


    // Check the condition (existingPayment) and run the matching branch.
    if (existingPayment) {

      // Check the condition (!existingPayment.transactionReference) and run the matching branch.
      if (!existingPayment.transactionReference) return res.status(409).json({ success: false, message: "A Stripe checkout request is processing or uncertain. Refresh payment status before retrying." });

      /*
      |--------------------------------------------------------------------------
      | Verify whether the existing Stripe session is still usable.
      |--------------------------------------------------------------------------
      */

      // Run this operation with a dedicated error-handling path for failures.
      try {

        // Declare existingSession for use by the surrounding module or function.
        const existingSession =
          await stripeRequest(
            `checkout/sessions/${encodeURIComponent(
              existingPayment.transactionReference
            )}`,
            {},
            "GET"
          );

        // Check the condition (existingSession?.status === "open" && existingSession?.url) and run the matching branch.
        if (
          existingSession?.status === "open" &&
          existingSession?.url
        ) {

          // Return the result of res.status(200).json() to the caller.
          return res.status(200).json({
            success: true,
            sessionId:
              existingSession.id,
            url:
              existingSession.url,
            reused: true,
          });
        }
        // Check the condition (existingSession?.status === "expired") and run the matching branch.
        if (existingSession?.status === "expired") {
          // Perform the side effect or state update expressed on the following line.
          existingPayment.status = "cancelled";
          // Perform the side effect or state update expressed on the following line.
          await existingPayment.save();
        } else {
          // Return the result of res.status(409).json() to the caller.
          return res.status(409).json({ success: false, message: "A Stripe checkout is already active or its status is uncertain. Refresh payment status before retrying." });
        }

      } catch {
        // Return the result of res.status(409).json() to the caller.
        return res.status(409).json({ success: false, message: "The existing Stripe checkout status could not be verified. Refresh payment status before retrying." });
      }
    }


    /*
    |--------------------------------------------------------------------------
    | TRUSTED REDIRECT ORIGIN
    |--------------------------------------------------------------------------
    */

    // Declare origin for use by the surrounding module or function.
    const origin =
      getTrustedClientOrigin();

    // Declare canonicalPaymentMethod for use by the surrounding module or function.
    const canonicalPaymentMethod = normalizePaymentMethod("CARD") || "CARD";
    // Perform the side effect or state update expressed on the following line.
    initiatingPayment = await Payment.create({ tenantId: booking.tenantId, customer: req.user._id, user: req.user._id, booking: booking._id, provider: "STRIPE", method: "card", paymentMethod: canonicalPaymentMethod, amount, currency, status: "processing", activeAttempt: true, notes: "Stripe Checkout creation pending." });


    /*
    |--------------------------------------------------------------------------
    | CREATE STRIPE CHECKOUT SESSION
    |--------------------------------------------------------------------------
    */

    // Declare session for use by the surrounding module or function.
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

    // Declare payment for use by the surrounding module or function.
    const payment = initiatingPayment;
    // Perform the side effect or state update expressed on the following line.
    payment.providerOrderId = String(session.id);
    // Perform the side effect or state update expressed on the following line.
    payment.providerApprovalUrl = String(session.url || "");
    // Perform the side effect or state update expressed on the following line.
    payment.transactionReference = String(session.id);
    // Perform the side effect or state update expressed on the following line.
    payment.status = "pending";
    // Perform the side effect or state update expressed on the following line.
    payment.notes = "Stripe Checkout session awaiting customer payment.";
    // Perform the side effect or state update expressed on the following line.
    await payment.save();


    /*
    |--------------------------------------------------------------------------
    | ATTACH PAYMENT TO BOOKING
    |--------------------------------------------------------------------------
    */

    // Declare paymentAlreadyAttached for use by the surrounding module or function.
    const paymentAlreadyAttached =
      Array.isArray(
        booking.payments
      ) &&
      booking.payments.some(
        (id) =>
          id.toString() ===
          payment._id.toString()
      );


    // Check the condition (!paymentAlreadyAttached) and run the matching branch.
    if (!paymentAlreadyAttached) {
      // Perform the side effect or state update expressed on the following line.
      booking.payments = booking.payments || [];
      // Perform the side effect or state update expressed on the following line.
      booking.payments.push(payment._id);
    }
    // Perform the side effect or state update expressed on the following line.
    booking.paymentMethod = "CARD";
    // Perform the side effect or state update expressed on the following line.
    booking.paymentStatus = "pending";
    // Perform the side effect or state update expressed on the following line.
    await booking.save();


    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({
      success: true,

      sessionId:
        session.id,

      url:
        session.url,
    });

  } catch (error) {

    // Check the condition (initiatingPayment && error?.status >= 400 && error?.status < 500) and run the matching branch.
    if (initiatingPayment && error?.status >= 400 && error?.status < 500) {
      // Perform the side effect or state update expressed on the following line.
      initiatingPayment.status = "failed";
      // Perform the side effect or state update expressed on the following line.
      initiatingPayment.failureReason = "Stripe rejected the checkout request.";
      // Perform the side effect or state update expressed on the following line.
      initiatingPayment.failedAt = new Date();
      // Perform the side effect or state update expressed on the following line.
      await initiatingPayment.save().catch(() => {});
    }

    // Return the result of next() to the caller.
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

// Declare verifyStripeSession for use by the surrounding module or function.
export const verifyStripeSession = async (
  req,
  res,
  next
) => {

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Check the condition (!req.user?._id) and run the matching branch.
    if (!req.user?._id) {

      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required.",
      });
    }


    // Declare sessionId for use by the surrounding module or function.
    const sessionId =
      String(
        req.params?.sessionId || ""
      ).trim();

    // Check the condition (!sessionId) and run the matching branch.
    if (!sessionId) {

      // Return the result of res.status(400).json() to the caller.
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

    // Declare session for use by the surrounding module or function.
    const session =
      await stripeRequest(
        `checkout/sessions/${encodeURIComponent(
          sessionId
        )}`,
        {},
        "GET"
      );


    // Declare bookingId for use by the surrounding module or function.
    const bookingId =
      String(
        session?.metadata?.bookingId ||
        ""
      ).trim();

    // Declare metadataUserId for use by the surrounding module or function.
    const metadataUserId =
      String(
        session?.metadata?.userId ||
        ""
      ).trim();

    // Check the condition (!bookingId) and run the matching branch.
    if (!bookingId) {

      // Return the result of res.status(400).json() to the caller.
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

    // Check the condition (metadataUserId && metadataUserId !== String(req.user._id)) and run the matching branch.
    if (
      metadataUserId &&
      metadataUserId !==
        String(req.user._id)
    ) {

      // Return the result of res.status(403).json() to the caller.
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

    // Declare booking for use by the surrounding module or function.
    const booking =
      await getCustomerBooking(
        bookingId,
        req.user
      );

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {

      // Return the result of res.status(404).json() to the caller.
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

    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.findOne(mergeTenantFilter(req, { booking: booking._id, provider: "STRIPE", transactionReference: session.id }));
    // Check the condition (!payment) and run the matching branch.
    if (!payment) return res.status(404).json({ success: false, message: "Stripe payment record not found." });
    // Check the condition (payment.customer && String(payment.customer) !== String(req.user._id)) and run the matching branch.
    if (payment.customer && String(payment.customer) !== String(req.user._id)) return res.status(403).json({ success: false, message: "Payment does not belong to this user." });
    // Declare expectedAmount for use by the surrounding module or function.
    const expectedAmount = Number(payment.amount);

    // Declare expectedCurrency for use by the surrounding module or function.
    const expectedCurrency =
      normalizeCurrency(
        await getServerCurrency(req)
      );


    /*
    |--------------------------------------------------------------------------
    | STRIPE AMOUNT VALIDATION
    |--------------------------------------------------------------------------
    */

    // Declare stripeAmount for use by the surrounding module or function.
    const stripeAmount =
      Number(
        session?.amount_total || 0
      );

    // Declare stripeCurrency for use by the surrounding module or function.
    const stripeCurrency =
      normalizeCurrency(
        session?.currency
      );


    // Check the condition (stripeAmount !== Math.round( expectedAmount * 100 )) and run the matching branch.
    if (
      stripeAmount !==
      Math.round(
        expectedAmount * 100
      )
    ) {

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          "Stripe payment amount does not match the booking amount.",
      });
    }


    // Check the condition (stripeCurrency !== expectedCurrency) and run the matching branch.
    if (
      stripeCurrency !==
      expectedCurrency
    ) {

      // Return the result of res.status(400).json() to the caller.
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

    // Check the condition (payment.customer && payment.customer.toString() !== req.user._id.toStr) and run the matching branch.
    if (
      payment.customer &&
      payment.customer.toString() !==
        req.user._id.toString()
    ) {

      // Return the result of res.status(403).json() to the caller.
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

    // Check the condition (payment.status === "completed" && booking.paymentStatus === "paid") and run the matching branch.
    if (
      payment.status === "completed" &&
      booking.paymentStatus === "paid"
    ) {

      // Return the result of res.status(200).json() to the caller.
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

    // Check the condition (session.payment_status !== "paid") and run the matching branch.
    if (
      session.payment_status !==
      "paid"
    ) {

      // Return the result of res.status(200).json() to the caller.
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

    // Declare result for use by the surrounding module or function.
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

    // Return the result of res.status(200).json() to the caller.
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

    // Return the result of next() to the caller.
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

// Declare createBankTransferPayment for use by the surrounding module or function.
export const createBankTransferPayment = async (
  req,
  res,
  next
) => {

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare tenantSettings for use by the surrounding module or function.
    const tenantSettings = await getSystemSettings(req);
    // Check the condition (!isTenantPaymentMethodAvailable(tenantSettings, "BANK_TRANSFER")) and run the matching branch.
    if (!isTenantPaymentMethodAvailable(tenantSettings, "BANK_TRANSFER")) return res.status(409).json({ success: false, message: "Bank transfer is disabled or not configured for this tenant." });

    // Check the condition (!req.user?._id) and run the matching branch.
    if (!req.user?._id) {

      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required.",
      });
    }


    // Declare bookingId for use by the surrounding module or function.
    const bookingId =
      String(
        req.body?.bookingId || ""
      ).trim();

    // Check the condition (!bookingId) and run the matching branch.
    if (!bookingId) {

      // Return the result of res.status(400).json() to the caller.
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

    // Declare booking for use by the surrounding module or function.
    const booking =
      await getCustomerBooking(
        bookingId,
        req.user
      );

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {

      // Return the result of res.status(404).json() to the caller.
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

    // Check the condition (booking.status === "cancelled" || booking.status === "refunded") and run the matching branch.
    if (
      booking.status === "cancelled" ||
      booking.status === "refunded"
    ) {

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          "This booking cannot receive payment.",
      });
    }


    // Check the condition (booking.paymentStatus === "paid") and run the matching branch.
    if (
      booking.paymentStatus === "paid"
    ) {

      // Return the result of res.status(400).json() to the caller.
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

    // Declare payableAmount for use by the surrounding module or function.
    const payableAmount = getPayableBookingAmount(booking);
    // Declare amount for use by the surrounding module or function.
    const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);

    // Check the condition (!Number.isFinite(amount) || amount <= 0) and run the matching branch.
    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          "No valid amount is due for this booking.",
      });
    }
    // Check the condition (amount > payableAmount) and run the matching branch.
    if (amount > payableAmount) return res.status(400).json({ success: false, message: "Payment amount cannot exceed the booking balance." });


    /*
    |--------------------------------------------------------------------------
    | SERVER-AUTHORITATIVE CURRENCY
    |--------------------------------------------------------------------------
    */

    // Declare currency for use by the surrounding module or function.
    const currency =
      normalizeCurrency(
        await getServerCurrency(req)
      );


    /*
    |--------------------------------------------------------------------------
    | CUSTOMER-SUPPLIED REFERENCE
    |--------------------------------------------------------------------------
    */

    // Declare reference for use by the surrounding module or function.
    const reference =
      String(
        req.body?.reference || ""
      )
        .trim()
        .slice(
          0,
          200
        );

    // Declare notes for use by the surrounding module or function.
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

    // Declare existingPayment for use by the surrounding module or function.
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


    // Check the condition (existingPayment) and run the matching branch.
    if (existingPayment) {

      // Return the result of res.status(200).json() to the caller.
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

    // Declare payment for use by the surrounding module or function.
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

    // Declare alreadyAttached for use by the surrounding module or function.
    const alreadyAttached =
      Array.isArray(
        booking.payments
      ) &&
      booking.payments.some(
        (id) =>
          id.toString() ===
          payment._id.toString()
      );


    // Check the condition (!alreadyAttached) and run the matching branch.
    if (!alreadyAttached) {
      // Perform the side effect or state update expressed on the following line.
      booking.payments = booking.payments || [];
      // Perform the side effect or state update expressed on the following line.
      booking.payments.push(payment._id);
    }
    // Perform the side effect or state update expressed on the following line.
    booking.paymentMethod = "BANK_TRANSFER";
    // Perform the side effect or state update expressed on the following line.
    booking.paymentStatus = "pending";
    // Perform the side effect or state update expressed on the following line.
    await booking.save();


    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({

      success:
        true,

      message:
        "Bank transfer recorded. The company will verify the transfer and confirm your booking.",

      payment: { id: payment._id, status: payment.status, amount: payment.amount, currency: payment.currency, transactionReference: payment.transactionReference },
    });

  } catch (error) {

    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare stripeWebhook for use by the surrounding module or function.
export const stripeWebhook = async (req, res) => {
  // Declare secret for use by the surrounding module or function.
  const secret = String(process.env.STRIPE_WEBHOOK_SECRET || "");
  // Check the condition (!secret) and run the matching branch.
  if (!secret) return res.status(503).json({ success: false, message: "Stripe webhook verification is not configured." });
  // Check the condition (!verifyStripeWebhookSignature({ payload: req.rawBody, signature: req.g) and run the matching branch.
  if (!verifyStripeWebhookSignature({ payload: req.rawBody, signature: req.get("stripe-signature"), secret })) return res.status(400).json({ success: false, message: "Stripe webhook signature verification failed." });
  // Declare eventPayload for use by the surrounding module or function.
  const eventPayload = req.body || {};
  // Declare eventId for use by the surrounding module or function.
  const eventId = String(eventPayload.id || "").trim();
  // Declare eventType for use by the surrounding module or function.
  const eventType = String(eventPayload.type || "").trim();
  // Declare sessionObject for use by the surrounding module or function.
  const sessionObject = eventPayload?.data?.object || {};
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = String(sessionObject?.metadata?.tenantId || "");
  // Check the condition (!/^\w{24}$/.test(tenantId) || !eventId || !eventType) and run the matching branch.
  if (!/^\w{24}$/.test(tenantId) || !eventId || !eventType) return res.status(400).json({ success: false, message: "Stripe event is missing payment correlation metadata." });
  // Declare leaseCutoff for use by the surrounding module or function.
  const leaseCutoff = new Date(Date.now() - 5 * 60 * 1000);
  // Declare event for use by the surrounding module or function.
  let event;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    event = await StripeWebhookEvent.findOneAndUpdate(
      { tenantId, eventId, $or: [{ status: { $in: ["received", "failed"] } }, { status: "processing", updatedAt: { $lt: leaseCutoff } }] },
      { $set: { eventType, status: "processing" } },
      { new: true },
    );
    // Check the condition (!event) and run the matching branch.
    if (!event) {
      // Run this operation with a dedicated error-handling path for failures.
      try { event = await StripeWebhookEvent.create({ tenantId, eventId, eventType, status: "processing" }); }
      // Handle the error raised by the preceding protected operation.
      catch (error) {
        // Check the condition (error?.code !== 11000) and run the matching branch.
        if (error?.code !== 11000) throw error;
        // Declare existing for use by the surrounding module or function.
        const existing = await StripeWebhookEvent.findOne({ tenantId, eventId }).lean();
        // Check the condition (existing?.status === "processed" || existing?.status === "ignored" || ) and run the matching branch.
        if (existing?.status === "processed" || existing?.status === "ignored" || existing?.status === "processing") return res.status(200).json({ success: true, duplicate: true });
        // Perform the side effect or state update expressed on the following line.
        event = await StripeWebhookEvent.findOneAndUpdate({ tenantId, eventId, status: { $in: ["received", "failed"] } }, { $set: { status: "processing" } }, { new: true });
      }
    }
    // Check the condition (!event) and run the matching branch.
    if (!event) return res.status(200).json({ success: true, duplicate: true });
    // Declare successful for use by the surrounding module or function.
    const successful = ["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(eventType);
    // Declare failed for use by the surrounding module or function.
    const failed = ["checkout.session.async_payment_failed", "checkout.session.expired"].includes(eventType);
    // Check the condition (!successful && !failed) and run the matching branch.
    if (!successful && !failed) { event.status = "ignored"; await event.save(); return res.status(200).json({ success: true, ignored: true }); }
    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ tenantId, role: "stripe_webhook", bypass: false }, async () => {
      // Declare session for use by the surrounding module or function.
      const session = sessionObject;
      // Check the condition (!session.id || String(session.metadata?.tenantId) !== tenantId) and run the matching branch.
      if (!session.id || String(session.metadata?.tenantId) !== tenantId) throw new Error("Stripe session tenant does not match the payment event.");
      // Declare payment for use by the surrounding module or function.
      const payment = await Payment.findOne({ tenantId, provider: "STRIPE", transactionReference: String(session.id) });
      // Check the condition (!payment) and run the matching branch.
      if (!payment) throw new Error("Stripe payment record is not available yet.");
      // Check the condition (String(session.metadata?.paymentId || "") !== String(payment._id)) and run the matching branch.
      if (String(session.metadata?.paymentId || "") !== String(payment._id)) throw new Error("Stripe payment correlation does not match the saved attempt.");
      // Declare booking for use by the surrounding module or function.
      const booking = await Booking.findOne({ tenantId, _id: payment.booking });
      // Check the condition (!booking) and run the matching branch.
      if (!booking) throw new Error("Stripe booking is not available.");
      // Perform the side effect or state update expressed on the following line.
      event.payment = payment._id;
      // Check the condition (failed) and run the matching branch.
      if (failed) {
        // Check the condition (payment.status === "pending" || payment.status === "processing") and run the matching branch.
        if (payment.status === "pending" || payment.status === "processing") {
          // Declare { failBookingPayment } for use by the surrounding module or function.
          const { failBookingPayment } = await import("../services/paymentLifecycleService.js");
          // Perform the side effect or state update expressed on the following line.
          await failBookingPayment({ payment, booking, failureReason: eventType === "checkout.session.expired" ? "Stripe Checkout session expired." : "Stripe reported asynchronous payment failure.", paymentData: { callbackResponse: { eventId, type: eventType, sessionId: session.id } } });
        }
        // Return the result to the caller.
        return;
      }
      // Check the condition (session.payment_status !== "paid") and run the matching branch.
      if (session.payment_status !== "paid") throw new Error("Stripe event does not confirm a paid Checkout session.");
      // Declare expectedAmount for use by the surrounding module or function.
      const expectedAmount = Math.round(Number(payment.amount) * 100);
      // Check the condition (!Number.isFinite(expectedAmount) || Number(session.amount_total) !== e) and run the matching branch.
      if (!Number.isFinite(expectedAmount) || Number(session.amount_total) !== expectedAmount || String(session.currency || "").toUpperCase() !== String(payment.currency || "").toUpperCase()) throw new Error("Stripe amount or currency does not match the saved payment.");
      // Perform the side effect or state update expressed on the following line.
      await completeBookingPayment({ payment, booking, paymentData: { amount: payment.amount, paymentMethod: "CARD", transactionId: String(session.payment_intent || session.id), paymentReference: String(session.id), callbackResponse: { provider: "stripe", eventId, type: eventType, sessionId: session.id, paymentStatus: session.payment_status, amountTotal: session.amount_total, currency: session.currency } } });
    });
    // Perform the side effect or state update expressed on the following line.
    event.status = "processed";
    // Perform the side effect or state update expressed on the following line.
    event.processedAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    await event.save();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true });
  } catch (error) {
    // Check the condition (event) and run the matching branch.
    if (event) { event.status = "failed"; await event.save().catch(() => {}); }
    // Perform the side effect or state update expressed on the following line.
    console.error("Stripe webhook processing failed:", { code: error?.code || "STRIPE_WEBHOOK_FAILED" });
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false });
  }
};
