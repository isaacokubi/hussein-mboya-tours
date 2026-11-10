# Source explanation: server/controllers/websiteLeadController.js

**Source:** [server/controllers/websiteLeadController.js](../../../server/controllers/websiteLeadController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Lead` from `../models/Lead.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Lead.js](../../../server/models/Lead.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `clean` — lines 5–5

Parameters: `value`, `max (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeEmail` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `safeUtm` — lines 8–15

Parameters: `value`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `if (!value || typeof value !== "object") return {};` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `const result = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `for (const key of ["source", "medium", "campaign", "term", "content"]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 12:** `if (value[key] !== undefined) result[key] = clean(value[key], 160);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `return result;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `safeFields` — lines 17–26

Parameters: `value`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `if (!value || typeof value !== "object" || Array.isArray(value)) return {};` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `const result = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `for (const [key, raw] of Object.entries(value).slice(0, 50)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 21:** `const name = clean(key, 80);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `return result;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createWebsiteLead` — lines 28–82

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId. Persistent operations detected: Tour.findOne, Lead.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 31:** `const body = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const customer = body.customer || body.contact || body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const name = clean(customer.name || \`${customer.firstName || ""} ${customer.lastName || ""}\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const parts = name.split(/\s+/).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const firstName = clean(customer.firstName || parts.shift() || "Website");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const lastName = clean(customer.lastName || parts.join(" ") || "Lead");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const phone = clean(customer.phone || customer.phoneNumber || customer.mobile, 40);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const email = normalizeEmail(customer.email || customer.emailAddress);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `if (!phone) return res.status(400).json({ success: false, message: "Customer phone number is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email address." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `let tour = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const tourId = body.tourId || body.tour || customer.tourId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const tourSlug = clean(body.tourSlug || customer.tourSlug, 180).toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `if (tourId || tourSlug) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `const filter = { published: true, available: true, isDeleted: false };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (tourId) filter._id = tourId;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `else filter.slug = tourSlug;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `listWebsiteLeads` — lines 84–97

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query, req.tenantId. Persistent operations detected: Lead.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 85:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 87:** `const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const filter = { tenantId: req.tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `if (req.query.status) filter.status = clean(req.query.status, 30);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `if (req.query.search) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 91:** `const search = clean(req.query.search, 120);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const leads = await Lead.find(filter).populate("tour", "title slug").sort({ createdAt: -1 }).limit(limit).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 95:** `res.json({ success: true, count: leads.length, leads });` — Sends a JSON response; inspect its caller for status and error semantics.

### `updateWebsiteLead` — lines 99–108

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params, req.tenantId. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 100:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 102:** `const updates = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `for (const key of ["status", "message", "lastContactedAt", "convertedBooking"]) if (req.body?.[key] !== undefined) updates[key] = req.body[key];` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 104:** `const lead = await Lead.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenantId }, { $set: updates }, { new: true, runValidators: true }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 105:** `if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 106:** `res.json({ success: true, lead });` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 5: `const clean = (value, max = 500) => String(value ?? "").trim().slice(0, max);`.
- Line 6: `const normalizeEmail = (value) => clean(value, 180).toLowerCase();`.
- Line 8: `const safeUtm = (value) => {`.
- Line 10: `const result = {};`.
- Line 17: `const safeFields = (value) => {`.
- Line 19: `const result = {};`.
- Line 21: `const name = clean(key, 80);`.
- Line 28: `export const createWebsiteLead = async (req, res, next) => {`.
- Line 31: `const body = req.body || {};`.
- Line 32: `const customer = body.customer || body.contact || body;`.
- Line 33: `const name = clean(customer.name || \`${customer.firstName || ""} ${customer.lastName || ""}\`);`.
- Line 34: `const parts = name.split(/\s+/).filter(Boolean);`.
- Line 35: `const firstName = clean(customer.firstName || parts.shift() || "Website");`.
- Line 36: `const lastName = clean(customer.lastName || parts.join(" ") || "Lead");`.
- Line 37: `const phone = clean(customer.phone || customer.phoneNumber || customer.mobile, 40);`.
- Line 38: `const email = normalizeEmail(customer.email || customer.emailAddress);`.
- Line 43: `let tour = null;`.
- Line 44: `const tourId = body.tourId || body.tour || customer.tourId;`.
- Line 45: `const tourSlug = clean(body.tourSlug || customer.tourSlug, 180).toLowerCase();`.
- Line 47: `const filter = { published: true, available: true, isDeleted: false };`.
- Line 53: `const marketingConsent = customer.marketingConsent === true || body.marketingConsent === true;`.
- Line 54: `const lead = await Lead.create({`.
- Line 84: `export const listWebsiteLeads = async (req, res, next) => {`.
- Line 87: `const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);`.
- Line 88: `const filter = { tenantId: req.tenantId };`.
- Line 91: `const search = clean(req.query.search, 120);`.
- Line 94: `const leads = await Lead.find(filter).populate("tour", "title slug").sort({ createdAt: -1 }).limit(limit).lean();`.
- Line 99: `export const updateWebsiteLead = async (req, res, next) => {`.
- Line 102: `const updates = {};`.
- Line 104: `const lead = await Lead.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenantId }, { $set: updates }, { new: true, runValidators: true }).lean();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
