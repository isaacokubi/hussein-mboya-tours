import mongoose from "mongoose";


const agentSchema = new mongoose.Schema(

{

/*
|--------------------------------------------------------------------------
| LINK TO USER ACCOUNT
|--------------------------------------------------------------------------
|
| Agent authentication comes from User.
| Agent stores business-specific information.
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
| Booking = $1,000
| Commission Rate = 10%
| Agent earns $100
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
| WALLET
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
| Admin approves agents before they can operate.
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
| INDEXES
|--------------------------------------------------------------------------
*/


agentSchema.index({

    user:1

});



agentSchema.index({

    isApproved:1

});





const Agent =

mongoose.models.Agent ||

mongoose.model(

    "Agent",

    agentSchema

);



export default Agent;