import mongoose from "mongoose";
import Hotel from "../models/Hotel.js";
import HotelRoomType from "../models/HotelRoomType.js";
import HotelBooking from "../models/HotelBooking.js";
import AirportTransferBooking from "../models/AirportTransferBooking.js";
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";
import HospitalitySupplierContract from "../models/HospitalitySupplierContract.js";
import HospitalityDeposit from "../models/HospitalityDeposit.js";

const tenantIdOf=req=>req.tenantId||req.user?.tenantId;
const id=v=>mongoose.Types.ObjectId.isValid(v)?v:null;
const date=v=>{if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d;};
const text=v=>String(v??"").trim();
const range=(from,to)=>{const a=date(from),b=date(to);if(from&&!a)return "Valid from is invalid.";if(to&&!b)return "Valid to is invalid.";if(a&&b&&b<=a)return "Valid to must be after valid from.";return null;};
const tenant=req=>({tenantId:tenantIdOf(req)});

export const createCommercialRatePlan=async(req,res,next)=>{try{
 const tenantId=tenantIdOf(req),hotelId=id(req.body.hotel),roomTypeId=id(req.body.roomType);
 if(!tenantId||!hotelId||!roomTypeId)return res.status(400).json({success:false,message:"Hotel and room type are required."});
 const nightlyRate=Number(req.body.nightlyRate); const minNights=Number(req.body.minNights||1); const maxNights=req.body.maxNights===undefined||req.body.maxNights===null||req.body.maxNights===""?null:Number(req.body.maxNights); if(!text(req.body.name)||!Number.isFinite(nightlyRate)||nightlyRate<0)return res.status(400).json({success:false,message:"Rate plan name and a valid nightly rate are required."}); if(!Number.isInteger(minNights)||minNights<1||maxNights!==null&&(!Number.isInteger(maxNights)||maxNights<minNights))return res.status(400).json({success:false,message:"Minimum and maximum nights are invalid."});
 const dateError=range(req.body.validFrom,req.body.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});
 const [hotel,roomType]=await Promise.all([Hotel.findOne({_id:hotelId,tenantId}).lean(),HotelRoomType.findOne({_id:roomTypeId,hotel:hotelId,tenantId}).lean()]);
 if(!hotel)return res.status(404).json({success:false,message:"Hotel not found in this tenant."});
 if(!roomType)return res.status(404).json({success:false,message:"Room type does not belong to the selected hotel."});
 const row=await HospitalityRatePlan.create({tenantId,hotel:hotelId,roomType:roomTypeId,name:text(req.body.name),code:text(req.body.code),nightlyRate:Number(req.body.nightlyRate),currency:text(req.body.currency||hotel.currency||"KES").toUpperCase(),mealPlan:req.body.mealPlan||"room_only",minNights,maxNights,validFrom:date(req.body.validFrom),validTo:date(req.body.validTo),refundable:req.body.refundable!==false,cancellationPolicy:text(req.body.cancellationPolicy),stopSell:Boolean(req.body.stopSell),status:req.body.status||"active",createdBy:req.user?._id||null,updatedBy:req.user?._id||null});
 res.status(201).json({success:true,data:row});
 }catch(e){next(e);}};

export const updateCommercialRatePlan=async(req,res,next)=>{try{
 const tenantId=tenantIdOf(req),row=await HospitalityRatePlan.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Rate plan not found."});
 if(req.body.hotel||req.body.roomType){const hotelId=id(req.body.hotel||row.hotel),roomTypeId=id(req.body.roomType||row.roomType);const room=await HotelRoomType.findOne({_id:roomTypeId,hotel:hotelId,tenantId}).lean();if(!room)return res.status(400).json({success:false,message:"Selected room type is not part of the selected hotel."});row.hotel=hotelId;row.roomType=roomTypeId;}
 const dateError=range(req.body.validFrom??row.validFrom,req.body.validTo??row.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});
 const allowed=["name","code","nightlyRate","currency","mealPlan","minNights","maxNights","validFrom","validTo","refundable","cancellationPolicy","stopSell","status"];
 allowed.forEach(k=>{if(req.body[k]!==undefined)row[k]=req.body[k]});
 if(req.body.nightlyRate!==undefined){const value=Number(req.body.nightlyRate);if(!Number.isFinite(value)||value<0)return res.status(400).json({success:false,message:"Nightly rate must be a valid non-negative number."});} if(req.body.minNights!==undefined){const value=Number(req.body.minNights);if(!Number.isInteger(value)||value<1)return res.status(400).json({success:false,message:"Minimum nights must be a whole number of at least 1."});} if(req.body.maxNights!==undefined&&req.body.maxNights!==null&&req.body.maxNights!==""){const value=Number(req.body.maxNights);const min=Number(req.body.minNights??row.minNights??1);if(!Number.isInteger(value)||value<min)return res.status(400).json({success:false,message:"Maximum nights must be a whole number and cannot be below minimum nights."});}
 row.updatedBy=req.user?._id||null;await row.save();res.json({success:true,data:row});
 }catch(e){next(e);}};

export const createCommercialSupplierContract=async(req,res,next)=>{try{
 const tenantId=tenantIdOf(req); const commissionPercent=Number(req.body.commissionPercent||0); const depositPercent=Number(req.body.depositPercent||0); if(!Number.isFinite(commissionPercent)||commissionPercent<0||commissionPercent>100||!Number.isFinite(depositPercent)||depositPercent<0||depositPercent>100)return res.status(400).json({success:false,message:"Commission and deposit percentages must be between 0 and 100."}); if(!text(req.body.supplierName))return res.status(400).json({success:false,message:"Supplier name is required."});
 const dateError=range(req.body.validFrom,req.body.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});
 let hotel=null;if(req.body.hotel){const hotelId=id(req.body.hotel);if(!hotelId)return res.status(400).json({success:false,message:"Invalid hotel reference."});hotel=await Hotel.findOne({_id:hotelId,tenantId}).lean();if(!hotel)return res.status(404).json({success:false,message:"Hotel not found in this tenant."});}
 const row=await HospitalitySupplierContract.create({...req.body,tenantId,hotel:hotel?hotel._id:null,supplierName:text(req.body.supplierName),contractNumber:text(req.body.contractNumber),currency:text(req.body.currency||"KES").toUpperCase(),commissionPercent,depositPercent,validFrom:date(req.body.validFrom),validTo:date(req.body.validTo),createdBy:req.user?._id||null,updatedBy:req.user?._id||null});
 res.status(201).json({success:true,data:row});
 }catch(e){next(e);}};

export const updateCommercialSupplierContract=async(req,res,next)=>{try{
 const tenantId=tenantIdOf(req),row=await HospitalitySupplierContract.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Supplier contract not found."});
 if(req.body.hotel!==undefined){const hotelId=req.body.hotel?id(req.body.hotel):null;if(req.body.hotel&&!hotelId)return res.status(400).json({success:false,message:"Invalid hotel reference."});if(hotelId&&!await Hotel.exists({_id:hotelId,tenantId}))return res.status(404).json({success:false,message:"Hotel not found in this tenant."});row.hotel=hotelId;}
 const dateError=range(req.body.validFrom??row.validFrom,req.body.validTo??row.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});
 ["supplierName","supplierType","contactName","contactPhone","contactEmail","contractNumber","currency","paymentTerms","cancellationTerms","status","notes"].forEach(k=>{if(req.body[k]!==undefined)row[k]=typeof req.body[k]==="string"?text(req.body[k]):req.body[k]});
 ["commissionPercent","depositPercent"].forEach(k=>{if(req.body[k]!==undefined)row[k]=Number(req.body[k])});
 ["validFrom","validTo"].forEach(k=>{if(req.body[k]!==undefined)row[k]=date(req.body[k])});
 if(!Number.isFinite(Number(row.commissionPercent))||!Number.isFinite(Number(row.depositPercent))||row.commissionPercent<0||row.commissionPercent>100||row.depositPercent<0||row.depositPercent>100)return res.status(400).json({success:false,message:"Percentages must be valid numbers between 0 and 100."});
 row.updatedBy=req.user?._id||null;await row.save();res.json({success:true,data:row});
 }catch(e){next(e);}};

export const createCommercialDeposit=async(req,res,next)=>{try{
 const tenantId=tenantIdOf(req),bookingId=id(req.body.hospitalityBooking),type=req.body.hospitalityType;
 if(!bookingId||!["hotel","airport_transfer"].includes(type))return res.status(400).json({success:false,message:"A valid hospitality booking and booking type are required."});
 const Booking=type==="hotel"?HotelBooking:AirportTransferBooking;const booking=await Booking.findOne({_id:bookingId,tenantId}).lean();if(!booking)return res.status(404).json({success:false,message:"Reservation not found in this tenant."}); if(["cancelled","no_show"].includes(String(booking.status||"").toLowerCase()))return res.status(409).json({success:false,message:"Deposits cannot be created for cancelled or no-show reservations."});
 const amount=Number(req.body.amount);if(!Number.isFinite(amount)||amount<=0)return res.status(400).json({success:false,message:"Deposit amount must be greater than zero."});
 const paidAmount=Math.max(0,Math.min(amount,Number(req.body.paidAmount||0)));const row=await HospitalityDeposit.create({tenantId,hospitalityType:type,hospitalityBooking:booking._id,bookingReference:booking.reference||booking.bookingReference||booking.confirmationNumber||"",amount,currency:text(req.body.currency||booking.currency||"KES").toUpperCase(),dueDate:date(req.body.dueDate),paidAmount,status:paidAmount<=0?"pending":paidAmount>=amount?"paid":"partial",notes:text(req.body.notes),createdBy:req.user?._id||null,updatedBy:req.user?._id||null});
 res.status(201).json({success:true,data:row});
 }catch(e){next(e);}};

export const updateCommercialDeposit=async(req,res,next)=>{try{
 const tenantId=tenantIdOf(req),row=await HospitalityDeposit.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Deposit not found."});
 if(req.body.paidAmount!==undefined){const paid=Number(req.body.paidAmount);if(!Number.isFinite(paid)||paid<0||paid>Number(row.amount))return res.status(400).json({success:false,message:"Received amount must be between zero and the deposit amount."});row.paidAmount=paid;row.status=paid===0?"pending":paid>=Number(row.amount)?"paid":"partial";}
 if(req.body.dueDate!==undefined)row.dueDate=date(req.body.dueDate);if(req.body.notes!==undefined)row.notes=text(req.body.notes);row.updatedBy=req.user?._id||null;await row.save();res.json({success:true,data:row});
 }catch(e){next(e);}};
