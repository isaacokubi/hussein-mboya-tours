# Source explanation: server/controllers/customTourRequestController.js

**Source:** [server/controllers/customTourRequestController.js](../../../server/controllers/customTourRequestController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `CustomTourRequest` from `../models/CustomTourRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CustomTourRequest.js](../../../server/models/CustomTourRequest.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)

## Runtime declarations and data flow

### `createCustomTourRequest` — lines 10–25

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: CustomTourRequest.create, User.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `const { destination,durationDays,people,startDate,budget,requirements,pickupLocation,pickupDate,pickupTime,adults,children,accommodationPreference,mealPreference,transportPreference,emergencyContact,specialRequests,guest` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if(!destination||Number(durationDays)<1||Number(people)<1) return res.status(400).json({success:false,message:"Destination, duration and number of people are required."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `const isAuthenticated=Boolean(req.user?._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const name=String(guestName||req.user?.name||"").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const email=String(guestEmail||req.user?.email||"").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const phone=String(guestPhone||req.user?.phone||"").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if(!isAuthenticated && (!name||!email)) return res.status(400).json({success:false,message:"Name and email are required for guest custom-tour requests."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const item=await CustomTourRequest.create({tenantId,customer:isAuthenticated?req.user._id:null,user:isAuthenticated?req.user._id:null,guestContact:{name,email,phone},destination:String(destination).trim(),durationDays:Nu` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `const admins=await User.find(mergeTenantFilter({$or:[{role:{$in:adminRoles}},{legacyRole:{$in:adminRoles}}],status:"active"})).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `if(admins.length) await Notification.insertMany(admins.map(a=>({recipient:a._id,user:a._id,title:"Custom Tour Request",message:\`A customer requested a ${durationDays}-day custom trip to ${destination} for ${people} peop` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `res.status(201).json({success:true,message:"Custom tour request submitted. The company will review it and send you a total cost.",request:item});` — Builds an HTTP response with an explicit status and JSON payload.

### `getMyCustomTourRequests` — lines 27–27

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: CustomTourRequest.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 27:** `async(req,res,next)=>{try{const requests=await CustomTourRequest.find(mergeTenantFilter({customer:req.user._id})).sort({createdAt:-1}).lean();res.json({success:true,requests})}catch(e){next(e)}}` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getAdminCustomTourRequests` — lines 28–28

Parameters: `req`, `res`, `next`.
Persistent operations detected: CustomTourRequest.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 28:** `async(req,res,next)=>{try{const requests=await CustomTourRequest.find(tenantFilter(req)).populate("customer","name email phone").sort({createdAt:-1}).lean();res.json({success:true,requests})}catch(e){next(e)}}` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `quoteCustomTourRequest` — lines 29–29

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: CustomTourRequest.findOne, Notification.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `async(req,res,next)=>{try{const {status="quoted",quotedAmount,adminNotes=""}=req.body||{};const amount=Number(quotedAmount);if(!["approved","quoted","rejected"].includes(status))return res.status(400).json({success:false` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `assignCustomTourResources` — lines 30–30

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: CustomTourRequest.findOne, Staff.findOne, Agent.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `async(req,res,next)=>{try{const item=await CustomTourRequest.findOne(mergeTenantFilter({_id:req.params.id}));if(!item)return res.status(404).json({success:false,message:"Request not found."});if(["converted","rejected"].` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `convertCustomTourToBooking` — lines 32–50

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: CustomTourRequest.findOne, Booking.findOne, Destination.findOne, Destination.create, Tour.findOne, Tour.create, Booking.create; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 34:** `const tenantId=requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const item=await CustomTourRequest.findOne(mergeTenantFilter({_id:req.params.id,customer:req.user._id,status:{$in:["quoted","approved"]}}));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `if(!item)return res.status(404).json({success:false,message:"Quoted custom tour request not found"});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `const Booking=(await import("../models/Booking.js")).default;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `if(item.bookingId){const existingBooking=await Booking.findOne(mergeTenantFilter({_id:item.bookingId}));if(existingBooking)return res.json({success:true,message:"Custom tour booking already exists.",booking:existingBooki` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `const Tour=(await import("../models/Tour.js")).default;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `const Destination=(await import("../models/Destination.js")).default;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `let customDestination=await Destination.findOne(mergeTenantFilter({name:"Custom Tour"}));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `if(!customDestination)customDestination=await Destination.create({tenantId,name:"Custom Tour",description:"Customer designed custom tour destination",country:"Kenya",location:"Customer Selected Location",status:"active"}` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `let customTour=await Tour.findOne(mergeTenantFilter({title:"Custom Tour Package",isDeleted:false}));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `if(!customTour)customTour=await Tour.create({tenantId,title:"Custom Tour Package",description:"Customer designed custom tour package",destination:customDestination._id,location:"Customer Selected Location",country:"Kenya` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `let pickupDateTime=null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `if(item.pickupDate&&item.pickupTime){const parsed=new Date(\`${new Date(item.pickupDate).toISOString().slice(0,10)}T${item.pickupTime}\`);if(!isNaN(parsed.getTime()))pickupDateTime=parsed;}` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `const booking=await Booking.create({tenantId,user:req.user._id,customer:req.user._id,customTourRequest:item._id,customerSnapshot:{name:req.user.name||"",email:req.user.email||"",phone:req.user.phone||""},tour:customTour.` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `item.status="converted";item.bookingId=booking._id;await item.save();res.json({success:true,booking});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 9: `const adminRoles=["admin","super_admin", "superadmin","manager","tour_manager","tourmanager"];`.
- Line 10: `export const createCustomTourRequest=async(req,res,next)=>{`.
- Line 11: `const tenantId = requireTenantId();`.
- Line 13: `const { destination,durationDays,people,startDate,budget,requirements,pickupLocation,pickupDate,pickupTime,adults,children,accommodationPreference,mealPreference,transportPreferenc`.
- Line 15: `const isAuthenticated=Boolean(req.user?._id);`.
- Line 16: `const name=String(guestName||req.user?.name||"").trim();`.
- Line 17: `const email=String(guestEmail||req.user?.email||"").trim();`.
- Line 18: `const phone=String(guestPhone||req.user?.phone||"").trim();`.
- Line 20: `const item=await CustomTourRequest.create({tenantId,customer:isAuthenticated?req.user._id:null,user:isAuthenticated?req.user._id:null,guestContact:{name,email,phone},destination:St`.
- Line 21: `const admins=await User.find(mergeTenantFilter({$or:[{role:{$in:adminRoles}},{legacyRole:{$in:adminRoles}}],status:"active"})).select("_id").lean();`.
- Line 27: `export const getMyCustomTourRequests=async(req,res,next)=>{try{const requests=await CustomTourRequest.find(mergeTenantFilter({customer:req.user._id})).sort({createdAt:-1}).lean();r`.
- Line 28: `export const getAdminCustomTourRequests=async(req,res,next)=>{try{const requests=await CustomTourRequest.find(tenantFilter(req)).populate("customer","name email phone").sort({creat`.
- Line 29: `export const quoteCustomTourRequest=async(req,res,next)=>{try{const {status="quoted",quotedAmount,adminNotes=""}=req.body||{};const amount=Number(quotedAmount);if(!["approved","quo`.
- Line 30: `export const assignCustomTourResources=async(req,res,next)=>{try{const item=await CustomTourRequest.findOne(mergeTenantFilter({_id:req.params.id}));if(!item)return res.status(404).`.
- Line 32: `export const convertCustomTourToBooking=async(req,res,next)=>{`.
- Line 34: `const tenantId=requireTenantId();`.
- Line 35: `const item=await CustomTourRequest.findOne(mergeTenantFilter({_id:req.params.id,customer:req.user._id,status:{$in:["quoted","approved"]}}));`.
- Line 37: `const Booking=(await import("../models/Booking.js")).default;`.
- Line 39: `const Tour=(await import("../models/Tour.js")).default;`.
- Line 40: `const Destination=(await import("../models/Destination.js")).default;`.
- Line 41: `let customDestination=await Destination.findOne(mergeTenantFilter({name:"Custom Tour"}));`.
- Line 43: `let customTour=await Tour.findOne(mergeTenantFilter({title:"Custom Tour Package",isDeleted:false}));`.
- Line 45: `let pickupDateTime=null;`.
- Line 47: `const booking=await Booking.create({tenantId,user:req.user._id,customer:req.user._id,customTourRequest:item._id,customerSnapshot:{name:req.user.name||"",email:req.user.email||"",ph`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
