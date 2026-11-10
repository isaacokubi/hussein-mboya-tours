# Source explanation: server/controllers/accommodationInventoryController.js

**Source:** [server/controllers/accommodationInventoryController.js](../../../server/controllers/accommodationInventoryController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `AccommodationInventory` from `../models/AccommodationInventory.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccommodationInventory.js](../../../server/models/AccommodationInventory.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)

## Runtime declarations and data flow

### `uid` — lines 3–3

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `listAccommodationInventory` — lines 4–4

Parameters: `req`, `res`, `next`.
Persistent operations detected: AccommodationInventory.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 4:** `async(req,res,next)=>{try{return res.json({success:true,data:await AccommodationInventory.find(tenantFilter(req)).sort({propertyName:1,roomType:1}).lean()});}catch(e){return next(e);}}` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createAccommodationInventory` — lines 5–5

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId. Persistent operations detected: AccommodationInventory.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 5:** `async(req,res,next)=>{try{const total=Math.max(0,Number(req.body.totalRooms||0));const available=Math.min(total,Math.max(0,Number(req.body.availableRooms??total)));const data=await AccommodationInventory.create({...req.b` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateAccommodationInventory` — lines 6–6

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `async(req,res,next)=>{try{const data=await AccommodationInventory.findOneAndUpdate({...tenantFilter(req),_id:req.params.id},{...req.body,updatedBy:uid(req)},{new:true,runValidators:true});if(!data)return res.status(404).` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 3: `const uid=req=>req.user?._id||req.user?.id||null;`.
- Line 4: `export const listAccommodationInventory=async(req,res,next)=>{try{return res.json({success:true,data:await AccommodationInventory.find(tenantFilter(req)).sort({propertyName:1,roomT`.
- Line 5: `export const createAccommodationInventory=async(req,res,next)=>{try{const total=Math.max(0,Number(req.body.totalRooms||0));const available=Math.min(total,Math.max(0,Number(req.body`.
- Line 6: `export const updateAccommodationInventory=async(req,res,next)=>{try{const data=await AccommodationInventory.findOneAndUpdate({...tenantFilter(req),_id:req.params.id},{...req.body,u`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
