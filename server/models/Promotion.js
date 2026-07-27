import mongoose from "mongoose";


const promotionSchema =
new mongoose.Schema(
{

title:String,


description:String,


discountType:{

type:String,

enum:[

"percentage",

"fixed"

]

},


discountValue:Number,


startDate:Date,


endDate:Date,


active:{

type:Boolean,

default:true

},


tours:[

{

type:mongoose.Schema.Types.ObjectId,

ref:"Tour"

}

]

},
{
timestamps:true
}

);


export default mongoose.model(
"Promotion",
promotionSchema
);