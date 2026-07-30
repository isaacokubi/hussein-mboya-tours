import mongoose from "mongoose";


const couponSchema =
new mongoose.Schema({

code:{

type:String,

unique:true

},


discountType:{

type:String,

enum:[

"percentage",

"fixed"

]

},


amount:Number,


expiresAt:Date,


usageLimit:Number,


usedCount:{

type:Number,

default:0

},


active:{

type:Boolean,

default:true

}


});


export default mongoose.model(
"Coupon",
couponSchema
);