import mongoose from "mongoose";



/*
|--------------------------------------------------------------------------
| CUSTOMER SCHEMA
|--------------------------------------------------------------------------
|
| Each Agent manages their own customers.
|
| Agent
|   |
|   ↓
| Customer
|   |
|   ↓
| Bookings
|
*/



const customerSchema = new mongoose.Schema(

{


/*
|--------------------------------------------------------------------------
| OWNER AGENT
|--------------------------------------------------------------------------
*/


agent:{

type:mongoose.Schema.Types.ObjectId,

ref:"Agent",

required:true,

index:true

},







/*
|--------------------------------------------------------------------------
| BASIC INFORMATION
|--------------------------------------------------------------------------
*/


firstName:{

type:String,

required:true,

trim:true

},



lastName:{

type:String,

required:true,

trim:true

},




email:{

type:String,

lowercase:true,

trim:true,

default:""

},



phone:{

type:String,

required:true,

trim:true

},







/*
|--------------------------------------------------------------------------
| PERSONAL DETAILS
|--------------------------------------------------------------------------
*/


gender:{

type:String,

enum:[

"male",

"female",

"other"

],

default:null

},




dateOfBirth:{

type:Date,

default:null

},




nationality:{

type:String,

default:"",

trim:true

},




passportNumber:{

type:String,

default:"",

trim:true

},




passportExpiryDate:{

type:Date,

default:null

},







/*
|--------------------------------------------------------------------------
| ADDRESS
|--------------------------------------------------------------------------
*/


address:{

type:String,

default:"",

trim:true

},




city:{

type:String,

default:"",

trim:true

},




country:{

type:String,

default:"Kenya",

trim:true

},







/*
|--------------------------------------------------------------------------
| CUSTOMER PROFILE
|--------------------------------------------------------------------------
*/


profileImage:{

type:String,

default:""

},




customerType:{

type:String,

enum:[

"individual",

"corporate",

"family",

"vip"

],

default:"individual"

},







/*
|--------------------------------------------------------------------------
| CRM INFORMATION
|--------------------------------------------------------------------------
*/


notes:{

type:String,

default:"",

trim:true

},




tags:[

{

type:String,

trim:true

}

],







/*
|--------------------------------------------------------------------------
| COMMUNICATION TRACKING
|--------------------------------------------------------------------------
*/


lastContactedAt:{

type:Date,

default:null

},



preferredContactMethod:{

type:String,

enum:[

"phone",

"email",

"whatsapp"

],

default:"phone"

},







/*
|--------------------------------------------------------------------------
| LOYALTY
|--------------------------------------------------------------------------
*/


loyaltyPoints:{

type:Number,

default:0,

min:0

},




totalBookings:{

type:Number,

default:0

},




totalSpent:{

type:Number,

default:0

},







/*
|--------------------------------------------------------------------------
| ACCOUNT STATUS
|--------------------------------------------------------------------------
*/


status:{

type:String,

enum:[

"active",

"inactive",

"blocked"

],

default:"active",

index:true

}




},

{

timestamps:true

}

);










/*
|--------------------------------------------------------------------------
| VIRTUAL FULL NAME
|--------------------------------------------------------------------------
*/


customerSchema.virtual(

"fullName"

)

.get(function(){


return `${this.firstName} ${this.lastName}`;


});









/*
|--------------------------------------------------------------------------
| DATABASE INDEXES
|--------------------------------------------------------------------------
*/


// Agent customers

customerSchema.index({

agent:1,

createdAt:-1

});




// Search customers

customerSchema.index({

email:1

});



customerSchema.index({

phone:1

});



// CRM filtering

customerSchema.index({

status:1

});







/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/


const Customer =

mongoose.models.Customer ||

mongoose.model(

"Customer",

customerSchema

);



export default Customer;