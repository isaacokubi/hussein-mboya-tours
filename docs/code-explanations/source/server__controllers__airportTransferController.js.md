# Source explanation: server/controllers/airportTransferController.js

**Source:** [server/controllers/airportTransferController.js](../../../server/controllers/airportTransferController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AirportTransfer` from `../models/AirportTransfer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransfer.js](../../../server/models/AirportTransfer.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)

## Runtime declarations and data flow

### `tenantIdOf` — lines 5–5

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user.

Key statements:

### `clean` — lines 5–5

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ref` — lines 5–5

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `roleOf` — lines 5–5

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `listTransfers` — lines 6–6

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: AirportTransfer.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req),status:"active"};if(req.query.airportCode)filter.airportCode=clean(req.query.airportCode).toUpperCase();if(req.query.direction)filter.direction=req.query.d` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getTransfer` — lines 7–7

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: AirportTransfer.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `async(req,res,next)=>{try{const item=await AirportTransfer.findOne({_id:req.params.id,tenantId:tenantIdOf(req),status:"active"}).lean();if(!item)return res.status(404).json({success:false,message:"Transfer service not fo` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listAdminTransfers` — lines 8–8

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: AirportTransfer.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req);if(!tenantId)return res.status(400).json({success:false,message:"Tenant context is required for hospitality operations."});const filter={tenantId};if(req.query.sta` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createTransfer` — lines 9–9

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: AirportTransfer.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `async(req,res,next)=>{try{const name=clean(req.body.name),vehicleType=clean(req.body.vehicleType);if(!name||!vehicleType||Number(req.body.passengerCapacity)<1||Number(req.body.price)<0)return res.status(400).json({succes` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateTransfer` — lines 10–10

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: AirportTransfer.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `async(req,res,next)=>{try{const item=await AirportTransfer.findOne({_id:req.params.id,tenantId:tenantIdOf(req)});if(!item)return res.status(404).json({success:false,message:"Transfer service not found."});const allowed=[` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `resolveCustomer` — lines 11–11

Parameters: `req`, `body`.
Reads request/component inputs: req.user. Persistent operations detected: Customer.findOne, Customer.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `async(req,body)=>{if(!req.user?._id)return null;let customer=await Customer.findOne({tenantId:tenantIdOf(req),user:req.user._id});if(customer)return customer;const firstName=clean(body.firstName||req.user.firstName||req.` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createTransferBooking` — lines 12–12

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: AirportTransfer.findOne, AirportTransferBooking.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),transfer=await AirportTransfer.findOne({_id:req.body.transferId,tenantId,status:"active"});if(!transfer)return res.status(404).json({success:false,message:"Transfe` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listTransferBookings` — lines 13–13

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query, req.user. Persistent operations detected: AirportTransferBooking.find, AirportTransfer.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `async(req,res,next)=>{try{const role=roleOf(req);if(role!=="customer"&&!staffRoles.has(role))return res.status(403).json({success:false,message:"Not allowed."});const tenantId=tenantIdOf(req);if(!tenantId)return res.stat` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateTransferBooking` — lines 25–87

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user, req.body. Persistent operations detected: AirportTransferBooking.findOne, Vehicle.findOne, User.findOne; verify tenant/ownership filters in the exact query. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 22 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `const tenantId=tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const booking=await AirportTransferBooking.findOne({_id:req.params.id,tenantId});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `if(!booking)return res.status(404).json({success:false,message:"Transfer booking not found."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const role=roleOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const isCustomer=role==="customer";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `if(isCustomer&&String(booking.user)!==String(req.user._id))return res.status(403).json({success:false,message:"Not allowed."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `if(!isCustomer&&!staffRoles.has(role))return res.status(403).json({success:false,message:"Only authorized booking operations staff may modify this reservation."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `const requestedKeys=Object.keys(req.body||{});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if(isCustomer&&requestedKeys.some(key=>key!=="specialRequests")){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `return res.status(403).json({success:false,message:"Customers may only update special requests on an existing reservation."});` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 40:** `if(req.body.status!==undefined){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `if(isCustomer)return res.status(403).json({success:false,message:"Customers cannot change transfer status."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `const nextStatus=clean(req.body.status).toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const allowed=TRANSFER_STATUS_TRANSITIONS[booking.status]||new Set();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `if(!allowed.has(nextStatus))return res.status(409).json({success:false,message:\`Invalid transfer status transition: ${booking.status} → ${nextStatus}.\`});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `if(req.body.assignedVehicle!==undefined||req.body.assignedDriver!==undefined){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `if(isCustomer)return res.status(403).json({success:false,message:"Customers cannot assign operational resources."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `const {default:Vehicle}=await import("../models/Vehicle.js");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 5: `const tenantIdOf=req=>req.tenantId||req.user?.tenantId||null; const clean=v=>String(v??"").trim(); const ref=()=>\`TRF-${Date.now().toString(36).toUpperCase()}-${Math.random().toSt`.
- Line 6: `export const listTransfers=async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req),status:"active"};if(req.query.airportCode)filter.airportCode=clean(req.query.airportCode`.
- Line 7: `export const getTransfer=async(req,res,next)=>{try{const item=await AirportTransfer.findOne({_id:req.params.id,tenantId:tenantIdOf(req),status:"active"}).lean();if(!item)return res`.
- Line 8: `export const listAdminTransfers=async(req,res,next)=>{try{const tenantId=tenantIdOf(req);if(!tenantId)return res.status(400).json({success:false,message:"Tenant context is required`.
- Line 9: `export const createTransfer=async(req,res,next)=>{try{const name=clean(req.body.name),vehicleType=clean(req.body.vehicleType);if(!name||!vehicleType||Number(req.body.passengerCapac`.
- Line 10: `export const updateTransfer=async(req,res,next)=>{try{const item=await AirportTransfer.findOne({_id:req.params.id,tenantId:tenantIdOf(req)});if(!item)return res.status(404).json({s`.
- Line 11: `const resolveCustomer=async(req,body)=>{if(!req.user?._id)return null;let customer=await Customer.findOne({tenantId:tenantIdOf(req),user:req.user._id});if(customer)return customer;`.
- Line 12: `export const createTransferBooking=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),transfer=await AirportTransfer.findOne({_id:req.body.transferId,tenantId,status:"active"`.
- Line 13: `export const listTransferBookings=async(req,res,next)=>{try{const role=roleOf(req);if(role!=="customer"&&!staffRoles.has(role))return res.status(403).json({success:false,message:"N`.
- Line 14: `const TRANSFER_STATUS_TRANSITIONS = {`.
- Line 25: `export const updateTransferBooking=async(req,res,next)=>{try{`.
- Line 26: `const tenantId=tenantIdOf(req);`.
- Line 27: `const booking=await AirportTransferBooking.findOne({_id:req.params.id,tenantId});`.
- Line 30: `const role=roleOf(req);`.
- Line 31: `const isCustomer=role==="customer";`.
- Line 35: `const requestedKeys=Object.keys(req.body||{});`.
- Line 42: `const nextStatus=clean(req.body.status).toLowerCase();`.
- Line 43: `const allowed=TRANSFER_STATUS_TRANSITIONS[booking.status]||new Set();`.
- Line 50: `const {default:Vehicle}=await import("../models/Vehicle.js");`.
- Line 51: `const {default:User}=await import("../models/User.js");`.
- Line 54: `const vehicleId=req.body.assignedVehicle||null;`.
- Line 57: `const vehicle=await Vehicle.findOne({tenantId,_id:vehicleId,isActive:true,isDeleted:{$ne:true},status:{$nin:["maintenance","out_of_service"]}}).lean();`.
- Line 59: `const conflict=await AirportTransferBooking.findOne({tenantId,_id:{$ne:booking._id},assignedVehicle:vehicleId,pickupDateTime:{$gte:new Date(new Date(booking.pickupDateTime).getTime`.
- Line 66: `const driverId=req.body.assignedDriver||null;`.
- Line 69: `const driver=await User.findOne({tenantId,_id:driverId,isActive:true,role:{$in:["driver","admin","manager","tour_manager","tourmanager"]}}).select("_id role").lean();`.
- Line 71: `const conflict=await AirportTransferBooking.findOne({tenantId,_id:{$ne:booking._id},assignedDriver:driverId,pickupDateTime:{$gte:new Date(new Date(booking.pickupDateTime).getTime()`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
