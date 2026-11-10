# Source explanation: server/controllers/operationsModuleController.js

**Source:** [server/controllers/operationsModuleController.js](../../../server/controllers/operationsModuleController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Supplier` from `../models/Supplier.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Supplier.js](../../../server/models/Supplier.js)
- `PurchaseOrder` from `../models/PurchaseOrder.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PurchaseOrder.js](../../../server/models/PurchaseOrder.js)
- `TourCost` from `../models/TourCost.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCost.js](../../../server/models/TourCost.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `CorporateAccount` from `../models/CorporateAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CorporateAccount.js](../../../server/models/CorporateAccount.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `operations` from `../services/operationsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/operationsService.js](../../../server/services/operationsService.js)
- `postSupplierPayable`, `postSupplierPayment` from `../services/financeLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeLifecycleService.js](../../../server/services/financeLifecycleService.js)

## Runtime declarations and data flow

### `userId` — lines 9–9

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `ok` — lines 9–9

Parameters: `res`, `data`, `status (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 9:** `(res,data,status=200)=>res.status(status).json({success:true,data})` — Builds an HTTP response with an explicit status and JSON payload.

### `fail` — lines 9–9

Parameters: `next`, `error`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listSuppliers` — lines 10–10

Parameters: `req`, `res`, `next`.
Persistent operations detected: Supplier.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 10:** `async(req,res,next)=>{try{return ok(res,await Supplier.find(tenantFilter(req)).sort({legalName:1}).lean());}catch(e){return fail(next,e);}}` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createSupplier` — lines 11–11

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

### `updateSupplier` — lines 12–12

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `async(req,res,next)=>{try{const supplier=await Supplier.findOneAndUpdate({...tenantFilter(req),_id:req.params.id},{...req.body,updatedBy:userId(req)},{new:true,runValidators:true});if(!supplier)return res.status(404).jso` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listPurchaseOrders` — lines 13–13

Parameters: `req`, `res`, `next`.
Persistent operations detected: PurchaseOrder.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 13:** `async(req,res,next)=>{try{return ok(res,await PurchaseOrder.find(tenantFilter(req)).populate("supplier","legalName supplierNumber").populate("tour","title").sort({createdAt:-1}).lean());}catch(e){return fail(next,e);}}` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createPurchaseOrder` — lines 14–14

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

### `transitionPurchaseOrder` — lines 15–15

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

### `listTourCosts` — lines 16–16

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: TourCost.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `async(req,res,next)=>{try{const filter=tenantFilter(req);if(req.query.tour)filter.tour=req.query.tour;if(req.query.booking)filter.booking=req.query.booking;return ok(res,await TourCost.find(filter).populate("supplier","l` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createTourCost` — lines 17–17

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

### `tourProfitability` — lines 18–18

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

### `listSupplierPayables` — lines 19–19

Parameters: `req`, `res`, `next`.
Persistent operations detected: SupplierPayable.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 19:** `async(req,res,next)=>{try{return ok(res,await SupplierPayable.find(tenantFilter(req)).populate("supplier","legalName").sort({dueDate:1,createdAt:-1}).lean());}catch(e){return fail(next,e);}}` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createSupplierPayable` — lines 20–20

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

### `paySupplierPayable` — lines 21–21

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: SupplierPayable.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `async(req,res,next)=>{try{const amount=Number(req.body.amount);const before=await SupplierPayable.findOne(tenantFilter(req,{_id:req.params.id}));if(!before)return res.status(404).json({success:false,message:"Supplier pay` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listCorporateAccounts` — lines 22–22

Parameters: `req`, `res`, `next`.
Persistent operations detected: CorporateAccount.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 22:** `async(req,res,next)=>{try{return ok(res,await CorporateAccount.find(tenantFilter(req)).sort({companyName:1}).lean());}catch(e){return fail(next,e);}}` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createCorporateAccount` — lines 23–23

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

### `reconcileCorporateAccount` — lines 24–24

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

### `resourceConflicts` — lines 25–25

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

## Module-level declarations

- Line 9: `const userId = (req) => req.user?._id || req.user?.id || null; const ok=(res,data,status=200)=>res.status(status).json({success:true,data}); const fail=(next,error)=>next(error);`.
- Line 10: `export const listSuppliers=async(req,res,next)=>{try{return ok(res,await Supplier.find(tenantFilter(req)).sort({legalName:1}).lean());}catch(e){return fail(next,e);}};`.
- Line 11: `export const createSupplier=async(req,res,next)=>{try{return ok(res,await operations.createSupplier(req.body,userId(req)),201);}catch(e){return fail(next,e);}};`.
- Line 12: `export const updateSupplier=async(req,res,next)=>{try{const supplier=await Supplier.findOneAndUpdate({...tenantFilter(req),_id:req.params.id},{...req.body,updatedBy:userId(req)},{n`.
- Line 13: `export const listPurchaseOrders=async(req,res,next)=>{try{return ok(res,await PurchaseOrder.find(tenantFilter(req)).populate("supplier","legalName supplierNumber").populate("tour",`.
- Line 14: `export const createPurchaseOrder=async(req,res,next)=>{try{return ok(res,await operations.createPurchaseOrder(req.body,userId(req)),201);}catch(e){return fail(next,e);}};`.
- Line 15: `export const transitionPurchaseOrder=async(req,res,next)=>{try{return ok(res,await operations.transitionPurchaseOrder(req.params.id,req.body.status,userId(req)));}catch(e){return f`.
- Line 16: `export const listTourCosts=async(req,res,next)=>{try{const filter=tenantFilter(req);if(req.query.tour)filter.tour=req.query.tour;if(req.query.booking)filter.booking=req.query.booki`.
- Line 17: `export const createTourCost=async(req,res,next)=>{try{return ok(res,await operations.createTourCost(req.body,userId(req)),201);}catch(e){return fail(next,e);}};`.
- Line 18: `export const tourProfitability=async(req,res,next)=>{try{return ok(res,await operations.getTourProfitability(req.params.tourId));}catch(e){return fail(next,e);}};`.
- Line 19: `export const listSupplierPayables=async(req,res,next)=>{try{return ok(res,await SupplierPayable.find(tenantFilter(req)).populate("supplier","legalName").sort({dueDate:1,createdAt:-`.
- Line 20: `export const createSupplierPayable=async(req,res,next)=>{try{const payable=await operations.createSupplierPayable(req.body,userId(req));await postSupplierPayable(payable);return ok`.
- Line 21: `export const paySupplierPayable=async(req,res,next)=>{try{const amount=Number(req.body.amount);const before=await SupplierPayable.findOne(tenantFilter(req,{_id:req.params.id}));if(`.
- Line 22: `export const listCorporateAccounts=async(req,res,next)=>{try{return ok(res,await CorporateAccount.find(tenantFilter(req)).sort({companyName:1}).lean());}catch(e){return fail(next,e`.
- Line 23: `export const createCorporateAccount=async(req,res,next)=>{try{return ok(res,await operations.createCorporateAccount(req.body,userId(req)),201);}catch(e){return fail(next,e);}};`.
- Line 24: `export const reconcileCorporateAccount=async(req,res,next)=>{try{return ok(res,await operations.reconcileCorporateAccountBalance(req.params.id));}catch(e){return fail(next,e);}};`.
- Line 25: `export const resourceConflicts=async(req,res,next)=>{try{return ok(res,await operations.getResourceConflicts(req.query));}catch(e){return fail(next,e);}};`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
