/**
 * Purpose: Finance Budget database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare financeBudgetSchema for use by the surrounding module or function.
const financeBudgetSchema = new mongoose.Schema({
  tenantId:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
  name:{type:String,required:true,trim:true},
  fiscalYear:{type:Number,required:true,index:true},
  period:{type:String,enum:["annual","monthly"],default:"annual"},
  accountCode:{type:String,required:true,trim:true},
  month:{type:Number,min:1,max:12,default:null},
  amount:{type:Number,min:0,required:true},
  currency:{type:String,uppercase:true,default:"KES"},
  costCenter:{type:String,trim:true,default:""},
  status:{type:String,enum:["draft","approved","closed"],default:"draft",index:true},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
  approvedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
  approvedAt:{type:Date,default:null},
},{timestamps:true});
// Perform the side effect or state update expressed on the following line.
financeBudgetSchema.index({tenantId:1,fiscalYear:1,accountCode:1,month:1,costCenter:1},{unique:true});
// Perform the side effect or state update expressed on the following line.
financeBudgetSchema.plugin(tenantPlugin);
export default mongoose.models.FinanceBudget || mongoose.model("FinanceBudget",financeBudgetSchema);
