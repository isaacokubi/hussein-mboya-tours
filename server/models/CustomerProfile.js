import mongoose from "mongoose";


const customerProfileSchema =
new mongoose.Schema(
{

user:{

type:mongoose.Schema.Types.ObjectId,

ref:"User",

unique:true

},


travelPreferences:{

destinations:[String],

activities:[String],

budgetRange:String,

travelStyle:String

},


totalBookings:{

type:Number,

default:0

},


totalSpent:{

type:Number,

default:0

},


lastTravelDate:Date,


customerType:{

type:String,

enum:[

"new",

"regular",

"vip",

"corporate"

],

default:"new"

}

},
{
timestamps:true
}

);


export default mongoose.model(
"CustomerProfile",
customerProfileSchema
);