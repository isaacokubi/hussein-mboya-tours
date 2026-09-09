import mongoose from "mongoose";
const { Schema } = mongoose;
const AccommodationInventorySchema = new Schema({
  tenantId:{type:Schema.Types.ObjectId,ref:"Tenant",required:true,index:true},
  propertyName:{type:String,required:true,trim:true,maxlength:180},
  location:{type:String,trim:true,maxlength:180},
  roomType:{type:String,required:true,trim:true,maxlength:120},
  totalRooms:{type:Number,min:0,required:true},
  availableRooms:{type:Number,min:0,required:true},
  nightlyRate:{type:Number,min:0,default:0},
  currency:{type:String,default:"KES",uppercase:true},
  status:{type:String,enum:["active","inactive"],default:"active"},
  notes:{type:String,trim:true,maxlength:2000},
  createdBy:{type:Schema.Types.ObjectId,ref:"User"},
  updatedBy:{type:Schema.Types.ObjectId,ref:"User"},
},{timestamps:true});
AccommodationInventorySchema.index({tenantId:1,propertyName:1,roomType:1},{unique:true});
export default mongoose.models.AccommodationInventory || mongoose.model("AccommodationInventory",AccommodationInventorySchema);
