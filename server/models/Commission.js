// models/Commission.js


import mongoose from "mongoose";





/*
|--------------------------------------------------------------------------
| COMMISSION SCHEMA
|--------------------------------------------------------------------------
*/


const commissionSchema = new mongoose.Schema(

{


/*
|--------------------------------------------------------------------------
| AGENT
|--------------------------------------------------------------------------
*/


agent:{


type:

mongoose.Schema.Types.ObjectId,


ref:

"Agent",


required:true


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


required:true,


unique:true


},








/*
|--------------------------------------------------------------------------
| COMMISSION AMOUNT
|--------------------------------------------------------------------------
*/


amount:{


type:Number,


required:true,


min:0


},








/*
|--------------------------------------------------------------------------
| COMMISSION RATE (%)
|--------------------------------------------------------------------------
*/


rate:{


type:Number,


default:10,


min:0


},








/*
|--------------------------------------------------------------------------
| COMMISSION STATUS
|--------------------------------------------------------------------------
*/


status:{


type:String,


enum:[


"pending",

"approved",

"processing",

"paid",

"cancelled"


],


default:

"pending"


},








/*
|--------------------------------------------------------------------------
| PAYMENT REFERENCE
|--------------------------------------------------------------------------
*/


paymentReference:{


type:String,


default:"",


trim:true


},








/*
|--------------------------------------------------------------------------
| PAYMENT DATE
|--------------------------------------------------------------------------
*/


paidAt:{


type:Date


},








/*
|--------------------------------------------------------------------------
| APPROVAL INFORMATION
|--------------------------------------------------------------------------
*/


approvedBy:{


type:

mongoose.Schema.Types.ObjectId,


ref:

"User",


default:null


},




approvedAt:{


type:Date


},








/*
|--------------------------------------------------------------------------
| NOTES
|--------------------------------------------------------------------------
*/


notes:{


type:String,


default:"",


trim:true


}



},



{


timestamps:true


}



);









/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/


// Agent commission dashboard


commissionSchema.index({

agent:1,

status:1

});






// Finance reports


commissionSchema.index({

status:1,

createdAt:-1

});






// Paid commissions


commissionSchema.index({

paidAt:-1

});






// Booking lookup


commissionSchema.index({

booking:1

});








/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/


const Commission =


mongoose.models.Commission ||


mongoose.model(

"Commission",

commissionSchema

);



export default Commission;