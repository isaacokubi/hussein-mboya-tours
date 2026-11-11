/**
 * Purpose: custom Tour Request Controller HTTP controller. Main declarations: createCustomTourRequest, getMyCustomTourRequests, getAdminCustomTourRequests, quoteCustomTourRequest, assignCustomTourResources.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/CustomTourRequest.js so this module can use its exported dependencies.
import CustomTourRequest from "../models/CustomTourRequest.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";

// Declare adminRoles for use by the surrounding module or function.
const adminRoles=["admin","super_admin", "superadmin","manager","tour_manager","tourmanager"];
// Declare createCustomTourRequest for use by the surrounding module or function.
export const createCustomTourRequest=async(req,res,next)=>{
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { destination,durationDays,people,startDate,budget,requirements,pickupLocation,pickupDate,pickupTime,adults,children,accommodationPreference,mealPreference,transportPreference,emergencyContact,specialRequests,guestName,guestEmail,guestPhone } for use by the surrounding module or function.
    const { destination,durationDays,people,startDate,budget,requirements,pickupLocation,pickupDate,pickupTime,adults,children,accommodationPreference,mealPreference,transportPreference,emergencyContact,specialRequests,guestName,guestEmail,guestPhone }=req.body||{};
    // Check the condition (!destination||Number(durationDays)<1||Number(people)<1) and run the matching branch.
    if(!destination||Number(durationDays)<1||Number(people)<1) return res.status(400).json({success:false,message:"Destination, duration and number of people are required."});
    // Declare isAuthenticated for use by the surrounding module or function.
    const isAuthenticated=Boolean(req.user?._id);
    // Declare name for use by the surrounding module or function.
    const name=String(guestName||req.user?.name||"").trim();
    // Declare email for use by the surrounding module or function.
    const email=String(guestEmail||req.user?.email||"").trim();
    // Declare phone for use by the surrounding module or function.
    const phone=String(guestPhone||req.user?.phone||"").trim();
    // Check the condition (!isAuthenticated && (!name||!email)) and run the matching branch.
    if(!isAuthenticated && (!name||!email)) return res.status(400).json({success:false,message:"Name and email are required for guest custom-tour requests."});
    // Declare item for use by the surrounding module or function.
    const item=await CustomTourRequest.create({tenantId,customer:isAuthenticated?req.user._id:null,user:isAuthenticated?req.user._id:null,guestContact:{name,email,phone},destination:String(destination).trim(),durationDays:Number(durationDays),people:Number(people),startDate:startDate?new Date(startDate):null,budget:Number(budget||0),requirements:String(requirements||"").trim(),pickupLocation:String(pickupLocation||"").trim(),pickupDate:pickupDate?new Date(pickupDate):null,pickupTime:String(pickupTime||"").trim(),adults:Number(adults||people||1),children:Number(children||0),accommodationPreference:String(accommodationPreference||"").trim(),mealPreference:String(mealPreference||"").trim(),transportPreference:String(transportPreference||"").trim(),emergencyContact:String(emergencyContact||"").trim(),specialRequests:String(specialRequests||"").trim()});
    // Declare admins for use by the surrounding module or function.
    const admins=await User.find(mergeTenantFilter({$or:[{role:{$in:adminRoles}},{legacyRole:{$in:adminRoles}}],status:"active"})).select("_id").lean();
    // Check the condition (admins.length) and run the matching branch.
    if(admins.length) await Notification.insertMany(admins.map(a=>({recipient:a._id,user:a._id,title:"Custom Tour Request",message:`A customer requested a ${durationDays}-day custom trip to ${destination} for ${people} people.`,type:"booking",relatedModel:"CustomTourRequest",relatedId:item._id,actionUrl:"/admin/custom-tour-requests"})));
    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({success:true,message:"Custom tour request submitted. The company will review it and send you a total cost.",request:item});
  } catch(e){next(e)}
};

// Declare getMyCustomTourRequests for use by the surrounding module or function.
export const getMyCustomTourRequests=async(req,res,next)=>{try{const requests=await CustomTourRequest.find(mergeTenantFilter({customer:req.user._id})).sort({createdAt:-1}).lean();res.json({success:true,requests})}catch(e){next(e)}};
// Declare getAdminCustomTourRequests for use by the surrounding module or function.
export const getAdminCustomTourRequests=async(req,res,next)=>{try{const requests=await CustomTourRequest.find(tenantFilter(req)).populate("customer","name email phone").sort({createdAt:-1}).lean();res.json({success:true,requests})}catch(e){next(e)}};
// Declare quoteCustomTourRequest for use by the surrounding module or function.
export const quoteCustomTourRequest=async(req,res,next)=>{try{const {status="quoted",quotedAmount,adminNotes=""}=req.body||{};const amount=Number(quotedAmount);if(!["approved","quoted","rejected"].includes(status))return res.status(400).json({success:false,message:"Invalid request status."});if(status!=="rejected"&&(!Number.isFinite(amount)||amount<=0))return res.status(400).json({success:false,message:"A quoted amount greater than zero is required."});const current=await CustomTourRequest.findOne(mergeTenantFilter({_id:req.params.id}));if(!current)return res.status(404).json({success:false,message:"Request not found."});if(["converted","rejected"].includes(current.status))return res.status(409).json({success:false,message:`A ${current.status} request cannot be quoted or rejected again.`});const item=await CustomTourRequest.findOneAndUpdate(mergeTenantFilter({_id:req.params.id}),{status,quotedAmount:status==="rejected"?0:amount,adminNotes:String(adminNotes).trim()},{new:true,runValidators:true}).populate("customer","name email phone");if(!item)return res.status(404).json({success:false,message:"Request not found."});if(item.customer?._id){await Notification.create({recipient:item.customer._id,user:item.customer._id,title:status==="rejected"?"Custom Tour Request Rejected":"Custom Tour Quote Ready",message:status==="rejected"?`Your custom tour request was rejected. ${adminNotes}`:`Your custom tour request has been priced at KES ${amount.toLocaleString()}. ${adminNotes}`,type:"booking",relatedModel:"CustomTourRequest",relatedId:item._id,actionUrl:"/my-custom-tours"});}res.json({success:true,request:item})}catch(e){next(e)}};
// Declare assignCustomTourResources for use by the surrounding module or function.
export const assignCustomTourResources=async(req,res,next)=>{try{const item=await CustomTourRequest.findOne(mergeTenantFilter({_id:req.params.id}));if(!item)return res.status(404).json({success:false,message:"Request not found."});if(["converted","rejected"].includes(item.status))return res.status(409).json({success:false,message:`A ${item.status} request cannot receive new resource assignments.`});const tenantId=requireTenantId();const guideId=req.body.guide||null;const driverId=req.body.driver||null;const agentId=req.body.agent||null;const [guide,driver,agent]=await Promise.all([guideId?Staff.findOne(mergeTenantFilter({_id:guideId,tenantId,position:"guide",status:"active",isDeleted:false,availability:{$in:["available","busy"]}})).select("_id").lean():null,driverId?Staff.findOne(mergeTenantFilter({_id:driverId,tenantId,position:"driver",status:"active",isDeleted:false,availability:{$in:["available","busy"]}})).select("_id").lean():null,agentId?Agent.findOne(mergeTenantFilter({_id:agentId,tenantId,status:"active",isApproved:true})).select("_id").lean():null]);if(guideId&&!guide)return res.status(400).json({success:false,message:"Selected guide is invalid, inactive, unavailable or belongs to another tenant."});if(driverId&&!driver)return res.status(400).json({success:false,message:"Selected driver is invalid, inactive, unavailable or belongs to another tenant."});if(agentId&&!agent)return res.status(400).json({success:false,message:"Selected agent is invalid, inactive, unapproved or belongs to another tenant."});item.assignedGuide=guideId;item.assignedDriver=driverId;item.assignedAgent=agentId;await item.save();res.json({success:true,request:item})}catch(e){next(e)}};

// Declare convertCustomTourToBooking for use by the surrounding module or function.
export const convertCustomTourToBooking=async(req,res,next)=>{
  // Run this operation with a dedicated error-handling path for failures.
  try{
    // Declare tenantId for use by the surrounding module or function.
    const tenantId=requireTenantId();
    // Declare item for use by the surrounding module or function.
    const item=await CustomTourRequest.findOne(mergeTenantFilter({_id:req.params.id,customer:req.user._id,status:{$in:["quoted","approved"]}}));
    // Check the condition (!item) and run the matching branch.
    if(!item)return res.status(404).json({success:false,message:"Quoted custom tour request not found"});
    // Declare Booking for use by the surrounding module or function.
    const Booking=(await import("../models/Booking.js")).default;
    // Check the condition (item.bookingId) and run the matching branch.
    if(item.bookingId){const existingBooking=await Booking.findOne(mergeTenantFilter({_id:item.bookingId}));if(existingBooking)return res.json({success:true,message:"Custom tour booking already exists.",booking:existingBooking});}
    // Declare Tour for use by the surrounding module or function.
    const Tour=(await import("../models/Tour.js")).default;
    // Declare Destination for use by the surrounding module or function.
    const Destination=(await import("../models/Destination.js")).default;
    // Declare customDestination for use by the surrounding module or function.
    let customDestination=await Destination.findOne(mergeTenantFilter({name:"Custom Tour"}));
    // Check the condition (!customDestination) and run the matching branch.
    if(!customDestination)customDestination=await Destination.create({tenantId,name:"Custom Tour",description:"Customer designed custom tour destination",country:"Kenya",location:"Customer Selected Location",status:"active"});
    // Declare customTour for use by the surrounding module or function.
    let customTour=await Tour.findOne(mergeTenantFilter({title:"Custom Tour Package",isDeleted:false}));
    // Check the condition (!customTour) and run the matching branch.
    if(!customTour)customTour=await Tour.create({tenantId,title:"Custom Tour Package",description:"Customer designed custom tour package",destination:customDestination._id,location:"Customer Selected Location",country:"Kenya",date:item.startDate||new Date(),price:Number(item.quotedAmount||0),duration:String(item.durationDays||1),durationDetails:{days:Number(item.durationDays||1),nights:Math.max(0,Number(item.durationDays||1)-1)},category:"Safari",published:false,available:false,isDeleted:false,status:"draft",capacity:1000,availabilitySettings:{totalSlots:1000,bookedSlots:0,waitlistEnabled:false},createdBy:req.user._id});
    // Declare pickupDateTime for use by the surrounding module or function.
    let pickupDateTime=null;
    // Check the condition (item.pickupDate&&item.pickupTime) and run the matching branch.
    if(item.pickupDate&&item.pickupTime){const parsed=new Date(`${new Date(item.pickupDate).toISOString().slice(0,10)}T${item.pickupTime}`);if(!isNaN(parsed.getTime()))pickupDateTime=parsed;}
    // Declare booking for use by the surrounding module or function.
    const booking=await Booking.create({tenantId,user:req.user._id,customer:req.user._id,customTourRequest:item._id,customerSnapshot:{name:req.user.name||"",email:req.user.email||"",phone:req.user.phone||""},tour:customTour._id,bookingSource:"website",travelDate:item.startDate||new Date(),travelers:[],numberOfGuests:Number(item.people||1),customTourLocked:true,customTourSnapshot:{destination:item.destination,durationDays:item.durationDays,people:item.people,startDate:item.startDate,budget:item.budget,pickupLocation:item.pickupLocation,pickupDate:item.pickupDate,pickupTime:item.pickupTime,accommodationPreference:item.accommodationPreference,mealPreference:item.mealPreference,transportPreference:item.transportPreference,requirements:item.requirements,specialRequests:item.specialRequests},contact:{name:req.user.name||"",email:req.user.email||"",phone:req.user.phone||""},pickupLocation:item.pickupLocation||"",pickupTime:pickupDateTime,hotelName:"",roomNumber:"",emergencyContact:item.emergencyContact?{name:item.emergencyContact,phone:"",relationship:""}:undefined,specialRequests:[item.requirements,item.specialRequests].filter(Boolean),subtotal:Number(item.quotedAmount||0),quotedAmount:Number(item.quotedAmount||0),discountAmount:0,totalAmount:Number(item.quotedAmount||0),depositAmount:0,balanceAmount:Number(item.quotedAmount||0),paymentStatus:"pending",status:"pending",notes:item.requirements||""});
    // Perform the side effect or state update expressed on the following line.
    item.status="converted";item.bookingId=booking._id;await item.save();res.json({success:true,booking});
  }catch(e){next(e)}
};
