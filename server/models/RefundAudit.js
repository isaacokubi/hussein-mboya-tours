
import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";


const refundAuditSchema =
new mongoose.Schema({

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

mongoose.model(
"RefundAudit",
refundAuditSchema
);
