# Source explanation: server/controllers/mpesaController.js

**Source:** [server/controllers/mpesaController.js](../../../server/controllers/mpesaController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `initiateStkPush`, `generateAccessToken`, `normalizePhoneNumber` from `../services/mpesaService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaService.js](../../../server/services/mpesaService.js)
- `failBookingPayment`, `completeBookingPayment`, `getPayableBookingAmount` from `../services/paymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentLifecycleService.js](../../../server/services/paymentLifecycleService.js)
- `getHospitalityModel`, `failHospitalityPayment`, `completeHospitalityPayment` from `../services/hospitalityPaymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/hospitalityPaymentLifecycleService.js](../../../server/services/hospitalityPaymentLifecycleService.js)
- `evaluateStkPaymentCallback`, `getCheckoutRequestId`, `getStkCallback` from `../services/mpesaCallbackPayload.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaCallbackPayload.js](../../../server/services/mpesaCallbackPayload.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `getTenantMpesaConfig` from `../services/paymentGatewayService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentGatewayService.js](../../../server/services/paymentGatewayService.js)
- `canAccessBookingPayment` from `../utils/bookingPaymentAccess.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/bookingPaymentAccess.js](../../../server/utils/bookingPaymentAccess.js)
- `resolveMpesaPaymentAmount` from `../utils/mpesaPaymentAmount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/mpesaPaymentAmount.js](../../../server/utils/mpesaPaymentAmount.js)

## Runtime declarations and data flow

### `getMpesaToken` — lines 16–16

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 16:** Sensitive-configuration/data operation; inspect source without copying secret values. — Builds an HTTP response with an explicit status and JSON payload.

### `stkPush` — lines 18–63

Parameters: `req`, `res`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Booking.findOne, Payment.findOne, Payment.create; verify tenant/ownership filters in the exact query. 10 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `let payment;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 22:** `const tenantSettings = await getSystemSettings(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `if (tenantSettings.enableMpesa === false) return res.status(409).json({ success: false, message: "M-Pesa is disabled for this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const { phoneNumber, phone, bookingId } = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (!bookingId || !(phoneNumber || phone)) return res.status(400).json({ success: false, message: "Phone number and booking ID are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `const booking = await Booking.findOne(mergeTenantFilter({ _id: bookingId }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `if (!canAccessBookingPayment(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to pay this booking." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `const payableAmount = Number(getPayableBookingAmount(booking));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `if (!Number.isFinite(payableAmount) || payableAmount <= 0) return res.status(400).json({ success: false, message: "This booking has no outstanding balance." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `const paymentAmount = resolveMpesaPaymentAmount(req.body?.amount, payableAmount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const existingPayment = await Payment.findOne(mergeTenantFilter({ booking: booking._id, provider: "MPESA", status: { $in: ["pending", "processing"] } }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `if (existingPayment) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `if (!existingPayment.checkoutRequestID && !existingPayment.checkoutRequestId) return res.status(202).json({ success: true, message: "M-Pesa request status is uncertain. Do not retry until an administrator reconciles this` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `return res.status(200).json({ success: true, message: "A payment request is already waiting for confirmation.", data: { CheckoutRequestID: existingPayment.checkoutRequestID || existingPayment.checkoutRequestId, checkoutR` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 39:** `const customerPhone = normalizePhoneNumber(phoneNumber || phone || booking?.contact?.phone || booking?.customerSnapshot?.phone || req.user?.phone);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const gateway = await getTenantMpesaConfig();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `mpesaCallback` — lines 65–67

Parameters: `req`, `res`.
Reads request/component inputs: req.body. Persistent operations detected: Payment.findOne, Model.findOne, Booking.findOne, User.find; verify tenant/ownership filters in the exact query. 15 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 16 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `async (req,res) => { try { const stkCallback=getStkCallback(req.body); if(!stkCallback)return res.json({ResultCode:0,ResultDesc:"Accepted"}); const checkoutRequestID=getCheckoutRequestId(stkCallback); if(!checkoutRequest` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 66:** `if(payment.hospitalityBooking && payment.hospitalityType){ const Model=getHospitalityModel(payment.hospitalityType); const booking=Model?await Model.findOne({tenantId:payment.tenantId,_id:payment.hospitalityBooking}):nul` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 67:** `const booking=await Booking.findOne(mergeTenantFilter(req,{_id:payment.booking})); if(!booking)return res.json({ResultCode:0,ResultDesc:"Accepted"}); if(callback.state==="provider_failed"){await failBookingPayment({payme` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `checkTransactionStatus` — lines 69–69

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 69:** `async(req,res,next)=>{try{const payment=await Payment.findOne(mergeTenantFilter(req,{_id:req.params.id})).populate("booking").populate("user","name email phone").populate("customer","name email phone");if(!payment)return` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getBookingPayments` — lines 70–70

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Booking.findOne, Payment.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 70:** `async(req,res,next)=>{try{const bookingId=req.params.bookingId||req.params.id;const booking=await Booking.findOne(mergeTenantFilter(req,{_id:bookingId}));if(!booking)return res.status(404).json({success:false,message:"Bo` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getAllPayments` — lines 71–71

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Payment.find, Payment.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 71:** `async(req,res,next)=>{try{const {status,provider,page=1,limit=20}=req.query;const filter={};if(status)filter.status=status;if(provider)filter.provider=provider;const safeLimit=Math.min(Math.max(Number(limit)||20,1),100);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getPaymentByReceipt` — lines 72–72

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 72:** `async(req,res,next)=>{try{const payment=await Payment.findOne(mergeTenantFilter(req,{mpesaReceiptNumber:req.params.receipt})).populate("booking").populate("user","name email phone").populate("customer","name email phone"` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `handleRefundResult` — lines 73–73

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 73:** `async(req,res)=>res.json({ResultCode:0,ResultDesc:"Accepted"})` — Sends a JSON response; inspect its caller for status and error semantics.

### `handleRefundTimeout` — lines 74–74

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 74:** `async(req,res)=>res.json({ResultCode:0,ResultDesc:"Accepted"})` — Sends a JSON response; inspect its caller for status and error semantics.

### `checkCheckoutStatus` — lines 75–75

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 75:** `async(req,res,next)=>{try{const checkoutRequestId=String(req.params.checkoutRequestId||"").trim();if(!checkoutRequestId)return res.status(400).json({success:false,message:"Checkout request ID is required"});const payment` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `verifyBookingPayment` — lines 76–76

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Booking.findOne, Payment.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 76:** `async(req,res,next)=>{try{const booking=await Booking.findOne(mergeTenantFilter(req,{_id:req.params.bookingId})).lean();if(!booking)return res.status(404).json({success:false,message:"Booking not found"});if(!canAccessBo` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 16: `<sensitive declaration redacted>`.
- Line 18: `export const stkPush = async (req, res) => {`.
- Line 20: `let payment;`.
- Line 22: `const tenantSettings = await getSystemSettings(req);`.
- Line 24: `const { phoneNumber, phone, bookingId } = req.body || {};`.
- Line 26: `const booking = await Booking.findOne(mergeTenantFilter({ _id: bookingId }));`.
- Line 29: `const payableAmount = Number(getPayableBookingAmount(booking));`.
- Line 31: `const paymentAmount = resolveMpesaPaymentAmount(req.body?.amount, payableAmount);`.
- Line 32: `const existingPayment = await Payment.findOne(mergeTenantFilter({ booking: booking._id, provider: "MPESA", status: { $in: ["pending", "processing"] } }));`.
- Line 39: `const customerPhone = normalizePhoneNumber(phoneNumber || phone || booking?.contact?.phone || booking?.customerSnapshot?.phone || req.user?.phone);`.
- Line 40: `const gateway = await getTenantMpesaConfig();`.
- Line 43: `const response = await initiateStkPush({ phone: customerPhone, amount: paymentAmount, bookingId: booking._id.toString(), config: gateway, companyName: tenantSettings.companyName })`.
- Line 65: `export const mpesaCallback = async (req,res) => { try { const stkCallback=getStkCallback(req.body); if(!stkCallback)return res.json({ResultCode:0,ResultDesc:"Accepted"}); const che`.
- Line 67: `const booking=await Booking.findOne(mergeTenantFilter(req,{_id:payment.booking})); if(!booking)return res.json({ResultCode:0,ResultDesc:"Accepted"}); if(callback.state==="provider_`.
- Line 69: `export const checkTransactionStatus = async(req,res,next)=>{try{const payment=await Payment.findOne(mergeTenantFilter(req,{_id:req.params.id})).populate("booking").populate("user",`.
- Line 70: `export const getBookingPayments = async(req,res,next)=>{try{const bookingId=req.params.bookingId||req.params.id;const booking=await Booking.findOne(mergeTenantFilter(req,{_id:booki`.
- Line 71: `export const getAllPayments = async(req,res,next)=>{try{const {status,provider,page=1,limit=20}=req.query;const filter={};if(status)filter.status=status;if(provider)filter.provider`.
- Line 72: `export const getPaymentByReceipt=async(req,res,next)=>{try{const payment=await Payment.findOne(mergeTenantFilter(req,{mpesaReceiptNumber:req.params.receipt})).populate("booking").p`.
- Line 73: `export const handleRefundResult=async(req,res)=>res.json({ResultCode:0,ResultDesc:"Accepted"});`.
- Line 74: `export const handleRefundTimeout=async(req,res)=>res.json({ResultCode:0,ResultDesc:"Accepted"});`.
- Line 75: `export const checkCheckoutStatus=async(req,res,next)=>{try{const checkoutRequestId=String(req.params.checkoutRequestId||"").trim();if(!checkoutRequestId)return res.status(400).json`.
- Line 76: `export const verifyBookingPayment=async(req,res,next)=>{try{const booking=await Booking.findOne(mergeTenantFilter(req,{_id:req.params.bookingId})).lean();if(!booking)return res.sta`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
