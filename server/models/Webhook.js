import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
const schema=new mongoose.Schema({tenantId:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},name:{type:String,required:true,trim:true,maxlength:120},url:{type:String,required:true,trim:true,maxlength:500},secret:{type:String,required:true,select:false},events:{type:[String],default:["booking.created","booking.updated","payment.completed"]},active:{type:Boolean,default:true,index:true},lastDeliveryAt:{type:Date,default:null},lastStatus:{type:Number,default:null},failureCount:{type:Number,default:0}},{timestamps:true});
schema.plugin(tenantPlugin); schema.index({tenantId:1,url:1});
export default mongoose.models.Webhook||mongoose.model("Webhook",schema);
