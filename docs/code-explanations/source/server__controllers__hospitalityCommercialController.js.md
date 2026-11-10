# Source explanation: server/controllers/hospitalityCommercialController.js

**Source:** [server/controllers/hospitalityCommercialController.js](../../../server/controllers/hospitalityCommercialController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Hotel` from `../models/Hotel.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Hotel.js](../../../server/models/Hotel.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)
- `HospitalityRatePlan` from `../models/HospitalityRatePlan.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRatePlan.js](../../../server/models/HospitalityRatePlan.js)
- `HospitalitySupplierContract` from `../models/HospitalitySupplierContract.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalitySupplierContract.js](../../../server/models/HospitalitySupplierContract.js)
- `HospitalityDeposit` from `../models/HospitalityDeposit.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityDeposit.js](../../../server/models/HospitalityDeposit.js)

## Runtime declarations and data flow

### `tenantIdOf` — lines 10–10

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user.

Key statements:

### `id` — lines 11–11

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `date` — lines 12–12

Parameters: `v`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `text` — lines 13–13

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `range` — lines 14–14

Parameters: `from`, `to`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `tenant` — lines 15–15

Parameters: `req`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `createCommercialRatePlan` — lines 17–27

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Hotel.findOne, HotelRoomType.findOne, HospitalityRatePlan.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `const tenantId=tenantIdOf(req),hotelId=id(req.body.hotel),roomTypeId=id(req.body.roomType);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if(!tenantId||!hotelId||!roomTypeId)return res.status(400).json({success:false,message:"Hotel and room type are required."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const nightlyRate=Number(req.body.nightlyRate); const minNights=Number(req.body.minNights||1); const maxNights=req.body.maxNights===undefined||req.body.maxNights===null||req.body.maxNights===""?null:Number(req.body.maxNi` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 21:** `const dateError=range(req.body.validFrom,req.body.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 22:** `const [hotel,roomType]=await Promise.all([Hotel.findOne({_id:hotelId,tenantId}).lean(),HotelRoomType.findOne({_id:roomTypeId,hotel:hotelId,tenantId}).lean()]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `if(!hotel)return res.status(404).json({success:false,message:"Hotel not found in this tenant."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if(!roomType)return res.status(404).json({success:false,message:"Room type does not belong to the selected hotel."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const row=await HospitalityRatePlan.create({tenantId,hotel:hotelId,roomType:roomTypeId,name:text(req.body.name),code:text(req.body.code),nightlyRate:Number(req.body.nightlyRate),currency:text(req.body.currency||hotel.cur` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `res.status(201).json({success:true,data:row});` — Builds an HTTP response with an explicit status and JSON payload.

### `updateCommercialRatePlan` — lines 29–37

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: HospitalityRatePlan.findOne, HotelRoomType.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `const tenantId=tenantIdOf(req),row=await HospitalityRatePlan.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Rate plan not found."});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `if(req.body.hotel||req.body.roomType){const hotelId=id(req.body.hotel||row.hotel),roomTypeId=id(req.body.roomType||row.roomType);const room=await HotelRoomType.findOne({_id:roomTypeId,hotel:hotelId,tenantId}).lean();if(!` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `const dateError=range(req.body.validFrom??row.validFrom,req.body.validTo??row.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 33:** `const allowed=["name","code","nightlyRate","currency","mealPlan","minNights","maxNights","validFrom","validTo","refundable","cancellationPolicy","stopSell","status"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `if(req.body.nightlyRate!==undefined){const value=Number(req.body.nightlyRate);if(!Number.isFinite(value)||value<0)return res.status(400).json({success:false,message:"Nightly rate must be a valid non-negative number."});}` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `row.updatedBy=req.user?._id||null;await row.save();res.json({success:true,data:row});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createCommercialSupplierContract` — lines 39–45

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Hotel.findOne, HospitalitySupplierContract.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 40:** `const tenantId=tenantIdOf(req); const commissionPercent=Number(req.body.commissionPercent||0); const depositPercent=Number(req.body.depositPercent||0); if(!Number.isFinite(commissionPercent)||commissionPercent<0||commiss` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 41:** `const dateError=range(req.body.validFrom,req.body.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 42:** `let hotel=null;if(req.body.hotel){const hotelId=id(req.body.hotel);if(!hotelId)return res.status(400).json({success:false,message:"Invalid hotel reference."});hotel=await Hotel.findOne({_id:hotelId,tenantId}).lean();if(!` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `const row=await HospitalitySupplierContract.create({...req.body,tenantId,hotel:hotel?hotel._id:null,supplierName:text(req.body.supplierName),contractNumber:text(req.body.contractNumber),currency:text(req.body.currency||"` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `res.status(201).json({success:true,data:row});` — Builds an HTTP response with an explicit status and JSON payload.

### `updateCommercialSupplierContract` — lines 47–56

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: HospitalitySupplierContract.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `const tenantId=tenantIdOf(req),row=await HospitalitySupplierContract.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Supplier contract not found."});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `if(req.body.hotel!==undefined){const hotelId=req.body.hotel?id(req.body.hotel):null;if(req.body.hotel&&!hotelId)return res.status(400).json({success:false,message:"Invalid hotel reference."});if(hotelId&&!await Hotel.exi` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `const dateError=range(req.body.validFrom??row.validFrom,req.body.validTo??row.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 54:** `if(!Number.isFinite(Number(row.commissionPercent))||!Number.isFinite(Number(row.depositPercent))||row.commissionPercent<0||row.commissionPercent>100||row.depositPercent<0||row.depositPercent>100)return res.status(400).js` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `row.updatedBy=req.user?._id||null;await row.save();res.json({success:true,data:row});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createCommercialDeposit` — lines 58–65

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Booking.findOne, HospitalityDeposit.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 59:** `const tenantId=tenantIdOf(req),bookingId=id(req.body.hospitalityBooking),type=req.body.hospitalityType;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `if(!bookingId||!["hotel","airport_transfer"].includes(type))return res.status(400).json({success:false,message:"A valid hospitality booking and booking type are required."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `const Booking=type==="hotel"?HotelBooking:AirportTransferBooking;const booking=await Booking.findOne({_id:bookingId,tenantId}).lean();if(!booking)return res.status(404).json({success:false,message:"Reservation not found ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `const amount=Number(req.body.amount);if(!Number.isFinite(amount)||amount<=0)return res.status(400).json({success:false,message:"Deposit amount must be greater than zero."});` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 63:** `const paidAmount=Math.max(0,Math.min(amount,Number(req.body.paidAmount||0)));const row=await HospitalityDeposit.create({tenantId,hospitalityType:type,hospitalityBooking:booking._id,bookingReference:booking.reference||boo` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `res.status(201).json({success:true,data:row});` — Builds an HTTP response with an explicit status and JSON payload.

### `updateCommercialDeposit` — lines 67–71

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: HospitalityDeposit.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 68:** `const tenantId=tenantIdOf(req),row=await HospitalityDeposit.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Deposit not found."});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `if(req.body.paidAmount!==undefined){const paid=Number(req.body.paidAmount);if(!Number.isFinite(paid)||paid<0||paid>Number(row.amount))return res.status(400).json({success:false,message:"Received amount must be between ze` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 70:** `if(req.body.dueDate!==undefined)row.dueDate=date(req.body.dueDate);if(req.body.notes!==undefined)row.notes=text(req.body.notes);row.updatedBy=req.user?._id||null;await row.save();res.json({success:true,data:row});` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 10: `const tenantIdOf=req=>req.tenantId||req.user?.tenantId;`.
- Line 11: `const id=v=>mongoose.Types.ObjectId.isValid(v)?v:null;`.
- Line 12: `const date=v=>{if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d;};`.
- Line 13: `const text=v=>String(v??"").trim();`.
- Line 14: `const range=(from,to)=>{const a=date(from),b=date(to);if(from&&!a)return "Valid from is invalid.";if(to&&!b)return "Valid to is invalid.";if(a&&b&&b<=a)return "Valid to must be aft`.
- Line 15: `const tenant=req=>({tenantId:tenantIdOf(req)});`.
- Line 17: `export const createCommercialRatePlan=async(req,res,next)=>{try{`.
- Line 18: `const tenantId=tenantIdOf(req),hotelId=id(req.body.hotel),roomTypeId=id(req.body.roomType);`.
- Line 20: `const nightlyRate=Number(req.body.nightlyRate); const minNights=Number(req.body.minNights||1); const maxNights=req.body.maxNights===undefined||req.body.maxNights===null||req.body.m`.
- Line 21: `const dateError=range(req.body.validFrom,req.body.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});`.
- Line 22: `const [hotel,roomType]=await Promise.all([Hotel.findOne({_id:hotelId,tenantId}).lean(),HotelRoomType.findOne({_id:roomTypeId,hotel:hotelId,tenantId}).lean()]);`.
- Line 25: `const row=await HospitalityRatePlan.create({tenantId,hotel:hotelId,roomType:roomTypeId,name:text(req.body.name),code:text(req.body.code),nightlyRate:Number(req.body.nightlyRate),cu`.
- Line 29: `export const updateCommercialRatePlan=async(req,res,next)=>{try{`.
- Line 30: `const tenantId=tenantIdOf(req),row=await HospitalityRatePlan.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Rate plan not found."`.
- Line 32: `const dateError=range(req.body.validFrom??row.validFrom,req.body.validTo??row.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});`.
- Line 33: `const allowed=["name","code","nightlyRate","currency","mealPlan","minNights","maxNights","validFrom","validTo","refundable","cancellationPolicy","stopSell","status"];`.
- Line 39: `export const createCommercialSupplierContract=async(req,res,next)=>{try{`.
- Line 40: `const tenantId=tenantIdOf(req); const commissionPercent=Number(req.body.commissionPercent||0); const depositPercent=Number(req.body.depositPercent||0); if(!Number.isFinite(commissi`.
- Line 41: `const dateError=range(req.body.validFrom,req.body.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});`.
- Line 42: `let hotel=null;if(req.body.hotel){const hotelId=id(req.body.hotel);if(!hotelId)return res.status(400).json({success:false,message:"Invalid hotel reference."});hotel=await Hotel.fin`.
- Line 43: `const row=await HospitalitySupplierContract.create({...req.body,tenantId,hotel:hotel?hotel._id:null,supplierName:text(req.body.supplierName),contractNumber:text(req.body.contractNu`.
- Line 47: `export const updateCommercialSupplierContract=async(req,res,next)=>{try{`.
- Line 48: `const tenantId=tenantIdOf(req),row=await HospitalitySupplierContract.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Supplier cont`.
- Line 50: `const dateError=range(req.body.validFrom??row.validFrom,req.body.validTo??row.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});`.
- Line 58: `export const createCommercialDeposit=async(req,res,next)=>{try{`.
- Line 59: `const tenantId=tenantIdOf(req),bookingId=id(req.body.hospitalityBooking),type=req.body.hospitalityType;`.
- Line 61: `const Booking=type==="hotel"?HotelBooking:AirportTransferBooking;const booking=await Booking.findOne({_id:bookingId,tenantId}).lean();if(!booking)return res.status(404).json({succe`.
- Line 62: `const amount=Number(req.body.amount);if(!Number.isFinite(amount)||amount<=0)return res.status(400).json({success:false,message:"Deposit amount must be greater than zero."});`.
- Line 63: `const paidAmount=Math.max(0,Math.min(amount,Number(req.body.paidAmount||0)));const row=await HospitalityDeposit.create({tenantId,hospitalityType:type,hospitalityBooking:booking._id`.
- Line 67: `export const updateCommercialDeposit=async(req,res,next)=>{try{`.
- Line 68: `const tenantId=tenantIdOf(req),row=await HospitalityDeposit.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Deposit not found."});`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
