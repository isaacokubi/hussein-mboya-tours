/**
 * Purpose: Accounting Period database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare accountingPeriodSchema for use by the surrounding module or function.
const accountingPeriodSchema = new mongoose.Schema({
  tenantId:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
  period:{type:String,required:true,match:/^\d{4}-(0[1-9]|1[0-2])$/},
  status:{type:String,enum:["open","soft_closed","closed"],default:"open",index:true},
  closedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
  closedAt:{type:Date,default:null},
  reopenedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
  reopenedAt:{type:Date,default:null},
  note:{type:String,trim:true,default:""},
},{timestamps:true});
// Perform the side effect or state update expressed on the following line.
accountingPeriodSchema.index({tenantId:1,period:1},{unique:true});
// Perform the side effect or state update expressed on the following line.
accountingPeriodSchema.plugin(tenantPlugin);
export default mongoose.models.AccountingPeriod || mongoose.model("AccountingPeriod",accountingPeriodSchema);
