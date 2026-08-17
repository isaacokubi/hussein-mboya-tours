// server/controllers/mpesaController.js



import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Agent from "../models/Agent.js";



import {
 initiateStkPush
} from "../services/mpesaService.js";

import { sendBookingConfirmation } from "../services/bookingNotificationService.js";
import { sendBookingEmail } from "../services/emailService.js";
import { addPoints } from "../services/loyaltyService.js";
import {
  failBookingPayment,
  completeBookingPayment,
  getPayableBookingAmount,
} from "../services/paymentLifecycleService.js";

/*
|--------------------------------------------------------------------------
| FORMAT PHONE NUMBER
|--------------------------------------------------------------------------
*/

const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  let formatted = phone.toString().trim();

  if (formatted.startsWith("+254")) {
    formatted = formatted.substring(1);
  }

  if (formatted.startsWith("0")) {
    formatted = `254${formatted.substring(1)}`;
  }

  return formatted;
};

/*
|--------------------------------------------------------------------------
| GET MPESA ACCESS TOKEN
|--------------------------------------------------------------------------
*/

export const getMpesaToken = async (req, res, next) => {
  try {
    const token = await generateAccessToken();

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| INITIATE STK PUSH
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| INITIATE STK PUSH
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| INITIATE STK PUSH
|--------------------------------------------------------------------------
*/

export const stkPush = async (req, res, next) => {
  try {
    console.log(
      "MPESA STK REQUEST BODY:",
      req.body
    );


    const {
      phoneNumber,
      phone,
      bookingId,
    } = req.body;



    /*
    |--------------------------------------------------------------------------
    | SUPPORT FRONTEND PAYLOADS
    |--------------------------------------------------------------------------
    */

      let booking = null;

    if (bookingId) {
      booking = await Booking.findById(bookingId);
    }

    const customerPhone =
      phoneNumber ||
      phone ||
      booking?.contact?.phone ||
      booking?.customerSnapshot?.phone ||
      req.user?.phone ||
      "";



    if (!customerPhone || !bookingId) {

      return res.status(400).json({

        success:false,

        message:
        "Phone number and booking ID are required."

      });

    }




    /*
    |--------------------------------------------------------------------------
    | FIND BOOKING
    |--------------------------------------------------------------------------
    */




    if(!booking){

      return res.status(404).json({

        success:false,

        message:
        "Booking not found."

      });

    }

    const requesterRole = String(
      req.user?.roleId?.name || req.user?.role || req.user?.legacyRole || ""
    )
      .trim()
      .toLowerCase()
      .replace(/[\s_-]/g, "");

    const isStaff = [
      "admin",
      "superadmin",
      "administrator",
      "manager",
      "tourmanager",
      "guide",
      "tourguide",
      "agent",
      "travelagent",
    ].includes(requesterRole);

    const ownsBooking =
      booking.user?.toString() === req.user._id.toString() ||
      booking.customer?.toString() === req.user._id.toString();

    if (!isStaff && !ownsBooking) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to pay this booking.",
      });
    }


    if(
      booking.paymentStatus === "paid"
    ){

      return res.status(400).json({

        success:false,

        message:
        "This booking has already been paid."

      });

    }




    /*
    |--------------------------------------------------------------------------
    | PREVENT DUPLICATE PAYMENT REQUEST
    |--------------------------------------------------------------------------
    */

    const existingPayment =
      await Payment.findOne({

        booking:booking._id,

        status:"pending"

      });



    if(existingPayment){

      return res.status(200).json({

        success:true,

        message:
        "Payment request already exists.",


        data:{

          checkoutRequestID:
          existingPayment.checkoutRequestID

        }

      });

    }




    /*
    |--------------------------------------------------------------------------
    | AMOUNT
    |--------------------------------------------------------------------------
    */

    // NEVER trust a client-supplied amount. The amount due is derived
    // exclusively from the server-side booking financial state.
    const paymentAmount =
      getPayableBookingAmount(booking);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0){

      return res.status(400).json({

        success:false,

        message:
        "Invalid booking amount."

      });

    }




    /*
    |--------------------------------------------------------------------------
    | SEND STK PUSH USING SERVICE
    |--------------------------------------------------------------------------
    */

    const response =
      await initiateStkPush({

        phone:
        customerPhone,


        amount:
        paymentAmount,


        bookingId:
        booking._id.toString()

      });



    console.log(
      "MPESA RESPONSE:",
      response
    );





    /*
    |--------------------------------------------------------------------------
    | SAVE PAYMENT
    |--------------------------------------------------------------------------
    */

    await Payment.create({

      booking:
      booking._id,


      user:
      booking.user || booking.customer || null,


      customer:
      booking.user || booking.customer || null,


      provider:
      "MPESA",


      method:
      "mpesa",


      paymentMethod:
      "MPESA",


      amount:
      paymentAmount,


      phoneNumber:
      customerPhone,


      merchantRequestID:
      response.MerchantRequestID,


      checkoutRequestID:
      response.CheckoutRequestID,


      status:
      "pending"

    });





    booking.paymentStatus =
      "pending";


    await booking.save();





    return res.status(200).json({

      success:true,


      message:
      "STK Push sent successfully.",


      data:
      response

    });



  } catch(error){


    console.error(
      "STK PUSH ERROR:",
      error.message
    );


    return res.status(500).json({

      success:false,


      message:
      error.message ||
      "M-Pesa STK Push failed"

    });


  }
};
/*
|--------------------------------------------------------------------------
| MPESA CALLBACK
|--------------------------------------------------------------------------
*/

export const mpesaCallback = async (req, res, next) => {
  try {
    console.log(
      "================================================"
    );
    console.log("MPESA CALLBACK RECEIVED");
    console.log(
      JSON.stringify(req.body, null, 2)
    );
    console.log(
      "================================================"
    );

    const stkCallback =
      req.body?.Body?.stkCallback;

    /*
    |--------------------------------------------------------------------------
    | INVALID CALLBACK BODY
    |--------------------------------------------------------------------------
    */

    if (!stkCallback) {
      console.warn(
        "M-Pesa callback received without stkCallback."
      );

      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    const checkoutRequestID =
      stkCallback.CheckoutRequestID ||
      stkCallback.checkoutRequestID ||
      stkCallback.checkoutRequestId;

    if (!checkoutRequestID) {
      console.warn(
        "M-Pesa callback missing CheckoutRequestID."
      );

      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND PAYMENT
    |--------------------------------------------------------------------------
    */

    const payment =
      await Payment.findOne({
        $or: [
          { checkoutRequestID },
          { checkoutRequestId: checkoutRequestID },
        ],
      });

    if (!payment) {
      console.warn(
        "Payment not found for CheckoutRequestID:",
        checkoutRequestID
      );

      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND BOOKING
    |--------------------------------------------------------------------------
    */

    const booking =
      await Booking.findById(
        payment.booking
      );

    if (!booking) {
      console.warn(
        "Booking not found for payment:",
        payment._id
      );

      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PREVENT DUPLICATE CALLBACK PROCESSING
    |--------------------------------------------------------------------------
    */

    if (
      payment.status === "completed" ||
      payment.status === "failed"
    ) {
      console.log(
        "Payment callback already processed:",
        payment.status
      );

      return res.json({
        ResultCode: 0,
        ResultDesc: "Already processed",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | MPESA RESULT CODE
    |--------------------------------------------------------------------------
    */

    const resultCode =
      Number(stkCallback.ResultCode);

    const resultDescription =
      stkCallback.ResultDesc ||
      "M-Pesa payment failed.";

    console.log(
      "MPESA RESULT:",
      {
        checkoutRequestID,
        resultCode,
        resultDescription,
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | FAILED PAYMENT
    |--------------------------------------------------------------------------
    |
    | Payment/booking state changes are handled centrally by the
    | payment lifecycle service.
    |
    |--------------------------------------------------------------------------
    */

    if (resultCode !== 0) {

      const lifecycleResult =
        await failBookingPayment({
          payment,
          booking,
          failureReason:
            resultDescription,
          paymentData: {
            checkoutRequestID,
            callbackResponse:
              stkCallback,
          },
        });

      console.log(
        "================================================"
      );

      console.log(
        "MPESA PAYMENT FAILED"
      );

      console.log(
        "Booking:",
        lifecycleResult.booking.bookingNumber
      );

      console.log(
        "CheckoutRequestID:",
        checkoutRequestID
      );

      console.log(
        "ResultCode:",
        resultCode
      );

      console.log(
        "Reason:",
        resultDescription
      );

      console.log(
        "================================================"
      );

      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESSFUL PAYMENT
    |--------------------------------------------------------------------------
    */

    const callbackItems =
      stkCallback.CallbackMetadata?.Item || [];

    const getValue = (name) => {

      const item =
        callbackItems.find(
          (i) => i.Name === name
        );

      return item?.Value ?? null;
    };

    const mpesaReceiptNumber =
      getValue("MpesaReceiptNumber");

    // Safaricom's callback amount is authoritative for the actual charge.
    // Do not fall back to our requested amount: a malformed callback must
    // never be converted into a successful financial event.
    const rawPaidAmount = getValue("Amount");
    const paidAmount = Number(rawPaidAmount);

    const expectedAmount = getPayableBookingAmount(booking);

    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      await failBookingPayment({
        payment,
        booking,
        failureReason: "M-Pesa callback did not contain a valid paid amount.",
        paymentData: { callbackResponse: stkCallback },
      });
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (Math.round(paidAmount) !== Math.round(expectedAmount)) {
      await failBookingPayment({
        payment,
        booking,
        failureReason: `M-Pesa amount mismatch. Expected ${expectedAmount}, received ${paidAmount}.`,
        paymentData: {
          amount: paidAmount,
          callbackResponse: stkCallback,
        },
      });
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const mpesaReceiptRequired = String(mpesaReceiptNumber || "").trim();
    if (!mpesaReceiptRequired) {
      await failBookingPayment({
        payment,
        booking,
        failureReason: "M-Pesa callback did not contain a receipt number.",
        paymentData: { amount: paidAmount, callbackResponse: stkCallback },
      });
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const phoneNumber =
      getValue("PhoneNumber");

    const merchantRequestID =
      stkCallback.MerchantRequestID ||
      stkCallback.merchantRequestID ||
      stkCallback.merchantRequestId ||
      payment.merchantRequestID ||
      payment.merchantRequestId ||
      "";

    const transactionDate =
      getValue("TransactionDate");

    /*
    |--------------------------------------------------------------------------
    | COMPLETE THROUGH PAYMENT LIFECYCLE
    |--------------------------------------------------------------------------
    */

    const lifecycleResult =
      await completeBookingPayment({
        payment,
        booking,
        paymentData: {

          amount:
            paidAmount,

          phoneNumber:
            phoneNumber ||
            payment.phoneNumber ||
            "",

          mpesaReceiptNumber:
            mpesaReceiptNumber ||
            "",

          merchantRequestID,

          checkoutRequestID,

          transactionDate,

          paymentMethod:
            "MPESA",

          callbackResponse:
            stkCallback,
        },
      });

    console.log(
      "================================================"
    );

    console.log(
      "MPESA PAYMENT SUCCESSFUL"
    );

    console.log(
      "Booking:",
      lifecycleResult.booking.bookingNumber
    );

    console.log(
      "Receipt:",
      mpesaReceiptNumber
    );

    console.log(
      "Amount:",
      paidAmount
    );

    console.log(
      "================================================"
    );

    /*
    |--------------------------------------------------------------------------
    | NOTIFY ADMINS
    |--------------------------------------------------------------------------
    */

    try {
      const managers =
        await User.find({
          $or: [
            {
              role: {
                $in: [
                  "admin",
                  "superadmin",
                  "super_admin",
                  "manager",
                  "tour_manager",
                  "tourmanager",
                ],
              },
            },
            {
              legacyRole: {
                $in: [
                  "admin",
                  "superadmin",
                  "super_admin",
                  "manager",
                  "tour_manager",
                  "tourmanager",
                ],
              },
            },
          ],
        });

      if (managers.length) {
        await Notification.insertMany(
          managers.map((manager) => ({
            recipient: manager._id,
            user: manager._id,
            title: "New Booking Payment",
            message:
              `Booking ${booking.bookingNumber || booking._id} has been paid successfully.`,
            type: "booking",
          }))
        );
      }
    } catch (err) {
      console.error(
        "Notification Error:",
        err.message
      );
    }

    /*
    |--------------------------------------------------------------------------
    | EMAIL
    |--------------------------------------------------------------------------
    */

    try {
      if (booking.email) {
        await sendBookingEmail(
          booking.email,
          booking
        );
      }
    } catch (err) {
      console.error(
        "Email Error:",
        err.message
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LOYALTY POINTS
    |--------------------------------------------------------------------------
    */

    try {
      if (booking.user) {
        await addPoints(
          booking.user,
          Math.floor(paidAmount)
        );
      }
    } catch (err) {
      console.error(
        "Loyalty Points Error:",
        err.message
      );
    }

    return res.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });

  } catch (error) {
    console.error(
      "MPESA CALLBACK ERROR:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    |
    | Always acknowledge the Safaricom callback.
    |
    */

    return res.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  }
};

export const checkTransactionStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("booking")
      .populate("user", "name email phone")
      .populate("customer", "name email phone");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET PAYMENTS FOR A BOOKING
|--------------------------------------------------------------------------
*/

export const getBookingPayments = async (req, res, next) => {
  try {
    

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const payments = await Payment.find({
      booking: booking._id,
    })
      .populate("user", "name email phone")
      .populate("customer", "name email phone")
      .populate("booking")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL PAYMENTS (ADMIN)
|--------------------------------------------------------------------------
*/

export const getAllPayments = async (req, res, next) => {
  try {
    const { status, provider, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (status) filter.status = status;

    if (provider) filter.provider = provider;

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(filter)
      .populate("booking", "bookingNumber status paymentStatus")
      .populate("user", "name email phone")
      .populate("customer", "name email phone")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: payments.length,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      payments,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET PAYMENT BY MPESA RECEIPT
|--------------------------------------------------------------------------
*/

export const getPaymentByReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      mpesaReceiptNumber: req.params.receipt,
    })
      .populate("booking")
      .populate("user", "name email phone")
      .populate("customer", "name email phone");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| MPESA REFUND RESULT CALLBACK
|--------------------------------------------------------------------------
*/

export const handleRefundResult = async(req,res,next)=>{

try{

const RefundAudit =
(await import("../models/RefundAudit.js")).default;


const Payment =
(await import("../models/Payment.js")).default;


const result =
req.body.Result || {};


const conversationId =
result.ConversationID ||
result.OriginatorConversationID;


const success =
result.ResultCode === 0 ||
result.ResultCode === "0";


const payment =
await Payment.findOne({

refundReference:conversationId

});


if(payment){


if(success){

payment.refundStatus="completed";

payment.refundedAt=new Date();



await RefundAudit.findOneAndUpdate(

{
reference:conversationId
},

{
status:"completed",
completedAt:new Date()
}

);


}
else{

payment.refundStatus="failed";


await RefundAudit.findOneAndUpdate(

{
reference:conversationId
},

{
status:"failed"
}

);

}


await payment.save();


}


res.json({

ResultCode:0,

ResultDesc:"Accepted"

});


}catch(error){

next(error);

}

};




/*
|--------------------------------------------------------------------------
| MPESA REFUND TIMEOUT CALLBACK
|--------------------------------------------------------------------------
*/

export const handleRefundTimeout = async(req,res,next)=>{

try{


res.json({

ResultCode:0,

ResultDesc:"Accepted"

});


}catch(error){

next(error);

}

};



/*
|--------------------------------------------------------------------------
| CHECK STK STATUS BY CHECKOUT REQUEST ID
|--------------------------------------------------------------------------
*/

export const checkCheckoutStatus = async (req, res, next) => {
  try {
    const checkoutRequestId =
      req.params.checkoutRequestId;

    const payment = await Payment.findOne({
      $or: [
        { checkoutRequestID: checkoutRequestId },
        { checkoutRequestId: checkoutRequestId },
      ],
    })
      .populate("booking")
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: payment.status,
        failureReason:
          payment.failureReason || "",
        booking:
          payment.booking || null,
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| VERIFY BOOKING PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyBookingPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const payment = await Payment.findOne({
      booking: booking._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        booking,
        payment,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
