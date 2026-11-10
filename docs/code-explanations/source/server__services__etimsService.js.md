# Source explanation: server/services/etimsService.js

**Source:** [server/services/etimsService.js](../../../server/services/etimsService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dns` from `dns/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `net` from `net`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
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

### `getEtimsConfirmation` — lines 13–24

Parameters: `httpOk`, `body`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `if (!httpOk || body?.success !== true) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `const invoiceNumber = String(body.invoiceNumber || body.etimsInvoiceNumber || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const receiptReference = String(body.receiptNumber || body.etimsReceiptNumber || body.uniqueRegisterIdentifier || body.uir || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (!invoiceNumber || !receiptReference) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isPrivateAddress` — lines 26–36

Parameters: `address`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 27:** `if (net.isIPv4(address)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const [a, b] = address.split(".").map(Number);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 0) || (a === 192 && b === 168) || (a === 198 && (b ===` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 31:** `if (net.isIPv6(address)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `const value = address.toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:") || value.startsWith("ff");` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 35:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assertAdapterUrl` — lines 38–53

Parameters: `rawUrl`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `let parsed;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `try { parsed = new URL(rawUrl); } catch { throw new Error("Invalid eTIMS adapter URL."); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 41:** `if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("eTIMS adapter URL must use HTTP(S).");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("Production eTIMS adapter must use HTTPS.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `if (["localhost", "localhost.localdomain", "metadata.google.internal", "metadata", "host.docker.internal"].includes(host) || (net.isIP(host) && isPrivateAddress(host))) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `throw new Error("eTIMS adapter cannot target a private or local address.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 48:** `if (!net.isIP(host)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `const records = await dns.lookup(host, { all: true, verbatim: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 50:** `if (!records.length || records.some(({ address }) => isPrivateAddress(address))) throw new Error("eTIMS adapter hostname resolves to a private or local address.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `return parsed.toString().replace(/\/$/, "");` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isRetryableEtimsHttpStatus` — lines 55–58

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 56:** `const code = Number(status);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `return code === 408 || code === 429 || code >= 500;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `nextEtimsRetryAt` — lines 60–61

Parameters: `attempt`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `adapterToken` — lines 63–66

Parameters: `tenantId`, `environment`.
Persistent operations detected: EtimsCredential.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 64:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 65:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.

### `buildEtimsInvoicePayload` — lines 68–77

Parameters: `invoice`, `profile`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `enqueueInvoiceForEtims` — lines 79–84

Parameters: `invoiceId`, `tenantId`, `arg3 (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 80:** `if (!invoiceId || !tenantId) throw new Error("Invoice and tenant are required for eTIMS queueing.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `const idempotencyKey = \`etims-invoice:${invoiceId}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `if (manualRetry) await retryDeadJob({ tenantId, idempotencyKey });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `return enqueueJob("etims.invoice.submit", { invoiceId: String(invoiceId), tenantId: String(tenantId) }, { tenantId, idempotencyKey });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createSubmissionAudit` — lines 86–93

Parameters: `{tenantId, invoice, attempt, requestHash, idempotencyKey}`.
Persistent operations detected: EtimsSubmission.create, EtimsSubmission.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 87:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 88:** `return await EtimsSubmission.create({ tenantId, documentType: "invoice", documentId: invoice._id, documentNumber: invoice.invoiceNumber, attempt, status: "pending", idempotencyKey, requestHash });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 90:** `if (error?.code !== 11000) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 91:** `return EtimsSubmission.findOne({ tenantId, documentType: "invoice", documentId: invoice._id, attempt });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `processEtimsInvoiceJob` — lines 95–183

Parameters: `payload`.
Persistent operations detected: Invoice.findOne, TaxProfile.findOne; verify tenant/ownership filters in the exact query. 14 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 96:** `const invoice = await Invoice.findOne({ tenantId: payload.tenantId, _id: payload.invoiceId, isDeleted: { $ne: true } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 97:** `if (!invoice) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 98:** `if (invoice.etimsStatus === "synced" && invoice.etimsInvoiceNumber) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 100:** `const profile = await TaxProfile.findOne({ tenantId: payload.tenantId }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 101:** `if (!profile?.etimsEnabled) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `await invoice.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 105:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 108:** `const configuredUrl = adapterUrl(profile);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `if (!configuredUrl) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 112:** `await invoice.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 113:** `throw new Error(invoice.etimsLastError);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 115:** `const url = await assertAdapterUrl(configuredUrl);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 116:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 121:** `await invoice.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 123:** `const requestPayload = buildEtimsInvoicePayload(invoice, profile);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `const requestHash = crypto.createHash("sha256").update(JSON.stringify(requestPayload)).digest("hex");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 125:** `const attempt = invoice.etimsSubmissionAttempts;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `const idempotencyKey = \`etims-invoice:${invoice._id}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `enqueueDueEtimsInvoices` — lines 185–203

Parameters: none.
Persistent operations detected: TaxProfile.find, Invoice.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 186:** `const profiles = await TaxProfile.find({ etimsEnabled: true }).select("tenantId").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 187:** `let queued = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 188:** `for (const profile of profiles) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 189:** `const invoices = await Invoice.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 197:** `for (const invoice of invoices) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 198:** `await enqueueInvoiceForEtims(invoice._id, profile.tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 202:** `return queued;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 11: `const adapterUrl = (profile) => String(profile?.etimsAdapterUrl || process.env.ETIMS_ADAPTER_URL || "").trim().replace(/\/$/, "");`.
- Line 13: `export function getEtimsConfirmation(httpOk, body) {`.
- Line 15: `const invoiceNumber = String(body.invoiceNumber || body.etimsInvoiceNumber || "").trim();`.
- Line 16: `const receiptReference = String(body.receiptNumber || body.etimsReceiptNumber || body.uniqueRegisterIdentifier || body.uir || "").trim();`.
- Line 26: `function isPrivateAddress(address) {`.
- Line 28: `const [a, b] = address.split(".").map(Number);`.
- Line 32: `const value = address.toLowerCase();`.
- Line 39: `let parsed;`.
- Line 44: `const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");`.
- Line 49: `const records = await dns.lookup(host, { all: true, verbatim: true });`.
- Line 55: `const isRetryableEtimsHttpStatus = (status) => {`.
- Line 56: `const code = Number(status);`.
- Line 60: `const nextEtimsRetryAt = (attempt) =>`.
- Line 63: `<sensitive declaration redacted>`.
- Line 64: `<sensitive declaration redacted>`.
- Line 68: `export const buildEtimsInvoicePayload = (invoice, profile) => ({`.
- Line 81: `const idempotencyKey = \`etims-invoice:${invoiceId}\`;`.
- Line 96: `const invoice = await Invoice.findOne({ tenantId: payload.tenantId, _id: payload.invoiceId, isDeleted: { $ne: true } });`.
- Line 100: `const profile = await TaxProfile.findOne({ tenantId: payload.tenantId }).lean();`.
- Line 108: `const configuredUrl = adapterUrl(profile);`.
- Line 115: `const url = await assertAdapterUrl(configuredUrl);`.
- Line 116: `<sensitive declaration redacted>`.
- Line 123: `const requestPayload = buildEtimsInvoicePayload(invoice, profile);`.
- Line 124: `const requestHash = crypto.createHash("sha256").update(JSON.stringify(requestPayload)).digest("hex");`.
- Line 125: `const attempt = invoice.etimsSubmissionAttempts;`.
- Line 126: `const idempotencyKey = \`etims-invoice:${invoice._id}\`;`.
- Line 127: `const audit = await createSubmissionAudit({ tenantId: payload.tenantId, invoice, attempt, requestHash, idempotencyKey });`.
- Line 130: `const response = await fetch(\`${url}/invoices\`, {`.
- Line 136: `const body = await response.json().catch(() => ({}));`.
- Line 139: `const confirmation = getEtimsConfirmation(response.ok, body);`.
- Line 146: `const retryable = !response.ok && isRetryableEtimsHttpStatus(response.status);`.
- Line 186: `const profiles = await TaxProfile.find({ etimsEnabled: true }).select("tenantId").lean();`.
- Line 187: `let queued = 0;`.
- Line 189: `const invoices = await Invoice.find({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
