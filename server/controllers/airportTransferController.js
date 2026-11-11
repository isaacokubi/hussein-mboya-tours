/**
 * Purpose: airport Transfer Controller HTTP controller. Main declarations: tenantIdOf, clean, ref, roleOf, listTransfers.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/AirportTransfer.js so this module can use its exported dependencies.
import AirportTransfer from "../models/AirportTransfer.js";
// Load ../models/AirportTransferBooking.js so this module can use its exported dependencies.
import AirportTransferBooking from "../models/AirportTransferBooking.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Declare tenantIdOf for use by the surrounding module or function.
const tenantIdOf=req=>req.tenantId||req.user?.tenantId||null; const clean=v=>String(v??"").trim(); const ref=()=>`TRF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`; const staffRoles=new Set(["admin","manager","tour_manager","tourmanager","agent","super_admin","superadmin"]); const roleOf=req=>String(req.userRole||req.user?.role||"").trim().toLowerCase().replace(/[\s-]+/g,"_");
// Declare listTransfers for use by the surrounding module or function.
export const listTransfers=async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req),status:"active"};if(req.query.airportCode)filter.airportCode=clean(req.query.airportCode).toUpperCase();if(req.query.direction)filter.direction=req.query.direction;res.json({success:true,data:await AirportTransfer.find(filter).sort({airportCode:1,price:1,name:1}).lean()});}catch(e){next(e);}};
// Declare getTransfer for use by the surrounding module or function.
export const getTransfer=async(req,res,next)=>{try{const item=await AirportTransfer.findOne({_id:req.params.id,tenantId:tenantIdOf(req),status:"active"}).lean();if(!item)return res.status(404).json({success:false,message:"Transfer service not found."});res.json({success:true,data:item});}catch(e){next(e);}};
// Declare listAdminTransfers for use by the surrounding module or function.
export const listAdminTransfers=async(req,res,next)=>{try{const tenantId=tenantIdOf(req);if(!tenantId)return res.status(400).json({success:false,message:"Tenant context is required for hospitality operations."});const filter={tenantId};if(req.query.status)filter.status=req.query.status;res.json({success:true,data:await AirportTransfer.find(filter).sort({createdAt:-1,airportCode:1,price:1,name:1}).lean()});}catch(e){next(e);}};
// Declare createTransfer for use by the surrounding module or function.
export const createTransfer=async(req,res,next)=>{try{const name=clean(req.body.name),vehicleType=clean(req.body.vehicleType);if(!name||!vehicleType||Number(req.body.passengerCapacity)<1||Number(req.body.price)<0)return res.status(400).json({success:false,message:"Name, vehicle capacity and valid price are required."});const item=await AirportTransfer.create({...req.body,tenantId:tenantIdOf(req),name,vehicleType,createdBy:req.user?._id||null,updatedBy:req.user?._id||null});res.status(201).json({success:true,data:item});}catch(e){next(e);}};
// Declare updateTransfer for use by the surrounding module or function.
export const updateTransfer=async(req,res,next)=>{try{const item=await AirportTransfer.findOne({_id:req.params.id,tenantId:tenantIdOf(req)});if(!item)return res.status(404).json({success:false,message:"Transfer service not found."});const allowed=["name","airportName","airportCode","direction","pickupLocation","dropoffLocation","vehicleType","passengerCapacity","luggageCapacity","pricingModel","price","currency","durationMinutes","amenities","operatingHours","notes","status"];for(const key of allowed)if(req.body[key]!==undefined)item[key]=req.body[key];item.updatedBy=req.user?._id||null;await item.save();res.json({success:true,data:item});}catch(e){next(e);}};
// Declare resolveCustomer for use by the surrounding module or function.
const resolveCustomer=async(req,body)=>{if(!req.user?._id)return null;let customer=await Customer.findOne({tenantId:tenantIdOf(req),user:req.user._id});if(customer)return customer;const firstName=clean(body.firstName||req.user.firstName||req.user.name?.split(" ")[0]||"Guest"),lastName=clean(body.lastName||req.user.lastName||req.user.name?.split(" ").slice(1).join(" ")||"Customer"),phone=clean(body.passengerPhone||body.phone||req.user.phone||"");if(!phone)return null;return Customer.create({tenantId:tenantIdOf(req),user:req.user._id,firstName,lastName,email:clean(body.passengerEmail||body.email||req.user.email),phone,createdBy:req.user._id,updatedBy:req.user._id});};
// Declare createTransferBooking for use by the surrounding module or function.
export const createTransferBooking=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),transfer=await AirportTransfer.findOne({_id:req.body.transferId,tenantId,status:"active"});if(!transfer)return res.status(404).json({success:false,message:"Transfer service not found."});const passengers=Number(req.body.passengers||1),luggage=Number(req.body.luggage||0),pickupDateTime=new Date(req.body.pickupDateTime);if(passengers<1||passengers>transfer.passengerCapacity||luggage>transfer.luggageCapacity)return res.status(400).json({success:false,message:"Passenger or luggage count exceeds vehicle capacity."});if(Number.isNaN(pickupDateTime.getTime()))return res.status(400).json({success:false,message:"A valid pickup date and time are required."});const customer=await resolveCustomer(req,req.body);if(req.user?.role==="customer"&&!customer)return res.status(400).json({success:false,message:"A passenger phone number is required to complete the booking."});const subtotal=transfer.pricingModel==="per_passenger"?Number(transfer.price||0)*passengers:Number(transfer.price||0),taxes=Number(req.body.taxes||0),fees=Number(req.body.fees||0);const booking=await AirportTransferBooking.create({tenantId,reference:ref(),transfer:transfer._id,customer:customer?._id||null,user:req.user?._id||null,linkedBooking:req.body.linkedBooking||null,pickupDateTime,pickupLocation:clean(req.body.pickupLocation||transfer.pickupLocation),dropoffLocation:clean(req.body.dropoffLocation||transfer.dropoffLocation),flightNumber:clean(req.body.flightNumber),airline:clean(req.body.airline),terminal:clean(req.body.terminal),passengerName:clean(req.body.passengerName),passengerPhone:clean(req.body.passengerPhone),passengerEmail:clean(req.body.passengerEmail),passengers,luggage,specialRequests:clean(req.body.specialRequests),status:"pending",paymentStatus:"pending",subtotal,taxes,fees,totalAmount:subtotal+taxes+fees,currency:transfer.currency||"KES",source:req.body.source||"website",notes:clean(req.body.notes),createdBy:req.user?._id||null,updatedBy:req.user?._id||null});res.status(201).json({success:true,data:booking});}catch(e){next(e);}};
// Declare listTransferBookings for use by the surrounding module or function.
export const listTransferBookings=async(req,res,next)=>{try{const role=roleOf(req);if(role!=="customer"&&!staffRoles.has(role))return res.status(403).json({success:false,message:"Not allowed."});const tenantId=tenantIdOf(req);if(!tenantId)return res.status(400).json({success:false,message:"Tenant context is required for hospitality operations."});const filter={tenantId};if(req.query.status)filter.status=req.query.status;if(role==="customer")filter.user=req.user._id;const rows=await AirportTransferBooking.find(filter).sort({pickupDateTime:1,createdAt:-1}).lean();if(!rows.length)return res.json({success:true,data:[]});const transferIds=[...new Set(rows.map(row=>String(row.transfer)).filter(Boolean))];const transfers=transferIds.length?await AirportTransfer.find({tenantId,_id:{$in:transferIds}}).select("name airportName airportCode vehicleType").lean():[];const transferMap=new Map(transfers.map(item=>[String(item._id),item]));res.json({success:true,data:rows.map(row=>({...row,transfer:transferMap.get(String(row.transfer))||null}))});}catch(e){next(e);}};
// Declare TRANSFER_STATUS_TRANSITIONS for use by the surrounding module or function.
const TRANSFER_STATUS_TRANSITIONS = {
  pending: new Set(["confirmed", "cancelled", "no_show"]),
  confirmed: new Set(["assigned", "cancelled", "no_show"]),
  assigned: new Set(["driver_en_route", "cancelled", "no_show"]),
  driver_en_route: new Set(["picked_up", "cancelled", "no_show"]),
  picked_up: new Set(["completed", "cancelled"]),
  completed: new Set([]),
  cancelled: new Set([]),
  no_show: new Set([]),
};

// Declare updateTransferBooking for use by the surrounding module or function.
export const updateTransferBooking=async(req,res,next)=>{try{
  // Declare tenantId for use by the surrounding module or function.
  const tenantId=tenantIdOf(req);
  // Declare booking for use by the surrounding module or function.
  const booking=await AirportTransferBooking.findOne({_id:req.params.id,tenantId});
  // Check the condition (!booking) and run the matching branch.
  if(!booking)return res.status(404).json({success:false,message:"Transfer booking not found."});

  // Declare role for use by the surrounding module or function.
  const role=roleOf(req);
  // Declare isCustomer for use by the surrounding module or function.
  const isCustomer=role==="customer";
  // Check the condition (isCustomer&&String(booking.user)!==String(req.user._id)) and run the matching branch.
  if(isCustomer&&String(booking.user)!==String(req.user._id))return res.status(403).json({success:false,message:"Not allowed."});
  // Check the condition (!isCustomer&&!staffRoles.has(role)) and run the matching branch.
  if(!isCustomer&&!staffRoles.has(role))return res.status(403).json({success:false,message:"Only authorized booking operations staff may modify this reservation."});

  // Declare requestedKeys for use by the surrounding module or function.
  const requestedKeys=Object.keys(req.body||{});
  // Check the condition (isCustomer&&requestedKeys.some(key=>key!=="specialRequests")) and run the matching branch.
  if(isCustomer&&requestedKeys.some(key=>key!=="specialRequests")){
    // Return the result of res.status(403).json() to the caller.
    return res.status(403).json({success:false,message:"Customers may only update special requests on an existing reservation."});
  }

  // Check the condition (req.body.status!==undefined) and run the matching branch.
  if(req.body.status!==undefined){
    // Check the condition (isCustomer) and run the matching branch.
    if(isCustomer)return res.status(403).json({success:false,message:"Customers cannot change transfer status."});
    // Declare nextStatus for use by the surrounding module or function.
    const nextStatus=clean(req.body.status).toLowerCase();
    // Declare allowed for use by the surrounding module or function.
    const allowed=TRANSFER_STATUS_TRANSITIONS[booking.status]||new Set();
    // Check the condition (!allowed.has(nextStatus)) and run the matching branch.
    if(!allowed.has(nextStatus))return res.status(409).json({success:false,message:`Invalid transfer status transition: ${booking.status} → ${nextStatus}.`});
    // Perform the side effect or state update expressed on the following line.
    booking.status=nextStatus;
  }

  // Check the condition (req.body.assignedVehicle!==undefined||req.body.assignedDriver!==undefi) and run the matching branch.
  if(req.body.assignedVehicle!==undefined||req.body.assignedDriver!==undefined){
    // Check the condition (isCustomer) and run the matching branch.
    if(isCustomer)return res.status(403).json({success:false,message:"Customers cannot assign operational resources."});
    // Declare {default:Vehicle} for use by the surrounding module or function.
    const {default:Vehicle}=await import("../models/Vehicle.js");
    // Declare {default:User} for use by the surrounding module or function.
    const {default:User}=await import("../models/User.js");

    // Check the condition (req.body.assignedVehicle!==undefined) and run the matching branch.
    if(req.body.assignedVehicle!==undefined){
      // Declare vehicleId for use by the surrounding module or function.
      const vehicleId=req.body.assignedVehicle||null;
      // Check the condition (vehicleId) and run the matching branch.
      if(vehicleId){
        // Check the condition (!mongoose.isValidObjectId(vehicleId)) and run the matching branch.
        if(!mongoose.isValidObjectId(vehicleId))return res.status(400).json({success:false,message:"Invalid vehicle ID."});
        // Declare vehicle for use by the surrounding module or function.
        const vehicle=await Vehicle.findOne({tenantId,_id:vehicleId,isActive:true,isDeleted:{$ne:true},status:{$nin:["maintenance","out_of_service"]}}).lean();
        // Check the condition (!vehicle) and run the matching branch.
        if(!vehicle)return res.status(409).json({success:false,message:"Selected vehicle is unavailable or does not belong to this tenant."});
        // Declare conflict for use by the surrounding module or function.
        const conflict=await AirportTransferBooking.findOne({tenantId,_id:{$ne:booking._id},assignedVehicle:vehicleId,pickupDateTime:{$gte:new Date(new Date(booking.pickupDateTime).getTime()-2*60*60*1000),$lte:new Date(new Date(booking.pickupDateTime).getTime()+2*60*60*1000)},status:{$nin:["cancelled","completed","no_show"]}}).select("reference pickupDateTime status").lean();
        // Check the condition (conflict) and run the matching branch.
        if(conflict)return res.status(409).json({success:false,message:`Vehicle is already assigned to transfer ${conflict.reference||conflict._id} near this pickup time.`});
      }
      // Perform the side effect or state update expressed on the following line.
      booking.assignedVehicle=vehicleId;
    }

    // Check the condition (req.body.assignedDriver!==undefined) and run the matching branch.
    if(req.body.assignedDriver!==undefined){
      // Declare driverId for use by the surrounding module or function.
      const driverId=req.body.assignedDriver||null;
      // Check the condition (driverId) and run the matching branch.
      if(driverId){
        // Check the condition (!mongoose.isValidObjectId(driverId)) and run the matching branch.
        if(!mongoose.isValidObjectId(driverId))return res.status(400).json({success:false,message:"Invalid driver ID."});
        // Declare driver for use by the surrounding module or function.
        const driver=await User.findOne({tenantId,_id:driverId,isActive:true,role:{$in:["driver","admin","manager","tour_manager","tourmanager"]}}).select("_id role").lean();
        // Check the condition (!driver) and run the matching branch.
        if(!driver)return res.status(409).json({success:false,message:"Selected driver is unavailable or does not belong to this tenant."});
        // Declare conflict for use by the surrounding module or function.
        const conflict=await AirportTransferBooking.findOne({tenantId,_id:{$ne:booking._id},assignedDriver:driverId,pickupDateTime:{$gte:new Date(new Date(booking.pickupDateTime).getTime()-2*60*60*1000),$lte:new Date(new Date(booking.pickupDateTime).getTime()+2*60*60*1000)},status:{$nin:["cancelled","completed","no_show"]}}).select("reference pickupDateTime status").lean();
        // Check the condition (conflict) and run the matching branch.
        if(conflict)return res.status(409).json({success:false,message:`Driver is already assigned to transfer ${conflict.reference||conflict._id} near this pickup time.`});
      }
      // Perform the side effect or state update expressed on the following line.
      booking.assignedDriver=driverId;
    }
  }

  // Check the condition (req.body.specialRequests!==undefined) and run the matching branch.
  if(req.body.specialRequests!==undefined)booking.specialRequests=clean(req.body.specialRequests);
  // Check the condition (req.body.notes!==undefined) and run the matching branch.
  if(req.body.notes!==undefined){
    // Check the condition (isCustomer) and run the matching branch.
    if(isCustomer)return res.status(403).json({success:false,message:"Customers cannot modify internal transfer notes."});
    // Perform the side effect or state update expressed on the following line.
    booking.notes=clean(req.body.notes);
  }

  // Perform the side effect or state update expressed on the following line.
  booking.updatedBy=req.user?._id||null;
  // Perform the side effect or state update expressed on the following line.
  await booking.save();
  // Perform the side effect or state update expressed on the following line.
  res.json({success:true,data:booking});
}catch(e){next(e);}};
