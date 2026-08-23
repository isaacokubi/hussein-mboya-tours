

import mongoose from "mongoose";
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


const refundSchema =
new mongoose.Schema(
{
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },

booking:{
type:mongoose.Schema.Types.ObjectId,
ref:"Booking",
required:true
},


payment:{
type:mongoose.Schema.Types.ObjectId,
ref:"Payment"
},


amount:{
type:Number,
required:true
},


reason:{
type:String
},


method:{
type:String,
enum:[
"mpesa",
"bank",
"cash"
],
default:"mpesa"
},


status:{
type:String,
enum:[
"requested",
"approved",
"processing",
"completed",
"rejected"
],
default:"requested"
},


mpesaReference:{
type:String
},


processedAt:{
type:Date
}


},
{
timestamps:true
}

);









refundSchema.plugin(tenantIsolationPlugin);
export default mongoose.model(
"Refund",
refundSchema
);
