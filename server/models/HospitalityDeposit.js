import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  tenantId:{type:Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
  hospitalityType:{type:String,enum:["hotel","airport_transfer"],required:true,index:true},
  hospitalityBooking:{type:Schema.Types.ObjectId,required:true,index:true},
  bookingReference:{type:String,trim:true,index:true},
  amount:{type:Number,min:0,required:true},currency:{type:String,uppercase:true,default:"KES"},
  dueDate:{type:Date,default:null},paidAmount:{type:Number,min:0,default:0},
  status:{type:String,enum:["pending","partial","paid","refunded","forfeited","waived"],default:"pending",index:true},
  payment:{type:Schema.Types.ObjectId,ref:"Payment",default:null},notes:{type:String,trim:true,default:""},
  createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},updatedBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true});
schema.index({tenantId:1,hospitalityType:1,hospitalityBooking:1});
export default mongoose.models.HospitalityDeposit||mongoose.model("HospitalityDeposit",schema);
