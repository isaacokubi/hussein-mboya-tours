# Source explanation: server/services/etimsNoteService.js

**Source:** [server/services/etimsNoteService.js](../../../server/services/etimsNoteService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dns` from `dns/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `net` from `net`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CreditDebitNote` from `../models/CreditDebitNote.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CreditDebitNote.js](../../../server/models/CreditDebitNote.js)
- `TaxProfile` from `../models/TaxProfile.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TaxProfile.js](../../../server/models/TaxProfile.js)
- `EtimsCredential`, `decryptEtimsSecret` from `../models/EtimsCredential.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/EtimsCredential.js](../../../server/models/EtimsCredential.js)
- `EtimsSubmission` from `../models/EtimsSubmission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/EtimsSubmission.js](../../../server/models/EtimsSubmission.js)
- `enqueueJob` from `./jobQueueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/jobQueueService.js](../../../server/services/jobQueueService.js)
- `retryDeadJob` from `./jobRetryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/jobRetryService.js](../../../server/services/jobRetryService.js)

## Runtime declarations and data flow

### `adapterUrl` — lines 11–11

Parameters: `profile`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getEtimsNoteConfirmation` — lines 12–17

Parameters: `httpOk`, `body`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `if (!httpOk || body?.success !== true) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `const reference = String(body.reference || body.noteNumber || body.etimsReference || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const receiptNumber = String(body.receiptNumber || body.etimsReceiptNumber || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `return reference && receiptNumber ? { reference, receiptNumber } : null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isPrivateAddress` — lines 18–22

Parameters: `address`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `if (net.isIPv4(address)) { const [a,b] = address.split(".").map(Number); return a===0 || a===10 || a===127 || (a===100&&b>=64&&b<=127) || (a===169&&b===254) || (a===172&&b>=16&&b<=31) || (a===192&&b===0) || (a===192&&b==` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (net.isIPv6(address)) { const v=address.toLowerCase(); return v==="::" || v==="::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80:") || v.startsWith("ff"); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assertAdapterUrl` — lines 23–32

Parameters: `rawUrl`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `let parsed; try { parsed = new URL(rawUrl); } catch { throw new Error("Invalid eTIMS adapter URL."); }` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (!["https:","http:"].includes(parsed.protocol)) throw new Error("eTIMS adapter URL must use HTTP(S).");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("Production eTIMS adapter must use HTTPS.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const host=parsed.hostname.toLowerCase().replace(/^\[|\]$/g,"");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (["localhost","localhost.localdomain","metadata.google.internal","metadata","host.docker.internal"].includes(host) || (net.isIP(host)&&isPrivateAddress(host))) throw new Error("eTIMS adapter cannot target a private or` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (!net.isIP(host)) { const records=await dns.lookup(host,{all:true,verbatim:true}); if(!records.length || records.some(({address})=>isPrivateAddress(address))) throw new Error("eTIMS adapter hostname resolves to a priv` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `return parsed.toString().replace(/\/$/,"");` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isRetryableEtimsHttpStatus` — lines 33–36

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 34:** `const code = Number(status);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `return code === 408 || code === 429 || code >= 500;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `nextEtimsRetryAt` — lines 37–38

Parameters: `attempt`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `adapterToken` — lines 39–39

Parameters: `tenantId`, `environment`.
Persistent operations detected: EtimsCredential.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 39:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `enqueueNoteForEtims` — lines 40–40

Parameters: `noteId`, `tenantId`, `arg3 (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `createSubmissionAudit` — lines 42–45

Parameters: `{tenantId, note, attempt, requestHash, idempotencyKey}`.
Persistent operations detected: EtimsSubmission.create, EtimsSubmission.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 43:** `try { return await EtimsSubmission.create({tenantId,documentType:note.type,documentId:note._id,documentNumber:note.noteNumber,attempt,status:"pending",idempotencyKey,requestHash}); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 44:** `catch(error) { if(error?.code!==11000) throw error; return EtimsSubmission.findOne({tenantId,documentType:note.type,documentId:note._id,attempt}); }` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.

### `processEtimsNoteJob` — lines 47–62

Parameters: `payload`.
Persistent operations detected: CreditDebitNote.findOne, TaxProfile.findOne; verify tenant/ownership filters in the exact query. 15 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `const note=await CreditDebitNote.findOne({tenantId:payload.tenantId,_id:payload.noteId}); if(!note) return; if(note.etimsStatus==="synced"&&note.etimsReference) return;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `const profile=await TaxProfile.findOne({tenantId:payload.tenantId}).lean(); if(!profile?.etimsEnabled){note.etimsStatus="not_submitted";await note.save();return;}` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 50:** `if(note.type==="credit"&&note.originalInvoiceNumber&&note.etimsSolution&&profile.etimsSolution&&note.etimsSolution!==profile.etimsSolution){note.etimsStatus="failed";note.etimsLastError="Credit notes must be generated th` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `const configuredUrl=adapterUrl(profile); if(!configuredUrl){note.etimsStatus="failed";note.etimsLastError="No eTIMS adapter is configured.";await note.save();throw new Error(note.etimsLastError);} const url=await assertA` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** `const requestPayload={noteId:String(note._id),noteNumber:note.noteNumber,type:note.type,originalInvoiceNumber:note.originalInvoiceNumber,originalEtimsInvoiceNumber:note.originalEtimsInvoiceNumber,reason:note.reason,amoun` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const requestHash=crypto.createHash("sha256").update(JSON.stringify(requestPayload)).digest("hex"); const attempt=note.etimsSubmissionAttempts; const idempotencyKey=\`etims-note:${note._id}\`; const audit=await createSub` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 55:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 56:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 57:** `const body=await response.json().catch(()=>({})); audit.httpStatus=response.status;audit.response=body;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 58:** `const confirmation=getEtimsNoteConfirmation(response.ok,body);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `if(!confirmation){note.etimsStatus="failed";note.etimsLastError=String(body?.message||body?.error||(!response.ok?\`Adapter returned HTTP ${response.status}\`:"Adapter response did not include explicit success and officia` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `note.etimsStatus="synced";note.etimsReference=confirmation.reference;note.etimsReceiptNumber=confirmation.receiptNumber;note.etimsSubmittedAt=new Date();note.etimsNextRetryAt=null;note.etimsLastError="";note.etimsRespons` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `} catch(error){if(audit.status==="pending"){note.etimsStatus="failed";note.etimsLastError=String(error?.message||error||"eTIMS note submission failed").slice(0,2000);note.etimsNextRetryAt=nextEtimsRetryAt(note.etimsSubmi` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 11: `const adapterUrl = (profile) => String(profile?.etimsAdapterUrl || process.env.ETIMS_ADAPTER_URL || "").trim().replace(/\/$/, "");`.
- Line 12: `export function getEtimsNoteConfirmation(httpOk, body) {`.
- Line 14: `const reference = String(body.reference || body.noteNumber || body.etimsReference || "").trim();`.
- Line 15: `const receiptNumber = String(body.receiptNumber || body.etimsReceiptNumber || "").trim();`.
- Line 18: `const isPrivateAddress = (address) => {`.
- Line 23: `const assertAdapterUrl = async (rawUrl) => {`.
- Line 24: `let parsed; try { parsed = new URL(rawUrl); } catch { throw new Error("Invalid eTIMS adapter URL."); }`.
- Line 28: `const host=parsed.hostname.toLowerCase().replace(/^\[|\]$/g,"");`.
- Line 33: `const isRetryableEtimsHttpStatus = (status) => {`.
- Line 34: `const code = Number(status);`.
- Line 37: `const nextEtimsRetryAt = (attempt) =>`.
- Line 39: `<sensitive declaration redacted>`.
- Line 40: `export const enqueueNoteForEtims = async (noteId, tenantId, { manualRetry=false }={}) => { if(!noteId||!tenantId) throw new Error("Note and tenant are required for eTIMS queueing."`.
- Line 42: `const createSubmissionAudit = async ({tenantId,note,attempt,requestHash,idempotencyKey}) => {`.
- Line 48: `const note=await CreditDebitNote.findOne({tenantId:payload.tenantId,_id:payload.noteId}); if(!note) return; if(note.etimsStatus==="synced"&&note.etimsReference) return;`.
- Line 49: `const profile=await TaxProfile.findOne({tenantId:payload.tenantId}).lean(); if(!profile?.etimsEnabled){note.etimsStatus="not_submitted";await note.save();return;}`.
- Line 51: `const configuredUrl=adapterUrl(profile); if(!configuredUrl){note.etimsStatus="failed";note.etimsLastError="No eTIMS adapter is configured.";await note.save();throw new Error(note.e`.
- Line 52: `<sensitive declaration redacted>`.
- Line 53: `const requestPayload={noteId:String(note._id),noteNumber:note.noteNumber,type:note.type,originalInvoiceNumber:note.originalInvoiceNumber,originalEtimsInvoiceNumber:note.originalEti`.
- Line 54: `const requestHash=crypto.createHash("sha256").update(JSON.stringify(requestPayload)).digest("hex"); const attempt=note.etimsSubmissionAttempts; const idempotencyKey=\`etims-note:${`.
- Line 56: `<sensitive declaration redacted>`.
- Line 57: `const body=await response.json().catch(()=>({})); audit.httpStatus=response.status;audit.response=body;`.
- Line 58: `const confirmation=getEtimsNoteConfirmation(response.ok,body);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
