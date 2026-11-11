/**
 * Purpose: hospitality Commercial Controller HTTP controller. Main declarations: tenantIdOf, id, date, text, range.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Hotel.js so this module can use its exported dependencies.
import Hotel from "../models/Hotel.js";
// Load ../models/HotelRoomType.js so this module can use its exported dependencies.
import HotelRoomType from "../models/HotelRoomType.js";
// Load ../models/HotelBooking.js so this module can use its exported dependencies.
import HotelBooking from "../models/HotelBooking.js";
// Load ../models/AirportTransferBooking.js so this module can use its exported dependencies.
import AirportTransferBooking from "../models/AirportTransferBooking.js";
// Load ../models/HospitalityRatePlan.js so this module can use its exported dependencies.
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";
// Load ../models/HospitalitySupplierContract.js so this module can use its exported dependencies.
import HospitalitySupplierContract from "../models/HospitalitySupplierContract.js";
// Load ../models/HospitalityDeposit.js so this module can use its exported dependencies.
import HospitalityDeposit from "../models/HospitalityDeposit.js";

// Declare tenantIdOf for use by the surrounding module or function.
const tenantIdOf=req=>req.tenantId||req.user?.tenantId;
// Declare id for use by the surrounding module or function.
const id=v=>mongoose.Types.ObjectId.isValid(v)?v:null;
// Declare date for use by the surrounding module or function.
const date=v=>{if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d;};
// Declare text for use by the surrounding module or function.
const text=v=>String(v??"").trim();
// Declare range for use by the surrounding module or function.
const range=(from,to)=>{const a=date(from),b=date(to);if(from&&!a)return "Valid from is invalid.";if(to&&!b)return "Valid to is invalid.";if(a&&b&&b<=a)return "Valid to must be after valid from.";return null;};
// Declare tenant for use by the surrounding module or function.
const tenant=req=>({tenantId:tenantIdOf(req)});

// Declare createCommercialRatePlan for use by the surrounding module or function.
export const createCommercialRatePlan=async(req,res,next)=>{try{
 // Declare tenantId, hotelId, roomTypeId for use by the surrounding module or function.
 const tenantId=tenantIdOf(req),hotelId=id(req.body.hotel),roomTypeId=id(req.body.roomType);
 // Check the condition (!tenantId||!hotelId||!roomTypeId) and run the matching branch.
 if(!tenantId||!hotelId||!roomTypeId)return res.status(400).json({success:false,message:"Hotel and room type are required."});
 // Declare nightlyRate for use by the surrounding module or function.
 const nightlyRate=Number(req.body.nightlyRate); const minNights=Number(req.body.minNights||1); const maxNights=req.body.maxNights===undefined||req.body.maxNights===null||req.body.maxNights===""?null:Number(req.body.maxNights); if(!text(req.body.name)||!Number.isFinite(nightlyRate)||nightlyRate<0)return res.status(400).json({success:false,message:"Rate plan name and a valid nightly rate are required."}); if(!Number.isInteger(minNights)||minNights<1||maxNights!==null&&(!Number.isInteger(maxNights)||maxNights<minNights))return res.status(400).json({success:false,message:"Minimum and maximum nights are invalid."});
 // Declare dateError for use by the surrounding module or function.
 const dateError=range(req.body.validFrom,req.body.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});
 // Declare [hotel,roomType] for use by the surrounding module or function.
 const [hotel,roomType]=await Promise.all([Hotel.findOne({_id:hotelId,tenantId}).lean(),HotelRoomType.findOne({_id:roomTypeId,hotel:hotelId,tenantId}).lean()]);
 // Check the condition (!hotel) and run the matching branch.
 if(!hotel)return res.status(404).json({success:false,message:"Hotel not found in this tenant."});
 // Check the condition (!roomType) and run the matching branch.
 if(!roomType)return res.status(404).json({success:false,message:"Room type does not belong to the selected hotel."});
 // Declare row for use by the surrounding module or function.
 const row=await HospitalityRatePlan.create({tenantId,hotel:hotelId,roomType:roomTypeId,name:text(req.body.name),code:text(req.body.code),nightlyRate:Number(req.body.nightlyRate),currency:text(req.body.currency||hotel.currency||"KES").toUpperCase(),mealPlan:req.body.mealPlan||"room_only",minNights,maxNights,validFrom:date(req.body.validFrom),validTo:date(req.body.validTo),refundable:req.body.refundable!==false,cancellationPolicy:text(req.body.cancellationPolicy),stopSell:Boolean(req.body.stopSell),status:req.body.status||"active",createdBy:req.user?._id||null,updatedBy:req.user?._id||null});
 // Perform the side effect or state update expressed on the following line.
 res.status(201).json({success:true,data:row});
 }catch(e){next(e);}};

// Declare updateCommercialRatePlan for use by the surrounding module or function.
export const updateCommercialRatePlan=async(req,res,next)=>{try{
 // Declare tenantId, row for use by the surrounding module or function.
 const tenantId=tenantIdOf(req),row=await HospitalityRatePlan.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Rate plan not found."});
 // Check the condition (req.body.hotel||req.body.roomType) and run the matching branch.
 if(req.body.hotel||req.body.roomType){const hotelId=id(req.body.hotel||row.hotel),roomTypeId=id(req.body.roomType||row.roomType);const room=await HotelRoomType.findOne({_id:roomTypeId,hotel:hotelId,tenantId}).lean();if(!room)return res.status(400).json({success:false,message:"Selected room type is not part of the selected hotel."});row.hotel=hotelId;row.roomType=roomTypeId;}
 // Declare dateError for use by the surrounding module or function.
 const dateError=range(req.body.validFrom??row.validFrom,req.body.validTo??row.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});
 // Declare allowed for use by the surrounding module or function.
 const allowed=["name","code","nightlyRate","currency","mealPlan","minNights","maxNights","validFrom","validTo","refundable","cancellationPolicy","stopSell","status"];
 // Perform the side effect or state update expressed on the following line.
 allowed.forEach(k=>{if(req.body[k]!==undefined)row[k]=req.body[k]});
 // Check the condition (req.body.nightlyRate!==undefined) and run the matching branch.
 if(req.body.nightlyRate!==undefined){const value=Number(req.body.nightlyRate);if(!Number.isFinite(value)||value<0)return res.status(400).json({success:false,message:"Nightly rate must be a valid non-negative number."});} if(req.body.minNights!==undefined){const value=Number(req.body.minNights);if(!Number.isInteger(value)||value<1)return res.status(400).json({success:false,message:"Minimum nights must be a whole number of at least 1."});} if(req.body.maxNights!==undefined&&req.body.maxNights!==null&&req.body.maxNights!==""){const value=Number(req.body.maxNights);const min=Number(req.body.minNights??row.minNights??1);if(!Number.isInteger(value)||value<min)return res.status(400).json({success:false,message:"Maximum nights must be a whole number and cannot be below minimum nights."});}
 // Perform the side effect or state update expressed on the following line.
 row.updatedBy=req.user?._id||null;await row.save();res.json({success:true,data:row});
 }catch(e){next(e);}};

// Declare createCommercialSupplierContract for use by the surrounding module or function.
export const createCommercialSupplierContract=async(req,res,next)=>{try{
 // Declare tenantId for use by the surrounding module or function.
 const tenantId=tenantIdOf(req); const commissionPercent=Number(req.body.commissionPercent||0); const depositPercent=Number(req.body.depositPercent||0); if(!Number.isFinite(commissionPercent)||commissionPercent<0||commissionPercent>100||!Number.isFinite(depositPercent)||depositPercent<0||depositPercent>100)return res.status(400).json({success:false,message:"Commission and deposit percentages must be between 0 and 100."}); if(!text(req.body.supplierName))return res.status(400).json({success:false,message:"Supplier name is required."});
 // Declare dateError for use by the surrounding module or function.
 const dateError=range(req.body.validFrom,req.body.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});
 // Declare hotel for use by the surrounding module or function.
 let hotel=null;if(req.body.hotel){const hotelId=id(req.body.hotel);if(!hotelId)return res.status(400).json({success:false,message:"Invalid hotel reference."});hotel=await Hotel.findOne({_id:hotelId,tenantId}).lean();if(!hotel)return res.status(404).json({success:false,message:"Hotel not found in this tenant."});}
 // Declare row for use by the surrounding module or function.
 const row=await HospitalitySupplierContract.create({...req.body,tenantId,hotel:hotel?hotel._id:null,supplierName:text(req.body.supplierName),contractNumber:text(req.body.contractNumber),currency:text(req.body.currency||"KES").toUpperCase(),commissionPercent,depositPercent,validFrom:date(req.body.validFrom),validTo:date(req.body.validTo),createdBy:req.user?._id||null,updatedBy:req.user?._id||null});
 // Perform the side effect or state update expressed on the following line.
 res.status(201).json({success:true,data:row});
 }catch(e){next(e);}};

// Declare updateCommercialSupplierContract for use by the surrounding module or function.
export const updateCommercialSupplierContract=async(req,res,next)=>{try{
 // Declare tenantId, row for use by the surrounding module or function.
 const tenantId=tenantIdOf(req),row=await HospitalitySupplierContract.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Supplier contract not found."});
 // Check the condition (req.body.hotel!==undefined) and run the matching branch.
 if(req.body.hotel!==undefined){const hotelId=req.body.hotel?id(req.body.hotel):null;if(req.body.hotel&&!hotelId)return res.status(400).json({success:false,message:"Invalid hotel reference."});if(hotelId&&!await Hotel.exists({_id:hotelId,tenantId}))return res.status(404).json({success:false,message:"Hotel not found in this tenant."});row.hotel=hotelId;}
 // Declare dateError for use by the surrounding module or function.
 const dateError=range(req.body.validFrom??row.validFrom,req.body.validTo??row.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});
 // Perform the side effect or state update expressed on the following line.
 ["supplierName","supplierType","contactName","contactPhone","contactEmail","contractNumber","currency","paymentTerms","cancellationTerms","status","notes"].forEach(k=>{if(req.body[k]!==undefined)row[k]=typeof req.body[k]==="string"?text(req.body[k]):req.body[k]});
 // Perform the side effect or state update expressed on the following line.
 ["commissionPercent","depositPercent"].forEach(k=>{if(req.body[k]!==undefined)row[k]=Number(req.body[k])});
 // Perform the side effect or state update expressed on the following line.
 ["validFrom","validTo"].forEach(k=>{if(req.body[k]!==undefined)row[k]=date(req.body[k])});
 // Check the condition (!Number.isFinite(Number(row.commissionPercent))||!Number.isFinite(Numb) and run the matching branch.
 if(!Number.isFinite(Number(row.commissionPercent))||!Number.isFinite(Number(row.depositPercent))||row.commissionPercent<0||row.commissionPercent>100||row.depositPercent<0||row.depositPercent>100)return res.status(400).json({success:false,message:"Percentages must be valid numbers between 0 and 100."});
 // Perform the side effect or state update expressed on the following line.
 row.updatedBy=req.user?._id||null;await row.save();res.json({success:true,data:row});
 }catch(e){next(e);}};

// Declare createCommercialDeposit for use by the surrounding module or function.
export const createCommercialDeposit=async(req,res,next)=>{try{
 // Declare tenantId, bookingId, type for use by the surrounding module or function.
 const tenantId=tenantIdOf(req),bookingId=id(req.body.hospitalityBooking),type=req.body.hospitalityType;
 // Check the condition (!bookingId||!["hotel","airport_transfer"].includes(type)) and run the matching branch.
 if(!bookingId||!["hotel","airport_transfer"].includes(type))return res.status(400).json({success:false,message:"A valid hospitality booking and booking type are required."});
 // Declare Booking for use by the surrounding module or function.
 const Booking=type==="hotel"?HotelBooking:AirportTransferBooking;const booking=await Booking.findOne({_id:bookingId,tenantId}).lean();if(!booking)return res.status(404).json({success:false,message:"Reservation not found in this tenant."}); if(["cancelled","no_show"].includes(String(booking.status||"").toLowerCase()))return res.status(409).json({success:false,message:"Deposits cannot be created for cancelled or no-show reservations."});
 // Declare amount for use by the surrounding module or function.
 const amount=Number(req.body.amount);if(!Number.isFinite(amount)||amount<=0)return res.status(400).json({success:false,message:"Deposit amount must be greater than zero."});
 // Declare paidAmount for use by the surrounding module or function.
 const paidAmount=Math.max(0,Math.min(amount,Number(req.body.paidAmount||0)));const row=await HospitalityDeposit.create({tenantId,hospitalityType:type,hospitalityBooking:booking._id,bookingReference:booking.reference||booking.bookingReference||booking.confirmationNumber||"",amount,currency:text(req.body.currency||booking.currency||"KES").toUpperCase(),dueDate:date(req.body.dueDate),paidAmount,status:paidAmount<=0?"pending":paidAmount>=amount?"paid":"partial",notes:text(req.body.notes),createdBy:req.user?._id||null,updatedBy:req.user?._id||null});
 // Perform the side effect or state update expressed on the following line.
 res.status(201).json({success:true,data:row});
 }catch(e){next(e);}};

// Declare updateCommercialDeposit for use by the surrounding module or function.
export const updateCommercialDeposit=async(req,res,next)=>{try{
 // Declare tenantId, row for use by the surrounding module or function.
 const tenantId=tenantIdOf(req),row=await HospitalityDeposit.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Deposit not found."});
 // Check the condition (req.body.paidAmount!==undefined) and run the matching branch.
 if(req.body.paidAmount!==undefined){const paid=Number(req.body.paidAmount);if(!Number.isFinite(paid)||paid<0||paid>Number(row.amount))return res.status(400).json({success:false,message:"Received amount must be between zero and the deposit amount."});row.paidAmount=paid;row.status=paid===0?"pending":paid>=Number(row.amount)?"paid":"partial";}
 // Check the condition (req.body.dueDate!==undefined) and run the matching branch.
 if(req.body.dueDate!==undefined)row.dueDate=date(req.body.dueDate);if(req.body.notes!==undefined)row.notes=text(req.body.notes);row.updatedBy=req.user?._id||null;await row.save();res.json({success:true,data:row});
 }catch(e){next(e);}};
