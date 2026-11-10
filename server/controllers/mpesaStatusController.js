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

export const createMpesaStatusHandlers = ({
  requireTenant = requireTenantId,
  findPayment = (req, checkoutRequestID) => Payment.findOne(mergeTenantFilter(req, { $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] })),
  findBooking = (req, payment) => Booking.findOne(mergeTenantFilter({ _id: payment.booking })),
  queryProvider = queryStkPush,
  classifyResult = classifyStkQueryResult,
  failPayment = failBookingPayment,
  now = () => new Date(),
} = {}) => ({
  queryMpesaPayment: async (req, res, next) => {
    requireTenant();
    try {
      const checkoutRequestID = String(req.params.checkoutRequestId || "").trim();
      if (!checkoutRequestID) return res.status(400).json({ success: false, message: "CheckoutRequestID is required." });
      const payment = await findPayment(req, checkoutRequestID);
      if (!payment) return res.status(404).json({ success: false, message: "Payment request not found." });
      const booking = await findBooking(req, payment);
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
      if (!canAccess(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to query this payment." });
      if (["completed", "failed", "cancelled", "refunded"].includes(payment.status)) {
        return res.json({ success: true, data: { paymentStatus: payment.status, providerQueried: false, payment } });
      }

      const providerResponse = await queryProvider(checkoutRequestID);
      const resultCode = String(providerResponse?.ResultCode ?? "");
      const providerStatus = classifyResult(resultCode);
      payment.providerQueryResponse = providerResponse;
      payment.providerResultCode = resultCode;
      payment.lastQueriedAt = now();

      if (providerStatus === "cancelled") {
        payment.status = "cancelled";
        payment.failureReason = providerResponse?.ResultDesc || "M-Pesa payment was cancelled or timed out.";
        payment.failedAt = payment.failedAt || now();
        booking.paymentStatus = "failed";
        if (!["completed", "cancelled", "refunded"].includes(booking.status)) {
          booking.status = "cancelled";
          booking.cancellationReason = booking.cancellationReason || "M-Pesa payment was cancelled.";
          booking.cancelledAt = booking.cancelledAt || now();
        }
        await payment.save();
        await booking.save();
      } else if (providerStatus === "failed") {
        await payment.save();
        await failPayment({
          payment,
          booking,
          failureReason: providerResponse?.ResultDesc || "M-Pesa payment failed.",
          paymentData: { checkoutRequestID },
        });
      } else {
        // STK query success does not provide receipt metadata. Keep the local
        // payment pending until the callback supplies receipt and amount.
        await payment.save();
      }

      return res.json({ success: true, data: { paymentStatus: payment.status, providerStatus, providerQueried: true, providerResponse, payment } });
    } catch (error) {
      return next(error);
    }
  },
});

const statusHandlers = createMpesaStatusHandlers();
export const queryMpesaPayment = statusHandlers.queryMpesaPayment;
