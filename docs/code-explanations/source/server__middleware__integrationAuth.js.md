# Source explanation: server/middleware/integrationAuth.js

**Source:** [server/middleware/integrationAuth.js](../../../server/middleware/integrationAuth.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `WebsiteIntegrationKey` from `../models/WebsiteIntegrationKey.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebsiteIntegrationKey.js](../../../server/models/WebsiteIntegrationKey.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `hashKey` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeOrigin` — lines 8–16

Parameters: `value (defaulted)`.
Error control: try=true, catch=false, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 10:** `const url = new URL(String(value).trim());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (!["http:", "https:"].includes(url.protocol)) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `return url.origin.toLowerCase();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 14:** `return String(value).trim().toLowerCase().replace(/\/$/, "");` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `requestOrigin` — lines 18–18

Parameters: `req`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getApiKeyFromRequest` — lines 20–21

Parameters: `req`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getPublicKeyFromRequest` — lines 23–24

Parameters: `req`.
Reads request/component inputs: req.query.

Key statements:

### `establishIntegrationTenant` — lines 26–62

Parameters: `req`, `key`, `arg3 (defaulted)`.
Reads request/component inputs: req.tenantId, req.tenant. Persistent operations detected: Organization.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 27:** `const tenant = await Organization.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `if (!tenant) return { error: { status: 403, message: "The connected company is not active." } };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const origin = requestOrigin(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const allowed = (key.allowedOrigins || []).map(normalizeOrigin).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (publicRequest) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `if (!origin) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `return { error: { status: 403, message: "A browser Origin is required for the public website connector." } };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 43:** `if (!allowed.length || !allowed.includes(origin)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `return { error: { status: 403, message: "This website origin is not authorized for this integration key." } };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 47:** `return { error: { status: 403, message: "This website origin is not authorized for this integration key." } };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 61:** `return { tenant };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `requireIntegrationKey` — lines 64–91

Parameters: `req`, `res`, `next`.
Persistent operations detected: WebsiteIntegrationKey.findOne, WebsiteIntegrationKey.updateOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 66:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `if (!rawKey || rawKey.length < 32) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 70:** `const key = await WebsiteIntegrationKey.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 75:** `if (!key) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 78:** `const result = await establishIntegrationTenant(req, key, { publicRequest: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 79:** `if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 80:** `await WebsiteIntegrationKey.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 84:** `return runWithTenant(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `requirePublicIntegrationKey` — lines 93–120

Parameters: `req`, `res`, `next`.
Persistent operations detected: WebsiteIntegrationKey.findOne, WebsiteIntegrationKey.updateOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 94:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 95:** `const publicKey = getPublicKeyFromRequest(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 96:** `if (!publicKey || publicKey.length < 20) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `return res.status(401).json({ success: false, message: "Public integration site key is required." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 99:** `const key = await WebsiteIntegrationKey.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 104:** `if (!key) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `return res.status(401).json({ success: false, message: "Invalid or revoked integration site key." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 107:** `const result = await establishIntegrationTenant(req, key, { publicRequest: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 108:** `if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 109:** `await WebsiteIntegrationKey.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 113:** `return runWithTenant(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `requireIntegrationPermission` — lines 122–130

Parameters: `permission`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 123:** `if (!req.integration?.permissions?.has(permission)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 124:** `return res.status(403).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const hashKey = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");`.
- Line 8: `const normalizeOrigin = (value = "") => {`.
- Line 10: `const url = new URL(String(value).trim());`.
- Line 18: `const requestOrigin = (req) => normalizeOrigin(req.get("Origin") || "");`.
- Line 20: `<sensitive declaration redacted>`.
- Line 23: `export const getPublicKeyFromRequest = (req) =>`.
- Line 27: `const tenant = await Organization.findOne({`.
- Line 33: `const origin = requestOrigin(req);`.
- Line 34: `const allowed = (key.allowedOrigins || []).map(normalizeOrigin).filter(Boolean);`.
- Line 64: `export const requireIntegrationKey = async (req, res, next) => {`.
- Line 66: `<sensitive declaration redacted>`.
- Line 70: `const key = await WebsiteIntegrationKey.findOne({`.
- Line 78: `const result = await establishIntegrationTenant(req, key, { publicRequest: false });`.
- Line 93: `export const requirePublicIntegrationKey = async (req, res, next) => {`.
- Line 95: `const publicKey = getPublicKeyFromRequest(req);`.
- Line 99: `const key = await WebsiteIntegrationKey.findOne({`.
- Line 107: `const result = await establishIntegrationTenant(req, key, { publicRequest: true });`.
- Line 122: `export const requireIntegrationPermission = (permission) => (req, res, next) => {`.
- Line 132: `export const hashIntegrationKey = hashKey;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
