import mongoose from "mongoose";


const referralSchema =
new mongoose.Schema(
{

referrer:{

type:mongoose.Schema.Types.ObjectId,

ref:"User"

},


referredUser:{

type:mongoose.Schema.Types.ObjectId,

ref:"User"

},


reward:Number,


status:{

type:String,

default:"pending"

}

},
{
timestamps:true
}

);



export default mongoose.model(
"Referral",
referralSchema
);