/**
 * Purpose: accommodation Inventory Controller HTTP controller. Main declarations: uid, listAccommodationInventory, createAccommodationInventory, updateAccommodationInventory.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import AccommodationInventory from "../models/AccommodationInventory.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Declare uid for use by the surrounding module or function.
const uid=req=>req.user?._id||req.user?.id||null;
// Declare listAccommodationInventory for use by the surrounding module or function.
export const listAccommodationInventory=async(req,res,next)=>{try{return res.json({success:true,data:await AccommodationInventory.find(tenantFilter(req)).sort({propertyName:1,roomType:1}).lean()});}catch(e){return next(e);}};
// Declare createAccommodationInventory for use by the surrounding module or function.
export const createAccommodationInventory=async(req,res,next)=>{try{const total=Math.max(0,Number(req.body.totalRooms||0));const available=Math.min(total,Math.max(0,Number(req.body.availableRooms??total)));const data=await AccommodationInventory.create({...req.body,tenantId:req.tenantId,totalRooms:total,availableRooms:available,createdBy:uid(req),updatedBy:uid(req)});return res.status(201).json({success:true,data});}catch(e){return next(e);}};
// Declare updateAccommodationInventory for use by the surrounding module or function.
export const updateAccommodationInventory=async(req,res,next)=>{try{const data=await AccommodationInventory.findOneAndUpdate({...tenantFilter(req),_id:req.params.id},{...req.body,updatedBy:uid(req)},{new:true,runValidators:true});if(!data)return res.status(404).json({success:false,message:"Accommodation inventory record not found."});if(data.availableRooms>data.totalRooms){data.availableRooms=data.totalRooms;await data.save();}return res.json({success:true,data});}catch(e){return next(e);}};
