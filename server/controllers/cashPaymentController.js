/**
 * Purpose: cash Payment Controller HTTP controller. Main declarations: ownsBooking, createCashPaymentHandler.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../services/paymentLifecycleService.js so this module can use its exported dependencies.
import { getPayableBookingAmount } from "../services/paymentLifecycleService.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ../services/tenantPaymentMethods.js so this module can use its exported dependencies.
import { isTenantPaymentMethodAvailable } from "../services/tenantPaymentMethods.js";

// Declare ownsBooking for use by the surrounding module or function.
const ownsBooking = (booking, user) => Boolean(user?._id) && [booking.user, booking.customer].some((owner) => String(owner || "") === String(user._id));

// Declare createCashPaymentHandler for use by the surrounding module or function.
export const createCashPaymentHandler = ({
  requireTenant = requireTenantId,
  getSettings = getSystemSettings,
  isMethodAvailable = isTenantPaymentMethodAvailable,
  findBooking = (req) => Booking.findOne(mergeTenantFilter(req, { _id: req.body?.bookingId })),
  payableAmount = getPayableBookingAmount,
  findPendingPayment = (req, booking) => Payment.findOne(mergeTenantFilter(req, { booking: booking._id, provider: "CASH", status: { $in: ["pending", "processing"] } })).sort({ createdAt: -1 }),
  createPayment = (data) => Payment.create(data),
} = {}) => async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenant();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare settings for use by the surrounding module or function.
    const settings = await getSettings(req);
    // Check the condition (!isMethodAvailable(settings, "CASH")) and run the matching branch.
    if (!isMethodAvailable(settings, "CASH")) return res.status(409).json({ success: false, message: "Cash payments are disabled or not configured for this tenant." });
    // Declare booking for use by the surrounding module or function.
    const booking = await findBooking(req);
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    // Check the condition (!ownsBooking(booking, req.user)) and run the matching branch.
    if (!ownsBooking(booking, req.user)) return res.status(403).json({ success: false, message: "You cannot create a cash payment for this booking." });
    // Check the condition (["cancelled", "refunded"].includes(String(booking.status).toLowerCase() and run the matching branch.
    if (["cancelled", "refunded"].includes(String(booking.status).toLowerCase()) || booking.paymentStatus === "paid") return res.status(409).json({ success: false, message: "This booking cannot receive another payment." });
    // Declare payable for use by the surrounding module or function.
    const payable = Number(payableAmount(booking));
    // Declare amount for use by the surrounding module or function.
    const amount = req.body?.amount === undefined ? payable : Number(req.body.amount);
    // Check the condition (!Number.isFinite(amount) || amount <= 0 || amount > payable) and run the matching branch.
    if (!Number.isFinite(amount) || amount <= 0 || amount > payable) return res.status(400).json({ success: false, message: "Enter a valid amount up to the outstanding booking balance." });
    // Declare existing for use by the surrounding module or function.
    const existing = await findPendingPayment(req, booking);
    // Check the condition (existing) and run the matching branch.
    if (existing) return res.status(200).json({ success: true, message: "Cash payment is awaiting staff confirmation.", payment: { id: existing._id, status: existing.status, amount: existing.amount, currency: existing.currency } });
    // Declare payment for use by the surrounding module or function.
    const payment = await createPayment({ tenantId: requireTenant(), customer: req.user._id, user: req.user._id, booking: booking._id, provider: "CASH", method: "cash", paymentMethod: "CASH", amount, currency: String(settings.currency || "KES").toUpperCase(), status: "pending", notes: "Cash payment awaiting staff confirmation." });
    // Perform the side effect or state update expressed on the following line.
    booking.payments = Array.isArray(booking.payments) ? booking.payments : [];
    // Check the condition (!booking.payments.some((id) => String(id) === String(payment._id))) and run the matching branch.
    if (!booking.payments.some((id) => String(id) === String(payment._id))) booking.payments.push(payment._id);
    // Perform the side effect or state update expressed on the following line.
    booking.paymentMethod = "CASH";
    // Perform the side effect or state update expressed on the following line.
    booking.paymentStatus = "pending";
    // Perform the side effect or state update expressed on the following line.
    await booking.save();
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, message: "Cash payment recorded as pending. Staff must confirm receipt before the booking is marked paid.", payment: { id: payment._id, status: payment.status, amount: payment.amount, currency: payment.currency } });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare createCashPayment for use by the surrounding module or function.
export const createCashPayment = createCashPaymentHandler();
