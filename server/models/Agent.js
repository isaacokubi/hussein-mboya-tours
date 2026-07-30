import mongoose from "mongoose";


/*
|--------------------------------------------------------------------------
| AGENT SCHEMA
|--------------------------------------------------------------------------
|
| Agent authentication comes from User.
| Agent stores business-specific information.
|
*/



const agentSchema = new mongoose.Schema(

{

/*
|--------------------------------------------------------------------------
| LINK TO USER ACCOUNT
|--------------------------------------------------------------------------
|
| One User account can have one Agent profile.
|
*/


user:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"User",

    required:true,

    unique:true

},







/*
|--------------------------------------------------------------------------
| AGENT BUSINESS PROFILE
|--------------------------------------------------------------------------
*/


companyName:{

    type:String,

    trim:true,

    default:""

},



phone:{

    type:String,

    trim:true,

    default:""

},



location:{

    type:String,

    trim:true,

    default:""

},







/*
|--------------------------------------------------------------------------
| COMMISSION SYSTEM
|--------------------------------------------------------------------------
|
| Example:
|
| Booking Amount = 100,000 KES
| Commission Rate = 10%
| Agent Commission = 10,000 KES
|
*/


commissionRate:{

    type:Number,

    default:10,

    min:0,

    max:100

},



totalCommission:{

    type:Number,

    default:0,

    min:0

},







/*
|--------------------------------------------------------------------------
| AGENT WALLET
|--------------------------------------------------------------------------
*/


walletBalance:{

    type:Number,

    default:0,

    min:0

},







/*
|--------------------------------------------------------------------------
| SALES TRACKING
|--------------------------------------------------------------------------
*/


totalSales:{

    type:Number,

    default:0,

    min:0

},



totalBookings:{

    type:Number,

    default:0,

    min:0

},







/*
|--------------------------------------------------------------------------
| APPROVAL STATUS
|--------------------------------------------------------------------------
|
| Admin controls agent activation.
|
*/


isApproved:{

    type:Boolean,

    default:false

},



status:{

    type:String,

    enum:[

        "active",

        "inactive",

        "suspended"

    ],

    default:"active"

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
|
| IMPORTANT:
|
| Do NOT add:
|
| agentSchema.index({user:1})
|
| because user already has:
|
| unique:true
|
| which automatically creates:
|
| user_1
|
*/



agentSchema.index({

    isApproved:1

});



agentSchema.index({

    status:1

});









/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/


const Agent =

mongoose.models.Agent ||

mongoose.model(

    "Agent",

    agentSchema

);



export default Agent;