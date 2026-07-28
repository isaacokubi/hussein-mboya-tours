import mongoose from "mongoose";



/*
|--------------------------------------------------------------------------
| TRAVELER SCHEMA
|--------------------------------------------------------------------------
*/

const travelerSchema = new mongoose.Schema(

{

name:{

type:String,

required:true,

trim:true

},


age:{

type:Number,

min:0

},


passportNumber:{

type:String,

default:"",

trim:true

},


nationality:{

type:String,

default:"",

trim:true

},


dateOfBirth:{

type:Date

}


},

{

_id:false

}

);









/*
|--------------------------------------------------------------------------
| CUSTOMER SNAPSHOT
|--------------------------------------------------------------------------
*/

const customerSnapshotSchema = new mongoose.Schema(

{

name:String,

email:String,

phone:String


},

{

_id:false

}

);









/*
|--------------------------------------------------------------------------
| BOOKING SCHEMA
|--------------------------------------------------------------------------
*/

const bookingSchema = new mongoose.Schema(

{




/*
|--------------------------------------------------------------------------
| BOOKING NUMBER
|--------------------------------------------------------------------------
*/


bookingNumber:{


type:String,


unique:true


},







/*
|--------------------------------------------------------------------------
| CUSTOMER
|--------------------------------------------------------------------------
*/


customer:{


type:mongoose.Schema.Types.ObjectId,


ref:"User",


required:true


},



user:{


type:mongoose.Schema.Types.ObjectId,


ref:"User"


},



customerSnapshot:

customerSnapshotSchema,





fullName:String,


email:String,


phone:String,







/*
|--------------------------------------------------------------------------
| AGENT
|--------------------------------------------------------------------------
*/


agent:{


type:mongoose.Schema.Types.ObjectId,


ref:"User",


default:null


},






bookingSource:{


type:String,


enum:[

"website",

"agent",

"admin",

"walk_in"

],


default:"website"


},








/*
|--------------------------------------------------------------------------
| TOUR DETAILS
|--------------------------------------------------------------------------
*/


tour:{


type:mongoose.Schema.Types.ObjectId,


ref:"Tour",


required:true


},





travelDate:{


type:Date,


required:true


},





travelers:[

travelerSchema

],






// merged from new schema

numberOfGuests:{


type:Number,


required:true,


default:1


},




guests:{


type:Number,


default:1


},




travelerCount:{


type:Number,


default:0


},







/*
|--------------------------------------------------------------------------
| TOUR OPERATIONS ASSIGNMENT
|--------------------------------------------------------------------------
*/


assignedGuide:{


type:mongoose.Schema.Types.ObjectId,


ref:"Staff",


default:null


},




assignedDriver:{


type:mongoose.Schema.Types.ObjectId,


ref:"Staff",


default:null


},




assignedVehicle:{


type:mongoose.Schema.Types.ObjectId,


ref:"Vehicle",


default:null


},






// merged assignment flag

assigned:{


type:Boolean,


default:false


},







/*
|--------------------------------------------------------------------------
| PRICING
|--------------------------------------------------------------------------
*/


subtotal:{


type:Number,


default:0


},




discountAmount:{


type:Number,


default:0


},




couponUsed:{


type:String,


default:""


},




totalAmount:{


type:Number,


required:true,


min:0


},




amount:{


type:Number,


default:0


},







/*
|--------------------------------------------------------------------------
| COMMISSION
|--------------------------------------------------------------------------
*/


commissionRate:{


type:Number,


default:0


},




commissionAmount:{


type:Number,


default:0


},




commissionStatus:{


type:String,


enum:[

"pending",

"approved",

"paid",

"cancelled"

],


default:"pending"


},




commissionPaidAt:{


type:Date,


default:null


},







/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/


depositAmount:{


type:Number,


default:0


},




balanceAmount:{


type:Number,


default:0


},




paymentMethod:{


type:String,


enum:[

"MPESA",

"CARD",

"PAYPAL",

"BANK_TRANSFER",

"CASH"

],


default:"MPESA"


},




paymentStatus:{


type:String,


enum:[

"pending",

"paid",

"partial",

"failed",

"refunded"

],


default:"pending"


},




transactionId:{


type:String

},




paymentReference:{


type:String

},




mpesaReceipt:{


type:String,


default:""


},







/*
|--------------------------------------------------------------------------
| BOOKING STATUS
|--------------------------------------------------------------------------
*/


status:{


type:String,


enum:[

"pending",

"confirmed",

"cancelled",

"completed"

],


default:"pending"


},





bookingStatus:{


type:String,


enum:[

"pending",

"confirmed",

"assigned",

"ongoing",

"completed",

"cancelled"

],


default:"pending"


},







/*
|--------------------------------------------------------------------------
| ABANDONED BOOKING
|--------------------------------------------------------------------------
*/


abandoned:{


type:Boolean,


default:false


},



lastReminderSent:{


type:Date,


default:null


},







/*
|--------------------------------------------------------------------------
| DOCUMENTS
|--------------------------------------------------------------------------
*/


documents:[

String

],






/*
|--------------------------------------------------------------------------
| NOTES
|--------------------------------------------------------------------------
*/


notes:{


type:String,


default:""


}



},



{

timestamps:true

}

);









/*
|--------------------------------------------------------------------------
| AUTO BOOKING NUMBER
|--------------------------------------------------------------------------
*/


bookingSchema.pre(

"save",

function(next){


if(!this.bookingNumber)

{


this.bookingNumber =

"HMT-" +

Date.now() +

"-" +

Math.floor(

Math.random()*10000

);


}



next();


}

);









/*
|--------------------------------------------------------------------------
| AUTO COMMISSION + BALANCE
|--------------------------------------------------------------------------
*/


bookingSchema.pre(

"save",

function(next){



if(

this.agent &&

this.commissionRate > 0

)

{


this.commissionAmount =

(

this.totalAmount *

this.commissionRate

)

/100;


}

else

{


this.commissionAmount = 0;


}





this.balanceAmount =

this.totalAmount -

this.depositAmount;





// keep assignment status synchronized

if(

this.assignedGuide ||

this.assignedDriver ||

this.assignedVehicle

)

{


this.assigned = true;


}



next();


}

);









/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/


bookingSchema.methods.calculateCommission = function(){


return (

this.totalAmount *

this.commissionRate

)

/100;


};





bookingSchema.methods.calculateBalance = function(){


return (

this.totalAmount -

this.depositAmount

);


};









/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/


bookingSchema.index({

customer:1,

createdAt:-1

});



bookingSchema.index({

tour:1,

travelDate:1

});



bookingSchema.index({

assignedGuide:1

});



bookingSchema.index({

assignedDriver:1

});



bookingSchema.index({

assignedVehicle:1

});



bookingSchema.index({

paymentStatus:1,

status:1

});



bookingSchema.index({

bookingStatus:1,

createdAt:-1

});



bookingSchema.index({

commissionStatus:1

});









const Booking =

mongoose.models.Booking ||

mongoose.model(

"Booking",

bookingSchema

);



export default Booking;