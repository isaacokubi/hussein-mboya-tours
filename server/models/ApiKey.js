import mongoose from "mongoose";
import crypto from "crypto";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
const schema=new mongoose.Schema({tenantId:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},name:{type:String,required:true,trim:true,maxlength:120},prefix:{type:String,required:true,index:true},secretHash:{type:String,required:true},scopes:{type:[String],default:["read"]},lastUsedAt:{type:Date,default:null},expiresAt:{type:Date,default:null},revokedAt:{type:Date,default:null},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}},{timestamps:true});
schema.plugin(tenantPlugin); schema.statics.hashSecret=value=>crypto.createHash("sha256").update(value).digest("hex");
export default mongoose.models.ApiKey||mongoose.model("ApiKey",schema);
