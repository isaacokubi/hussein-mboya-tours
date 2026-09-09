import { requireTenantId } from "../tenancy/context.js";
import Payment from "../models/Payment.js";
import { refundBookingPayment } from "../services/paymentLifecycleService.js";

const getConversationId = (result = {}) => String(
  result.ConversationID || result.OriginatorConversationID || ""
).trim();

export const mpesaRefundResult = async (req, res) => {
  requireTenantId();
  try {
    const result = req.body?.Result;
    if (!result || typeof result !== "object") {
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const conversationId = getConversationId(result);
    if (!conversationId) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const payment = await Payment.findOne({ refundReference: conversationId });
    if (!payment) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    // Duplicate successful callbacks must be harmless.
    if (payment.refundStatus === "completed" && payment.refundReference === conversationId) {
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const resultCode = Number(result.ResultCode);
    if (resultCode === 0) {
      await refundBookingPayment({
        payment,
        refundAmount: Number(payment.refundRequestedAmount || 0),
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
    console.error("M-PESA REFUND CALLBACK ERROR:", error);
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};

export const mpesaRefundTimeout = async (req, res) => {
  requireTenantId();
  try {
    const result = req.body?.Result || {};
    const conversationId = getConversationId(result);
    if (conversationId) {
      const payment = await Payment.findOne({ refundReference: conversationId });
      if (payment && payment.refundStatus !== "completed") {
        payment.refundStatus = "failed";
        payment.refundRequestedAmount = 0;
        payment.refundResponse = result;
        await payment.save();
      }
    }
  } catch (error) {
    console.error("M-PESA REFUND TIMEOUT ERROR:", error);
  }

  return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
};
