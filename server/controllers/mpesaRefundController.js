
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";


import { refundBookingPayment } from "../services/paymentLifecycleService.js";

export const mpesaRefundResult = async (
  req,
  res,
  next
) => {

  try {

    console.log(
      "MPESA REFUND RESULT",
      JSON.stringify(
        req.body,
        null,
        2
      )
    );

    const result =
      req.body?.Result;

    if (!result) {

      return res.json({
        success: true,
        message:
          "Invalid refund callback",
      });

    }

    const conversationId =
      result.ConversationID ||
      result.OriginatorConversationID ||
      "";

    if (!conversationId) {

      return res.json({
        success: true,
        message:
          "Refund conversation ID missing",
      });

    }

    const payment =
      await Payment.findOne({
        refundReference:
          conversationId,
      });

    if (!payment) {

      return res.json({
        success: true,
        message:
          "Payment not found",
      });

    }

    /*
    |--------------------------------------------------------------------------
    | IDEMPOTENCY
    |--------------------------------------------------------------------------
    */

    if (
      payment.refundStatus ===
        "completed" &&
      payment.status ===
        "refunded"
    ) {

      return res.json({
        success: true,
        message:
          "Refund already processed",
      });

    }

    /*
    |--------------------------------------------------------------------------
    | M-PESA REFUND SUCCESS
    |--------------------------------------------------------------------------
    */

    if (
      Number(result.ResultCode) === 0
    ) {

      await refundBookingPayment({

        payment,

        refundAmount:
          Number(
            payment.refundRequestedAmount ||
            payment.amount ||
            0
          ),

        refundData: {

          refundReference:
            conversationId,

          refundStatus:
            "completed",

          refundResponse:
            result,

        },

      });

    } else {

      payment.refundStatus =
        "failed";

      payment.refundReference =
        conversationId;

      payment.refundRequestedAmount =
        Number(
          payment.refundRequestedAmount ||
          0
        );

      await payment.save();

    }

    return res.json({
      success: true,
    });

  } catch (error) {

    next(error);

  }

};

export const mpesaRefundTimeout = async(req,res)=>{


console.log(
"MPESA REFUND TIMEOUT",
JSON.stringify(req.body,null,2)
);


res.json({
success:true
});


};

