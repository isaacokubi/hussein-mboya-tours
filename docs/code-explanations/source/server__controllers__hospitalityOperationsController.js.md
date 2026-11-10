# Source explanation: server/controllers/hospitalityOperationsController.js

**Source:** [server/controllers/hospitalityOperationsController.js](../../../server/controllers/hospitalityOperationsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Hotel` from `../models/Hotel.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Hotel.js](../../../server/models/Hotel.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `HospitalityRoomBlock` from `../models/HospitalityRoomBlock.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRoomBlock.js](../../../server/models/HospitalityRoomBlock.js)
- `HospitalityRatePlan` from `../models/HospitalityRatePlan.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRatePlan.js](../../../server/models/HospitalityRatePlan.js)
- `HospitalitySupplierContract` from `../models/HospitalitySupplierContract.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalitySupplierContract.js](../../../server/models/HospitalitySupplierContract.js)
- `HospitalityDeposit` from `../models/HospitalityDeposit.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityDeposit.js](../../../server/models/HospitalityDeposit.js)
- `createAuditLog` from `../services/auditService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/auditService.js](../../../server/services/auditService.js)

## Runtime declarations and data flow

### `tenantIdOf` — lines 15–15

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user.

Key statements:

### `clean` — lines 16–16

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `asDate` — lines 17–17

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `kenyaDayBounds` — lines 18–18

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `staff` — lines 19–19

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `audit` — lines 20–20

Parameters: `req`, `action`, `resource`, `id`, `metadata (defaulted)`.
Reads request/component inputs: req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false.

Key statements:

### `hotelCalendar` — lines 22–22

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Hotel.findOne, HotelRoomType.find, HotelBooking.find, HospitalityRoomBlock.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),hotelId=req.query.hotelId;const from=asDate(req.query.from)||new Date(),to=asDate(req.query.to)||new Date(Date.now()+30*86400000);if(to<=from)return res.status(400` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `hotelPerformance` — lines 24–24

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: HotelRoomType.find, HotelBooking.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),hotelId=req.query.hotelId,from=asDate(req.query.from)||new Date(Date.now()-30*86400000),to=asDate(req.query.to)||new Date();const filter={tenantId,checkIn:{$lt:to}` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `amendHotelBooking` — lines 26–26

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: HotelBooking.findOne, HotelBooking.aggregate, HotelRoomType.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),b=await HotelBooking.findOne({_id:req.params.id,tenantId});if(!b)return res.status(404).json({success:false,message:"Hotel booking not found."});if(b.status==="can` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `cancelHotelBooking` — lines 28–28

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: HotelBooking.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 28:** `async(req,res,next)=>{try{const b=await HotelBooking.findOne({_id:req.params.id,tenantId:tenantIdOf(req)});if(!b)return res.status(404).json({success:false,message:"Hotel booking not found."});if(b.status==="checked_in"|` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `blockRooms` — lines 30–30

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: HotelRoomType.findOne, HospitalityRoomBlock.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),room=await HotelRoomType.findOne({_id:req.body.roomTypeId,tenantId});if(!room)return res.status(404).json({success:false,message:"Room type not found."});const sta` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `releaseRoomBlock` — lines 31–31

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: HospitalityRoomBlock.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 31:** `async(req,res,next)=>{try{const block=await HospitalityRoomBlock.findOne({_id:req.params.id,tenantId:tenantIdOf(req)});if(!block)return res.status(404).json({success:false,message:"Room block not found."});block.status="` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `ratePlans` — lines 33–33

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: HospitalityRatePlan.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.hotelId)filter.hotel=req.query.hotelId;if(req.query.roomTypeId)filter.roomType=req.query.roomTypeId;const rows=await HospitalityRatePlan.find` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `saveRatePlan` — lines 34–34

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user, req.params. Persistent operations detected: HospitalityRatePlan.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),payload={...req.body,tenantId,createdBy:req.user?._id||null,updatedBy:req.user?._id||null};let row=req.params.id?await HospitalityRatePlan.findOne({_id:req.params.` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `supplierContracts` — lines 36–36

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: HospitalitySupplierContract.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 36:** `async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.status)filter.status=req.query.status;if(req.query.supplierType)filter.supplierType=req.query.supplierType;const rows=await HospitalitySuppli` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `saveSupplierContract` — lines 37–37

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user, req.params. Persistent operations detected: HospitalitySupplierContract.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 37:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),payload={...req.body,tenantId,createdBy:req.user?._id||null,updatedBy:req.user?._id||null};let row=req.params.id?await HospitalitySupplierContract.findOne({_id:req` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `roomBlocks` — lines 39–39

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: HospitalityRoomBlock.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.status)filter.status=req.query.status;if(req.query.hotelId)filter.hotel=req.query.hotelId;if(req.query.roomTypeId)filter.roomType=req.query.r` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `deposits` — lines 40–40

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: HospitalityDeposit.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 40:** `async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.status)filter.status=req.query.status;const rows=await HospitalityDeposit.find(filter).sort({dueDate:1,createdAt:-1}).lean();res.json({succes` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `saveDeposit` — lines 41–41

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user, req.params. Persistent operations detected: HospitalityDeposit.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),payload={...req.body,tenantId,createdBy:req.user?._id||null,updatedBy:req.user?._id||null};let row=req.params.id?await HospitalityDeposit.findOne({_id:req.params.i` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `transferDispatch` — lines 43–43

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: AirportTransferBooking.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 43:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),bounds=kenyaDayBounds(req.query.date),from=asDate(req.query.from)||bounds.start,to=asDate(req.query.to)||bounds.end,filter={tenantId,pickupDateTime:{$gte:from,$lt:` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `assignTransfer` — lines 45–45

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: AirportTransferBooking.findOne, Vehicle.findOne, User.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 45:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),b=await AirportTransferBooking.findOne({_id:req.params.id,tenantId});if(!b)return res.status(404).json({success:false,message:"Transfer booking not found."});if(re` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateTransferStatus` — lines 47–47

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: AirportTransferBooking.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 47:** `async(req,res,next)=>{try{const allowed=["pending","confirmed","assigned","driver_en_route","picked_up","completed","cancelled","no_show"];const b=await AirportTransferBooking.findOne({_id:req.params.id,tenantId:tenantId` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `paymentReconciliation` — lines 49–49

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Payment.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 49:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),from=asDate(req.query.from)||new Date(Date.now()-7*86400000),to=asDate(req.query.to)||new Date(),filter={tenantId,createdAt:{$gte:from,$lt:to}};if(req.query.provid` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `hospitalityDashboard` — lines 51–51

Parameters: `req`, `res`, `next`.
Persistent operations detected: Hotel.countDocuments, HotelRoomType.find, AirportTransferBooking.countDocuments, HotelBooking.countDocuments, Payment.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 51:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),now=new Date(),bounds=kenyaDayBounds(),tomorrow=bounds.end;const [hotels,rooms,todayTransfers,todayBookings,paid]=await Promise.all([Hotel.countDocuments({tenantId` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listDrivers` — lines 53–53

Parameters: `req`, `res`, `next`.
Persistent operations detected: User.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 53:** `async(req,res,next)=>{try{const tenantId=tenantIdOf(req);const rows=await User.find({tenantId,$or:[{role:"driver"},{role:"Driver"},{roles:"driver"},{roles:"Driver"}] }).select("name firstName lastName phone email role ro` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listVehicles` — lines 54–54

Parameters: `req`, `res`, `next`.
Persistent operations detected: Vehicle.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 54:** `async(req,res,next)=>{try{const rows=await Vehicle.find({tenantId:tenantIdOf(req)}).sort({registration:1,registrationNumber:1}).lean();res.json({success:true,data:rows});}catch(e){next(e);}}` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `ensureOpsAccess` — lines 56–56

Parameters: `req`, `res`, `next`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 56:** `(req,res,next)=>staff(req)?next():res.status(403).json({success:false,message:"Operations access required."})` — Builds an HTTP response with an explicit status and JSON payload.

## Module-level declarations

- Line 15: `const tenantIdOf=req=>req.tenantId||req.user?.tenantId;`.
- Line 16: `const clean=v=>String(v??"").trim();`.
- Line 17: `const asDate=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?null:d;};`.
- Line 18: `const kenyaDayBounds=v=>{const day=clean(v)||new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Nairobi",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());const star`.
- Line 19: `const staff= req => ["admin","manager","tour_manager","tourmanager","agent"].includes(String(req.user?.role||"").toLowerCase());`.
- Line 20: `const audit=async(req,action,resource,id,metadata={})=>{try{await createAuditLog({user:req.user?._id||null,action,resource,resourceId:id,description:\`${action} ${resource}\`,metho`.
- Line 22: `export const hotelCalendar=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),hotelId=req.query.hotelId;const from=asDate(req.query.from)||new Date(),to=asDate(req.query.to)|`.
- Line 24: `export const hotelPerformance=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),hotelId=req.query.hotelId,from=asDate(req.query.from)||new Date(Date.now()-30*86400000),to=as`.
- Line 26: `export const amendHotelBooking=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),b=await HotelBooking.findOne({_id:req.params.id,tenantId});if(!b)return res.status(404).json`.
- Line 28: `export const cancelHotelBooking=async(req,res,next)=>{try{const b=await HotelBooking.findOne({_id:req.params.id,tenantId:tenantIdOf(req)});if(!b)return res.status(404).json({succes`.
- Line 30: `export const blockRooms=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),room=await HotelRoomType.findOne({_id:req.body.roomTypeId,tenantId});if(!room)return res.status(404`.
- Line 31: `export const releaseRoomBlock=async(req,res,next)=>{try{const block=await HospitalityRoomBlock.findOne({_id:req.params.id,tenantId:tenantIdOf(req)});if(!block)return res.status(404`.
- Line 33: `export const ratePlans=async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.hotelId)filter.hotel=req.query.hotelId;if(req.query.roomTypeId)filter.roomType`.
- Line 34: `export const saveRatePlan=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),payload={...req.body,tenantId,createdBy:req.user?._id||null,updatedBy:req.user?._id||null};let ro`.
- Line 36: `export const supplierContracts=async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.status)filter.status=req.query.status;if(req.query.supplierType)filter`.
- Line 37: `export const saveSupplierContract=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),payload={...req.body,tenantId,createdBy:req.user?._id||null,updatedBy:req.user?._id||null`.
- Line 39: `export const roomBlocks=async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.status)filter.status=req.query.status;if(req.query.hotelId)filter.hotel=req.q`.
- Line 40: `export const deposits=async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.status)filter.status=req.query.status;const rows=await HospitalityDeposit.find(`.
- Line 41: `export const saveDeposit=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),payload={...req.body,tenantId,createdBy:req.user?._id||null,updatedBy:req.user?._id||null};let row`.
- Line 43: `export const transferDispatch=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),bounds=kenyaDayBounds(req.query.date),from=asDate(req.query.from)||bounds.start,to=asDate(req`.
- Line 45: `export const assignTransfer=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),b=await AirportTransferBooking.findOne({_id:req.params.id,tenantId});if(!b)return res.status(40`.
- Line 47: `export const updateTransferStatus=async(req,res,next)=>{try{const allowed=["pending","confirmed","assigned","driver_en_route","picked_up","completed","cancelled","no_show"];const b`.
- Line 49: `export const paymentReconciliation=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),from=asDate(req.query.from)||new Date(Date.now()-7*86400000),to=asDate(req.query.to)||ne`.
- Line 51: `export const hospitalityDashboard=async(req,res,next)=>{try{const tenantId=tenantIdOf(req),now=new Date(),bounds=kenyaDayBounds(),tomorrow=bounds.end;const [hotels,rooms,todayTrans`.
- Line 53: `export const listDrivers=async(req,res,next)=>{try{const tenantId=tenantIdOf(req);const rows=await User.find({tenantId,$or:[{role:"driver"},{role:"Driver"},{roles:"driver"},{roles:`.
- Line 54: `export const listVehicles=async(req,res,next)=>{try{const rows=await Vehicle.find({tenantId:tenantIdOf(req)}).sort({registration:1,registrationNumber:1}).lean();res.json({success:t`.
- Line 56: `export const ensureOpsAccess=(req,res,next)=>staff(req)?next():res.status(403).json({success:false,message:"Operations access required."});`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
