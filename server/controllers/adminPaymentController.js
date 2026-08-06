import Payment from "../models/Payment.js";



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
await Payment.findById(req.params.id);


if(!payment){

return res.status(404).json({

success:false,

message:"Payment not found"

});

}



payment.status="refunded";

payment.refundStatus="completed";

payment.refundedAt=new Date();


await payment.save();





/*
|--------------------------------------------------------------------------
| SYNC BOOKING PAYMENT STATUS
|--------------------------------------------------------------------------
*/


if(payment.booking){

const Booking =
(await import("../models/Booking.js")).default;


const booking =
await Booking.findById(
payment.booking
);


if(booking){


booking.paymentStatus="refunded";


booking.refundStatus="completed";


booking.refundAmount =
payment.amount || 0;


booking.refundedAt =
new Date();


await booking.save();


}



}




res.json({

success:true,

message:"Payment refunded successfully",

payment

});


}catch(error){

next(error);

}

};


