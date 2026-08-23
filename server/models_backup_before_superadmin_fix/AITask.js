import mongoose from "mongoose";
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


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










aiTaskSchema.plugin(tenantIsolationPlugin);
export default mongoose.model(
"AITask",
aiTaskSchema
);
