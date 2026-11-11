/**
 * Purpose: Fixed Asset database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare fixedAssetSchema for use by the surrounding module or function.
const fixedAssetSchema = new mongoose.Schema({
  tenantId:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
  assetNumber:{type:String,required:true,trim:true},
  name:{type:String,required:true,trim:true},
  category:{type:String,default:"general",trim:true},
  acquisitionDate:{type:Date,required:true},
  acquisitionCost:{type:Number,min:0,required:true},
  residualValue:{type:Number,min:0,default:0},
  usefulLifeMonths:{type:Number,min:1,required:true},
  accumulatedDepreciation:{type:Number,min:0,default:0},
  status:{type:String,enum:["active","disposed","fully_depreciated"],default:"active",index:true},
  disposalDate:{type:Date,default:null},
  disposalProceeds:{type:Number,min:0,default:0},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
},{timestamps:true});
// Perform the side effect or state update expressed on the following line.
fixedAssetSchema.index({tenantId:1,assetNumber:1},{unique:true});
// Perform the side effect or state update expressed on the following line.
fixedAssetSchema.plugin(tenantPlugin);
export default mongoose.models.FixedAsset || mongoose.model("FixedAsset",fixedAssetSchema);
