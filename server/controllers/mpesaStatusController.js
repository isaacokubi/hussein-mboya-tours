import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { queryStkPush, classifyStkQueryResult } from "../services/mpesaQueryService.js";
import { failBookingPayment } from "../services/paymentLifecycleService.js";

const isStaff = (user) => {
  const role = String(user?.roleId?.name || user?.role || user?.legacyRole || "").toLowerCase().replace(/[\s_-]/g, "");
  return ["admin", "superadmin", "administrator", "manager", "tourmanager", "agent", "travelagent"].includes(role);
};
const canAccess = (booking, user) => isStaff(user) || booking?.user?.toString() === user?._id?.toString() || booking?.customer?.toString() === user?._id?.toString();

export const queryMpesaPayment = async (req, res, next) => {
  requireTenantId();
  try {
    const checkoutRequestID = String(req.params.checkoutRequestId || "").trim();
    if (!checkoutRequestID) return res.status(400).json({ success: false, message: "CheckoutRequestID is required." });
    const payment = await Payment.findOne(mergeTenantFilter(req, { $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] }));
    if (!payment) return res.status(404).json({ success: false, message: "Payment request not found." });
    const booking = await Booking.findById(payment.booking);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (!canAccess(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to query this payment." });
    if (["completed", "failed", "cancelled", "refunded"].includes(payment.status)) return res.json({ success: true, data: { paymentStatus: payment.status, providerQueried: false, payment } });

    const providerResponse = await queryStkPush(checkoutRequestID);
    const resultCode = String(providerResponse?.ResultCode ?? "");
    const providerStatus = classifyStkQueryResult(resultCode);
    payment.providerQueryResponse = providerResponse;
    payment.providerResultCode = resultCode;
    payment.lastQueriedAt = new Date();

    if (providerStatus === "cancelled") {
      payment.status = "cancelled";
      payment.failureReason = providerResponse?.ResultDesc || "M-Pesa payment was cancelled or timed out.";
      payment.failedAt = payment.failedAt || new Date();
      booking.paymentStatus = "failed";
      if (!["completed", "cancelled", "refunded"].includes(booking.status)) booking.status = "failed";
      await payment.save();
      await booking.save();
    } else if (providerStatus === "failed") {
      await payment.save();
      await failBookingPayment({ payment, booking, failureReason: providerResponse?.ResultDesc || "M-Pesa payment failed.", paymentData: { checkoutRequestID } });
    } else {
      // A successful STK query does not contain the receipt metadata needed by
      // the booking lifecycle. Keep the local payment pending until the
      // provider callback supplies the receipt and amount.
      await payment.save();
    }

    return res.json({ success: true, data: { paymentStatus: payment.status, providerStatus, providerQueried: true, providerResponse, payment } });
  } catch (error) { next(error); }
};
