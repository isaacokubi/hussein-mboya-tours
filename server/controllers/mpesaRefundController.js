import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Payment from "../models/Payment.js";
import {
  refundBookingPayment
} from "../services/paymentLifecycleService.js";

export const mpesaRefundResult = async (
  req,
  res,
  next
) => {
  requireTenantId();
  try {
    console.log(
      "MPESA REFUND RESULT",
      JSON.stringify(req.body, null, 2)
    );

    const result = req.body?.Result;

    if (!result || typeof result !== "object") {
      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      });
    }

    const conversationId = String(
      result.ConversationID ||
      result.OriginatorConversationID ||
      ""
    ).trim();

    if (!conversationId) {
      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      });
    }

    const payment = await Payment.findOne({
      refundReference: conversationId
    });

    /*
     * Unknown provider callbacks are acknowledged without revealing
     * whether a payment exists.
     */
    if (!payment) {
      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      });
    }

    /*
     * Idempotency protection.
     */
    if (
      payment.refundStatus === "completed" &&
      payment.status === "refunded"
    ) {
      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      });
    }

    const resultCode = Number(result.ResultCode);

    if (resultCode === 0) {
      await refundBookingPayment({
        payment,
        refundAmount: Number(
          payment.refundRequestedAmount ||
          payment.amount ||
          0
        ),
        refundData: {
          refundReference: conversationId,
          refundStatus: "completed",
          refundResponse: result
        }
      });
    } else {
      payment.refundStatus = "failed";
      payment.refundReference = conversationId;

      await payment.save();
    }

    return res.json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    });

  } catch (error) {
    console.error(
      "M-PESA REFUND CALLBACK ERROR:",
      error
    );

    /*
     * Provider callbacks should be acknowledged after the request has
     * reached the application. The error remains in server logs.
     */
    return res.json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    });
  }
};

export const mpesaRefundTimeout = async (
  req,
  res
) => {
  console.log(
    "MPESA REFUND TIMEOUT",
    JSON.stringify(req.body, null, 2)
  );

  return res.json({
    ResultCode: 0,
    ResultDesc: "Accepted"
  });
};
