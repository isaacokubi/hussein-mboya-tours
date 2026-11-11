/**
 * Purpose: Webhook database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Declare schema for use by the surrounding module or function.
const schema=new mongoose.Schema({tenantId:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},name:{type:String,required:true,trim:true,maxlength:120},url:{type:String,required:true,trim:true,maxlength:500},secret:{type:String,required:true,select:false},events:{type:[String],default:["booking.created","booking.updated","payment.completed"]},active:{type:Boolean,default:true,index:true},lastDeliveryAt:{type:Date,default:null},lastStatus:{type:Number,default:null},failureCount:{type:Number,default:0}},{timestamps:true});
// Perform the side effect or state update expressed on the following line.
schema.plugin(tenantPlugin); schema.index({tenantId:1,url:1});
export default mongoose.models.Webhook||mongoose.model("Webhook",schema);
