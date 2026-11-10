# Source explanation: server/services/financeLifecycleService.js

**Source:** [server/services/financeLifecycleService.js](../../../server/services/financeLifecycleService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `AccountingPeriod` from `../models/AccountingPeriod.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccountingPeriod.js](../../../server/models/AccountingPeriod.js)

## Runtime declarations and data flow

### `money` — lines 7–7

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `account` — lines 8–8

Parameters: `tenantId`, `code`.
Persistent operations detected: ChartOfAccount.findOne; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 8:** `async (tenantId, code) => ChartOfAccount.findOne({ tenantId, code, active: true }).lean()` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `ensure` — lines 9–12

Parameters: `tenantId`.
Persistent operations detected: ChartOfAccount.updateOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `const defaults = [["1000","Cash on Hand","asset","cash"],["1010","Bank Account","asset","bank"],["1020","M-Pesa","asset","mobile_money"],["1030","Card / Gateway Clearing","asset","payment_clearing"],["1100","Accounts Rec` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `for(const [code,name,type,subtype] of defaults) await ChartOfAccount.updateOne({tenantId,code},{$setOnInsert:{tenantId,code,name,type,subtype,currency:"KES",active:true,system:true}},{upsert:true});` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.

### `normalizeSourceId` — lines 13–13

Parameters: `sourceId`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `postFinanceEntry` — lines 15–26

Parameters: `{tenantId, sourceType, sourceId, description, reference, date, lines}`.
Persistent operations detected: JournalEntry.findOne, AccountingPeriod.findOne, JournalEntry.create; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `if(!tenantId||sourceId==null||!sourceType||!description)return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if(!Array.isArray(lines)||lines.length<2)throw new Error("Finance journal entry requires at least two lines.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const normalizedSourceId = normalizeSourceId(sourceId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const existing=await JournalEntry.findOne({tenantId,sourceType,sourceId:normalizedSourceId}).lean();if(existing)return existing;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `const entryDate=new Date(date);if(Number.isNaN(entryDate.getTime()))throw new Error("Finance journal date is invalid.");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const period=entryDate.toISOString().slice(0,7);const closed=await AccountingPeriod.findOne({tenantId,period,status:"closed"}).lean();if(closed)throw new Error(\`Accounting period ${period} is closed; post a correcting e` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `await ensure(tenantId);const resolved=[];` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `for(const line of lines){const acc=await account(tenantId,line.code);if(!acc)throw new Error(\`Account ${line.code} is unavailable.\`);const debit=money(line.debit),credit=money(line.credit);if(debit<0||credit<0||(debit>` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 24:** `const debit=money(resolved.reduce((s,l)=>s+l.debit,0)),credit=money(resolved.reduce((s,l)=>s+l.credit,0));if(debit<=0||Math.abs(debit-credit)>0.01)throw new Error("Finance journal entry is not balanced.");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `try{return await JournalEntry.create({tenantId,sourceType,sourceId:normalizedSourceId,entryDate,description,reference,status:"posted",lines:resolved,postedAt:new Date()});}catch(error){if(error?.code===11000)return Journ` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `postSupplierPayable` — lines 27–27

Parameters: `payable`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `postSupplierPayment` — lines 28–28

Parameters: `{payable, amount, paymentReference, paymentMethod}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `postCreditDebitNote` — lines 29–29

Parameters: `note`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const money = (n) => Math.round(Number(n || 0) * 100) / 100;`.
- Line 8: `const account = async (tenantId, code) => ChartOfAccount.findOne({ tenantId, code, active: true }).lean();`.
- Line 9: `const ensure = async (tenantId) => {`.
- Line 10: `const defaults = [["1000","Cash on Hand","asset","cash"],["1010","Bank Account","asset","bank"],["1020","M-Pesa","asset","mobile_money"],["1030","Card / Gateway Clearing","asset","`.
- Line 13: `const normalizeSourceId = (sourceId) => { if (sourceId instanceof mongoose.Types.ObjectId) return sourceId; if (mongoose.Types.ObjectId.isValid(sourceId)) return new mongoose.Types`.
- Line 18: `const normalizedSourceId = normalizeSourceId(sourceId);`.
- Line 19: `const existing=await JournalEntry.findOne({tenantId,sourceType,sourceId:normalizedSourceId}).lean();if(existing)return existing;`.
- Line 20: `const entryDate=new Date(date);if(Number.isNaN(entryDate.getTime()))throw new Error("Finance journal date is invalid.");`.
- Line 21: `const period=entryDate.toISOString().slice(0,7);const closed=await AccountingPeriod.findOne({tenantId,period,status:"closed"}).lean();if(closed)throw new Error(\`Accounting period `.
- Line 24: `const debit=money(resolved.reduce((s,l)=>s+l.debit,0)),credit=money(resolved.reduce((s,l)=>s+l.credit,0));if(debit<=0||Math.abs(debit-credit)>0.01)throw new Error("Finance journal `.
- Line 27: `export const postSupplierPayable=(payable)=>postFinanceEntry({tenantId:payable.tenantId,sourceType:"supplier_payable",sourceId:payable._id,description:\`Supplier payable ${payable.`.
- Line 28: `export const postSupplierPayment=({payable,amount,paymentReference,paymentMethod="BANK_TRANSFER"})=>{const key=\`${payable._id}:${money(amount)}:${String(paymentReference||"").trim`.
- Line 29: `export const postCreditDebitNote=(note)=>{const credit=note.type==="credit";const lines=credit?[{code:"4000",debit:note.amount,credit:0,description:"Revenue reversal"},...(Number(n`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
