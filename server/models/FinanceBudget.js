import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

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
financeBudgetSchema.index({tenantId:1,fiscalYear:1,accountCode:1,month:1,costCenter:1},{unique:true});
financeBudgetSchema.plugin(tenantPlugin);
export default mongoose.models.FinanceBudget || mongoose.model("FinanceBudget",financeBudgetSchema);
