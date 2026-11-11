/**
 * Purpose: mpesa Controller HTTP controller. Main declarations: getMpesaToken, stkPush, mpesaCallback, checkTransactionStatus, getBookingPayments.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ../services/mpesaService.js so this module can use its exported dependencies.
import { initiateStkPush, generateAccessToken, normalizePhoneNumber } from "../services/mpesaService.js";
// Load ../services/paymentLifecycleService.js so this module can use its exported dependencies.
import { failBookingPayment, completeBookingPayment, getPayableBookingAmount } from "../services/paymentLifecycleService.js";
// Load ../services/hospitalityPaymentLifecycleService.js so this module can use its exported dependencies.
import { getHospitalityModel, failHospitalityPayment, completeHospitalityPayment } from "../services/hospitalityPaymentLifecycleService.js";
// Load ../services/mpesaCallbackPayload.js so this module can use its exported dependencies.
import { evaluateStkPaymentCallback, getCheckoutRequestId, getStkCallback } from "../services/mpesaCallbackPayload.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ../services/paymentGatewayService.js so this module can use its exported dependencies.
import { getTenantMpesaConfig } from "../services/paymentGatewayService.js";
// Load ../utils/bookingPaymentAccess.js so this module can use its exported dependencies.
import { canAccessBookingPayment } from "../utils/bookingPaymentAccess.js";
// Load ../utils/mpesaPaymentAmount.js so this module can use its exported dependencies.
import { resolveMpesaPaymentAmount } from "../utils/mpesaPaymentAmount.js";

// Declare getMpesaToken for use by the surrounding module or function.
export const getMpesaToken = async (req, res) => res.status(501).json({ success: false, message: "Direct M-Pesa token access is disabled." });

// Declare stkPush for use by the surrounding module or function.
export const stkPush = async (req, res) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare payment for use by the surrounding module or function.
  let payment;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantSettings for use by the surrounding module or function.
    const tenantSettings = await getSystemSettings(req);
    // Check the condition (tenantSettings.enableMpesa === false) and run the matching branch.
    if (tenantSettings.enableMpesa === false) return res.status(409).json({ success: false, message: "M-Pesa is disabled for this tenant." });
    // Declare { phoneNumber, phone, bookingId } for use by the surrounding module or function.
    const { phoneNumber, phone, bookingId } = req.body || {};
    // Check the condition (!bookingId || !(phoneNumber || phone)) and run the matching branch.
    if (!bookingId || !(phoneNumber || phone)) return res.status(400).json({ success: false, message: "Phone number and booking ID are required." });
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(mergeTenantFilter({ _id: bookingId }));
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    // Check the condition (!canAccessBookingPayment(booking, req.user)) and run the matching branch.
    if (!canAccessBookingPayment(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to pay this booking." });
    // Declare payableAmount for use by the surrounding module or function.
    const payableAmount = Number(getPayableBookingAmount(booking));
    // Check the condition (!Number.isFinite(payableAmount) || payableAmount <= 0) and run the matching branch.
    if (!Number.isFinite(payableAmount) || payableAmount <= 0) return res.status(400).json({ success: false, message: "This booking has no outstanding balance." });
    // Declare paymentAmount for use by the surrounding module or function.
    const paymentAmount = resolveMpesaPaymentAmount(req.body?.amount, payableAmount);
    // Declare existingPayment for use by the surrounding module or function.
    const existingPayment = await Payment.findOne(mergeTenantFilter({ booking: booking._id, provider: "MPESA", status: { $in: ["pending", "processing"] } }));
    // Check the condition (existingPayment) and run the matching branch.
    if (existingPayment) {
      // Check the condition (!existingPayment.checkoutRequestID && !existingPayment.checkoutRequest) and run the matching branch.
      if (!existingPayment.checkoutRequestID && !existingPayment.checkoutRequestId) return res.status(202).json({ success: true, message: "M-Pesa request status is uncertain. Do not retry until an administrator reconciles this attempt.", data: { amount: existingPayment.amount, status: existingPayment.status } });
      // Return the result of res.status(200).json() to the caller.
      return res.status(200).json({ success: true, message: "A payment request is already waiting for confirmation.", data: { CheckoutRequestID: existingPayment.checkoutRequestID || existingPayment.checkoutRequestId, checkoutRequestID: existingPayment.checkoutRequestID || existingPayment.checkoutRequestId, amount: existingPayment.amount, status: existingPayment.status } });
    }
    // Validate before creating a processing attempt so invalid input cannot
    // leave a stuck payment that blocks a later valid retry.
    // Declare customerPhone for use by the surrounding module or function.
    const customerPhone = normalizePhoneNumber(phoneNumber || phone || booking?.contact?.phone || booking?.customerSnapshot?.phone || req.user?.phone);
    // Declare gateway for use by the surrounding module or function.
    const gateway = await getTenantMpesaConfig();
    // Perform the side effect or state update expressed on the following line.
    await generateAccessToken(gateway);
    // Perform the side effect or state update expressed on the following line.
    payment = await Payment.create({ tenantId: booking.tenantId, booking: booking._id, user: booking.user || booking.customer || req.user._id, customer: booking.user || booking.customer || req.user._id, provider: "MPESA", method: "mpesa", paymentMethod: "MPESA", amount: paymentAmount, currency: String(tenantSettings.currency || "KES").toUpperCase(), phoneNumber: customerPhone, providerEnvironment: gateway.environment, status: "processing", activeAttempt: true, notes: "M-Pesa STK Push request pending." });
    // Declare response for use by the surrounding module or function.
    const response = await initiateStkPush({ phone: customerPhone, amount: paymentAmount, bookingId: booking._id.toString(), config: gateway, companyName: tenantSettings.companyName });
    // Perform the side effect or state update expressed on the following line.
    payment.merchantRequestID = response.MerchantRequestID;
    // Perform the side effect or state update expressed on the following line.
    payment.checkoutRequestID = response.CheckoutRequestID;
    // Perform the side effect or state update expressed on the following line.
    payment.status = "pending";
    // Perform the side effect or state update expressed on the following line.
    await payment.save();
    // Perform the side effect or state update expressed on the following line.
    booking.paymentMethod = "MPESA";
    // Perform the side effect or state update expressed on the following line.
    booking.paymentStatus = "pending";
    // Perform the side effect or state update expressed on the following line.
    await booking.save();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "M-Pesa prompt sent. Waiting for payment confirmation.", data: { CheckoutRequestID: response.CheckoutRequestID, MerchantRequestID: response.MerchantRequestID, amount: paymentAmount, status: "pending" } });
  } catch (error) {
    // Check the condition (error?.code === 11000 && !payment) and run the matching branch.
    if (error?.code === 11000 && !payment) return res.status(409).json({ success: false, message: "A M-Pesa payment attempt is already being processed for this booking." });
    // Check the condition (payment && error?.code === "MPESA_PROVIDER_REJECTED") and run the matching branch.
    if (payment && error?.code === "MPESA_PROVIDER_REJECTED") {
      // Perform the side effect or state update expressed on the following line.
      payment.status = "failed";
      // Perform the side effect or state update expressed on the following line.
      payment.failureReason = "Daraja rejected the STK Push request.";
      // Perform the side effect or state update expressed on the following line.
      payment.failedAt = new Date();
      // Perform the side effect or state update expressed on the following line.
      await payment.save().catch(() => {});
    }
    // Perform the side effect or state update expressed on the following line.
    console.error("STK PUSH ERROR:", { status: error?.status || 500, code: error?.code || "MPESA_REQUEST_FAILED" });
    // Return the result of res.status(error?.status || 500).json() to the caller.
    return res.status(error?.status || 500).json({ success: false, message: publicErrorMessage(error, "M-Pesa STK Push failed") });
  }
};

// Declare mpesaCallback for use by the surrounding module or function.
export const mpesaCallback = async (req,res) => { try { const stkCallback=getStkCallback(req.body); if(!stkCallback)return res.json({ResultCode:0,ResultDesc:"Accepted"}); const checkoutRequestID=getCheckoutRequestId(stkCallback); if(!checkoutRequestID)return res.json({ResultCode:0,ResultDesc:"Accepted"}); const payment=await Payment.findOne(mergeTenantFilter(req,{$or:[{checkoutRequestID},{checkoutRequestId:checkoutRequestID}]})); if(!payment)return res.json({ResultCode:0,ResultDesc:"Accepted"}); if(["completed","failed","cancelled","refunded"].includes(String(payment.status).toLowerCase()))return res.json({ResultCode:0,ResultDesc:"Already processed"}); const callback=evaluateStkPaymentCallback(stkCallback,payment.amount); const {paidAmount,receiptNumber:mpesaReceiptNumber}=callback;
    // Check the condition (payment.hospitalityBooking && payment.hospitalityType) and run the matching branch.
    if(payment.hospitalityBooking && payment.hospitalityType){ const Model=getHospitalityModel(payment.hospitalityType); const booking=Model?await Model.findOne({tenantId:payment.tenantId,_id:payment.hospitalityBooking}):null; if(!booking)return res.json({ResultCode:0,ResultDesc:"Accepted"}); if(callback.state==="provider_failed"){await failHospitalityPayment({payment,booking,reason:callback.reason,paymentData:{checkoutRequestID,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="invalid_amount"){await failHospitalityPayment({payment,booking,reason:callback.reason,paymentData:{callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="amount_mismatch"){await failHospitalityPayment({payment,booking,reason:callback.reason,paymentData:{amount:paidAmount,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="missing_receipt"){await failHospitalityPayment({payment,booking,reason:callback.reason,paymentData:{amount:paidAmount,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} await completeHospitalityPayment({payment,booking,paymentData:{amount:paidAmount,phoneNumber:callback.phoneNumber||payment.phoneNumber||"",mpesaReceiptNumber,merchantRequestID:stkCallback.MerchantRequestID||stkCallback.merchantRequestID||payment.merchantRequestID||"",checkoutRequestID,transactionDate:callback.transactionDate,paymentMethod:"MPESA",callbackResponse:stkCallback}}); return res.json({ResultCode:0,ResultDesc:"Accepted"}); }
    // Declare booking for use by the surrounding module or function.
    const booking=await Booking.findOne(mergeTenantFilter(req,{_id:payment.booking})); if(!booking)return res.json({ResultCode:0,ResultDesc:"Accepted"}); if(callback.state==="provider_failed"){await failBookingPayment({payment,booking,failureReason:callback.reason,paymentData:{checkoutRequestID,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="invalid_amount"){await failBookingPayment({payment,booking,failureReason:callback.reason,paymentData:{callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="amount_mismatch"){await failBookingPayment({payment,booking,failureReason:callback.reason,paymentData:{amount:paidAmount,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="missing_receipt"){await failBookingPayment({payment,booking,failureReason:callback.reason,paymentData:{amount:paidAmount,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} const lifecycleResult=await completeBookingPayment({payment,booking,paymentData:{amount:paidAmount,phoneNumber:callback.phoneNumber||payment.phoneNumber||"",mpesaReceiptNumber,merchantRequestID:stkCallback.MerchantRequestID||stkCallback.merchantRequestID||payment.merchantRequestID||"",checkoutRequestID,transactionDate:callback.transactionDate,paymentMethod:"MPESA",callbackResponse:stkCallback}}); try { const managers=await User.find(mergeTenantFilter(req,{$or:[{role:{$in:["admin","super_admin","superadmin","manager","tour_manager","tourmanager"]}},{legacyRole:{$in:["admin","super_admin","superadmin","manager","tour_manager","tourmanager"]}}]})).select("_id"); if(managers.length)await Notification.insertMany(managers.map(manager=>({tenantId:booking.tenantId,recipient:manager._id,user:manager._id,title:lifecycleResult?.booking?.paymentStatus==="paid"?"Booking Fully Paid":"Booking Payment Received",message:`Booking ${booking.bookingNumber||booking._id} received a payment of KES ${paidAmount.toLocaleString()}.`,type:"booking"}))); } catch(notificationError){console.error("M-Pesa notification error:",notificationError.message);} return res.json({ResultCode:0,ResultDesc:"Accepted"}); } catch(error){console.error("MPESA CALLBACK ERROR:",{code:error?.code||"CALLBACK_PROCESSING_FAILED"});return res.json({ResultCode:0,ResultDesc:"Accepted"});} };

// Declare checkTransactionStatus for use by the surrounding module or function.
export const checkTransactionStatus = async(req,res,next)=>{try{const payment=await Payment.findOne(mergeTenantFilter(req,{_id:req.params.id})).populate("booking").populate("user","name email phone").populate("customer","name email phone");if(!payment)return res.status(404).json({success:false,message:"Payment not found"});return res.status(200).json({success:true,payment});}catch(error){next(error);}};
// Declare getBookingPayments for use by the surrounding module or function.
export const getBookingPayments = async(req,res,next)=>{try{const bookingId=req.params.bookingId||req.params.id;const booking=await Booking.findOne(mergeTenantFilter(req,{_id:bookingId}));if(!booking)return res.status(404).json({success:false,message:"Booking not found"});if(!canAccessBookingPayment(booking,req.user))return res.status(403).json({success:false,message:"You do not have permission to view these payments."});const payments=await Payment.find(mergeTenantFilter(req,{booking:booking._id})).populate("user","name email phone").populate("customer","name email phone").sort({createdAt:-1});return res.status(200).json({success:true,count:payments.length,payments});}catch(error){next(error);}};
// Declare getAllPayments for use by the surrounding module or function.
export const getAllPayments = async(req,res,next)=>{try{const {status,provider,page=1,limit=20}=req.query;const filter={};if(status)filter.status=status;if(provider)filter.provider=provider;const safeLimit=Math.min(Math.max(Number(limit)||20,1),100);const safePage=Math.max(Number(page)||1,1);const tenantFilter=mergeTenantFilter(req,filter);const payments=await Payment.find(tenantFilter).populate("booking","bookingNumber status paymentStatus totalAmount amountPaid balanceAmount").populate("user","name email phone").populate("customer","name email phone").sort({createdAt:-1}).skip((safePage-1)*safeLimit).limit(safeLimit);const total=await Payment.countDocuments(tenantFilter);return res.status(200).json({success:true,count:payments.length,pagination:{total,page:safePage,pages:Math.ceil(total/safeLimit)},payments});}catch(error){next(error);}};
// Declare getPaymentByReceipt for use by the surrounding module or function.
export const getPaymentByReceipt=async(req,res,next)=>{try{const payment=await Payment.findOne(mergeTenantFilter(req,{mpesaReceiptNumber:req.params.receipt})).populate("booking").populate("user","name email phone").populate("customer","name email phone");if(!payment)return res.status(404).json({success:false,message:"Payment not found"});return res.status(200).json({success:true,payment});}catch(error){next(error);}};
// Declare handleRefundResult for use by the surrounding module or function.
export const handleRefundResult=async(req,res)=>res.json({ResultCode:0,ResultDesc:"Accepted"});
// Declare handleRefundTimeout for use by the surrounding module or function.
export const handleRefundTimeout=async(req,res)=>res.json({ResultCode:0,ResultDesc:"Accepted"});
// Declare checkCheckoutStatus for use by the surrounding module or function.
export const checkCheckoutStatus=async(req,res,next)=>{try{const checkoutRequestId=String(req.params.checkoutRequestId||"").trim();if(!checkoutRequestId)return res.status(400).json({success:false,message:"Checkout request ID is required"});const payment=await Payment.findOne(mergeTenantFilter(req,{$or:[{checkoutRequestID:checkoutRequestId},{checkoutRequestId}]})).populate("booking").lean();if(!payment)return res.status(404).json({success:false,message:"Payment request not found"});if(!payment.booking)return res.status(404).json({success:false,message:"Booking not found"});if(!canAccessBookingPayment(payment.booking,req.user))return res.status(403).json({success:false,message:"You do not have permission to view this payment."});return res.status(200).json({success:true,data:{status:payment.status,failureReason:payment.failureReason||"",booking:payment.booking,payment}});}catch(error){next(error);}};
// Declare verifyBookingPayment for use by the surrounding module or function.
export const verifyBookingPayment=async(req,res,next)=>{try{const booking=await Booking.findOne(mergeTenantFilter(req,{_id:req.params.bookingId})).lean();if(!booking)return res.status(404).json({success:false,message:"Booking not found"});if(!canAccessBookingPayment(booking,req.user))return res.status(403).json({success:false,message:"You do not have permission to view this booking payment."});const payment=await Payment.findOne(mergeTenantFilter(req,{booking:booking._id})).sort({createdAt:-1}).lean();return res.status(200).json({success:true,data:{booking,payment,paymentStatus:booking.paymentStatus}});}catch(error){next(error);}};
