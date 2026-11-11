/**
 * Purpose: Refund database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */


// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


// Declare refundSchema for use by the surrounding module or function.
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









// Perform the side effect or state update expressed on the following line.
refundSchema.plugin(tenantPlugin);

// Declare Refund for use by the surrounding module or function.
const Refund = mongoose.models.Refund || mongoose.model("Refund", refundSchema);
export default Refund;
