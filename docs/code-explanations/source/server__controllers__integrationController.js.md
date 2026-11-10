# Source explanation: server/controllers/integrationController.js

**Source:** [server/controllers/integrationController.js](../../../server/controllers/integrationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `WebsiteIntegrationKey` from `../models/WebsiteIntegrationKey.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebsiteIntegrationKey.js](../../../server/models/WebsiteIntegrationKey.js)
- `WebsiteIntegrationEvent` from `../models/WebsiteIntegrationEvent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebsiteIntegrationEvent.js](../../../server/models/WebsiteIntegrationEvent.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `calculateBookingAmounts` from `../utils/bookingPricing.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/bookingPricing.js](../../../server/utils/bookingPricing.js)
- `validateTourCapacity`, `reserveSlots`, `releaseSlots` from `../services/inventoryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/inventoryService.js](../../../server/services/inventoryService.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `hashIntegrationKey` from `../middleware/integrationAuth.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/middleware/integrationAuth.js](../../../server/middleware/integrationAuth.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `sendSMS` from `../services/smsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/smsService.js](../../../server/services/smsService.js)
- `sendWhatsApp` from `../services/whatsappService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/whatsappService.js](../../../server/services/whatsappService.js)

## Runtime declarations and data flow

### `clean` — lines 20–20

Parameters: `v`, `max (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `email` — lines 21–21

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `phone` — lines 22–22

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `guests` — lines 23–23

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `secret` — lines 24–24

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `site` — lines 25–25

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `canManage` — lines 26–26

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `createIntegrationKey` — lines 28–28

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId, req.user. Persistent operations detected: WebsiteIntegrationKey.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 28:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listIntegrationKeys` — lines 29–29

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId. Persistent operations detected: WebsiteIntegrationKey.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `async(req,res,next)=>{try{requireTenantId();if(!canManage(req))return res.status(403).json({success:false,message:"You do not have permission to manage integrations."});const integrations=await WebsiteIntegrationKey.find` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `revokeIntegrationKey` — lines 30–30

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.tenantId. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `async(req,res,next)=>{try{requireTenantId();if(!canManage(req))return res.status(403).json({success:false,message:"You do not have permission to manage integrations."});const updated=await WebsiteIntegrationKey.findOneAn` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getIntegrationConfig` — lines 31–31

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId. Persistent operations detected: Organization.findById; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 31:** `async(req,res,next)=>{try{requireTenantId();const tenant=await Organization.findById(req.tenantId).select("name slug logoUrl brandColors websiteUrl supportEmail supportPhone currency timezone").lean();const settings=awai` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listIntegrationTours` — lines 32–32

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Tour.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 32:** `async(req,res,next)=>{try{requireTenantId();const limit=Math.min(Math.max(Number(req.query.limit)||50,1),100);const search=clean(req.query.search,120);const filter={status:{$in:["scheduled","upcoming","ongoing"]},publish` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `script` — lines 34–34

Parameters: `api`, `key`.
Error control: try=false, catch=true, finally=false. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** Sensitive-configuration/data operation; inspect source without copying secret values. — Sends a JSON response; inspect its caller for status and error semantics.

### `getIntegrationWidget` — lines 35–35

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Error control: try=true, catch=true, finally=false.

Key statements:

### `createExternalBooking` — lines 37–39

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId. Persistent operations detected: WebsiteIntegrationEvent.findOne, Booking.findOne, WebsiteIntegrationEvent.create, Tour.findOne, Customer.findOne, Customer.create, Booking.create, Customer.updateOne, User.find; verify tenant/ownership filters in the exact query. 19 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 21 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 37:** `async(req,res,next)=>{let reserved=false,tourId=null,count=1;try{requireTenantId();const body=req.body||{};tourId=body.tourId||body.tour||null;const slug=clean(body.tourSlug||body.slug,180).toLowerCase();const travelDate` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `const filter={status:{$in:["scheduled","upcoming","ongoing"]},published:true,available:true,isDeleted:false};if(tourId)filter._id=tourId;else filter.slug=slug;const tour=await Tour.findOne(filter).lean();if(!tour)return ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `const travelers=Array.isArray(body.travelers)&&body.travelers.length?body.travelers.slice(0,count).map(t=>({name:clean(t.name||\`${t.firstName||''} ${t.lastName||''}\`),age:Number.isFinite(Number(t.age))?Number(t.age):un` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 20: `const clean=(v,max=250)=>String(v??"").trim().slice(0,max);`.
- Line 21: `const email=v=>clean(v,180).toLowerCase();`.
- Line 22: `const phone=v=>clean(v,40);`.
- Line 23: `const guests=v=>{const n=Number(v);return Number.isInteger(n)&&n>0?Math.min(n,100):1;};`.
- Line 24: `<sensitive declaration redacted>`.
- Line 25: `const site=()=>\`hmt_site_${crypto.randomBytes(24).toString("base64url")}\`;`.
- Line 26: `const canManage=req=>Boolean(req.user&&(String(req.user.role||req.userRole||"").toLowerCase()==="admin"||String(req.user.role||req.userRole||"").toLowerCase().includes("super")||ne`.
- Line 28: `<sensitive declaration redacted>`.
- Line 29: `export const listIntegrationKeys=async(req,res,next)=>{try{requireTenantId();if(!canManage(req))return res.status(403).json({success:false,message:"You do not have permission to ma`.
- Line 30: `export const revokeIntegrationKey=async(req,res,next)=>{try{requireTenantId();if(!canManage(req))return res.status(403).json({success:false,message:"You do not have permission to m`.
- Line 31: `export const getIntegrationConfig=async(req,res,next)=>{try{requireTenantId();const tenant=await Organization.findById(req.tenantId).select("name slug logoUrl brandColors websiteUr`.
- Line 32: `export const listIntegrationTours=async(req,res,next)=>{try{requireTenantId();const limit=Math.min(Math.max(Number(req.query.limit)||50,1),100);const search=clean(req.query.search,`.
- Line 34: `<sensitive declaration redacted>`.
- Line 35: `<sensitive declaration redacted>`.
- Line 37: `export const createExternalBooking=async(req,res,next)=>{let reserved=false,tourId=null,count=1;try{requireTenantId();const body=req.body||{};tourId=body.tourId||body.tour||null;co`.
- Line 38: `const filter={status:{$in:["scheduled","upcoming","ongoing"]},published:true,available:true,isDeleted:false};if(tourId)filter._id=tourId;else filter.slug=slug;const tour=await Tour`.
- Line 39: `const travelers=Array.isArray(body.travelers)&&body.travelers.length?body.travelers.slice(0,count).map(t=>({name:clean(t.name||\`${t.firstName||''} ${t.lastName||''}\`),age:Number.`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
