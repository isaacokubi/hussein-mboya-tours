import { publicErrorMessage } from "../utils/publicError.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { initiateStkPush, generateAccessToken, normalizePhoneNumber } from "../services/mpesaService.js";
import { failBookingPayment, completeBookingPayment, getPayableBookingAmount } from "../services/paymentLifecycleService.js";
import { getHospitalityModel, failHospitalityPayment, completeHospitalityPayment } from "../services/hospitalityPaymentLifecycleService.js";
import { evaluateStkPaymentCallback, getCheckoutRequestId, getStkCallback } from "../services/mpesaCallbackPayload.js";
import { getSystemSettings } from "../services/settingsService.js";
import { getTenantMpesaConfig } from "../services/paymentGatewayService.js";
import { canAccessBookingPayment } from "../utils/bookingPaymentAccess.js";
import { resolveMpesaPaymentAmount } from "../utils/mpesaPaymentAmount.js";

export const getMpesaToken = async (req, res) => res.status(501).json({ success: false, message: "Direct M-Pesa token access is disabled." });

export const stkPush = async (req, res) => {
  requireTenantId();
  let payment;
  try {
    const tenantSettings = await getSystemSettings(req);
    if (tenantSettings.enableMpesa === false) return res.status(409).json({ success: false, message: "M-Pesa is disabled for this tenant." });
    const { phoneNumber, phone, bookingId } = req.body || {};
    if (!bookingId || !(phoneNumber || phone)) return res.status(400).json({ success: false, message: "Phone number and booking ID are required." });
    const booking = await Booking.findOne(mergeTenantFilter({ _id: bookingId }));
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (!canAccessBookingPayment(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to pay this booking." });
    const payableAmount = Number(getPayableBookingAmount(booking));
    if (!Number.isFinite(payableAmount) || payableAmount <= 0) return res.status(400).json({ success: false, message: "This booking has no outstanding balance." });
    const paymentAmount = resolveMpesaPaymentAmount(req.body?.amount, payableAmount);
    const existingPayment = await Payment.findOne(mergeTenantFilter({ booking: booking._id, provider: "MPESA", status: { $in: ["pending", "processing"] } }));
    if (existingPayment) {
      if (!existingPayment.checkoutRequestID && !existingPayment.checkoutRequestId) return res.status(202).json({ success: true, message: "M-Pesa request status is uncertain. Do not retry until an administrator reconciles this attempt.", data: { amount: existingPayment.amount, status: existingPayment.status } });
      return res.status(200).json({ success: true, message: "A payment request is already waiting for confirmation.", data: { CheckoutRequestID: existingPayment.checkoutRequestID || existingPayment.checkoutRequestId, checkoutRequestID: existingPayment.checkoutRequestID || existingPayment.checkoutRequestId, amount: existingPayment.amount, status: existingPayment.status } });
    }
    // Validate before creating a processing attempt so invalid input cannot
    // leave a stuck payment that blocks a later valid retry.
    const customerPhone = normalizePhoneNumber(phoneNumber || phone || booking?.contact?.phone || booking?.customerSnapshot?.phone || req.user?.phone);
    const gateway = await getTenantMpesaConfig();
    await generateAccessToken(gateway);
    payment = await Payment.create({ tenantId: booking.tenantId, booking: booking._id, user: booking.user || booking.customer || req.user._id, customer: booking.user || booking.customer || req.user._id, provider: "MPESA", method: "mpesa", paymentMethod: "MPESA", amount: paymentAmount, currency: String(tenantSettings.currency || "KES").toUpperCase(), phoneNumber: customerPhone, providerEnvironment: gateway.environment, status: "processing", activeAttempt: true, notes: "M-Pesa STK Push request pending." });
    const response = await initiateStkPush({ phone: customerPhone, amount: paymentAmount, bookingId: booking._id.toString(), config: gateway, companyName: tenantSettings.companyName });
    payment.merchantRequestID = response.MerchantRequestID;
    payment.checkoutRequestID = response.CheckoutRequestID;
    payment.status = "pending";
    await payment.save();
    booking.paymentMethod = "MPESA";
    booking.paymentStatus = "pending";
    await booking.save();
    return res.status(200).json({ success: true, message: "M-Pesa prompt sent. Waiting for payment confirmation.", data: { CheckoutRequestID: response.CheckoutRequestID, MerchantRequestID: response.MerchantRequestID, amount: paymentAmount, status: "pending" } });
  } catch (error) {
    if (error?.code === 11000 && !payment) return res.status(409).json({ success: false, message: "A M-Pesa payment attempt is already being processed for this booking." });
    if (payment && error?.code === "MPESA_PROVIDER_REJECTED") {
      payment.status = "failed";
      payment.failureReason = "Daraja rejected the STK Push request.";
      payment.failedAt = new Date();
      await payment.save().catch(() => {});
    }
    console.error("STK PUSH ERROR:", { status: error?.status || 500, code: error?.code || "MPESA_REQUEST_FAILED" });
    return res.status(error?.status || 500).json({ success: false, message: publicErrorMessage(error, "M-Pesa STK Push failed") });
  }
};

export const mpesaCallback = async (req,res) => { try { const stkCallback=getStkCallback(req.body); if(!stkCallback)return res.json({ResultCode:0,ResultDesc:"Accepted"}); const checkoutRequestID=getCheckoutRequestId(stkCallback); if(!checkoutRequestID)return res.json({ResultCode:0,ResultDesc:"Accepted"}); const payment=await Payment.findOne(mergeTenantFilter(req,{$or:[{checkoutRequestID},{checkoutRequestId:checkoutRequestID}]})); if(!payment)return res.json({ResultCode:0,ResultDesc:"Accepted"}); if(["completed","failed","cancelled","refunded"].includes(String(payment.status).toLowerCase()))return res.json({ResultCode:0,ResultDesc:"Already processed"}); const callback=evaluateStkPaymentCallback(stkCallback,payment.amount); const {paidAmount,receiptNumber:mpesaReceiptNumber}=callback;
    if(payment.hospitalityBooking && payment.hospitalityType){ const Model=getHospitalityModel(payment.hospitalityType); const booking=Model?await Model.findOne({tenantId:payment.tenantId,_id:payment.hospitalityBooking}):null; if(!booking)return res.json({ResultCode:0,ResultDesc:"Accepted"}); if(callback.state==="provider_failed"){await failHospitalityPayment({payment,booking,reason:callback.reason,paymentData:{checkoutRequestID,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="invalid_amount"){await failHospitalityPayment({payment,booking,reason:callback.reason,paymentData:{callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="amount_mismatch"){await failHospitalityPayment({payment,booking,reason:callback.reason,paymentData:{amount:paidAmount,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="missing_receipt"){await failHospitalityPayment({payment,booking,reason:callback.reason,paymentData:{amount:paidAmount,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} await completeHospitalityPayment({payment,booking,paymentData:{amount:paidAmount,phoneNumber:callback.phoneNumber||payment.phoneNumber||"",mpesaReceiptNumber,merchantRequestID:stkCallback.MerchantRequestID||stkCallback.merchantRequestID||payment.merchantRequestID||"",checkoutRequestID,transactionDate:callback.transactionDate,paymentMethod:"MPESA",callbackResponse:stkCallback}}); return res.json({ResultCode:0,ResultDesc:"Accepted"}); }
    const booking=await Booking.findOne(mergeTenantFilter(req,{_id:payment.booking})); if(!booking)return res.json({ResultCode:0,ResultDesc:"Accepted"}); if(callback.state==="provider_failed"){await failBookingPayment({payment,booking,failureReason:callback.reason,paymentData:{checkoutRequestID,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="invalid_amount"){await failBookingPayment({payment,booking,failureReason:callback.reason,paymentData:{callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="amount_mismatch"){await failBookingPayment({payment,booking,failureReason:callback.reason,paymentData:{amount:paidAmount,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} if(callback.state==="missing_receipt"){await failBookingPayment({payment,booking,failureReason:callback.reason,paymentData:{amount:paidAmount,callbackResponse:stkCallback}});return res.json({ResultCode:0,ResultDesc:"Accepted"});} const lifecycleResult=await completeBookingPayment({payment,booking,paymentData:{amount:paidAmount,phoneNumber:callback.phoneNumber||payment.phoneNumber||"",mpesaReceiptNumber,merchantRequestID:stkCallback.MerchantRequestID||stkCallback.merchantRequestID||payment.merchantRequestID||"",checkoutRequestID,transactionDate:callback.transactionDate,paymentMethod:"MPESA",callbackResponse:stkCallback}}); try { const managers=await User.find(mergeTenantFilter(req,{$or:[{role:{$in:["admin","super_admin","superadmin","manager","tour_manager","tourmanager"]}},{legacyRole:{$in:["admin","super_admin","superadmin","manager","tour_manager","tourmanager"]}}]})).select("_id"); if(managers.length)await Notification.insertMany(managers.map(manager=>({tenantId:booking.tenantId,recipient:manager._id,user:manager._id,title:lifecycleResult?.booking?.paymentStatus==="paid"?"Booking Fully Paid":"Booking Payment Received",message:`Booking ${booking.bookingNumber||booking._id} received a payment of KES ${paidAmount.toLocaleString()}.`,type:"booking"}))); } catch(notificationError){console.error("M-Pesa notification error:",notificationError.message);} return res.json({ResultCode:0,ResultDesc:"Accepted"}); } catch(error){console.error("MPESA CALLBACK ERROR:",{code:error?.code||"CALLBACK_PROCESSING_FAILED"});return res.json({ResultCode:0,ResultDesc:"Accepted"});} };

export const checkTransactionStatus = async(req,res,next)=>{try{const payment=await Payment.findOne(mergeTenantFilter(req,{_id:req.params.id})).populate("booking").populate("user","name email phone").populate("customer","name email phone");if(!payment)return res.status(404).json({success:false,message:"Payment not found"});return res.status(200).json({success:true,payment});}catch(error){next(error);}};
export const getBookingPayments = async(req,res,next)=>{try{const bookingId=req.params.bookingId||req.params.id;const booking=await Booking.findOne(mergeTenantFilter(req,{_id:bookingId}));if(!booking)return res.status(404).json({success:false,message:"Booking not found"});if(!canAccessBookingPayment(booking,req.user))return res.status(403).json({success:false,message:"You do not have permission to view these payments."});const payments=await Payment.find(mergeTenantFilter(req,{booking:booking._id})).populate("user","name email phone").populate("customer","name email phone").sort({createdAt:-1});return res.status(200).json({success:true,count:payments.length,payments});}catch(error){next(error);}};
export const getAllPayments = async(req,res,next)=>{try{const {status,provider,page=1,limit=20}=req.query;const filter={};if(status)filter.status=status;if(provider)filter.provider=provider;const safeLimit=Math.min(Math.max(Number(limit)||20,1),100);const safePage=Math.max(Number(page)||1,1);const tenantFilter=mergeTenantFilter(req,filter);const payments=await Payment.find(tenantFilter).populate("booking","bookingNumber status paymentStatus totalAmount amountPaid balanceAmount").populate("user","name email phone").populate("customer","name email phone").sort({createdAt:-1}).skip((safePage-1)*safeLimit).limit(safeLimit);const total=await Payment.countDocuments(tenantFilter);return res.status(200).json({success:true,count:payments.length,pagination:{total,page:safePage,pages:Math.ceil(total/safeLimit)},payments});}catch(error){next(error);}};
export const getPaymentByReceipt=async(req,res,next)=>{try{const payment=await Payment.findOne(mergeTenantFilter(req,{mpesaReceiptNumber:req.params.receipt})).populate("booking").populate("user","name email phone").populate("customer","name email phone");if(!payment)return res.status(404).json({success:false,message:"Payment not found"});return res.status(200).json({success:true,payment});}catch(error){next(error);}};
export const handleRefundResult=async(req,res)=>res.json({ResultCode:0,ResultDesc:"Accepted"});
export const handleRefundTimeout=async(req,res)=>res.json({ResultCode:0,ResultDesc:"Accepted"});
export const checkCheckoutStatus=async(req,res,next)=>{try{const checkoutRequestId=String(req.params.checkoutRequestId||"").trim();if(!checkoutRequestId)return res.status(400).json({success:false,message:"Checkout request ID is required"});const payment=await Payment.findOne(mergeTenantFilter(req,{$or:[{checkoutRequestID:checkoutRequestId},{checkoutRequestId}]})).populate("booking").lean();if(!payment)return res.status(404).json({success:false,message:"Payment request not found"});if(!payment.booking)return res.status(404).json({success:false,message:"Booking not found"});if(!canAccessBookingPayment(payment.booking,req.user))return res.status(403).json({success:false,message:"You do not have permission to view this payment."});return res.status(200).json({success:true,data:{status:payment.status,failureReason:payment.failureReason||"",booking:payment.booking,payment}});}catch(error){next(error);}};
export const verifyBookingPayment=async(req,res,next)=>{try{const booking=await Booking.findOne(mergeTenantFilter(req,{_id:req.params.bookingId})).lean();if(!booking)return res.status(404).json({success:false,message:"Booking not found"});if(!canAccessBookingPayment(booking,req.user))return res.status(403).json({success:false,message:"You do not have permission to view this booking payment."});const payment=await Payment.findOne(mergeTenantFilter(req,{booking:booking._id})).sort({createdAt:-1}).lean();return res.status(200).json({success:true,data:{booking,payment,paymentStatus:booking.paymentStatus}});}catch(error){next(error);}};
