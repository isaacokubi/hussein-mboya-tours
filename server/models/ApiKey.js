/**
 * Purpose: Api Key database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Declare schema for use by the surrounding module or function.
const schema=new mongoose.Schema({tenantId:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},name:{type:String,required:true,trim:true,maxlength:120},prefix:{type:String,required:true,index:true},secretHash:{type:String,required:true},scopes:{type:[String],default:["read"]},lastUsedAt:{type:Date,default:null},expiresAt:{type:Date,default:null},revokedAt:{type:Date,default:null},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}},{timestamps:true});
// Perform the side effect or state update expressed on the following line.
schema.plugin(tenantPlugin); schema.statics.hashSecret=value=>crypto.createHash("sha256").update(value).digest("hex");
export default mongoose.models.ApiKey||mongoose.model("ApiKey",schema);
