/**
 * Purpose: mpesa Status Controller HTTP controller. Main declarations: isStaff, canAccess, createMpesaStatusHandlers.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Payment from "../models/Payment.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../services/mpesaQueryService.js so this module can use its exported dependencies.
import { queryStkPush, classifyStkQueryResult } from "../services/mpesaQueryService.js";
// Load ../services/paymentLifecycleService.js so this module can use its exported dependencies.
import { failBookingPayment } from "../services/paymentLifecycleService.js";

// Declare isStaff for use by the surrounding module or function.
const isStaff = (user) => {
  // Declare role for use by the surrounding module or function.
  const role = String(user?.roleId?.name || user?.role || user?.legacyRole || "").toLowerCase().replace(/[\s_-]/g, "");
  // Return the result of ["admin", "superadmin", "administrator", "manager", "tourmanager", "agent", "travelagent"].includes() to the caller.
  return ["admin", "superadmin", "administrator", "manager", "tourmanager", "agent", "travelagent"].includes(role);
};
// Declare canAccess for use by the surrounding module or function.
const canAccess = (booking, user) => isStaff(user) || booking?.user?.toString() === user?._id?.toString() || booking?.customer?.toString() === user?._id?.toString();

// Declare createMpesaStatusHandlers for use by the surrounding module or function.
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
    // Perform the side effect or state update expressed on the following line.
    requireTenant();
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare checkoutRequestID for use by the surrounding module or function.
      const checkoutRequestID = String(req.params.checkoutRequestId || "").trim();
      // Check the condition (!checkoutRequestID) and run the matching branch.
      if (!checkoutRequestID) return res.status(400).json({ success: false, message: "CheckoutRequestID is required." });
      // Declare payment for use by the surrounding module or function.
      const payment = await findPayment(req, checkoutRequestID);
      // Check the condition (!payment) and run the matching branch.
      if (!payment) return res.status(404).json({ success: false, message: "Payment request not found." });
      // Declare booking for use by the surrounding module or function.
      const booking = await findBooking(req, payment);
      // Check the condition (!booking) and run the matching branch.
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
      // Check the condition (!canAccess(booking, req.user)) and run the matching branch.
      if (!canAccess(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to query this payment." });
      // Check the condition (["completed", "failed", "cancelled", "refunded"].includes(payment.stat) and run the matching branch.
      if (["completed", "failed", "cancelled", "refunded"].includes(payment.status)) {
        // Return the result of res.json() to the caller.
        return res.json({ success: true, data: { paymentStatus: payment.status, providerQueried: false, payment } });
      }

      // Declare providerResponse for use by the surrounding module or function.
      const providerResponse = await queryProvider(checkoutRequestID);
      // Declare resultCode for use by the surrounding module or function.
      const resultCode = String(providerResponse?.ResultCode ?? "");
      // Declare providerStatus for use by the surrounding module or function.
      const providerStatus = classifyResult(resultCode);
      // Perform the side effect or state update expressed on the following line.
      payment.providerQueryResponse = providerResponse;
      // Perform the side effect or state update expressed on the following line.
      payment.providerResultCode = resultCode;
      // Perform the side effect or state update expressed on the following line.
      payment.lastQueriedAt = now();

      // Check the condition (providerStatus === "cancelled") and run the matching branch.
      if (providerStatus === "cancelled") {
        // Perform the side effect or state update expressed on the following line.
        payment.status = "cancelled";
        // Perform the side effect or state update expressed on the following line.
        payment.failureReason = providerResponse?.ResultDesc || "M-Pesa payment was cancelled or timed out.";
        // Perform the side effect or state update expressed on the following line.
        payment.failedAt = payment.failedAt || now();
        // Perform the side effect or state update expressed on the following line.
        booking.paymentStatus = "failed";
        // Check the condition (!["completed", "cancelled", "refunded"].includes(booking.status)) and run the matching branch.
        if (!["completed", "cancelled", "refunded"].includes(booking.status)) {
          // Perform the side effect or state update expressed on the following line.
          booking.status = "cancelled";
          // Perform the side effect or state update expressed on the following line.
          booking.cancellationReason = booking.cancellationReason || "M-Pesa payment was cancelled.";
          // Perform the side effect or state update expressed on the following line.
          booking.cancelledAt = booking.cancelledAt || now();
        }
        // Perform the side effect or state update expressed on the following line.
        await payment.save();
        // Perform the side effect or state update expressed on the following line.
        await booking.save();
      } else if (providerStatus === "failed") {
        // Perform the side effect or state update expressed on the following line.
        await payment.save();
        // Perform the side effect or state update expressed on the following line.
        await failPayment({
          payment,
          booking,
          failureReason: providerResponse?.ResultDesc || "M-Pesa payment failed.",
          paymentData: { checkoutRequestID },
        });
      } else {
        // STK query success does not provide receipt metadata. Keep the local
        // payment pending until the callback supplies receipt and amount.
        // Perform the side effect or state update expressed on the following line.
        await payment.save();
      }

      // Return the result of res.json() to the caller.
      return res.json({ success: true, data: { paymentStatus: payment.status, providerStatus, providerQueried: true, providerResponse, payment } });
    } catch (error) {
      // Return the result of next() to the caller.
      return next(error);
    }
  },
});

// Declare statusHandlers for use by the surrounding module or function.
const statusHandlers = createMpesaStatusHandlers();
// Declare queryMpesaPayment for use by the surrounding module or function.
export const queryMpesaPayment = statusHandlers.queryMpesaPayment;
