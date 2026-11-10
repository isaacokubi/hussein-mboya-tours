# Source explanation: server/controllers/paymentLinkController.js

**Source:** [server/controllers/paymentLinkController.js](../../../server/controllers/paymentLinkController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `PaymentLink` from `../models/PaymentLink.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentLink.js](../../../server/models/PaymentLink.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `mergeTenantFilter`, `requireTenantId`, `setTenantContext` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `money` — lines 5–5

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `publicData` — lines 6–6

Parameters: `link`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listPaymentLinks` — lines 7–7

Parameters: `req`, `res`, `next`.
Persistent operations detected: PaymentLink.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 7:** `async(req,res,next)=>{requireTenantId();try{const links=await PaymentLink.find(mergeTenantFilter(req,{})).populate("booking","bookingNumber totalAmount balanceAmount status travelDate").populate("invoice","invoiceNumber ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createPaymentLink` — lines 8–8

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId, req.user. Persistent operations detected: Booking.findOne, Invoice.findOne, PaymentLink.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getPaymentLink` — lines 9–9

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: PaymentLink.findOne, PaymentLink.updateOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `cancelPaymentLink` — lines 10–10

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: PaymentLink.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `async(req,res,next)=>{requireTenantId();try{const link=await PaymentLink.findOne(mergeTenantFilter(req,{_id:req.params.id}));if(!link)return res.status(404).json({success:false,message:"Payment link not found."});if(link` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 5: `const money=(n)=>Math.round(Number(n||0)*100)/100;`.
- Line 6: `<sensitive declaration redacted>`.
- Line 7: `export const listPaymentLinks=async(req,res,next)=>{requireTenantId();try{const links=await PaymentLink.find(mergeTenantFilter(req,{})).populate("booking","bookingNumber totalAmoun`.
- Line 8: `<sensitive declaration redacted>`.
- Line 9: `<sensitive declaration redacted>`.
- Line 10: `export const cancelPaymentLink=async(req,res,next)=>{requireTenantId();try{const link=await PaymentLink.findOne(mergeTenantFilter(req,{_id:req.params.id}));if(!link)return res.stat`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
