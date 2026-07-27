import mongoose from "mongoose";


const loyaltySchema =
new mongoose.Schema(
{

user:{

type:mongoose.Schema.Types.ObjectId,

ref:"User"

},


points:{

type:Number,

default:0

},


tier:{

type:String,

enum:[

"Bronze",

"Silver",

"Gold",

"Platinum"

],

default:"Bronze"

}

},
{
timestamps:true
}

);



export default mongoose.model(
"Loyalty",
loyaltySchema
);