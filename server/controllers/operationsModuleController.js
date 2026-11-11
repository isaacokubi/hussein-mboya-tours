/**
 * Purpose: operations Module Controller HTTP controller. Main declarations: userId, ok, fail, listSuppliers, createSupplier.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Supplier from "../models/Supplier.js";
// Load ../models/PurchaseOrder.js so this module can use its exported dependencies.
import PurchaseOrder from "../models/PurchaseOrder.js";
// Load ../models/TourCost.js so this module can use its exported dependencies.
import TourCost from "../models/TourCost.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../models/CorporateAccount.js so this module can use its exported dependencies.
import CorporateAccount from "../models/CorporateAccount.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../services/operationsService.js so this module can use its exported dependencies.
import * as operations from "../services/operationsService.js";
// Load ../services/financeLifecycleService.js so this module can use its exported dependencies.
import { postSupplierPayable, postSupplierPayment } from "../services/financeLifecycleService.js";
// Declare userId for use by the surrounding module or function.
const userId = (req) => req.user?._id || req.user?.id || null; const ok=(res,data,status=200)=>res.status(status).json({success:true,data}); const fail=(next,error)=>next(error);
// Declare listSuppliers for use by the surrounding module or function.
export const listSuppliers=async(req,res,next)=>{try{return ok(res,await Supplier.find(tenantFilter(req)).sort({legalName:1}).lean());}catch(e){return fail(next,e);}};
// Declare createSupplier for use by the surrounding module or function.
export const createSupplier=async(req,res,next)=>{try{return ok(res,await operations.createSupplier(req.body,userId(req)),201);}catch(e){return fail(next,e);}};
// Declare updateSupplier for use by the surrounding module or function.
export const updateSupplier=async(req,res,next)=>{try{const supplier=await Supplier.findOneAndUpdate({...tenantFilter(req),_id:req.params.id},{...req.body,updatedBy:userId(req)},{new:true,runValidators:true});if(!supplier)return res.status(404).json({success:false,message:"Supplier not found."});return ok(res,supplier);}catch(e){return fail(next,e);}};
// Declare listPurchaseOrders for use by the surrounding module or function.
export const listPurchaseOrders=async(req,res,next)=>{try{return ok(res,await PurchaseOrder.find(tenantFilter(req)).populate("supplier","legalName supplierNumber").populate("tour","title").sort({createdAt:-1}).lean());}catch(e){return fail(next,e);}};
// Declare createPurchaseOrder for use by the surrounding module or function.
export const createPurchaseOrder=async(req,res,next)=>{try{return ok(res,await operations.createPurchaseOrder(req.body,userId(req)),201);}catch(e){return fail(next,e);}};
// Declare transitionPurchaseOrder for use by the surrounding module or function.
export const transitionPurchaseOrder=async(req,res,next)=>{try{return ok(res,await operations.transitionPurchaseOrder(req.params.id,req.body.status,userId(req)));}catch(e){return fail(next,e);}};
// Declare listTourCosts for use by the surrounding module or function.
export const listTourCosts=async(req,res,next)=>{try{const filter=tenantFilter(req);if(req.query.tour)filter.tour=req.query.tour;if(req.query.booking)filter.booking=req.query.booking;return ok(res,await TourCost.find(filter).populate("supplier","legalName").populate("purchaseOrder","poNumber").sort({costDate:-1}).lean());}catch(e){return fail(next,e);}};
// Declare createTourCost for use by the surrounding module or function.
export const createTourCost=async(req,res,next)=>{try{return ok(res,await operations.createTourCost(req.body,userId(req)),201);}catch(e){return fail(next,e);}};
// Declare tourProfitability for use by the surrounding module or function.
export const tourProfitability=async(req,res,next)=>{try{return ok(res,await operations.getTourProfitability(req.params.tourId));}catch(e){return fail(next,e);}};
// Declare listSupplierPayables for use by the surrounding module or function.
export const listSupplierPayables=async(req,res,next)=>{try{return ok(res,await SupplierPayable.find(tenantFilter(req)).populate("supplier","legalName").sort({dueDate:1,createdAt:-1}).lean());}catch(e){return fail(next,e);}};
// Declare createSupplierPayable for use by the surrounding module or function.
export const createSupplierPayable=async(req,res,next)=>{try{const payable=await operations.createSupplierPayable(req.body,userId(req));await postSupplierPayable(payable);return ok(res,payable,201);}catch(e){return fail(next,e);}};
// Declare paySupplierPayable for use by the surrounding module or function.
export const paySupplierPayable=async(req,res,next)=>{try{const amount=Number(req.body.amount);const before=await SupplierPayable.findOne(tenantFilter(req,{_id:req.params.id}));if(!before)return res.status(404).json({success:false,message:"Supplier payable not found."});const payable=await operations.paySupplierPayable(req.params.id,amount,req.body.paymentReference);await postSupplierPayment({payable,amount,paymentReference:req.body.paymentReference});return ok(res,payable);}catch(e){return fail(next,e);}};
// Declare listCorporateAccounts for use by the surrounding module or function.
export const listCorporateAccounts=async(req,res,next)=>{try{return ok(res,await CorporateAccount.find(tenantFilter(req)).sort({companyName:1}).lean());}catch(e){return fail(next,e);}};
// Declare createCorporateAccount for use by the surrounding module or function.
export const createCorporateAccount=async(req,res,next)=>{try{return ok(res,await operations.createCorporateAccount(req.body,userId(req)),201);}catch(e){return fail(next,e);}};
// Declare reconcileCorporateAccount for use by the surrounding module or function.
export const reconcileCorporateAccount=async(req,res,next)=>{try{return ok(res,await operations.reconcileCorporateAccountBalance(req.params.id));}catch(e){return fail(next,e);}};
// Declare resourceConflicts for use by the surrounding module or function.
export const resourceConflicts=async(req,res,next)=>{try{return ok(res,await operations.getResourceConflicts(req.query));}catch(e){return fail(next,e);}};
