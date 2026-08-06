
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";


export const getPaymentReconciliation = async(req,res,next)=>{

try{


const payments =
await Payment.find()
.populate(
"booking",
"bookingNumber paymentStatus totalAmount"
)
.sort({
createdAt:-1
})
.lean();



const summary={

total:payments.length,

completed:
payments.filter(
p=>p.status==="completed"
).length,


pending:
payments.filter(
p=>p.status==="pending"
).length,


failed:
payments.filter(
p=>p.status==="failed"
).length,


missingReceipt:
payments.filter(
p=>
p.status==="completed" &&
!p.mpesaReceiptNumber
).length

};



const mismatches =
payments.filter(
p=>

p.booking &&

p.status==="completed" &&

p.booking.paymentStatus!=="paid"

);



res.json({

success:true,

data:{

summary,

mismatches,

payments

}

});


}catch(error){

next(error);

}


};


