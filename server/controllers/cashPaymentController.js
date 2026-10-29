import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { getPayableBookingAmount } from "../services/paymentLifecycleService.js";
import { getSystemSettings } from "../services/settingsService.js";
import { isTenantPaymentMethodAvailable } from "../services/tenantPaymentMethods.js";

const ownsBooking = (booking, user) => Boolean(user?._id) && [booking.user, booking.customer].some((owner) => String(owner || "") === String(user._id));

export const createCashPayment = async (req, res, next) => {
  requireTenantId();
  try {
    const settings = await getSystemSettings(req);
    if (!isTenantPaymentMethodAvailable(settings, "CASH")) return res.status(409).json({ success: false, message: "Cash payments are disabled or not configured for this tenant." });
    const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.body?.bookingId }));
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (!ownsBooking(booking, req.user)) return res.status(403).json({ success: false, message: "You cannot create a cash payment for this booking." });
    if (["cancelled", "refunded"].includes(String(booking.status).toLowerCase()) || booking.paymentStatus === "paid") return res.status(409).json({ success: false, message: "This booking cannot receive another payment." });
    const payableAmount = Number(getPayableBookingAmount(booking));
    const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > payableAmount) return res.status(400).json({ success: false, message: "Enter a valid amount up to the outstanding booking balance." });
    const existing = await Payment.findOne(mergeTenantFilter(req, { booking: booking._id, provider: "CASH", status: { $in: ["pending", "processing"] } })).sort({ createdAt: -1 });
    if (existing) return res.status(200).json({ success: true, message: "Cash payment is awaiting staff confirmation.", payment: { id: existing._id, status: existing.status, amount: existing.amount, currency: existing.currency } });
    const payment = await Payment.create({ tenantId: requireTenantId(), customer: req.user._id, user: req.user._id, booking: booking._id, provider: "CASH", method: "cash", paymentMethod: "CASH", amount, currency: String(settings.currency || "KES").toUpperCase(), status: "pending", notes: "Cash payment awaiting staff confirmation." });
    booking.payments = Array.isArray(booking.payments) ? booking.payments : [];
    if (!booking.payments.some((id) => String(id) === String(payment._id))) booking.payments.push(payment._id);
    booking.paymentMethod = "CASH";
    booking.paymentStatus = "pending";
    await booking.save();
    return res.status(201).json({ success: true, message: "Cash payment recorded as pending. Staff must confirm receipt before the booking is marked paid.", payment: { id: payment._id, status: payment.status, amount: payment.amount, currency: payment.currency } });
  } catch (error) { return next(error); }
};
