import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const fixedAssetSchema = new firestore.Schema({
  tenantId:{type:firestore.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
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
  createdBy:{type:firestore.Schema.Types.ObjectId,ref:"User",default:null},
},{timestamps:true});
fixedAssetSchema.index({tenantId:1,assetNumber:1},{unique:true});
fixedAssetSchema.plugin(tenantPlugin);
export default firestore.models.FixedAsset || firestore.model("FixedAsset",fixedAssetSchema);
