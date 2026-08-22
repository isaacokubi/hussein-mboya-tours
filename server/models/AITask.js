import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";


const aiTaskSchema = new mongoose.Schema(

{

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

mongoose.model(
"AITask",
aiTaskSchema
);
