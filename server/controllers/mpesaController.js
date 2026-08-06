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
      amount,
    } = req.body;



    /*
    |--------------------------------------------------------------------------
    | SUPPORT FRONTEND PAYLOADS
    |--------------------------------------------------------------------------
    */

    const customerPhone =
      phoneNumber || phone;



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

    const booking =
      await Booking.findById(
        bookingId
      );



    if(!booking){

      return res.status(404).json({

        success:false,

        message:
        "Booking not found."

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

    const paymentAmount =
      Math.round(
        amount ||
        booking.totalAmount ||
        booking.amount ||
        0
      );



    if(paymentAmount <=0){

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
      booking.user || null,


      customer:
      booking.customer || null,


      provider:
      "MPESA",


      method:
      "mpesa",


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
    console.log("MPESA CALLBACK:", JSON.stringify(req.body, null, 2));

    const stkCallback = req.body?.Body?.stkCallback;

    if (!stkCallback) {
      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    const checkoutRequestID = stkCallback.CheckoutRequestID;

    const payment = await Payment.findOne({
      checkoutRequestID,
    });

    if (!payment) {
      console.warn("Payment not found:", checkoutRequestID);

      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate callbacks
    |--------------------------------------------------------------------------
    */

    if (payment.status === "completed") {
      return res.json({
        ResultCode: 0,
        ResultDesc: "Already processed",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FAILED PAYMENT
    |--------------------------------------------------------------------------
    */

    if (stkCallback.ResultCode !== 0) {
      payment.status = "failed";
      payment.failureReason = stkCallback.ResultDesc;

      await payment.save();

      await Booking.findByIdAndUpdate(payment.booking, {
        paymentStatus: "failed",
      });

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

    const callbackItems = stkCallback.CallbackMetadata?.Item || [];

    const getValue = (name) => {
      const item = callbackItems.find((i) => i.Name === name);

      return item?.Value ?? null;
    };

    const mpesaReceiptNumber = getValue("MpesaReceiptNumber");

    const paidAmount = Number(getValue("Amount")) || payment.amount;

    const phoneNumber = getValue("PhoneNumber");

    payment.status = "completed";
    payment.phoneNumber = phoneNumber;
    payment.amount = paidAmount;
    payment.mpesaReceiptNumber = mpesaReceiptNumber;
    payment.paidAt = new Date();

    await payment.save();

    /*
    |--------------------------------------------------------------------------
    | UPDATE BOOKING
    |--------------------------------------------------------------------------
    */

    const booking = await Booking.findById(payment.booking);

    if (!booking) {
      return res.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    booking.paymentStatus = "paid";

    // Update booking lifecycle after successful payment
    booking.status = "confirmed";

    booking.transactionId = mpesaReceiptNumber;
    booking.mpesaReceipt = mpesaReceiptNumber;
    booking.paidAt = new Date();

    await booking.save();

    console.log("Booking payment confirmed:", booking._id);

    /*
    |--------------------------------------------------------------------------
    | NOTIFY ADMINS
    |--------------------------------------------------------------------------
    */

    try {
      const managers = await User.find({
        role: {
          $in: ["admin", "manager", "tour_manager"],
        },
      });

      if (managers.length) {
        await Notification.insertMany(
          managers.map((manager) => ({
            user: manager._id,
            title: "New Booking Payment",
            message: `Booking ${booking._id} has been paid successfully.`,
            type: "booking",
          })),
        );
      }
    } catch (err) {
      console.error("Notification Error:", err.message);
    }

    /*
    |--------------------------------------------------------------------------
    | EMAIL
    |--------------------------------------------------------------------------
    */

    try {
      if (booking.email) {
        await sendBookingEmail(booking.email, booking);
      }
    } catch (err) {
      console.error("Email Error:", err.message);
    }

    /*
    |--------------------------------------------------------------------------
    | BOOKING CONFIRMATION
    |--------------------------------------------------------------------------
    */

    try {
      await sendBookingConfirmation(booking);
    } catch (err) {
      console.error("Booking Confirmation Error:", err.message);
    }

    /*
    |--------------------------------------------------------------------------
    | LOYALTY POINTS
    |--------------------------------------------------------------------------
    */

    try {
      if (booking.user) {
        const points = Math.floor(
          (booking.totalAmount || booking.amount || 0) / 100,
        );

        if (points > 0) {
          await addPoints(booking.user, points);
        }
      }
    } catch (err) {
      console.error("Loyalty Error:", err.message);
    }

    /*
    |--------------------------------------------------------------------------
    | AGENT COMMISSION
    |--------------------------------------------------------------------------
    */

    try {
      if (booking.agent) {
        const agent = await Agent.findById(booking.agent);

        if (agent) {
          const exists = await Commission.findOne({
            booking: booking._id,
          });

          if (!exists) {
            const rate = agent.commissionRate || 0;

            const commissionAmount =
              ((booking.totalAmount || booking.amount || 0) * rate) / 100;

            await Commission.create({
              booking: booking._id,
              agent: agent._id,
              amount: commissionAmount,
              status: "pending",
            });

            agent.walletBalance = (agent.walletBalance || 0) + commissionAmount;

            await agent.save();
          }
        }
      }
    } catch (err) {
      console.error("Commission Error:", err.message);
    }

    return res.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  } catch (error) {
    console.error("MPESA CALLBACK ERROR:", error);

    return res.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  }
}; /*
|--------------------------------------------------------------------------
| CHECK PAYMENT STATUS
|--------------------------------------------------------------------------
*/

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
    const booking = await Booking.findById(req.params.bookingId);

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


}
else{

payment.refundStatus="failed";

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

