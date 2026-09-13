import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const accountingPeriodSchema = new mongoose.Schema({
  tenantId:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
  period:{type:String,required:true,match:/^\\d{4}-(0[1-9]|1[0-2])$/},
  status:{type:String,enum:["open","soft_closed","closed"],default:"open",index:true},
  closedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
  closedAt:{type:Date,default:null},
  reopenedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
  reopenedAt:{type:Date,default:null},
  note:{type:String,trim:true,default:""},
},{timestamps:true});
accountingPeriodSchema.index({tenantId:1,period:1},{unique:true});
accountingPeriodSchema.plugin(tenantPlugin);
export default mongoose.models.AccountingPeriod || mongoose.model("AccountingPeriod",accountingPeriodSchema);
