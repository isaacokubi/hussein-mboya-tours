
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";


export const mpesaRefundResult = async(req,res,next)=>{

try{


console.log(
"MPESA REFUND RESULT",
JSON.stringify(req.body,null,2)
);



const result =
req.body.Result;



if(!result){

return res.json({
success:false,
message:"Invalid refund callback"
});

}



const conversationId =
result.ConversationID ||
result.OriginatorConversationID;



const payment =
await Payment.findOne({

refundReference:
conversationId

});



if(!payment){

return res.json({
success:true,
message:"Payment not found"
});

}



if(
result.ResultCode === 0
){

payment.refundStatus="completed";

payment.status="refunded";

payment.refundedAt =
new Date();



if(payment.booking){

const booking =
await Booking.findById(
payment.booking
);


if(booking){

booking.refundStatus="completed";

booking.paymentStatus="refunded";

booking.refundedAt =
new Date();

await booking.save();

}

}

}else{

payment.refundStatus="failed";

}


await payment.save();



res.json({
success:true
});


}catch(error){

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

