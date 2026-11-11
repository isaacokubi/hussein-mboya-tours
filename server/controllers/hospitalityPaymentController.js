/**
 * Purpose: hospitality Payment Controller HTTP controller. Main declarations: staff, clean, stripeRequest, getBooking, initiateHospitalityMpesa.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Payment from "../models/Payment.js";
// Load ../services/mpesaService.js so this module can use its exported dependencies.
import { initiateStkPush } from "../services/mpesaService.js";
// Load ../services/hospitalityPaymentLifecycleService.js so this module can use its exported dependencies.
import { getHospitalityModel, getHospitalityPayableAmount, assertHospitalityPaymentAccess, completeHospitalityPayment, failHospitalityPayment } from "../services/hospitalityPaymentLifecycleService.js";
// Load ../services/hospitalityInvoiceService.js so this module can use its exported dependencies.
import { ensureHospitalityInvoice } from "../services/hospitalityInvoiceService.js";

// Declare staff for use by the surrounding module or function.
const staff = (user) => ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager", "agent"].includes(String(user?.role || user?.legacyRole || "").toLowerCase());
// Declare clean for use by the surrounding module or function.
const clean = (v) => String(v ?? "").trim();
// Declare stripeRequest for use by the surrounding module or function.
const stripeRequest = async (path, body = {}, method = "POST") => {
  // Declare key for use by the surrounding module or function.
  const key = process.env.STRIPE_SECRET_KEY; if (!key) throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to the server environment.");
  // Declare options for use by the surrounding module or function.
  const options = { method, headers: { Authorization: `Bearer ${key}` } }; if (method !== "GET") { options.headers["Content-Type"] = "application/x-www-form-urlencoded"; options.body = new URLSearchParams(body); }
  // Declare response for use by the surrounding module or function.
  const response = await fetch(`https://api.stripe.com/v1/${path}`, options); const data = await response.json(); if (!response.ok) { const error = new Error(data?.error?.message || "Stripe request failed."); error.status = response.status; throw error; } return data;
};
// Declare getBooking for use by the surrounding module or function.
const getBooking = async (req) => { const type = String(req.body?.type || req.query?.type || "").toLowerCase(); const Model = getHospitalityModel(type); if (!Model) return { type, Model, booking: null }; const booking = await Model.findOne({ tenantId: req.tenantId, _id: req.body?.bookingId || req.query?.bookingId || req.params?.bookingId }); return { type, Model, booking }; };

// Declare initiateHospitalityMpesa for use by the surrounding module or function.
export const initiateHospitalityMpesa = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { type, Model, booking } for use by the surrounding module or function.
    const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking not found." }); if (!assertHospitalityPaymentAccess(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to pay this reservation." }); await ensureHospitalityInvoice({ type, booking });
    // Declare payable for use by the surrounding module or function.
    const payable = await getHospitalityPayableAmount(booking); if (payable <= 0) return res.status(400).json({ success: false, message: "No balance remains for this reservation." }); const amount = Number(req.body.amount || payable); if (!Number.isFinite(amount) || amount < 1 || amount > payable) return res.status(400).json({ success: false, message: `Payment amount must be between 1 and ${payable.toLocaleString()} KES.`, balance: payable });
    // Declare existing for use by the surrounding module or function.
    const existing = await Payment.findOne({ tenantId: req.tenantId, hospitalityBooking: booking._id, hospitalityType: type, status: { $in: ["pending", "processing"] } }).sort({ createdAt: -1 }); if (existing) return res.json({ success: true, message: "A payment request is already waiting for confirmation.", data: { CheckoutRequestID: existing.checkoutRequestID, amount: existing.amount, paymentId: existing._id } });
    // Declare phone for use by the surrounding module or function.
    const phone = String(req.body.phoneNumber || booking.passengerPhone || req.user?.phone || "").trim(); if (!phone) return res.status(400).json({ success: false, message: "A valid Kenyan phone number is required for M-Pesa." });
    // Declare response for use by the surrounding module or function.
    const response = await initiateStkPush({ phone, amount, bookingId: booking._id.toString() }); const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user || req.user._id, customer: booking.user || req.user._id, hospitalityBooking: booking._id, hospitalityBookingModel: type === "hotel" ? "HotelBooking" : "AirportTransferBooking", hospitalityType: type, provider: "MPESA", method: "mpesa", paymentMethod: "MPESA", amount, currency: booking.currency || "KES", phoneNumber: phone, merchantRequestID: response.MerchantRequestID, checkoutRequestID: response.CheckoutRequestID, status: "pending" });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: `M-Pesa STK Push sent for KES ${amount.toLocaleString()}.`, data: { ...response, amount, paymentId: payment._id, hospitalityType: type, bookingId: booking._id } });
  } catch (error) { next(error); }
};

// Declare initiateHospitalityCard for use by the surrounding module or function.
export const initiateHospitalityCard = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { type, Model, booking } for use by the surrounding module or function.
    const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking not found." }); if (!assertHospitalityPaymentAccess(booking, req.user)) return res.status(403).json({ success: false, message: "Not allowed." }); await ensureHospitalityInvoice({ type, booking });
    // Declare amount for use by the surrounding module or function.
    const amount = await getHospitalityPayableAmount(booking); if (amount <= 0) return res.status(400).json({ success: false, message: "No balance remains for this reservation." }); const currency = String(process.env.DEFAULT_CURRENCY || booking.currency || "KES").toLowerCase(); const origin = String(process.env.CLIENT_URL || "").replace(/\/+$/, ""); if (!origin) throw new Error("CLIENT_URL is not configured.");
    // Declare session for use by the surrounding module or function.
    const session = await stripeRequest("checkout/sessions", { mode: "payment", currency, "line_items[0][price_data][currency]": currency, "line_items[0][price_data][product_data][name]": type === "hotel" ? `Hotel reservation ${booking.reference}` : `Airport transfer ${booking.reference}`, "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)), "line_items[0][quantity]": "1", success_url: `${origin}/payment-status/hospitality/${booking._id}?type=${encodeURIComponent(type)}&stripe_session={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/hospitality-payment/${booking._id}?type=${encodeURIComponent(type)}`, "metadata[hospitalityBookingId]": String(booking._id), "metadata[hospitalityType]": type, "metadata[userId]": String(req.user._id), "metadata[reference]": booking.reference });
    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user || req.user._id, customer: booking.user || req.user._id, hospitalityBooking: booking._id, hospitalityBookingModel: type === "hotel" ? "HotelBooking" : "AirportTransferBooking", hospitalityType: type, provider: "STRIPE", method: "card", paymentMethod: "CARD", amount, currency: currency.toUpperCase(), transactionReference: session.id, status: "pending", notes: "Stripe Checkout session" });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, data: { sessionId: session.id, url: session.url, paymentId: payment._id, amount, currency } });
  } catch (error) { next(error); }
};

// Declare verifyHospitalityCard for use by the surrounding module or function.
export const verifyHospitalityCard = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare sessionId for use by the surrounding module or function.
    const sessionId = clean(req.params.sessionId); if (!sessionId) return res.status(400).json({ success: false, message: "Stripe session ID is required." }); const session = await stripeRequest(`checkout/sessions/${encodeURIComponent(sessionId)}`, {}, "GET"); const type = clean(session?.metadata?.hospitalityType).toLowerCase(); const Model = getHospitalityModel(type); const bookingId = clean(session?.metadata?.hospitalityBookingId); if (!Model || !bookingId) return res.status(400).json({ success: false, message: "Stripe session is missing hospitality metadata." }); if (session?.metadata?.userId && String(session.metadata.userId) !== String(req.user._id) && !staff(req.user)) return res.status(403).json({ success: false, message: "Stripe session does not belong to this user." });
    // Declare booking for use by the surrounding module or function.
    const booking = await Model.findOne({ tenantId: req.tenantId, _id: bookingId }); if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking not found." }); if (!assertHospitalityPaymentAccess(booking, req.user)) return res.status(403).json({ success: false, message: "Not allowed." }); const payment = await Payment.findOne({ tenantId: req.tenantId, hospitalityBooking: booking._id, hospitalityType: type, provider: "STRIPE", transactionReference: session.id }).sort({ createdAt: -1 }); if (!payment) return res.status(404).json({ success: false, message: "Stripe payment record not found." });
    // Check the condition (session.payment_status !== "paid") and run the matching branch.
    if (session.payment_status !== "paid") { if (session.status === "expired") await failHospitalityPayment({ payment, booking, reason: "Stripe Checkout session expired." }); return res.json({ success: true, paid: false, status: session.payment_status || session.status }); }
    // Declare expected for use by the surrounding module or function.
    const expected = await getHospitalityPayableAmount(booking); const actual = Number(session.amount_total || 0) / 100; if (Math.round(actual * 100) !== Math.round(expected * 100)) return res.status(400).json({ success: false, message: "Stripe amount does not match the reservation balance." });
    // Declare result for use by the surrounding module or function.
    const result = await completeHospitalityPayment({ payment, booking, paymentData: { amount: actual, paymentMethod: "CARD", transactionId: session.payment_intent ? String(session.payment_intent) : session.id, paymentReference: session.id } }); return res.json({ success: true, paid: true, data: { payment: result.payment, booking: result.booking, paidAmount: result.paidAmount, balance: result.balance } });
  } catch (error) { next(error); }
};

// Declare submitHospitalityBank for use by the surrounding module or function.
export const submitHospitalityBank = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { type, Model, booking } for use by the surrounding module or function.
    const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking not found." }); if (!assertHospitalityPaymentAccess(booking, req.user)) return res.status(403).json({ success: false, message: "Not allowed." }); await ensureHospitalityInvoice({ type, booking }); const payable = await getHospitalityPayableAmount(booking); const amount = Number(req.body.amount || payable); if (!Number.isFinite(amount) || amount < 1 || amount > payable) return res.status(400).json({ success: false, message: "Invalid bank payment amount." }); const reference = clean(req.body.reference); if (!reference) return res.status(400).json({ success: false, message: "Bank transfer reference is required." });
    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user || req.user._id, customer: booking.user || req.user._id, hospitalityBooking: booking._id, hospitalityBookingModel: type === "hotel" ? "HotelBooking" : "AirportTransferBooking", hospitalityType: type, provider: "BANK", method: "bank", paymentMethod: "BANK_TRANSFER", amount, currency: booking.currency || "KES", transactionReference: reference, notes: clean(req.body.notes), status: "pending" }); return res.status(201).json({ success: true, message: "Bank payment submitted for verification.", data: { paymentId: payment._id, reference, amount, status: payment.status } });
  } catch (error) { next(error); }
};

// Declare confirmHospitalityBank for use by the surrounding module or function.
export const confirmHospitalityBank = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!staff(req.user)) and run the matching branch.
    if (!staff(req.user)) return res.status(403).json({ success: false, message: "Staff authorization is required." }); const payment = await Payment.findOne({ tenantId: req.tenantId, _id: req.params.paymentId, hospitalityType: { $in: ["hotel", "airport_transfer"] }, provider: "BANK" }); if (!payment) return res.status(404).json({ success: false, message: "Hospitality bank payment not found." }); const Model = payment.hospitalityBookingModel === "HotelBooking" ? getHospitalityModel("hotel") : getHospitalityModel("airport_transfer"); const booking = await Model.findOne({ tenantId: req.tenantId, _id: payment.hospitalityBooking }); if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking not found." }); const result = req.body.approved === false ? await failHospitalityPayment({ payment, booking, reason: clean(req.body.reason) || "Bank payment rejected." }) : await completeHospitalityPayment({ payment, booking, paymentData: { amount: payment.amount, paymentMethod: "BANK_TRANSFER", transactionId: clean(req.body.transactionId), paymentReference: payment.transactionReference } }); return res.json({ success: true, data: { payment: result.payment, booking: result.booking, paidAmount: result.paidAmount, balance: result.balance } });
  } catch (error) { next(error); }
};

// Declare getHospitalityPayments for use by the surrounding module or function.
export const getHospitalityPayments = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare type for use by the surrounding module or function.
    const type = String(req.query?.type || "").toLowerCase(); const Model = getHospitalityModel(type); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); const booking = await Model.findOne({ tenantId: req.tenantId, _id: req.params.bookingId }).lean(); if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking not found." }); if (!assertHospitalityPaymentAccess(booking, req.user)) return res.status(403).json({ success: false, message: "Not allowed." }); await ensureHospitalityInvoice({ type, booking }); const payments = await Payment.find({ tenantId: req.tenantId, hospitalityBooking: booking._id, hospitalityType: type }).sort({ createdAt: -1 }).lean(); const paid = payments.filter(p => ["completed", "refunded"].includes(p.status)).reduce((s, p) => s + Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0)), 0); const invoice = await ensureHospitalityInvoice({ type, booking }); return res.json({ success: true, data: { booking, invoice, payments, paidAmount: paid, balance: Math.max(0, Number(booking.totalAmount || 0) - paid) } });
  } catch (error) { next(error); }
};
