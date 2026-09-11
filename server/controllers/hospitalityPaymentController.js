import Payment from "../models/Payment.js";
import { initiateStkPush } from "../services/mpesaService.js";
import { getHospitalityModel, getHospitalityPayableAmount, assertHospitalityPaymentAccess } from "../services/hospitalityPaymentLifecycleService.js";

export const initiateHospitalityMpesa = async (req, res, next) => {
  try {
    const type = String(req.body?.type || "").toLowerCase();
    const Model = getHospitalityModel(type);
    if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." });
    const booking = await Model.findOne({ tenantId: req.tenantId, _id: req.body.bookingId });
    if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking not found." });
    if (!assertHospitalityPaymentAccess(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to pay this reservation." });
    const payable = getHospitalityPayableAmount(booking); const amount = Number(req.body.amount || payable);
    if (!Number.isInteger(amount) || amount < 1 || amount > payable) return res.status(400).json({ success: false, message: `Payment amount must be a whole KES amount between 1 and ${payable.toLocaleString()}.`, balance: payable });
    const existing = await Payment.findOne({ tenantId: req.tenantId, hospitalityBooking: booking._id, hospitalityType: type, status: { $in: ["pending", "processing"] } }).sort({ createdAt: -1 });
    if (existing) return res.json({ success: true, message: "A payment request is already waiting for confirmation.", data: { CheckoutRequestID: existing.checkoutRequestID, amount: existing.amount, paymentId: existing._id } });
    const phone = String(req.body.phoneNumber || booking.passengerPhone || req.user?.phone || "").trim();
    if (!phone) return res.status(400).json({ success: false, message: "A valid Kenyan phone number is required for M-Pesa." });
    const response = await initiateStkPush({ phone, amount, bookingId: booking._id.toString() });
    const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user || req.user._id, customer: booking.user || req.user._id, hospitalityBooking: booking._id, hospitalityBookingModel: type === "hotel" ? "HotelBooking" : "AirportTransferBooking", hospitalityType: type, provider: "MPESA", method: "mpesa", paymentMethod: "MPESA", amount, currency: booking.currency || "KES", phoneNumber: phone, merchantRequestID: response.MerchantRequestID, checkoutRequestID: response.CheckoutRequestID, status: "pending" });
    return res.json({ success: true, message: `M-Pesa STK Push sent for KES ${amount.toLocaleString()}.`, data: { ...response, amount, paymentId: payment._id, hospitalityType: type, bookingId: booking._id } });
  } catch (error) { next(error); }
};

export const getHospitalityPayments = async (req, res, next) => {
  try {
    const type = String(req.query?.type || "").toLowerCase(); const Model = getHospitalityModel(type);
    if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." });
    const booking = await Model.findOne({ tenantId: req.tenantId, _id: req.params.bookingId }).lean();
    if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking not found." });
    if (!assertHospitalityPaymentAccess(booking, req.user)) return res.status(403).json({ success: false, message: "Not allowed." });
    const payments = await Payment.find({ tenantId: req.tenantId, hospitalityBooking: booking._id, hospitalityType: type }).sort({ createdAt: -1 }).lean();
    const paid = payments.filter(p => ["completed", "refunded"].includes(p.status)).reduce((s, p) => s + Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0)), 0);
    return res.json({ success: true, data: { booking, payments, paidAmount: paid, balance: Math.max(0, Number(booking.totalAmount || 0) - paid) } });
  } catch (error) { next(error); }
};
