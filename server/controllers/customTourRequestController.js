import CustomTourRequest from "../models/CustomTourRequest.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const adminRoles=["admin","superadmin","super_admin","manager","tour_manager","tourmanager"];
export const createCustomTourRequest=async(req,res,next)=>{try{const {
destination,
durationDays,
people,
startDate,
budget,
requirements,
pickupLocation,
pickupDate,
pickupTime,
adults,
children,
accommodationPreference,
mealPreference,
transportPreference,
emergencyContact,
specialRequests
}=req.body||{};if(!destination||Number(durationDays)<1||Number(people)<1)return res.status(400).json({success:false,message:"Destination, duration and number of people are required."});const item=await CustomTourRequest.create({customer:req.user._id,destination:String(destination).trim(),durationDays:Number(durationDays),people:Number(people),startDate:startDate?new Date(startDate):null,budget:Number(budget||0),requirements:String(requirements||"").trim(),

pickupLocation:String(pickupLocation||"").trim(),
pickupDate:pickupDate?new Date(pickupDate):null,
pickupTime:String(pickupTime||"").trim(),

adults:Number(adults||people||1),
children:Number(children||0),

accommodationPreference:String(accommodationPreference||"").trim(),
mealPreference:String(mealPreference||"").trim(),
transportPreference:String(transportPreference||"").trim(),

emergencyContact:String(emergencyContact||"").trim(),
specialRequests:String(specialRequests||"").trim()

});const admins=await User.find({$or:[{role:{$in:adminRoles}},{legacyRole:{$in:adminRoles}}],status:"active"}).select("_id").lean();if(admins.length)await Notification.insertMany(admins.map(a=>({recipient:a._id,user:a._id,title:"Custom Tour Request",message:`A customer requested a ${durationDays}-day custom trip to ${destination} for ${people} people.`,type:"booking",relatedModel:"CustomTourRequest",relatedId:item._id,actionUrl:"/admin/custom-tour-requests"})));res.status(201).json({success:true,message:"Custom tour request submitted. The company will review it and send you a total cost.",request:item});}catch(e){next(e)}};
export const getMyCustomTourRequests=async(req,res,next)=>{try{const requests=await CustomTourRequest.find({customer:req.user._id}).sort({createdAt:-1}).lean();res.json({success:true,requests})}catch(e){next(e)}};
export const getAdminCustomTourRequests=async(req,res,next)=>{try{const requests=await CustomTourRequest.find().populate("customer","name email phone").sort({createdAt:-1}).lean();res.json({success:true,requests})}catch(e){next(e)}};
export const quoteCustomTourRequest=async(req,res,next)=>{try{const {status="quoted",quotedAmount,adminNotes=""}=req.body||{};const amount=Number(quotedAmount);if(!["approved","quoted","rejected"].includes(status))return res.status(400).json({success:false,message:"Invalid request status."});if(status!=="rejected"&&!Number.isFinite(amount)||status!=="rejected"&&amount<0)return res.status(400).json({success:false,message:"A valid quoted amount is required."});const item=await CustomTourRequest.findByIdAndUpdate(req.params.id,{status,quotedAmount:status==="rejected"?0:amount,adminNotes:String(adminNotes)}, {new:true}).populate("customer","name email phone");if(!item)return res.status(404).json({success:false,message:"Request not found."});await Notification.create({recipient:item.customer._id,user:item.customer._id,title:status==="rejected"?"Custom Tour Request Declined":"Custom Tour Quote Ready",message:status==="rejected"?`Your custom tour request was declined. ${adminNotes}`:`Your custom tour request has been priced at KES ${amount.toLocaleString()}. ${adminNotes}`,type:"booking",relatedModel:"CustomTourRequest",relatedId:item._id,actionUrl:"/custom-tour"});res.json({success:true,request:item})}catch(e){next(e)}};
export const assignCustomTourResources=async(req,res,next)=>{try{const item=await CustomTourRequest.findByIdAndUpdate(req.params.id,{assignedGuide:req.body.guide||null,assignedDriver:req.body.driver||null,assignedAgent:req.body.agent||null},{new:true});if(!item)return res.status(404).json({success:false,message:"Request not found."});res.json({success:true,request:item})}catch(e){next(e)}};


export const convertCustomTourToBooking = async(req,res,next)=>{
try{

const item=await CustomTourRequest.findOne({
_id:req.params.id,
customer:req.user._id,
status:"quoted"
});

if(!item)
return res.status(404).json({
success:false,
message:"Quoted custom tour request not found"
});


const Booking = (await import("../models/Booking.js")).default;
const Tour = (await import("../models/Tour.js")).default;

const Destination = (await import("../models/Destination.js")).default;

let customDestination = await Destination.findOne({
name:"Custom Tour"
});

if(!customDestination){

customDestination = await Destination.create({
name:"Custom Tour",
description:"Customer designed custom tour destination",
country:"Kenya",
location:"Customer Selected Location"
});

}

let customTour = await Tour.findOne({
title:"Custom Tour Package"
});

if(!customTour){

customTour = await Tour.create({

title:"Custom Tour Package",

description:"Customer designed custom tour package",

destination:customDestination._id,

location:"Customer Selected Location",

country:"Kenya",

date:new Date(),

price:Number(item.quotedAmount || 0),

durationDays:Number(item.durationDays || 1),

category:"Safari",

totalSlots:1000,

availableSlots:1000

});

}

let pickupDateTime = null;

if(item.pickupDate && item.pickupTime){

const parsed = new Date(`${item.pickupDate}T${item.pickupTime}`);

if(!isNaN(parsed.getTime())){
pickupDateTime = parsed;
}

}



const booking=await Booking.create({

user:req.user._id,

customer:null,

customTourRequest:item._id,

customerSnapshot:{
name:req.user.name || "",
email:req.user.email || "",
phone:req.user.phone || ""
},

tour:customTour._id,

bookingSource:"website",

travelDate:item.startDate || new Date(),

travelers:[],

numberOfGuests:Number(item.people || 1),
customTourLocked:true,

customTourSnapshot:{
destination:item.destination,
durationDays:item.durationDays,
people:item.people,
startDate:item.startDate,
budget:item.budget,
pickupLocation:item.pickupLocation,
pickupDate:item.pickupDate,
pickupTime:item.pickupTime,
accommodationPreference:item.accommodationPreference,
mealPreference:item.mealPreference,
transportPreference:item.transportPreference,
requirements:item.requirements,
specialRequests:item.specialRequests
},

contact:{
name:req.user.name || "",
email:req.user.email || "",
phone:req.user.phone || ""
},

pickupLocation:item.pickupLocation || "",

pickupTime:pickupDateTime,

hotelName:"",

roomNumber:"",

emergencyContact:
item.emergencyContact
?
{
name:item.emergencyContact,
phone:"",
relationship:""
}
:
undefined,

specialRequests:[
item.requirements,
item.specialRequests
]
.filter(Boolean),

subtotal:Number(item.quotedAmount || 0),
quotedAmount:Number(item.quotedAmount || 0),

discountAmount:0,

totalAmount:Number(item.quotedAmount || 0),

depositAmount:Number(item.quotedAmount || 0),

paymentStatus:"pending",

status:"pending",

notes:item.requirements || ""

});


item.status="converted";
item.bookingId=booking._id;

await item.save();


res.json({
success:true,
booking
});


}catch(e){
next(e)
}

};

