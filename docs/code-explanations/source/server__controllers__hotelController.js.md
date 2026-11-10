# Source explanation: server/controllers/hotelController.js

**Source:** [server/controllers/hotelController.js](../../../server/controllers/hotelController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Hotel` from `../models/Hotel.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Hotel.js](../../../server/models/Hotel.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)

## Runtime declarations and data flow

### `tenantIdOf` — lines 6–6

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user.

Key statements:

### `clean` — lines 6–6

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `slugify` — lines 6–6

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ref` — lines 6–6

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `daysBetween` — lines 6–6

Parameters: `a`, `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `roleOf` — lines 6–6

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `requireTenant` — lines 7–7

Parameters: `req`, `res`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `(req,res)=>{const tenantId=tenantIdOf(req);if(!tenantId||!mongoose.isValidObjectId(tenantId)){res.status(400).json({success:false,message:"A valid company/tenant context is required."});return null;}return tenantId;}` — Builds an HTTP response with an explicit status and JSON payload.

### `escapeRegex` — lines 9–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `arrayClean` — lines 10–10

Parameters: `value`, `max (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeRoomPayload` — lines 11–11

Parameters: `body (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listHotels` — lines 12–35

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Hotel.find, HotelRoomType.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 14:** `const tenantId = requireTenant(req, res);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (!tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `const filter = { tenantId, status: "active" };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (req.query.city) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const city = escapeRegex(clean(req.query.city));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (req.query.featured === "true") filter.featured = true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const hotels = await Hotel.find(filter).sort({ featured: -1, name: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `const data = await Promise.all(hotels.map(async (hotel) => ({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `roomTypes: await HotelRoomType.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `return res.json({ success: true, data });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 33:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getHotel` — lines 37–60

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Hotel.findOne, HotelRoomType.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 38:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 39:** `const tenantId = requireTenant(req, res);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `if (!tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `const key = clean(req.params.id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const hotel = await Hotel.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 50:** `if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `const rooms = await HotelRoomType.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `return res.json({ success: true, data: { ...hotel, roomTypes: rooms } });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 58:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `listAdminHotels` — lines 62–62

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Hotel.find, HotelRoomType.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 62:** `async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const filter={tenantId};if(req.query.status)filter.status=req.query.status;const hotels=await Hotel.find(filter).sort({createdAt:-1}).le` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createHotel` — lines 63–63

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Hotel.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 63:** `async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const name=clean(req.body.name);if(!name)return res.status(400).json({success:false,message:"Hotel name is required."});const baseSlug=s` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateHotel` — lines 64–64

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: Hotel.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 64:** `async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const hotel=await Hotel.findOne({_id:req.params.id,tenantId});if(!hotel)return res.status(404).json({success:false,message:"Hotel not fo` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createRoomType` — lines 65–65

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: Hotel.findOne, HotelRoomType.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const hotelId=clean(req.params.hotelId);if(!mongoose.isValidObjectId(hotelId))return res.status(400).json({success:false,message:"Select` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateRoomType` — lines 66–66

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: HotelRoomType.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 66:** `async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const room=await HotelRoomType.findOne({_id:req.params.id,tenantId});if(!room)return res.status(404).json({success:false,message:"Room t` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `resolveCustomer` — lines 67–67

Parameters: `req`, `payload`.
Reads request/component inputs: req.user. Persistent operations detected: Customer.findOne, Customer.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 67:** `async(req,payload)=>{if(!req.user?._id)return null;let customer=await Customer.findOne({tenantId:tenantIdOf(req),user:req.user._id});if(customer)return customer;const firstName=clean(payload.firstName||req.user.firstName` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createHotelBooking` — lines 68–68

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Hotel.findOne, HotelRoomType.findOne, HotelBooking.aggregate, HotelBooking.create; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 68:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),hotel=await Hotel.findOne({_id:req.body.hotelId,tenantId,status:"active"}),room=await HotelRoomType.findOne({_id:req.body.roomTypeId,tenantId,hotel:req.body.hotelI` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listHotelBookings` — lines 69–69

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query, req.user. Persistent operations detected: HotelBooking.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 69:** `async(req,res,next)=>{try{if(roleOf(req)!=="customer"&&!staffRoles.has(roleOf(req)))return res.status(403).json({success:false,message:"Not allowed."});const filter={tenantId:tenantIdOf(req)};if(req.query.status)filter.s` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateHotelBooking` — lines 79–111

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user, req.body. Persistent operations detected: HotelBooking.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 80:** `const tenantId=tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const booking=await HotelBooking.findOne({_id:req.params.id,tenantId});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 82:** `if(!booking)return res.status(404).json({success:false,message:"Hotel booking not found."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `const role=roleOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const isCustomer=role==="customer";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `if(isCustomer&&String(booking.user)!==String(req.user._id))return res.status(403).json({success:false,message:"Not allowed."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 87:** `if(!isCustomer&&!staffRoles.has(role))return res.status(403).json({success:false,message:"Only authorized booking operations staff may modify this reservation."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 89:** `const requestedKeys=Object.keys(req.body||{});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `if(isCustomer&&requestedKeys.some(key=>key!=="specialRequests")){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 91:** `return res.status(403).json({success:false,message:"Customers may only update special requests on an existing reservation."});` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 94:** `if(req.body.status!==undefined){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 95:** `if(isCustomer)return res.status(403).json({success:false,message:"Customers cannot change reservation status."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 96:** `const nextStatus=clean(req.body.status).toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `const allowed=HOTEL_STATUS_TRANSITIONS[booking.status]||new Set();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 98:** `if(!allowed.has(nextStatus))return res.status(409).json({success:false,message:\`Invalid hotel reservation status transition: ${booking.status} → ${nextStatus}.\`});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 102:** `if(req.body.specialRequests!==undefined)booking.specialRequests=clean(req.body.specialRequests);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 103:** `if(req.body.notes!==undefined){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `if(isCustomer)return res.status(403).json({success:false,message:"Customers cannot modify internal reservation notes."});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `const tenantIdOf=(req)=>req.tenantId||req.user?.tenantId; const clean=(v)=>String(v??"").trim(); const slugify=(v)=>clean(v).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$`.
- Line 7: `const requireTenant=(req,res)=>{const tenantId=tenantIdOf(req);if(!tenantId||!mongoose.isValidObjectId(tenantId)){res.status(400).json({success:false,message:"A valid company/tenan`.
- Line 8: `const regexSpecialChars = new Set([".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]", "\\"]);`.
- Line 9: `const escapeRegex = (value) => Array.from(String(value ?? ""), (char) => regexSpecialChars.has(char) ? "\\" + char : char).join("");`.
- Line 10: `const arrayClean=(value,max=50)=>Array.isArray(value)?value.map(clean).filter(Boolean).slice(0,max):clean(value)?[clean(value)]:[];`.
- Line 11: `const normalizeRoomPayload=(body={})=>({name:clean(body.name),description:clean(body.description),maxAdults:Number(body.maxAdults??2),maxChildren:Number(body.maxChildren??1),beds:a`.
- Line 12: `export const listHotels = async (req, res, next) => {`.
- Line 14: `const tenantId = requireTenant(req, res);`.
- Line 16: `const filter = { tenantId, status: "active" };`.
- Line 18: `const city = escapeRegex(clean(req.query.city));`.
- Line 22: `const hotels = await Hotel.find(filter).sort({ featured: -1, name: 1 }).lean();`.
- Line 23: `const data = await Promise.all(hotels.map(async (hotel) => ({`.
- Line 37: `export const getHotel = async (req, res, next) => {`.
- Line 39: `const tenantId = requireTenant(req, res);`.
- Line 41: `const key = clean(req.params.id);`.
- Line 42: `const hotel = await Hotel.findOne({`.
- Line 51: `const rooms = await HotelRoomType.find({`.
- Line 62: `export const listAdminHotels=async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const filter={tenantId};if(req.query.status)filter.status=req.query`.
- Line 63: `export const createHotel=async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const name=clean(req.body.name);if(!name)return res.status(400).json({s`.
- Line 64: `export const updateHotel=async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const hotel=await Hotel.findOne({_id:req.params.id,tenantId});if(!hotel`.
- Line 65: `export const createRoomType=async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const hotelId=clean(req.params.hotelId);if(!mongoose.isValidObjectId`.
- Line 66: `export const updateRoomType=async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const room=await HotelRoomType.findOne({_id:req.params.id,tenantId})`.
- Line 67: `const resolveCustomer=async(req,payload)=>{if(!req.user?._id)return null;let customer=await Customer.findOne({tenantId:tenantIdOf(req),user:req.user._id});if(customer)return custom`.
- Line 68: `export const createHotelBooking=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),hotel=await Hotel.findOne({_id:req.body.hotelId,tenantId,status:"active"}),room=await Hotel`.
- Line 69: `export const listHotelBookings=async(req,res,next)=>{try{if(roleOf(req)!=="customer"&&!staffRoles.has(roleOf(req)))return res.status(403).json({success:false,message:"Not allowed."`.
- Line 70: `const HOTEL_STATUS_TRANSITIONS = {`.
- Line 79: `export const updateHotelBooking=async(req,res,next)=>{try{`.
- Line 80: `const tenantId=tenantIdOf(req);`.
- Line 81: `const booking=await HotelBooking.findOne({_id:req.params.id,tenantId});`.
- Line 84: `const role=roleOf(req);`.
- Line 85: `const isCustomer=role==="customer";`.
- Line 89: `const requestedKeys=Object.keys(req.body||{});`.
- Line 96: `const nextStatus=clean(req.body.status).toLowerCase();`.
- Line 97: `const allowed=HOTEL_STATUS_TRANSITIONS[booking.status]||new Set();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
