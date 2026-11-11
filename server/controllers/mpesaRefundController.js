/**
 * Purpose: mpesa Refund Controller HTTP controller. Main declarations: getConversationId, findRefundPayment, createMpesaRefundHandlers, mpesaRefundResult, mpesaRefundTimeout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../services/paymentLifecycleService.js so this module can use its exported dependencies.
import { refundBookingPayment } from "../services/paymentLifecycleService.js";

// Declare getConversationId for use by the surrounding module or function.
const getConversationId = (result = {}) => String(
  result.ConversationID || result.OriginatorConversationID || ""
).trim();

// Declare findRefundPayment for use by the surrounding module or function.
const findRefundPayment = (req, conversationId) =>
  Payment.findOne(mergeTenantFilter(req, { refundReference: conversationId }));

/**
 * Build the refund callback handlers with injectable persistence/lifecycle
 * dependencies. The callback URL is public, so a matching conversation ID is
 * not enough by itself: only a currently processing refund with a positive
 * server-recorded requested amount may change financial state.
 */
// Declare createMpesaRefundHandlers for use by the surrounding module or function.
export const createMpesaRefundHandlers = ({
  requireTenant = requireTenantId,
  findPayment = findRefundPayment,
  completeRefund = refundBookingPayment,
} = {}) => {
  // Declare mpesaRefundResult for use by the surrounding module or function.
  const mpesaRefundResult = async (req, res) => {
    // Perform the side effect or state update expressed on the following line.
    requireTenant();
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare result for use by the surrounding module or function.
      const result = req.body?.Result;
      // Check the condition (!result || typeof result !== "object") and run the matching branch.
      if (!result || typeof result !== "object") {
        // Return the result of res.json() to the caller.
        return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
      }

      // Declare conversationId for use by the surrounding module or function.
      const conversationId = getConversationId(result);
      // Check the condition (!conversationId) and run the matching branch.
      if (!conversationId) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

      // Declare payment for use by the surrounding module or function.
      const payment = await findPayment(req, conversationId);
      // Check the condition (!payment || String(payment.refundReference || "").trim() !== conversat) and run the matching branch.
      if (!payment || String(payment.refundReference || "").trim() !== conversationId) {
        // Return the result of res.json() to the caller.
        return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
      }

      // Ignore duplicate, stale, timed-out, or otherwise unclaimed callbacks.
      // The amount is sourced only from the server-side refund request.
      // Declare refundAmount for use by the surrounding module or function.
      const refundAmount = Number(payment.refundRequestedAmount || 0);
      // Check the condition (payment.refundStatus !== "processing" || !Number.isFinite(refundAmount) and run the matching branch.
      if (payment.refundStatus !== "processing" || !Number.isFinite(refundAmount) || refundAmount <= 0) {
        // Return the result of res.json() to the caller.
        return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
      }

      // Declare resultCode for use by the surrounding module or function.
      const resultCode = Number(result.ResultCode);
      // Check the condition (resultCode === 0) and run the matching branch.
      if (resultCode === 0) {
        // Perform the side effect or state update expressed on the following line.
        await completeRefund({
          payment,
          refundAmount,
          refundData: {
            refundReference: conversationId,
            refundStatus: "completed",
            refundResponse: result,
          },
        });
      } else {
        // Perform the side effect or state update expressed on the following line.
        payment.refundStatus = "failed";
        // Perform the side effect or state update expressed on the following line.
        payment.refundRequestedAmount = 0;
        // Perform the side effect or state update expressed on the following line.
        payment.refundResponse = result;
        // Perform the side effect or state update expressed on the following line.
        await payment.save();
      }

      // Return the result of res.json() to the caller.
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      console.error("M-PESA REFUND CALLBACK ERROR:", { code: error?.code || "REFUND_CALLBACK_FAILED" });
      // Return the result of res.json() to the caller.
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
  };

  // Declare mpesaRefundTimeout for use by the surrounding module or function.
  const mpesaRefundTimeout = async (req, res) => {
    // Perform the side effect or state update expressed on the following line.
    requireTenant();
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare result for use by the surrounding module or function.
      const result = req.body?.Result || {};
      // Declare conversationId for use by the surrounding module or function.
      const conversationId = getConversationId(result);
      // Check the condition (conversationId) and run the matching branch.
      if (conversationId) {
        // Declare payment for use by the surrounding module or function.
        const payment = await findPayment(req, conversationId);
        // Check the condition (payment && String(payment.refundReference || "").trim() === conversati) and run the matching branch.
        if (
          payment &&
          String(payment.refundReference || "").trim() === conversationId &&
          payment.refundStatus === "processing" &&
          Number(payment.refundRequestedAmount) > 0
        ) {
          // Perform the side effect or state update expressed on the following line.
          payment.refundStatus = "failed";
          // Perform the side effect or state update expressed on the following line.
          payment.refundRequestedAmount = 0;
          // Perform the side effect or state update expressed on the following line.
          payment.refundResponse = result;
          // Perform the side effect or state update expressed on the following line.
          await payment.save();
        }
      }
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      console.error("M-PESA REFUND TIMEOUT ERROR:", { code: error?.code || "REFUND_TIMEOUT_FAILED" });
    }

    // Return the result of res.json() to the caller.
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  };

  // Return the object assembled below to the caller.
  return { mpesaRefundResult, mpesaRefundTimeout };
};

// Declare refundHandlers for use by the surrounding module or function.
const refundHandlers = createMpesaRefundHandlers();
// Declare mpesaRefundResult for use by the surrounding module or function.
export const mpesaRefundResult = refundHandlers.mpesaRefundResult;
// Declare mpesaRefundTimeout for use by the surrounding module or function.
export const mpesaRefundTimeout = refundHandlers.mpesaRefundTimeout;
