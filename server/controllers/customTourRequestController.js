import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import CustomTourRequest from "../models/CustomTourRequest.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const adminRoles=["admin","super_admin", "superadmin","manager","tour_manager","tourmanager"];
export const createCustomTourRequest=async(req,res,next)=>{
  requireTenantId();
  try {
    const { destination,durationDays,people,startDate,budget,requirements,pickupLocation,pickupDate,pickupTime,adults,children,accommodationPreference,mealPreference,transportPreference,emergencyContact,specialRequests,guestName,guestEmail,guestPhone }=req.body||{};
    if(!destination||Number(durationDays)<1||Number(people)<1) return res.status(400).json({success:false,message:"Destination, duration and number of people are required."});
    const isAuthenticated=Boolean(req.user?._id);
    const name=String(guestName||req.user?.name||"").trim();
    const email=String(guestEmail||req.user?.email||"").trim();
    const phone=String(guestPhone||req.user?.phone||"").trim();
    if(!isAuthenticated && (!name||!email)) return res.status(400).json({success:false,message:"Name and email are required for guest custom-tour requests."});
    const item=await CustomTourRequest.create({customer:isAuthenticated?req.user._id:null,user:isAuthenticated?req.user._id:null,guestContact:{name,email,phone},destination:String(destination).trim(),durationDays:Number(durationDays),people:Number(people),startDate:startDate?new Date(startDate):null,budget:Number(budget||0),requirements:String(requirements||"").trim(),pickupLocation:String(pickupLocation||"").trim(),pickupDate:pickupDate?new Date(pickupDate):null,pickupTime:String(pickupTime||"").trim(),adults:Number(adults||people||1),children:Number(children||0),accommodationPreference:String(accommodationPreference||"").trim(),mealPreference:String(mealPreference||"").trim(),transportPreference:String(transportPreference||"").trim(),emergencyContact:String(emergencyContact||"").trim(),specialRequests:String(specialRequests||"").trim()});
    const admins=await User.find(mergeTenantFilter({$or:[{role:{$in:adminRoles}},{legacyRole:{$in:adminRoles}}],status:"active"})).select("_id").lean();
    if(admins.length) await Notification.insertMany(admins.map(a=>({recipient:a._id,user:a._id,title:"Custom Tour Request",message:`A customer requested a ${durationDays}-day custom trip to ${destination} for ${people} people.`,type:"booking",relatedModel:"CustomTourRequest",relatedId:item._id,actionUrl:"/admin/custom-tour-requests"})));
    res.status(201).json({success:true,message:"Custom tour request submitted. The company will review it and send you a total cost.",request:item});
  } catch(e){next(e)}
};

export const getMyCustomTourRequests=async(req,res,next)=>{try{const requests=await CustomTourRequest.find(mergeTenantFilter({customer:req.user._id})).sort({createdAt:-1}).lean();res.json({success:true,requests})}catch(e){next(e)}};
export const getAdminCustomTourRequests=async(req,res,next)=>{try{const requests=await CustomTourRequest.find(tenantFilter(req)).populate("customer","name email phone").sort({createdAt:-1}).lean();res.json({success:true,requests})}catch(e){next(e)}};
export const quoteCustomTourRequest=async(req,res,next)=>{try{const {status="quoted",quotedAmount,adminNotes=""}=req.body||{};const amount=Number(quotedAmount);if(!["approved","quoted","rejected"].includes(status))return res.status(400).json({success:false,message:"Invalid request status."});if(status!=="rejected"&&(!Number.isFinite(amount)||amount<=0))return res.status(400).json({success:false,message:"A quoted amount greater than zero is required."});const item=await CustomTourRequest.findOneAndUpdate(mergeTenantFilter({_id:req.params.id}),{status,quotedAmount:status==="rejected"?0:amount,adminNotes:String(adminNotes).trim()},{new:true,runValidators:true}).populate("customer","name email phone");if(!item)return res.status(404).json({success:false,message:"Request not found."});if(item.customer?._id){await Notification.create({recipient:item.customer._id,user:item.customer._id,title:status==="rejected"?"Custom Tour Request Declined":"Custom Tour Quote Ready",message:status==="rejected"?`Your custom tour request was declined. ${adminNotes}`:`Your custom tour request has been priced at KES ${amount.toLocaleString()}. ${adminNotes}`,type:"booking",relatedModel:"CustomTourRequest",relatedId:item._id,actionUrl:"/my-custom-tours"});}res.json({success:true,request:item})}catch(e){next(e)}};
export const assignCustomTourResources=async(req,res,next)=>{try{const item=await CustomTourRequest.findOneAndUpdate(mergeTenantFilter({_id:req.params.id}),{assignedGuide:req.body.guide||null,assignedDriver:req.body.driver||null,assignedAgent:req.body.agent||null},{new:true});if(!item)return res.status(404).json({success:false,message:"Request not found."});res.json({success:true,request:item})}catch(e){next(e)}};

export const convertCustomTourToBooking=async(req,res,next)=>{
  try{
    const tenantId=requireTenantId();
    const item=await CustomTourRequest.findOne(mergeTenantFilter({_id:req.params.id,customer:req.user._id,status:{$in:["quoted","approved"]}}));
    if(!item)return res.status(404).json({success:false,message:"Quoted custom tour request not found"});
    const Booking=(await import("../models/Booking.js")).default;
    if(item.bookingId){const existingBooking=await Booking.findOne(mergeTenantFilter({_id:item.bookingId}));if(existingBooking)return res.json({success:true,message:"Custom tour booking already exists.",booking:existingBooking});}
    const Tour=(await import("../models/Tour.js")).default;
    const Destination=(await import("../models/Destination.js")).default;
    let customDestination=await Destination.findOne(mergeTenantFilter({name:"Custom Tour"}));
    if(!customDestination)customDestination=await Destination.create({tenantId,name:"Custom Tour",description:"Customer designed custom tour destination",country:"Kenya",location:"Customer Selected Location",status:"active"});
    let customTour=await Tour.findOne(mergeTenantFilter({title:"Custom Tour Package",isDeleted:false}));
    if(!customTour)customTour=await Tour.create({tenantId,title:"Custom Tour Package",description:"Customer designed custom tour package",destination:customDestination._id,location:"Customer Selected Location",country:"Kenya",date:item.startDate||new Date(),price:Number(item.quotedAmount||0),duration:String(item.durationDays||1),durationDetails:{days:Number(item.durationDays||1),nights:Math.max(0,Number(item.durationDays||1)-1)},category:"Safari",published:false,available:false,isDeleted:false,status:"draft",capacity:1000,availabilitySettings:{totalSlots:1000,bookedSlots:0,waitlistEnabled:false},createdBy:req.user._id});
    let pickupDateTime=null;
    if(item.pickupDate&&item.pickupTime){const parsed=new Date(`${new Date(item.pickupDate).toISOString().slice(0,10)}T${item.pickupTime}`);if(!isNaN(parsed.getTime()))pickupDateTime=parsed;}
    const booking=await Booking.create({tenantId,user:req.user._id,customer:req.user._id,customTourRequest:item._id,customerSnapshot:{name:req.user.name||"",email:req.user.email||"",phone:req.user.phone||""},tour:customTour._id,bookingSource:"website",travelDate:item.startDate||new Date(),travelers:[],numberOfGuests:Number(item.people||1),customTourLocked:true,customTourSnapshot:{destination:item.destination,durationDays:item.durationDays,people:item.people,startDate:item.startDate,budget:item.budget,pickupLocation:item.pickupLocation,pickupDate:item.pickupDate,pickupTime:item.pickupTime,accommodationPreference:item.accommodationPreference,mealPreference:item.mealPreference,transportPreference:item.transportPreference,requirements:item.requirements,specialRequests:item.specialRequests},contact:{name:req.user.name||"",email:req.user.email||"",phone:req.user.phone||""},pickupLocation:item.pickupLocation||"",pickupTime:pickupDateTime,hotelName:"",roomNumber:"",emergencyContact:item.emergencyContact?{name:item.emergencyContact,phone:"",relationship:""}:undefined,specialRequests:[item.requirements,item.specialRequests].filter(Boolean),subtotal:Number(item.quotedAmount||0),quotedAmount:Number(item.quotedAmount||0),discountAmount:0,totalAmount:Number(item.quotedAmount||0),depositAmount:0,balanceAmount:Number(item.quotedAmount||0),paymentStatus:"pending",status:"pending",notes:item.requirements||""});
    item.status="converted";item.bookingId=booking._id;await item.save();res.json({success:true,booking});
  }catch(e){next(e)}
};
