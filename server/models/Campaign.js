import mongoose from "mongoose";


const campaignSchema =
new mongoose.Schema(
{

name:{

type:String,

required:true

},


subject:String,


message:String,


audience:{

type:String,

enum:[

"all",

"new",

"vip",

"regular",

"corporate"

]

},


status:{

type:String,

enum:[

"draft",

"scheduled",

"sent"

],

default:"draft"

},


scheduledAt:Date,


sentCount:{

type:Number,

default:0

}

},
{
timestamps:true
}

);



export default mongoose.model(
"Campaign",
campaignSchema
);