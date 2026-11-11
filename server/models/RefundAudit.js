/**
 * Purpose: Refund Audit database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


// Declare refundAuditSchema for use by the surrounding module or function.
const refundAuditSchema =
new mongoose.Schema({

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },

payment:{
type:mongoose.Schema.Types.ObjectId,
ref:"Payment",
required:true,
index:true
},


booking:{
type:mongoose.Schema.Types.ObjectId,
ref:"Booking",
default:null
},


amount:{
type:Number,
required:true
},


status:{
type:String,
enum:[
"processing",
"completed",
"failed"
],
default:"processing"
},


reference:{
type:String,
default:""
},


requestedBy:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
default:null
},


completedAt:{
type:Date,
default:null
}


},{
timestamps:true
});









export default refundAuditSchema.plugin(tenantPlugin);

// Perform the side effect or state update expressed on the following line.
mongoose.model(
"RefundAudit",
refundAuditSchema
);
