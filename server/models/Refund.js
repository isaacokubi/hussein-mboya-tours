

import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


const refundSchema =
new firestore.Schema(
{
    tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", index:true },

booking:{
type:firestore.Schema.Types.ObjectId,
ref:"Booking",
required:true
},


payment:{
type:firestore.Schema.Types.ObjectId,
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









export default refundSchema.plugin(tenantPlugin);

firestore.model(
"Refund",
refundSchema
);
