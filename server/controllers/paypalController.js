/**
 * Purpose: paypal Controller HTTP controller. Main declarations: amountValue, currentTenantId, loadActiveConfig, trustedClientUrl, getPayable.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "node:crypto";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/PaymentGatewayConfig.js so this module can use its exported dependencies.
import PaymentGatewayConfig from "../models/PaymentGatewayConfig.js";
// Load ../models/PaypalWebhookEvent.js so this module can use its exported dependencies.
import PaypalWebhookEvent from "../models/PaypalWebhookEvent.js";
// Load ../services/paypalService.js so this module can use its exported dependencies.
import { getPaypalEnvironmentSettings, normalizePaypalEnvironment, paypalApiRequest, verifyPaypalWebhook } from "../services/paypalService.js";
// Load ../services/paymentLifecycleService.js so this module can use its exported dependencies.
import { completeBookingPayment, getPayableBookingAmount, userOwnsBooking } from "../services/paymentLifecycleService.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId, runWithTenant } from "../tenancy/context.js";

// Declare PAYPAL_PAYMENT_CURRENCIES for use by the surrounding module or function.
const PAYPAL_PAYMENT_CURRENCIES = new Set(["AUD", "BRL", "CAD", "CNY", "CZK", "DKK", "EUR", "HKD", "HUF", "ILS", "JPY", "MYR", "MXN", "TWD", "NZD", "NOK", "PHP", "PLN", "GBP", "SGD", "SEK", "CHF", "THB", "USD"]);
// Declare PAYPAL_ZERO_DECIMAL_CURRENCIES for use by the surrounding module or function.
const PAYPAL_ZERO_DECIMAL_CURRENCIES = new Set(["HUF", "JPY", "TWD"]);
// Declare amountValue for use by the surrounding module or function.
const amountValue = (amount, currency) => PAYPAL_ZERO_DECIMAL_CURRENCIES.has(currency) ? String(Math.round(Number(amount))) : Number(amount).toFixed(2);
// Declare currentTenantId for use by the surrounding module or function.
const currentTenantId = () => String(requireTenantId());

// Define loadActiveConfig; its parameters and body implement this operation.
async function loadActiveConfig(tenantId, { requireEnabled = true, environment: requestedEnvironment = "" } = {}) {
  // Declare config for use by the surrounding module or function.
  const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();
  // Declare environment for use by the surrounding module or function.
  const environment = normalizePaypalEnvironment(requestedEnvironment || config?.environment);
  // Declare selected for use by the surrounding module or function.
  const selected = getPaypalEnvironmentSettings(config || {}, environment);
  // Check the condition (!config || !environment || requireEnabled && !config.enabled || !selec) and run the matching branch.
  if (!config || !environment || requireEnabled && !config.enabled || !selected.configured || !selected.validatedAt) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("PayPal is not configured and validated for this tenant environment.");
    // Perform the side effect or state update expressed on the following line.
    error.status = 409;
    // Stop the current operation by raising the value of error.
    throw error;
  }
  // Check the condition (environment === "production" && !config.sandboxLifecycleVerifiedAt) and run the matching branch.
  if (environment === "production" && !config.sandboxLifecycleVerifiedAt) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("PayPal Production is unavailable until a complete Sandbox payment lifecycle has been verified.");
    // Perform the side effect or state update expressed on the following line.
    error.status = 409;
    // Stop the current operation by raising the value of error.
    throw error;
  }
  // Return the object assembled below to the caller.
  return { config, provider: { ...selected, environment } };
}

// Declare trustedClientUrl for use by the surrounding module or function.
const trustedClientUrl = () => {
  // Declare value for use by the surrounding module or function.
  const value = String(process.env.CLIENT_URL || "").trim().replace(/\/+$/, "");
  // Declare parsed for use by the surrounding module or function.
  const parsed = new URL(value);
  // Check the condition (!(["https:", "http:"].includes(parsed.protocol)) || parsed.username ||) and run the matching branch.
  if (!(["https:", "http:"].includes(parsed.protocol)) || parsed.username || parsed.password) throw new Error("Client URL is not configured safely.");
  // Check the condition (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") and run the matching branch.
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("Client URL must use HTTPS in production.");
  // Return the value of value to the caller.
  return value;
};

// Declare getPayable for use by the surrounding module or function.
const getPayable = async (booking, settings) => {
  // Declare amount for use by the surrounding module or function.
  const amount = Number(getPayableBookingAmount(booking));
  // Declare currency for use by the surrounding module or function.
  const currency = String(booking.currency || settings?.currency || "").trim().toUpperCase();
  // Return the object assembled below to the caller.
  return { amount, currency };
};

// Declare createPaypalOrder for use by the surrounding module or function.
export const createPaypalOrder = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = currentTenantId();
    // Declare settings for use by the surrounding module or function.
    const settings = await getSystemSettings(req);
    // Check the condition (settings.paypalAvailable !== true) and run the matching branch.
    if (settings.paypalAvailable !== true) return res.status(409).json({ success: false, message: "PayPal is disabled or not validated for this tenant." });
    // Declare bookingId for use by the surrounding module or function.
    const bookingId = String(req.body?.bookingId || "").trim();
    // Check the condition (!bookingId || !req.user?._id) and run the matching branch.
    if (!bookingId || !req.user?._id) return res.status(400).json({ success: false, message: "A booking ID and authenticated customer are required." });
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(mergeTenantFilter({ _id: bookingId }));
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    // Check the condition (!userOwnsBooking(booking, req.user)) and run the matching branch.
    if (!userOwnsBooking(booking, req.user)) return res.status(403).json({ success: false, message: "You cannot pay this booking." });
    // Check the condition (booking.isDeleted || ["cancelled", "refunded"].includes(String(booking) and run the matching branch.
    if (booking.isDeleted || ["cancelled", "refunded"].includes(String(booking.status).toLowerCase()) || booking.paymentStatus === "paid") return res.status(409).json({ success: false, message: "This booking cannot receive another payment." });
    // Declare { amount, currency } for use by the surrounding module or function.
    const { amount, currency } = await getPayable(booking, settings);
    // Check the condition (!Number.isFinite(amount) || amount <= 0) and run the matching branch.
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "No amount is due for this booking." });
    // Check the condition (!PAYPAL_PAYMENT_CURRENCIES.has(currency)) and run the matching branch.
    if (!PAYPAL_PAYMENT_CURRENCIES.has(currency)) return res.status(409).json({ success: false, message: `PayPal does not support this tenant's configured payment currency (${currency || "unknown"}).` });
    // Declare existing for use by the surrounding module or function.
    const existing = await Payment.findOne(mergeTenantFilter({ booking: booking._id, provider: "PAYPAL", status: { $in: ["pending", "processing"] } })).sort({ createdAt: -1 });
    // Check the condition (existing?.providerOrderId && existing?.providerApprovalUrl) and run the matching branch.
    if (existing?.providerOrderId && existing?.providerApprovalUrl) return res.status(200).json({ success: true, orderId: existing.providerOrderId, url: existing.providerApprovalUrl, status: existing.status, reused: true });
    // Check the condition (existing) and run the matching branch.
    if (existing) return res.status(409).json({ success: false, message: "A PayPal order is already being processed. Refresh payment status before retrying." });

    // Declare { provider } for use by the surrounding module or function.
    const { provider } = await loadActiveConfig(tenantId);
    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.create({ tenantId, customer: req.user._id, user: req.user._id, booking: booking._id, provider: "PAYPAL", method: "paypal", paymentMethod: "PAYPAL", amount, currency, providerEnvironment: provider.environment, status: "processing", activeAttempt: true, transactionReference: `paypal-pending-${crypto.randomUUID()}`, notes: "PayPal order creation pending." });
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare origin for use by the surrounding module or function.
      const origin = trustedClientUrl();
      // Declare order for use by the surrounding module or function.
      const order = await paypalApiRequest(provider, "/v2/checkout/orders", {
        method: "POST", requestId: `order-${payment._id}`,
        body: {
          intent: "CAPTURE",
          purchase_units: [{ reference_id: String(booking._id), custom_id: String(payment._id), invoice_id: String(payment._id), amount: { currency_code: currency, value: amountValue(amount, currency) }, description: `Booking ${String(booking.bookingNumber || booking._id).slice(0, 120)}`, ...(provider.merchantId ? { payee: { merchant_id: provider.merchantId } } : {}) }],
          application_context: { return_url: `${origin}/payment-status/${booking._id}?provider=paypal`, cancel_url: `${origin}/payment-status/${booking._id}?provider=paypal&cancelled=1`, user_action: "PAY_NOW" },
        },
      });
      // Declare approvalUrl for use by the surrounding module or function.
      const approvalUrl = (order?.links || []).find((link) => link.rel === "approve")?.href;
      // Check the condition (!order?.id || !approvalUrl || order.status !== "CREATED") and run the matching branch.
      if (!order?.id || !approvalUrl || order.status !== "CREATED") throw new Error("PayPal returned an incomplete order response.");
      // Perform the side effect or state update expressed on the following line.
      payment.providerOrderId = order.id;
      // Perform the side effect or state update expressed on the following line.
      payment.transactionReference = order.id;
      // Perform the side effect or state update expressed on the following line.
      payment.providerApprovalUrl = approvalUrl;
      // Perform the side effect or state update expressed on the following line.
      payment.status = "pending";
      // Perform the side effect or state update expressed on the following line.
      payment.notes = "PayPal order awaiting customer approval.";
      // Perform the side effect or state update expressed on the following line.
      await payment.save();
      // Perform the side effect or state update expressed on the following line.
      booking.payments = Array.isArray(booking.payments) ? booking.payments : [];
      // Check the condition (!booking.payments.some((id) => String(id) === String(payment._id))) and run the matching branch.
      if (!booking.payments.some((id) => String(id) === String(payment._id))) booking.payments.push(payment._id);
      // Perform the side effect or state update expressed on the following line.
      booking.paymentMethod = "PAYPAL";
      // Perform the side effect or state update expressed on the following line.
      booking.paymentStatus = "pending";
      // Perform the side effect or state update expressed on the following line.
      await booking.save();
      // Return the result of res.status(201).json() to the caller.
      return res.status(201).json({ success: true, orderId: order.id, url: approvalUrl, status: "pending" });
    } catch (error) {
      // Provider timeouts are uncertain: retain a processing record and block retries.
      // Check the condition (!["TimeoutError", "AbortError"].includes(error?.name) && !error?.cause) and run the matching branch.
      if (!["TimeoutError", "AbortError"].includes(error?.name) && !error?.cause) {
        // Perform the side effect or state update expressed on the following line.
        payment.status = "failed";
        // Perform the side effect or state update expressed on the following line.
        payment.failureReason = "PayPal order could not be created.";
        // Perform the side effect or state update expressed on the following line.
        payment.failedAt = new Date();
        // Perform the side effect or state update expressed on the following line.
        await payment.save();
      }
      // Return the result of res.status(error?.status || 502).json() to the caller.
      return res.status(error?.status || 502).json({ success: false, message: "PayPal could not create the order. Check payment status before retrying." });
    }
  } catch (error) { return next(error); }
};

// Define verifyOrderForPayment; its parameters and body implement this operation.
async function verifyOrderForPayment(provider, orderId, payment, providerSettings) {
  // Declare order for use by the surrounding module or function.
  const order = await paypalApiRequest(provider, `/v2/checkout/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
  // Declare unit for use by the surrounding module or function.
  const unit = order?.purchase_units?.find((item) => String(item.custom_id || "") === String(payment._id));
  // Declare orderAmount for use by the surrounding module or function.
  const orderAmount = unit?.amount;
  // Check the condition (!unit || String(order.id) !== String(payment.providerOrderId) || Strin) and run the matching branch.
  if (!unit || String(order.id) !== String(payment.providerOrderId) || String(orderAmount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(orderAmount?.value) !== Number(payment.amount)) throw new Error("PayPal order does not match the saved payment.");
  // Check the condition (providerSettings.merchantId && String(unit?.payee?.merchant_id || "") ) and run the matching branch.
  if (providerSettings.merchantId && String(unit?.payee?.merchant_id || "") !== String(providerSettings.merchantId)) throw new Error("PayPal order merchant does not match the configured merchant.");
  // Return the value of order to the caller.
  return order;
}

// Declare capturePaypalOrder for use by the surrounding module or function.
export const capturePaypalOrder = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = currentTenantId();
    // Declare orderId for use by the surrounding module or function.
    const orderId = String(req.body?.orderId || "").trim();
    // Check the condition (!orderId || orderId.length > 80) and run the matching branch.
    if (!orderId || orderId.length > 80) return res.status(400).json({ success: false, message: "A valid PayPal order ID is required." });
    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.findOne(mergeTenantFilter({ provider: "PAYPAL", providerOrderId: orderId }));
    // Check the condition (!payment) and run the matching branch.
    if (!payment) return res.status(404).json({ success: false, message: "PayPal order not found." });
    // Check the condition (payment.customer && String(payment.customer) !== String(req.user?._id)) and run the matching branch.
    if (payment.customer && String(payment.customer) !== String(req.user?._id)) return res.status(403).json({ success: false, message: "This PayPal order belongs to another customer." });
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(mergeTenantFilter({ _id: payment.booking }));
    // Check the condition (!booking || !userOwnsBooking(booking, req.user)) and run the matching branch.
    if (!booking || !userOwnsBooking(booking, req.user)) return res.status(404).json({ success: false, message: "Booking not found." });
    // Check the condition (payment.status === "completed") and run the matching branch.
    if (payment.status === "completed") return res.json({ success: true, paid: true, alreadyCompleted: true });
    // Declare { config, provider } for use by the surrounding module or function.
    const { config, provider } = await loadActiveConfig(tenantId, { requireEnabled: false, environment: payment.providerEnvironment || "sandbox" });
    // Perform the side effect or state update expressed on the following line.
    await verifyOrderForPayment(provider, orderId, payment, provider);
    // Declare captured for use by the surrounding module or function.
    const captured = await paypalApiRequest(provider, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: "POST", requestId: `capture-${payment._id}`, body: {} });
    // Declare capture for use by the surrounding module or function.
    const capture = captured?.purchase_units?.flatMap((unit) => unit?.payments?.captures || []).find((item) => item.status === "COMPLETED");
    // Check the condition (!capture && ["VOIDED", "DECLINED"].includes(String(captured?.status ||) and run the matching branch.
    if (!capture && ["VOIDED", "DECLINED"].includes(String(captured?.status || "").toUpperCase())) {
      // Perform the side effect or state update expressed on the following line.
      payment.status = captured.status === "VOIDED" ? "cancelled" : "failed";
      // Perform the side effect or state update expressed on the following line.
      payment.failureReason = captured.status === "VOIDED" ? "PayPal order was voided." : "PayPal capture was declined.";
      // Check the condition (payment.status === "failed") and run the matching branch.
      if (payment.status === "failed") payment.failedAt = new Date();
      // Perform the side effect or state update expressed on the following line.
      await payment.save();
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, paid: false, status: payment.status, message: "PayPal did not complete the payment." });
    }
    // Check the condition (!capture) and run the matching branch.
    if (!capture) return res.status(202).json({ success: true, paid: false, status: captured?.status || "pending", message: "PayPal has not confirmed a completed capture." });
    // Declare captureAmount for use by the surrounding module or function.
    const captureAmount = capture?.amount;
    // Check the condition (String(captureAmount?.currency_code || "").toUpperCase() !== String(pa) and run the matching branch.
    if (String(captureAmount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(captureAmount?.value) !== Number(payment.amount)) return res.status(409).json({ success: false, message: "PayPal capture amount does not match the saved payment." });
    // Perform the side effect or state update expressed on the following line.
    payment.providerCaptureId = String(capture.id || "");
    // Perform the side effect or state update expressed on the following line.
    payment.transactionId = String(capture.id || orderId);
    // Perform the side effect or state update expressed on the following line.
    payment.transactionReference = orderId;
    // Declare completed for use by the surrounding module or function.
    const completed = await completeBookingPayment({ payment, booking, paymentData: { amount: Number(payment.amount), paymentMethod: "PAYPAL", transactionId: payment.transactionId, paymentReference: orderId, providerOrderId: orderId, providerCaptureId: String(capture.id), providerEnvironment: provider.environment, callbackResponse: { provider: "paypal", orderId, captureId: String(capture.id), status: capture.status, amount: captureAmount.value, currency: captureAmount.currency_code } } });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, paid: completed?.booking?.paymentStatus === "paid", status: "completed", paymentId: payment._id });
  } catch (error) {
    // Check the condition (["TimeoutError", "AbortError"].includes(error?.name)) and run the matching branch.
    if (["TimeoutError", "AbortError"].includes(error?.name)) return res.status(202).json({ success: true, paid: false, status: "processing", message: "PayPal capture result is pending. Refresh payment status before retrying." });
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare paypalWebhook for use by the surrounding module or function.
export const paypalWebhook = async (req, res) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = String(req.params?.tenantId || "");
  // Declare environment for use by the surrounding module or function.
  const environment = normalizePaypalEnvironment(req.params?.environment);
  // Check the condition (!/^[a-f\d]{24}$/i.test(tenantId) || !environment || !req.body?.id || !) and run the matching branch.
  if (!/^[a-f\d]{24}$/i.test(tenantId) || !environment || !req.body?.id || !req.body?.event_type) return res.status(400).json({ success: false });
  // Declare event for use by the surrounding module or function.
  let event;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenant for use by the surrounding module or function.
    const tenant = await Organization.findById(tenantId).select("_id").lean();
    // Declare gateway for use by the surrounding module or function.
    const gateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();
    // Declare selected for use by the surrounding module or function.
    const selected = getPaypalEnvironmentSettings(gateway || {}, environment);
    // Check the condition (!tenant || !selected.configured) and run the matching branch.
    if (!tenant || !selected.configured) return res.status(404).json({ success: false });
    // Declare verified for use by the surrounding module or function.
    const verified = await verifyPaypalWebhook({ config: { ...selected, environment }, headers: req.headers, event: req.body });
    // Check the condition (!verified) and run the matching branch.
    if (!verified) return res.status(400).json({ success: false, message: "Webhook signature was not verified." });
    // Declare eventId for use by the surrounding module or function.
    const eventId = String(req.body.id).slice(0, 160);
    // Declare eventType for use by the surrounding module or function.
    const eventType = String(req.body.event_type).slice(0, 160);
    // Declare leaseCutoff for use by the surrounding module or function.
    const leaseCutoff = new Date(Date.now() - 5 * 60 * 1000);
    // Perform the side effect or state update expressed on the following line.
    event = await PaypalWebhookEvent.findOneAndUpdate({ tenantId, eventId, $or: [{ status: { $in: ["received", "failed"] } }, { status: "processing", updatedAt: { $lt: leaseCutoff } }] }, { $set: { status: "processing", eventType } }, { new: true });
    // Check the condition (!event) and run the matching branch.
    if (!event) {
      // Run this operation with a dedicated error-handling path for failures.
      try { event = await PaypalWebhookEvent.create({ tenantId, eventId, eventType, status: "processing" }); }
      // Handle the error raised by the preceding protected operation.
      catch (error) {
        // Check the condition (error?.code !== 11000) and run the matching branch.
        if (error?.code !== 11000) throw error;
        // Declare existing for use by the surrounding module or function.
        const existing = await PaypalWebhookEvent.findOne({ tenantId, eventId }).lean();
        // Check the condition (existing?.status === "processed" || existing?.status === "ignored" || ) and run the matching branch.
        if (existing?.status === "processed" || existing?.status === "ignored" || existing?.status === "processing") return res.status(200).json({ success: true, duplicate: true });
        // Perform the side effect or state update expressed on the following line.
        event = await PaypalWebhookEvent.findOneAndUpdate({ tenantId, eventId, status: { $in: ["received", "failed"] } }, { $set: { status: "processing", eventType } }, { new: true });
      }
    }
    // Check the condition (!event) and run the matching branch.
    if (!event) return res.status(200).json({ success: true, duplicate: true });
    // Declare supported for use by the surrounding module or function.
    const supported = new Set(["PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.VOIDED"]);
    // Check the condition (!supported.has(event.eventType)) and run the matching branch.
    if (!supported.has(event.eventType)) { event.status = "ignored"; await event.save(); return res.status(200).json({ success: true, ignored: true }); }
    // Declare resource for use by the surrounding module or function.
    const resource = req.body.resource || {};
    // Check the condition (event.eventType === "CHECKOUT.ORDER.VOIDED") and run the matching branch.
    if (event.eventType === "CHECKOUT.ORDER.VOIDED") {
      // Declare voidedOrderId for use by the surrounding module or function.
      const voidedOrderId = String(resource.id || "");
      // Declare voidedPayment for use by the surrounding module or function.
      const voidedPayment = await Payment.findOne({ tenantId, provider: "PAYPAL", providerOrderId: voidedOrderId });
      // Check the condition (voidedPayment && ["pending", "processing"].includes(voidedPayment.stat) and run the matching branch.
      if (voidedPayment && ["pending", "processing"].includes(voidedPayment.status)) {
        // Perform the side effect or state update expressed on the following line.
        voidedPayment.status = "cancelled";
        // Perform the side effect or state update expressed on the following line.
        voidedPayment.failureReason = "PayPal order was voided by the customer or merchant.";
        // Perform the side effect or state update expressed on the following line.
        await voidedPayment.save();
        // Perform the side effect or state update expressed on the following line.
        event.payment = voidedPayment._id;
      }
      // Perform the side effect or state update expressed on the following line.
      event.status = "processed"; event.processedAt = new Date(); await event.save();
      // Return the result of res.status(200).json() to the caller.
      return res.status(200).json({ success: true });
    }
    // Declare orderId for use by the surrounding module or function.
    const orderId = String(resource?.supplementary_data?.related_ids?.order_id || "").trim();
    // Check the condition (!orderId) and run the matching branch.
    if (!orderId) { event.status = "ignored"; await event.save(); return res.status(200).json({ success: true, ignored: true }); }
    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.findOne({ tenantId, provider: "PAYPAL", providerOrderId: orderId });
    // Check the condition (!payment) and run the matching branch.
    if (!payment) { event.status = "failed"; await event.save(); return res.status(500).json({ success: false }); }
    // Check the condition ((payment.providerEnvironment || "sandbox") !== environment) and run the matching branch.
    if ((payment.providerEnvironment || "sandbox") !== environment) { event.status = "ignored"; await event.save(); return res.status(200).json({ success: true, ignored: true }); }
    // Perform the side effect or state update expressed on the following line.
    event.payment = payment._id; event.status = "processing"; await event.save();
    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ tenantId, role: "paypal_webhook", bypass: false }, async () => {
      // Declare order for use by the surrounding module or function.
      const order = await paypalApiRequest({ ...selected, environment }, `/v2/checkout/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
      // Declare unit for use by the surrounding module or function.
      const unit = order?.purchase_units?.find((item) => String(item.custom_id || "") === String(payment._id));
      // Declare capture for use by the surrounding module or function.
      const capture = unit?.payments?.captures?.find((item) => String(item.id) === String(resource.id) && item.status === "COMPLETED");
      // Check the condition (!unit || !capture || String(unit.amount?.currency_code || "").toUpperC) and run the matching branch.
      if (!unit || !capture || String(unit.amount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(unit.amount?.value) !== Number(payment.amount) || String(capture.amount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(capture.amount?.value) !== Number(payment.amount) || selected.merchantId && String(unit?.payee?.merchant_id || "") !== String(selected.merchantId)) throw new Error("PayPal webhook payment details do not match the tenant payment.");
      // Declare booking for use by the surrounding module or function.
      const booking = await Booking.findOne({ tenantId, _id: payment.booking });
      // Check the condition (!booking) and run the matching branch.
      if (!booking) throw new Error("PayPal booking not found.");
      // Perform the side effect or state update expressed on the following line.
      payment.providerCaptureId = String(capture.id);
      // Perform the side effect or state update expressed on the following line.
      payment.transactionId = String(capture.id);
      // Perform the side effect or state update expressed on the following line.
      await completeBookingPayment({ payment, booking, paymentData: { amount: Number(payment.amount), paymentMethod: "PAYPAL", transactionId: String(capture.id), paymentReference: orderId, providerOrderId: orderId, providerCaptureId: String(capture.id), providerEnvironment: environment, callbackResponse: { provider: "paypal", orderId, captureId: capture.id, status: capture.status, eventId } } });
      // Check the condition (environment === "sandbox" && !gateway.sandboxLifecycleVerifiedAt) and run the matching branch.
      if (environment === "sandbox" && !gateway.sandboxLifecycleVerifiedAt) await PaymentGatewayConfig.updateOne({ tenantId, provider: "PAYPAL" }, { $set: { sandboxLifecycleVerifiedAt: new Date() } });
    });
    // Perform the side effect or state update expressed on the following line.
    event.status = "processed"; event.processedAt = new Date(); await event.save();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true });
  } catch (error) {
    // Never echo provider bodies, request headers, or credentials to PayPal or logs.
    // Check the condition (event) and run the matching branch.
    if (event) { event.status = "failed"; await event.save().catch(() => {}); }
    // Perform the side effect or state update expressed on the following line.
    console.error("PayPal webhook processing failed:", { code: error?.code || "PAYPAL_WEBHOOK_FAILED" });
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false });
  }
};
