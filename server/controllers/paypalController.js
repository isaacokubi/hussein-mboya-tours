import crypto from "node:crypto";
import Booking from "../models/Booking.js";
import Organization from "../models/Organization.js";
import Payment from "../models/Payment.js";
import PaymentGatewayConfig from "../models/PaymentGatewayConfig.js";
import PaypalWebhookEvent from "../models/PaypalWebhookEvent.js";
import { getPaypalEnvironmentSettings, normalizePaypalEnvironment, paypalApiRequest, verifyPaypalWebhook } from "../services/paypalService.js";
import { completeBookingPayment, getPayableBookingAmount, userOwnsBooking } from "../services/paymentLifecycleService.js";
import { getSystemSettings } from "../services/settingsService.js";
import { mergeTenantFilter, requireTenantId, runWithTenant } from "../tenancy/context.js";

const PAYPAL_PAYMENT_CURRENCIES = new Set(["AUD", "BRL", "CAD", "CNY", "CZK", "DKK", "EUR", "HKD", "HUF", "ILS", "JPY", "MYR", "MXN", "TWD", "NZD", "NOK", "PHP", "PLN", "GBP", "SGD", "SEK", "CHF", "THB", "USD"]);
const PAYPAL_ZERO_DECIMAL_CURRENCIES = new Set(["HUF", "JPY", "TWD"]);
const amountValue = (amount, currency) => PAYPAL_ZERO_DECIMAL_CURRENCIES.has(currency) ? String(Math.round(Number(amount))) : Number(amount).toFixed(2);
const currentTenantId = () => String(requireTenantId());

async function loadActiveConfig(tenantId, { requireEnabled = true, environment: requestedEnvironment = "" } = {}) {
  const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();
  const environment = normalizePaypalEnvironment(requestedEnvironment || config?.environment);
  const selected = getPaypalEnvironmentSettings(config || {}, environment);
  if (!config || !environment || requireEnabled && !config.enabled || !selected.configured || !selected.validatedAt) {
    const error = new Error("PayPal is not configured and validated for this tenant environment.");
    error.status = 409;
    throw error;
  }
  if (environment === "production" && !config.sandboxLifecycleVerifiedAt) {
    const error = new Error("PayPal Production is unavailable until a complete Sandbox payment lifecycle has been verified.");
    error.status = 409;
    throw error;
  }
  return { config, provider: { ...selected, environment } };
}

const trustedClientUrl = () => {
  const value = String(process.env.CLIENT_URL || "").trim().replace(/\/+$/, "");
  const parsed = new URL(value);
  if (!(["https:", "http:"].includes(parsed.protocol)) || parsed.username || parsed.password) throw new Error("Client URL is not configured safely.");
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("Client URL must use HTTPS in production.");
  return value;
};

const getPayable = async (booking, settings) => {
  const amount = Number(getPayableBookingAmount(booking));
  const currency = String(booking.currency || settings?.currency || "").trim().toUpperCase();
  return { amount, currency };
};

export const createPaypalOrder = async (req, res, next) => {
  try {
    const tenantId = currentTenantId();
    const settings = await getSystemSettings(req);
    if (settings.paypalAvailable !== true) return res.status(409).json({ success: false, message: "PayPal is disabled or not validated for this tenant." });
    const bookingId = String(req.body?.bookingId || "").trim();
    if (!bookingId || !req.user?._id) return res.status(400).json({ success: false, message: "A booking ID and authenticated customer are required." });
    const booking = await Booking.findOne(mergeTenantFilter({ _id: bookingId }));
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (!userOwnsBooking(booking, req.user)) return res.status(403).json({ success: false, message: "You cannot pay this booking." });
    if (booking.isDeleted || ["cancelled", "refunded"].includes(String(booking.status).toLowerCase()) || booking.paymentStatus === "paid") return res.status(409).json({ success: false, message: "This booking cannot receive another payment." });
    const { amount, currency } = await getPayable(booking, settings);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "No amount is due for this booking." });
    if (!PAYPAL_PAYMENT_CURRENCIES.has(currency)) return res.status(409).json({ success: false, message: `PayPal does not support this tenant's configured payment currency (${currency || "unknown"}).` });
    const existing = await Payment.findOne(mergeTenantFilter({ booking: booking._id, provider: "PAYPAL", status: { $in: ["pending", "processing"] } })).sort({ createdAt: -1 });
    if (existing?.providerOrderId && existing?.providerApprovalUrl) return res.status(200).json({ success: true, orderId: existing.providerOrderId, url: existing.providerApprovalUrl, status: existing.status, reused: true });
    if (existing) return res.status(409).json({ success: false, message: "A PayPal order is already being processed. Refresh payment status before retrying." });

    const { provider } = await loadActiveConfig(tenantId);
    const payment = await Payment.create({ tenantId, customer: req.user._id, user: req.user._id, booking: booking._id, provider: "PAYPAL", method: "paypal", paymentMethod: "PAYPAL", amount, currency, providerEnvironment: provider.environment, status: "processing", activeAttempt: true, transactionReference: `paypal-pending-${crypto.randomUUID()}`, notes: "PayPal order creation pending." });
    try {
      const origin = trustedClientUrl();
      const order = await paypalApiRequest(provider, "/v2/checkout/orders", {
        method: "POST", requestId: `order-${payment._id}`,
        body: {
          intent: "CAPTURE",
          purchase_units: [{ reference_id: String(booking._id), custom_id: String(payment._id), invoice_id: String(payment._id), amount: { currency_code: currency, value: amountValue(amount, currency) }, description: `Booking ${String(booking.bookingNumber || booking._id).slice(0, 120)}`, ...(provider.merchantId ? { payee: { merchant_id: provider.merchantId } } : {}) }],
          application_context: { return_url: `${origin}/payment-status/${booking._id}?provider=paypal`, cancel_url: `${origin}/payment-status/${booking._id}?provider=paypal&cancelled=1`, user_action: "PAY_NOW" },
        },
      });
      const approvalUrl = (order?.links || []).find((link) => link.rel === "approve")?.href;
      if (!order?.id || !approvalUrl || order.status !== "CREATED") throw new Error("PayPal returned an incomplete order response.");
      payment.providerOrderId = order.id;
      payment.transactionReference = order.id;
      payment.providerApprovalUrl = approvalUrl;
      payment.status = "pending";
      payment.notes = "PayPal order awaiting customer approval.";
      await payment.save();
      booking.payments = Array.isArray(booking.payments) ? booking.payments : [];
      if (!booking.payments.some((id) => String(id) === String(payment._id))) booking.payments.push(payment._id);
      booking.paymentMethod = "PAYPAL";
      booking.paymentStatus = "pending";
      await booking.save();
      return res.status(201).json({ success: true, orderId: order.id, url: approvalUrl, status: "pending" });
    } catch (error) {
      // Provider timeouts are uncertain: retain a processing record and block retries.
      if (!["TimeoutError", "AbortError"].includes(error?.name) && !error?.cause) {
        payment.status = "failed";
        payment.failureReason = "PayPal order could not be created.";
        payment.failedAt = new Date();
        await payment.save();
      }
      return res.status(error?.status || 502).json({ success: false, message: "PayPal could not create the order. Check payment status before retrying." });
    }
  } catch (error) { return next(error); }
};

async function verifyOrderForPayment(provider, orderId, payment, providerSettings) {
  const order = await paypalApiRequest(provider, `/v2/checkout/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
  const unit = order?.purchase_units?.find((item) => String(item.custom_id || "") === String(payment._id));
  const orderAmount = unit?.amount;
  if (!unit || String(order.id) !== String(payment.providerOrderId) || String(orderAmount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(orderAmount?.value) !== Number(payment.amount)) throw new Error("PayPal order does not match the saved payment.");
  if (providerSettings.merchantId && String(unit?.payee?.merchant_id || "") !== String(providerSettings.merchantId)) throw new Error("PayPal order merchant does not match the configured merchant.");
  return order;
}

export const capturePaypalOrder = async (req, res, next) => {
  try {
    const tenantId = currentTenantId();
    const orderId = String(req.body?.orderId || "").trim();
    if (!orderId || orderId.length > 80) return res.status(400).json({ success: false, message: "A valid PayPal order ID is required." });
    const payment = await Payment.findOne(mergeTenantFilter({ provider: "PAYPAL", providerOrderId: orderId }));
    if (!payment) return res.status(404).json({ success: false, message: "PayPal order not found." });
    if (payment.customer && String(payment.customer) !== String(req.user?._id)) return res.status(403).json({ success: false, message: "This PayPal order belongs to another customer." });
    const booking = await Booking.findOne(mergeTenantFilter({ _id: payment.booking }));
    if (!booking || !userOwnsBooking(booking, req.user)) return res.status(404).json({ success: false, message: "Booking not found." });
    if (payment.status === "completed") return res.json({ success: true, paid: true, alreadyCompleted: true });
    const { config, provider } = await loadActiveConfig(tenantId, { requireEnabled: false, environment: payment.providerEnvironment || "sandbox" });
    await verifyOrderForPayment(provider, orderId, payment, provider);
    const captured = await paypalApiRequest(provider, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: "POST", requestId: `capture-${payment._id}`, body: {} });
    const capture = captured?.purchase_units?.flatMap((unit) => unit?.payments?.captures || []).find((item) => item.status === "COMPLETED");
    if (!capture && ["VOIDED", "DECLINED"].includes(String(captured?.status || "").toUpperCase())) {
      payment.status = captured.status === "VOIDED" ? "cancelled" : "failed";
      payment.failureReason = captured.status === "VOIDED" ? "PayPal order was voided." : "PayPal capture was declined.";
      if (payment.status === "failed") payment.failedAt = new Date();
      await payment.save();
      return res.status(409).json({ success: false, paid: false, status: payment.status, message: "PayPal did not complete the payment." });
    }
    if (!capture) return res.status(202).json({ success: true, paid: false, status: captured?.status || "pending", message: "PayPal has not confirmed a completed capture." });
    const captureAmount = capture?.amount;
    if (String(captureAmount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(captureAmount?.value) !== Number(payment.amount)) return res.status(409).json({ success: false, message: "PayPal capture amount does not match the saved payment." });
    payment.providerCaptureId = String(capture.id || "");
    payment.transactionId = String(capture.id || orderId);
    payment.transactionReference = orderId;
    const completed = await completeBookingPayment({ payment, booking, paymentData: { amount: Number(payment.amount), paymentMethod: "PAYPAL", transactionId: payment.transactionId, paymentReference: orderId, providerOrderId: orderId, providerCaptureId: String(capture.id), providerEnvironment: provider.environment, callbackResponse: { provider: "paypal", orderId, captureId: String(capture.id), status: capture.status, amount: captureAmount.value, currency: captureAmount.currency_code } } });
    return res.json({ success: true, paid: completed?.booking?.paymentStatus === "paid", status: "completed", paymentId: payment._id });
  } catch (error) {
    if (["TimeoutError", "AbortError"].includes(error?.name)) return res.status(202).json({ success: true, paid: false, status: "processing", message: "PayPal capture result is pending. Refresh payment status before retrying." });
    return next(error);
  }
};

export const paypalWebhook = async (req, res) => {
  const tenantId = String(req.params?.tenantId || "");
  const environment = normalizePaypalEnvironment(req.params?.environment);
  if (!/^[a-f\d]{24}$/i.test(tenantId) || !environment || !req.body?.id || !req.body?.event_type) return res.status(400).json({ success: false });
  let event;
  try {
    const tenant = await Organization.findById(tenantId).select("_id").lean();
    const gateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();
    const selected = getPaypalEnvironmentSettings(gateway || {}, environment);
    if (!tenant || !selected.configured) return res.status(404).json({ success: false });
    const verified = await verifyPaypalWebhook({ config: { ...selected, environment }, headers: req.headers, event: req.body });
    if (!verified) return res.status(400).json({ success: false, message: "Webhook signature was not verified." });
    const eventId = String(req.body.id).slice(0, 160);
    const eventType = String(req.body.event_type).slice(0, 160);
    const leaseCutoff = new Date(Date.now() - 5 * 60 * 1000);
    event = await PaypalWebhookEvent.findOneAndUpdate({ tenantId, eventId, $or: [{ status: { $in: ["received", "failed"] } }, { status: "processing", updatedAt: { $lt: leaseCutoff } }] }, { $set: { status: "processing", eventType } }, { new: true });
    if (!event) {
      try { event = await PaypalWebhookEvent.create({ tenantId, eventId, eventType, status: "processing" }); }
      catch (error) {
        if (error?.code !== 11000) throw error;
        const existing = await PaypalWebhookEvent.findOne({ tenantId, eventId }).lean();
        if (existing?.status === "processed" || existing?.status === "ignored" || existing?.status === "processing") return res.status(200).json({ success: true, duplicate: true });
        event = await PaypalWebhookEvent.findOneAndUpdate({ tenantId, eventId, status: { $in: ["received", "failed"] } }, { $set: { status: "processing", eventType } }, { new: true });
      }
    }
    if (!event) return res.status(200).json({ success: true, duplicate: true });
    const supported = new Set(["PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.VOIDED"]);
    if (!supported.has(event.eventType)) { event.status = "ignored"; await event.save(); return res.status(200).json({ success: true, ignored: true }); }
    const resource = req.body.resource || {};
    if (event.eventType === "CHECKOUT.ORDER.VOIDED") {
      const voidedOrderId = String(resource.id || "");
      const voidedPayment = await Payment.findOne({ tenantId, provider: "PAYPAL", providerOrderId: voidedOrderId });
      if (voidedPayment && ["pending", "processing"].includes(voidedPayment.status)) {
        voidedPayment.status = "cancelled";
        voidedPayment.failureReason = "PayPal order was voided by the customer or merchant.";
        await voidedPayment.save();
        event.payment = voidedPayment._id;
      }
      event.status = "processed"; event.processedAt = new Date(); await event.save();
      return res.status(200).json({ success: true });
    }
    const orderId = String(resource?.supplementary_data?.related_ids?.order_id || "").trim();
    if (!orderId) { event.status = "ignored"; await event.save(); return res.status(200).json({ success: true, ignored: true }); }
    const payment = await Payment.findOne({ tenantId, provider: "PAYPAL", providerOrderId: orderId });
    if (!payment) { event.status = "failed"; await event.save(); return res.status(500).json({ success: false }); }
    if ((payment.providerEnvironment || "sandbox") !== environment) { event.status = "ignored"; await event.save(); return res.status(200).json({ success: true, ignored: true }); }
    event.payment = payment._id; event.status = "processing"; await event.save();
    await runWithTenant({ tenantId, role: "paypal_webhook", bypass: false }, async () => {
      const order = await paypalApiRequest({ ...selected, environment }, `/v2/checkout/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
      const unit = order?.purchase_units?.find((item) => String(item.custom_id || "") === String(payment._id));
      const capture = unit?.payments?.captures?.find((item) => String(item.id) === String(resource.id) && item.status === "COMPLETED");
      if (!unit || !capture || String(unit.amount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(unit.amount?.value) !== Number(payment.amount) || String(capture.amount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(capture.amount?.value) !== Number(payment.amount) || selected.merchantId && String(unit?.payee?.merchant_id || "") !== String(selected.merchantId)) throw new Error("PayPal webhook payment details do not match the tenant payment.");
      const booking = await Booking.findOne({ tenantId, _id: payment.booking });
      if (!booking) throw new Error("PayPal booking not found.");
      payment.providerCaptureId = String(capture.id);
      payment.transactionId = String(capture.id);
      await completeBookingPayment({ payment, booking, paymentData: { amount: Number(payment.amount), paymentMethod: "PAYPAL", transactionId: String(capture.id), paymentReference: orderId, providerOrderId: orderId, providerCaptureId: String(capture.id), providerEnvironment: environment, callbackResponse: { provider: "paypal", orderId, captureId: capture.id, status: capture.status, eventId } } });
      if (environment === "sandbox" && !gateway.sandboxLifecycleVerifiedAt) await PaymentGatewayConfig.updateOne({ tenantId, provider: "PAYPAL" }, { $set: { sandboxLifecycleVerifiedAt: new Date() } });
    });
    event.status = "processed"; event.processedAt = new Date(); await event.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    // Never echo provider bodies, request headers, or credentials to PayPal or logs.
    if (event) { event.status = "failed"; await event.save().catch(() => {}); }
    console.error("PayPal webhook processing failed:", { code: error?.code || "PAYPAL_WEBHOOK_FAILED" });
    return res.status(500).json({ success: false });
  }
};
