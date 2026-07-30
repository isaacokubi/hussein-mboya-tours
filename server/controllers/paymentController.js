import mongoose from "mongoose";


const paymentSchema = new mongoose.Schema(
{

/*
|--------------------------------------------------------------------------
| USER WHO MADE PAYMENT
|--------------------------------------------------------------------------
*/

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},



/*
|--------------------------------------------------------------------------
| RELATED BOOKING
|--------------------------------------------------------------------------
*/

booking:{
type:mongoose.Schema.Types.ObjectId,
ref:"Booking",
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
"PAYPAL"
],
required:true
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
},



/*
|--------------------------------------------------------------------------
| PAYMENT AMOUNT
|--------------------------------------------------------------------------
*/

amount:{
type:Number,
required:true,
min:0
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
default:"pending"
},



/*
|--------------------------------------------------------------------------
| GENERAL TRANSACTION ID
|--------------------------------------------------------------------------
*/

transactionId:{
type:String,
},


transactionReference:{
type:String,
},




/*
|--------------------------------------------------------------------------
| M-PESA IDENTIFIERS
|--------------------------------------------------------------------------
*/

merchantRequestID:{
type:String
},


checkoutRequestID:{
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
| CUSTOMER PHONE
|--------------------------------------------------------------------------
*/

phoneNumber:{
type:String
},




/*
|--------------------------------------------------------------------------
| FAILURE HANDLING
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
default:"none"
},


refundReference:{
type:String
},



},
{
timestamps:true
});





/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/


// Prevent duplicate M-Pesa callbacks

paymentSchema.index(
{
checkoutRequestID:1
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




// Fast booking payments

paymentSchema.index({
booking:1
});




// Fast user history

paymentSchema.index({
user:1
});




// Analytics queries

paymentSchema.index({
status:1,
provider:1
});




// Transaction lookup

paymentSchema.index({
transactionId:1
});





const Payment = mongoose.model(
"Payment",
paymentSchema
);


export default Payment;