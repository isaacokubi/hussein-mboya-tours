import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Payment from "../models/Payment.js";
import { refundBookingPayment } from "../services/paymentLifecycleService.js";

const getConversationId = (result = {}) => String(
  result.ConversationID || result.OriginatorConversationID || ""
).trim();

const findRefundPayment = (req, conversationId) =>
  Payment.findOne(mergeTenantFilter(req, { refundReference: conversationId }));

/**
 * Build the refund callback handlers with injectable persistence/lifecycle
 * dependencies. The callback URL is public, so a matching conversation ID is
 * not enough by itself: only a currently processing refund with a positive
 * server-recorded requested amount may change financial state.
 */
export const createMpesaRefundHandlers = ({
  requireTenant = requireTenantId,
  findPayment = findRefundPayment,
  completeRefund = refundBookingPayment,
} = {}) => {
  const mpesaRefundResult = async (req, res) => {
    requireTenant();
    try {
      const result = req.body?.Result;
      if (!result || typeof result !== "object") {
        return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
      }

      const conversationId = getConversationId(result);
      if (!conversationId) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

      const payment = await findPayment(req, conversationId);
      if (!payment || String(payment.refundReference || "").trim() !== conversationId) {
        return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
      }

      // Ignore duplicate, stale, timed-out, or otherwise unclaimed callbacks.
      // The amount is sourced only from the server-side refund request.
      const refundAmount = Number(payment.refundRequestedAmount || 0);
      if (payment.refundStatus !== "processing" || !Number.isFinite(refundAmount) || refundAmount <= 0) {
        return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
      }

      const resultCode = Number(result.ResultCode);
      if (resultCode === 0) {
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
        payment.refundStatus = "failed";
        payment.refundRequestedAmount = 0;
        payment.refundResponse = result;
        await payment.save();
      }

      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
      console.error("M-PESA REFUND CALLBACK ERROR:", { code: error?.code || "REFUND_CALLBACK_FAILED" });
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
  };

  const mpesaRefundTimeout = async (req, res) => {
    requireTenant();
    try {
      const result = req.body?.Result || {};
      const conversationId = getConversationId(result);
      if (conversationId) {
        const payment = await findPayment(req, conversationId);
        if (
          payment &&
          String(payment.refundReference || "").trim() === conversationId &&
          payment.refundStatus === "processing" &&
          Number(payment.refundRequestedAmount) > 0
        ) {
          payment.refundStatus = "failed";
          payment.refundRequestedAmount = 0;
          payment.refundResponse = result;
          await payment.save();
        }
      }
    } catch (error) {
      console.error("M-PESA REFUND TIMEOUT ERROR:", { code: error?.code || "REFUND_TIMEOUT_FAILED" });
    }

    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  };

  return { mpesaRefundResult, mpesaRefundTimeout };
};

const refundHandlers = createMpesaRefundHandlers();
export const mpesaRefundResult = refundHandlers.mpesaRefundResult;
export const mpesaRefundTimeout = refundHandlers.mpesaRefundTimeout;
