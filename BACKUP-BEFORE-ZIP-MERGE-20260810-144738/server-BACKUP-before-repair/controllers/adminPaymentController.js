import Refund from "../models/Refund.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import RefundAudit from "../models/RefundAudit.js";
import {requestMpesaRefund}
from "../services/mpesaRefundService.js";



export const getPayments = async(req,res,next)=>{

try{

const page = Number(req.query.page)||1;
const limit = Number(req.query.limit)||20;


const query={};


if(req.query.status){

query.status=req.query.status;

}


if(req.query.method){

query.method=req.query.method;

}



const payments =
await Payment.find(query)

.populate(
"customer",
"name email phone"
)

.populate({

path:"booking",

select:
"bookingNumber travelDate totalAmount status",

populate:{

path:"tour",

select:"title"

}

})

.sort({

createdAt:-1

})

.skip(
(page-1)*limit
)

.limit(limit);



const total =
await Payment.countDocuments(query);



res.json({

success:true,

page,

limit,

total,

payments

});


}catch(error){

next(error);

}

};



export const getPaymentStats = async(req,res,next)=>{

try{


const stats =
await Payment.aggregate([

{
$group:{
_id:"$status",
count:{
$sum:1
},
amount:{
$sum:"$amount"
}
}
}

]);



res.json({

success:true,

stats

});


}catch(error){

next(error);

}

};





export const updatePaymentStatus = async(req,res,next)=>{

try{


const payment =
await Payment.findById(req.params.id);


if(!payment){

return res.status(404).json({

success:false,

message:"Payment not found"

});

}


payment.status=req.body.status;


await payment.save();


res.json({

success:true,

payment

});


}catch(error){

next(error);

}

};





export const getPayment = async(req,res,next)=>{

try{


const payment =
await Payment.findById(req.params.id)
.populate("customer")
.populate("booking");


res.json({

success:true,

payment

});


}catch(error){

next(error);

}

};




export const refundPayment = async(req,res,next)=>{

try{


const payment =
await Payment.findById(
req.params.id
)
.populate("booking")
.populate("customer");



if(!payment){

return res.status(404).json({

success:false,

message:"Payment not found"

});

}



if(
payment.status!=="completed"
){

return res.status(400).json({

success:false,

message:
"Only completed payments can be refunded"

});

}



if(payment.status==="refunded"){

return res.status(400).json({

success:false,

message:"Payment already refunded"

});

}



const phone =
payment.phoneNumber ||
payment.phone ||
payment.customer?.phone;



if(!phone){

return res.status(400).json({

success:false,

message:"Customer phone number missing"

});

}



if(!payment.amount || payment.amount<=0){

return res.status(400).json({

success:false,

message:"Invalid refund amount"

});

}


const refundResponse =
await requestMpesaRefund({

amount:
payment.amount,

phone,

transactionId:
payment.mpesaReceipt ||
payment.checkoutRequestID ||
payment._id

});



payment.refundStatus="processing";

payment.refundReference =
refundResponse.ConversationID ||
refundResponse.OriginatorConversationID ||
"";

payment.refundRequestedAt =
new Date();


await payment.save();



if(payment.booking){


const booking =
await Booking.findById(
payment.booking._id
);



if(booking){

booking.paymentStatus="refunded";

booking.refundStatus="processing";

booking.refundAmount =
payment.amount;


booking.refundedAt =
new Date();


await booking.save();

}


}



res.json({

success:true,

message:
"Refund request submitted",

refundResponse,

payment

});


}catch(error){

next(error);

}

};



/*
|--------------------------------------------------------------------------
| PAYMENT ANALYTICS
|--------------------------------------------------------------------------
*/

export const getPaymentAnalytics = async (req, res, next) => {
  try {
    const analytics = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| REFUND BY BOOKING ID
|--------------------------------------------------------------------------
|
| The audited finance UI identifies refunds by booking ID, while the
| payment controller works with payment IDs. Resolve the payment here.
|--------------------------------------------------------------------------
*/

export const refundBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const payment = await Payment.findOne({
      booking: booking._id,
      status: { $in: ["completed", "paid", "success"] },
    }).sort({ createdAt: -1 });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No completed payment found for this booking",
      });
    }

    if (payment.refundStatus === "processing" || payment.refundStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Refund has already been requested for this payment",
      });
    }

    const phone =
      payment.phoneNumber ||
      payment.phone ||
      booking.contact?.phone ||
      booking.customerSnapshot?.phone;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Customer phone number missing",
      });
    }

    const amount = Number(req.body.amount || payment.amount);

    if (!amount || amount <= 0 || amount > Number(payment.amount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund amount",
      });
    }

    const refundResponse = await requestMpesaRefund({
      amount,
      phone,
      transactionId:
        payment.mpesaReceipt ||
        payment.checkoutRequestID ||
        payment._id,
    });

    payment.refundStatus = "processing";
    payment.refundReference =
      refundResponse.ConversationID ||
      refundResponse.OriginatorConversationID ||
      "";
    payment.refundRequestedAt = new Date();
    await payment.save();

    booking.paymentStatus = "refunded";
    booking.refundStatus = "requested";
    booking.refundAmount = amount;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Refund request submitted",
      refundResponse,
      payment,
      booking,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| PROCESS REFUND RECORD
|--------------------------------------------------------------------------
*/


export const processRefund = async (req, res, next) => {
  try {
    const refund = await Refund.findById(req.params.id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    const status = req.body.status || "processing";
    const allowedStatuses = [
      "requested",
      "approved",
      "processing",
      "completed",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund status",
      });
    }

    refund.status = status;

    if (req.body.mpesaReference) {
      refund.mpesaReference = req.body.mpesaReference;
    }

    if (status === "completed") {
      refund.processedAt = new Date();
    }

    await refund.save();

    if (refund.booking) {
      const booking = await Booking.findById(refund.booking);

      if (booking) {
        if (status === "completed") {
          booking.refundStatus = "completed";
          booking.paymentStatus = "refunded";
          booking.status = "refunded";
          booking.refundedAt = new Date();
        } else if (status === "rejected") {
          booking.refundStatus = "rejected";
        } else {
          booking.refundStatus = status;
        }

        await booking.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Refund updated successfully",
      data: refund,
    });
  } catch (error) {
    next(error);
  }
};
