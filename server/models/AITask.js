/**
 * Purpose: AITask database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


// Declare aiTaskSchema for use by the surrounding module or function.
const aiTaskSchema = new mongoose.Schema(

{

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },

title:{
type:String,
required:true
},


description:{
type:String,
default:""
},


priority:{
type:String,
enum:[
"low",
"medium",
"high"
],
default:"medium"
},


status:{
type:String,
enum:[
"pending",
"in_progress",
"completed"
],
default:"pending"
},


category:{
type:String,
default:"general"
},


assignedTo:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
default:null
}


},

{
timestamps:true
}

);










export default aiTaskSchema.plugin(tenantPlugin);

// Perform the side effect or state update expressed on the following line.
mongoose.model(
"AITask",
aiTaskSchema
);
