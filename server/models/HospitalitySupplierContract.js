import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  tenantId:{type:Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
  supplierName:{type:String,required:true,trim:true},
  supplierType:{type:String,enum:["hotel","transfer","vehicle","guide","other"],default:"hotel",index:true},
  hotel:{type:Schema.Types.ObjectId,ref:"Hotel",default:null,index:true},
  contactName:{type:String,trim:true,default:""},contactPhone:{type:String,trim:true,default:""},contactEmail:{type:String,trim:true,lowercase:true,default:""},
  contractNumber:{type:String,trim:true,uppercase:true,default:""},currency:{type:String,uppercase:true,default:"KES"},
  commissionPercent:{type:Number,min:0,max:100,default:0},depositPercent:{type:Number,min:0,max:100,default:0},
  rates:{type:[{name:String,roomType:String,vehicleType:String,unit:String,amount:Number}],default:[]},
  validFrom:{type:Date,default:null},validTo:{type:Date,default:null},paymentTerms:{type:String,trim:true,default:""},cancellationTerms:{type:String,trim:true,default:""},
  status:{type:String,enum:["draft","active","expired","terminated"],default:"draft",index:true},notes:{type:String,trim:true,default:""},
  createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},updatedBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true});
schema.index({tenantId:1,supplierType:1,status:1,validTo:1});
export default mongoose.models.HospitalitySupplierContract||mongoose.model("HospitalitySupplierContract",schema);
