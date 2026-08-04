import Payment from "../models/Payment.js";


export const getPayments = async(req,res,next)=>{

try{

const page = Number(req.query.page)||1;
const limit = Number(req.query.limit)||20;


const payments =
await Payment.find()
.populate("customer","name email phone")
.populate("booking")
.sort({createdAt:-1})
.skip((page-1)*limit)
.limit(limit);



const total =
await Payment.countDocuments();



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
