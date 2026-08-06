

import Payment from "../models/Payment.js";


export const mpesaRefundResult = async(req,res)=>{


try{


console.log(
"REFUND CALLBACK",
JSON.stringify(req.body,null,2)
);



const result =
req.body.Result;



if(!result){
return res.json({
ResultCode:0
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



if(payment){


if(result.ResultCode===0){

payment.refundStatus="completed";

payment.status="refunded";

payment.refundedAt =
new Date();


}else{


payment.refundStatus="failed";


}


await payment.save();


}



res.json({

ResultCode:0,

ResultDesc:"Accepted"

});


}catch(error){


console.error(error);


res.json({

ResultCode:0

});


}


};


