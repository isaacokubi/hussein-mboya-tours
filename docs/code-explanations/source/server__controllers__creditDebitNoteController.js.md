# Source explanation: server/controllers/creditDebitNoteController.js

**Source:** [server/controllers/creditDebitNoteController.js](../../../server/controllers/creditDebitNoteController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CreditDebitNote` from `../models/CreditDebitNote.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CreditDebitNote.js](../../../server/models/CreditDebitNote.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `postCreditDebitNote` from `../services/financeLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeLifecycleService.js](../../../server/services/financeLifecycleService.js)
- `enqueueNoteForEtims` from `../services/etimsNoteService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/etimsNoteService.js](../../../server/services/etimsNoteService.js)

## Runtime declarations and data flow

### `money` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listCreditDebitNotes` — lines 8–8

Parameters: `req`, `res`, `next`.
Persistent operations detected: CreditDebitNote.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 8:** `async (req, res, next) => { requireTenantId(); try { const notes = await CreditDebitNote.find(mergeTenantFilter(req, {})).populate("originalInvoice", "invoiceNumber totalAmount balance status").sort({ createdAt: -1 }).le` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createCreditDebitNote` — lines 9–9

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId, req.user. Persistent operations detected: Invoice.findOne, CreditDebitNote.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `async (req, res, next) => { requireTenantId(); try { const { type, originalInvoice, reason, amount, taxAmount = 0 } = req.body || {}; if (!["credit","debit"].includes(String(type))) return res.status(400).json({success:f` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `issueCreditDebitNote` — lines 10–10

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: CreditDebitNote.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `async (req,res,next)=>{requireTenantId();try{const note=await CreditDebitNote.findOne(mergeTenantFilter(req,{_id:req.params.id}));if(!note)return res.status(404).json({success:false,message:"Credit/debit note not found."` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `cancelCreditDebitNote` — lines 11–11

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: CreditDebitNote.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `async (req,res,next)=>{requireTenantId();try{const note=await CreditDebitNote.findOne(mergeTenantFilter(req,{_id:req.params.id}));if(!note)return res.status(404).json({success:false,message:"Credit/debit note not found."` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 7: `const money = (value) => Math.round(Number(value || 0) * 100) / 100;`.
- Line 8: `export const listCreditDebitNotes = async (req, res, next) => { requireTenantId(); try { const notes = await CreditDebitNote.find(mergeTenantFilter(req, {})).populate("originalInvo`.
- Line 9: `export const createCreditDebitNote = async (req, res, next) => { requireTenantId(); try { const { type, originalInvoice, reason, amount, taxAmount = 0 } = req.body || {}; if (!["cr`.
- Line 10: `export const issueCreditDebitNote = async (req,res,next)=>{requireTenantId();try{const note=await CreditDebitNote.findOne(mergeTenantFilter(req,{_id:req.params.id}));if(!note)retur`.
- Line 11: `export const cancelCreditDebitNote = async (req,res,next)=>{requireTenantId();try{const note=await CreditDebitNote.findOne(mergeTenantFilter(req,{_id:req.params.id}));if(!note)retu`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
