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

    name:{
        type:String,
        trim:true
    },


    email:{
        type:String,
        trim:true,
        lowercase:true
    },


    phone:{
        type:String,
        trim:true
    }

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

    unique:true,

    index:true

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


// Backward compatibility

user:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"User"

},



customerSnapshot:

customerSnapshotSchema,











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










/*
|--------------------------------------------------------------------------
| SOURCE
|--------------------------------------------------------------------------
*/


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
| CONTACT
|--------------------------------------------------------------------------
*/


contact:{


    name:{

        type:String,

        trim:true

    },


    email:{

        type:String,

        required:true,

        trim:true,

        lowercase:true

    },


    phone:{

        type:String,

        required:true,

        trim:true

    }

},











/*
|--------------------------------------------------------------------------
| TOUR INFORMATION
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







/*
|--------------------------------------------------------------------------
| GUEST COUNT
|--------------------------------------------------------------------------
*/


guests:{

    type:Number,

    required:true,

    min:1

},


// Backward compatibility

travelerCount:{

    type:Number,

    default:0

},











/*
|--------------------------------------------------------------------------
| PRICING
|--------------------------------------------------------------------------
*/


subtotal:{

    type:Number,

    required:true,

    min:0

},



discountAmount:{

    type:Number,

    default:0,

    min:0

},



couponUsed:{

    type:String,

    default:"",

    trim:true

},







/*
|--------------------------------------------------------------------------
| TOTAL AMOUNT
|--------------------------------------------------------------------------
*/


totalAmount:{

    type:Number,

    required:true,

    min:0

},


// Backward compatibility

amount:{

    type:Number,

    default:0,

    min:0

},











/*
|--------------------------------------------------------------------------
| COMMISSION
|--------------------------------------------------------------------------
*/


commissionRate:{

    type:Number,

    default:0,

    min:0,

    max:100

},



commissionAmount:{

    type:Number,

    default:0,

    min:0

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

    default:0,

    min:0

},



balanceAmount:{

    type:Number,

    default:0,

    min:0

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

        "partial",

        "paid",

        "failed",

        "refunded"

    ],

    default:"pending"

},



transactionId:{

    type:String,

    default:"",

    trim:true

},



paymentReference:{

    type:String,

    default:"",

    trim:true

},











/*
|--------------------------------------------------------------------------
| BOOKING STATUS
|--------------------------------------------------------------------------
*/


bookingStatus:{

    type:String,

    enum:[

        "pending",

        "confirmed",

        "cancelled",

        "completed"

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

    {

        type:String

    }

],











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
| AUTO GENERATE BOOKING NUMBER
|--------------------------------------------------------------------------
*/


bookingSchema.pre(

"save",

function(next){


    if(!this.bookingNumber){


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
| CALCULATE COMMISSION AND BALANCE
|--------------------------------------------------------------------------
*/


bookingSchema.pre(

"save",

function(next){



    if(

        this.agent &&

        this.commissionRate > 0

    ){


        this.commissionAmount =

        (

            this.totalAmount *

            this.commissionRate

        )

        /

        100;


    }

    else{


        this.commissionAmount = 0;


    }





    this.balanceAmount =

    this.totalAmount -

    this.depositAmount;





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

    /

    100;


};







bookingSchema.methods.calculateBalance = function(){


    return (

        this.totalAmount -

        this.depositAmount

    );


};









/*
|--------------------------------------------------------------------------
| DATABASE INDEXES
|--------------------------------------------------------------------------
*/


bookingSchema.index({

    customer:1,

    createdAt:-1

});




bookingSchema.index({

    user:1,

    createdAt:-1

});




// Agent dashboard

bookingSchema.index({

    agent:1,

    createdAt:-1

});




// Tour availability

bookingSchema.index({

    tour:1,

    travelDate:1

});




// Payment reports

bookingSchema.index({

    paymentStatus:1,

    bookingStatus:1

});




// Booking status dashboard

bookingSchema.index({

    bookingStatus:1,

    createdAt:-1

});




// Commission reports

bookingSchema.index({

    commissionStatus:1,

    createdAt:-1

});




// Abandoned booking reminders

bookingSchema.index({

    abandoned:1,

    lastReminderSent:1

});









/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/


const Booking =

mongoose.models.Booking ||

mongoose.model(

    "Booking",

    bookingSchema

);



export default Booking;