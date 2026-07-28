import mongoose from "mongoose";


const commissionSchema = new mongoose.Schema(

{

agent:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"Agent",

    required:true

},



booking:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"Booking",

    required:true,

    unique:true

},



amount:{

    type:Number,

    required:true,

    min:0

},



rate:{

    type:Number,

    required:true,

    min:0

},



status:{

    type:String,

    enum:[

        "pending",

        "approved",

        "processing",

        "paid",

        "cancelled"

    ],

    default:"pending"

},



paymentReference:{

    type:String,

    default:"",

    trim:true

},



paidAt:{
    type:Date
},



approvedBy:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"User",

    default:null

},



approvedAt:{
    type:Date
},



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


commissionSchema.index({

    agent:1,

    status:1

});



commissionSchema.index({

    status:1,

    createdAt:-1

});



commissionSchema.index({

    paidAt:-1

});







const Commission = mongoose.model(

"Commission",

commissionSchema

);


export default Commission;