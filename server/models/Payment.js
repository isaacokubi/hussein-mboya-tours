// models/Payment.js


import mongoose from "mongoose";





/*
|--------------------------------------------------------------------------
| PAYMENT SCHEMA
|--------------------------------------------------------------------------
*/


const paymentSchema = new mongoose.Schema(

{


/*
|--------------------------------------------------------------------------
| USER / CUSTOMER
|--------------------------------------------------------------------------
*/


user:{


type:

mongoose.Schema.Types.ObjectId,


ref:

"User"


},




customer:{


type:

mongoose.Schema.Types.ObjectId,


ref:

"User"


},








/*
|--------------------------------------------------------------------------
| RELATED BOOKING
|--------------------------------------------------------------------------
*/


booking:{


type:

mongoose.Schema.Types.ObjectId,


ref:

"Booking",


required:true


},








/*
|--------------------------------------------------------------------------
| PAYMENT PROVIDER
|--------------------------------------------------------------------------
*/


provider:{


type:String,


enum:[


"MPESA",

"STRIPE",

"PAYPAL",

"BANK"


],


default:

"MPESA"


},








/*
|--------------------------------------------------------------------------
| PAYMENT METHOD
|--------------------------------------------------------------------------
*/


method:{


type:String,


enum:[


"mpesa",

"card",

"bank"


],


default:

"mpesa"


},








/*
|--------------------------------------------------------------------------
| LEGACY PAYMENT METHOD SUPPORT
|--------------------------------------------------------------------------
*/


paymentMethod:{


type:String,


enum:[


"M-Pesa",

"Cash",

"Card",

"Bank"


],


default:

"M-Pesa"


},








/*
|--------------------------------------------------------------------------
| AMOUNT
|--------------------------------------------------------------------------
*/


amount:{


type:Number,


required:true,


min:0


},








/*
|--------------------------------------------------------------------------
| PHONE NUMBER
|--------------------------------------------------------------------------
*/


phone:{


type:String


},




phoneNumber:{


type:String,


required:true


},








/*
|--------------------------------------------------------------------------
| PAYMENT STATUS
|--------------------------------------------------------------------------
*/


status:{


type:String,


enum:[


"pending",

"completed",

"failed",

"cancelled"


],


default:

"pending"


},








/*
|--------------------------------------------------------------------------
| TRANSACTION IDENTIFIERS
|--------------------------------------------------------------------------
*/


transactionId:{


type:String,


default:""


},




transactionReference:{


type:String,


default:""


},








/*
|--------------------------------------------------------------------------
| M-PESA DARaja IDENTIFIERS
|--------------------------------------------------------------------------
*/


merchantRequestID:{


type:String


},



merchantRequestId:{


type:String


},




checkoutRequestID:{


type:String


},




checkoutRequestId:{


type:String


},




mpesaReceiptNumber:{


type:String


},




transactionDate:{


type:String


},








/*
|--------------------------------------------------------------------------
| CALLBACK RESPONSE STORAGE
|--------------------------------------------------------------------------
*/


callbackResponse:{


type:Object


},








/*
|--------------------------------------------------------------------------
| PAYMENT FAILURE
|--------------------------------------------------------------------------
*/


failureReason:{


type:String


},








/*
|--------------------------------------------------------------------------
| REFUNDS
|--------------------------------------------------------------------------
*/


refundStatus:{


type:String,


enum:[


"none",

"requested",

"processing",

"completed",

"failed"


],


default:

"none"


},




refundReference:{


type:String


},








/*
|--------------------------------------------------------------------------
| PAYMENT DATE
|--------------------------------------------------------------------------
*/


paidAt:{


type:Date


}



},



{


timestamps:true


}



);









/*
|--------------------------------------------------------------------------
| DATABASE INDEXES
|--------------------------------------------------------------------------
*/


// Prevent duplicate STK callbacks


paymentSchema.index(

{

checkoutRequestID:1

},

{

unique:true,

sparse:true

}

);





paymentSchema.index(

{

checkoutRequestId:1

},

{

unique:true,

sparse:true

}

);







// Prevent duplicate M-Pesa receipts


paymentSchema.index(

{

mpesaReceiptNumber:1

},

{

unique:true,

sparse:true

}

);







// Booking payment history


paymentSchema.index({

booking:1

});







// Customer payment history


paymentSchema.index({

customer:1

});






paymentSchema.index({

user:1

});







// Payment analytics


paymentSchema.index({

status:1,

provider:1

});







// Transaction searching


paymentSchema.index({

transactionId:1

});









/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/


const Payment =


mongoose.models.Payment ||


mongoose.model(

"Payment",

paymentSchema

);



export default Payment;