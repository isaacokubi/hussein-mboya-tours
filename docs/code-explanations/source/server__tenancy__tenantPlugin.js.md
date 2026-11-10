# Source explanation: server/tenancy/tenantPlugin.js

**Source:** [server/tenancy/tenantPlugin.js](../../../server/tenancy/tenantPlugin.js)

## Purpose

A tenant context/query isolation primitive used by request middleware, model plugins and domain services.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getTenantId`, `isTenantBypassed` from `./context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `requireTenantId` — lines 9–15

Parameters: none.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `if (isTenantBypassed()) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `const tenantId = getTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `if (!tenantId) throw new Error("Tenant context is required for tenant-scoped data access.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (!mongoose.Types.ObjectId.isValid(tenantId)) throw new Error("Invalid tenant context.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `return String(tenantId);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tenantObjectId` — lines 17–19

Parameters: `tenantId (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 18:** `return tenantId ? new mongoose.Types.ObjectId(tenantId) : null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assertTenantValue` — lines 21–33

Parameters: `value`, `tenantId`, `message (defaulted)`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `if (value == null) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `if (typeof value === "object" && !value._bsontype && (value.$eq !== undefined || value.$in !== undefined || value.$ne !== undefined)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const candidate = value.$eq ?? value.$in;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (Array.isArray(candidate)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (candidate.some((item) => String(item) !== String(tenantId))) throw new Error(message);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `if (candidate !== undefined && String(candidate) !== String(tenantId)) throw new Error(message);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 32:** `if (String(value) !== String(tenantId)) throw new Error(message);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `isPlatformOwnerDocument` — lines 35–38

Parameters: `document`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 36:** `const role = String(document?.role || document?.legacyRole || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `return PLATFORM_ROLES.has(role) && !document?.tenantId;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `mergeTenantFilter` — lines 40–48

Parameters: `query`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (!tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `const current = query.getFilter?.() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `if (Object.prototype.hasOwnProperty.call(current, TENANT_PATH)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `enforceUpdateTenant` — lines 50–76

Parameters: `update`, `tenantId`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 51:** `if (!update || !tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `if (Array.isArray(update)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `for (const stage of update) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 54:** `if (stage?.$replaceRoot || stage?.$replaceWith || stage?.$project) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `throw new Error("Tenant-scoped update pipelines cannot replace or project the document root.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 57:** `const requestedTenant = stage?.$set?.[TENANT_PATH] ?? stage?.$addFields?.[TENANT_PATH] ?? stage?.$setOnInsert?.[TENANT_PATH];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const unset = stage?.$unset;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `const unsetPaths = Array.isArray(unset)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const attemptsToUnset = unsetPaths.includes(TENANT_PATH);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `if (attemptsToUnset) throw new Error("Cross-tenant tenantId removal rejected.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 70:** `const requestedTenant = update.$set?.[TENANT_PATH] ?? update[TENANT_PATH] ?? update.$setOnInsert?.[TENANT_PATH];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `if (update.$unset && Object.prototype.hasOwnProperty.call(update.$unset, TENANT_PATH)) delete update.$unset[TENANT_PATH];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `if (Object.prototype.hasOwnProperty.call(update, TENANT_PATH)) delete update[TENANT_PATH];` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `enforceReplacementTenant` — lines 78–82

Parameters: `replacement`, `tenantId`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 79:** `if (!replacement || Array.isArray(replacement) || !tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `enforceBulkWriteTenant` — lines 84–105

Parameters: `operations`, `tenantId`.
9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 85:** `if (!Array.isArray(operations) || !tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `for (const operation of operations) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 87:** `if (operation.insertOne?.document) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `const document = operation.insertOne.document;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `if (isPlatformOwnerDocument(document)) document[TENANT_PATH] = null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `else { assertTenantValue(document[TENANT_PATH], tenantId); document[TENANT_PATH] = tenantId; }` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const updateOperation = operation.updateOne || operation.updateMany || operation.replaceOne;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `if (updateOperation) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 96:** `if (updateOperation.update) enforceUpdateTenant(updateOperation.update, tenantId);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `if (updateOperation.replacement) enforceReplacementTenant(updateOperation.replacement, tenantId);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `const deleteOperation = operation.deleteOne || operation.deleteMany;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `if (deleteOperation) {` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `enforceLookupStage` — lines 107–118

Parameters: `stage`, `tenantId`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 108:** `if (!stage?.$lookup || !tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 109:** `const lookup = stage.$lookup;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `if (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase())) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 112:** `const tenantMatch = { [TENANT_PATH]: tenantObjectId(tenantId) };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 113:** `const existingTenant = lookup.pipeline.find((entry) => entry?.$match && Object.prototype.hasOwnProperty.call(entry.$match, TENANT_PATH));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 114:** `if (existingTenant) {` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `enforceUnionStage` — lines 120–135

Parameters: `stage`, `tenantId`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 121:** `if (!stage?.$unionWith || !tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 122:** `if (typeof stage.$unionWith === "string") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 123:** `if (GLOBAL_COLLECTIONS.has(stage.$unionWith.toLowerCase())) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 127:** `const union = stage.$unionWith;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `if (!union.coll || GLOBAL_COLLECTIONS.has(String(union.coll).toLowerCase())) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 130:** `const existingTenant = union.pipeline.find((entry) => entry?.$match && Object.prototype.hasOwnProperty.call(entry.$match, TENANT_PATH));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 131:** `if (existingTenant) {` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `enforceGraphLookupStage` — lines 137–144

Parameters: `stage`, `tenantId`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 138:** `if (!stage?.$graphLookup || !tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 139:** `const lookup = stage.$graphLookup;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 140:** `if (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase())) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `enforceNestedAggregatePipelines` — lines 146–160

Parameters: `pipeline`, `tenantId`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 147:** `for (const stage of pipeline || []) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 152:** `if (stage?.$facet && typeof stage.$facet === "object") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 153:** `for (const nestedPipeline of Object.values(stage.$facet)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 154:** `if (Array.isArray(nestedPipeline)) enforceNestedAggregatePipelines(nestedPipeline, tenantId);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 157:** `if (Array.isArray(stage?.$lookup?.pipeline)) enforceNestedAggregatePipelines(stage.$lookup.pipeline, tenantId);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 158:** `if (Array.isArray(stage?.$unionWith?.pipeline)) enforceNestedAggregatePipelines(stage.$unionWith.pipeline, tenantId);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `tenantPlugin` — lines 162–274

Parameters: `schema`, `options (defaulted)`.
Error control: try=true, catch=true, finally=false. 35 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 163:** `if (schema[TENANT_PLUGIN_MARKER]) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 165:** `if (options.global === true) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 166:** `if (!schema.path(TENANT_PATH)) schema.add({ [TENANT_PATH]: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true, immutable: true } });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 168:** `const declaredIndexes = schema.indexes();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 169:** `const singleFieldIndexes = new Set(declaredIndexes.filter(([keys]) => Object.keys(keys || {}).length === 1).map(([keys]) => Object.keys(keys)[0]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 170:** `for (const [pathName, path] of Object.entries(schema.paths || {})) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 171:** `if (pathName !== TENANT_PATH && path?.options?.index === true && singleFieldIndexes.has(pathName)) path.options.index = false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 173:** `for (const path of Object.values(schema.paths || {})) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 174:** `if (!path?.options?.unique || path.path === TENANT_PATH) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 175:** `const field = path.path;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 176:** `const sparse = Boolean(path.options.sparse);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 177:** `try { schema.removeIndex({ [field]: 1 }); } catch { /* legacy Mongo index */ }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 186:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 187:** `if (isPlatformOwnerDocument(this)) { this.tenantId = null; return next(); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 192:** `const tenantId = getTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 193:** `if (!tenantId) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 194:** `if (!mongoose.Types.ObjectId.isValid(tenantId)) throw new Error("Invalid tenant context.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 196:** `if (!this.tenantId) this.tenantId = tenantId;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 4: `const TENANT_PATH = "tenantId";`.
- Line 5: `const GLOBAL_COLLECTIONS = new Set(["organizations", "permissions", "currencies"]);`.
- Line 6: `const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);`.
- Line 7: `const TENANT_PLUGIN_MARKER = Symbol.for("globalTours.tenantPluginApplied");`.
- Line 9: `function requireTenantId() {`.
- Line 11: `const tenantId = getTenantId();`.
- Line 17: `function tenantObjectId(tenantId = requireTenantId()) {`.
- Line 21: `function assertTenantValue(value, tenantId, message = "Cross-tenant write rejected.") {`.
- Line 24: `const candidate = value.$eq ?? value.$in;`.
- Line 35: `function isPlatformOwnerDocument(document) {`.
- Line 36: `const role = String(document?.role || document?.legacyRole || "").trim().toLowerCase();`.
- Line 40: `function mergeTenantFilter(query) {`.
- Line 41: `const tenantId = requireTenantId();`.
- Line 43: `const current = query.getFilter?.() || {};`.
- Line 50: `function enforceUpdateTenant(update, tenantId) {`.
- Line 57: `const requestedTenant = stage?.$set?.[TENANT_PATH] ?? stage?.$addFields?.[TENANT_PATH] ?? stage?.$setOnInsert?.[TENANT_PATH];`.
- Line 59: `const unset = stage?.$unset;`.
- Line 60: `const unsetPaths = Array.isArray(unset)`.
- Line 65: `const attemptsToUnset = unsetPaths.includes(TENANT_PATH);`.
- Line 70: `const requestedTenant = update.$set?.[TENANT_PATH] ?? update[TENANT_PATH] ?? update.$setOnInsert?.[TENANT_PATH];`.
- Line 78: `function enforceReplacementTenant(replacement, tenantId) {`.
- Line 84: `function enforceBulkWriteTenant(operations, tenantId) {`.
- Line 88: `const document = operation.insertOne.document;`.
- Line 92: `const updateOperation = operation.updateOne || operation.updateMany || operation.replaceOne;`.
- Line 99: `const deleteOperation = operation.deleteOne || operation.deleteMany;`.
- Line 107: `function enforceLookupStage(stage, tenantId) {`.
- Line 109: `const lookup = stage.$lookup;`.
- Line 112: `const tenantMatch = { [TENANT_PATH]: tenantObjectId(tenantId) };`.
- Line 113: `const existingTenant = lookup.pipeline.find((entry) => entry?.$match && Object.prototype.hasOwnProperty.call(entry.$match, TENANT_PATH));`.
- Line 120: `function enforceUnionStage(stage, tenantId) {`.
- Line 127: `const union = stage.$unionWith;`.
- Line 130: `const existingTenant = union.pipeline.find((entry) => entry?.$match && Object.prototype.hasOwnProperty.call(entry.$match, TENANT_PATH));`.
- Line 137: `function enforceGraphLookupStage(stage, tenantId) {`.
- Line 139: `const lookup = stage.$graphLookup;`.
- Line 146: `function enforceNestedAggregatePipelines(pipeline, tenantId) {`.
- Line 162: `export function tenantPlugin(schema, options = {}) {`.
- Line 168: `const declaredIndexes = schema.indexes();`.
- Line 169: `const singleFieldIndexes = new Set(declaredIndexes.filter(([keys]) => Object.keys(keys || {}).length === 1).map(([keys]) => Object.keys(keys)[0]));`.
- Line 175: `const field = path.path;`.
- Line 176: `const sparse = Boolean(path.options.sparse);`.
- Line 192: `const tenantId = getTenantId();`.
- Line 204: `const tenantId = requireTenantId();`.
- Line 214: `const tenantId = requireTenantId();`.
- Line 227: `const tenantId = requireTenantId();`.
- Line 246: `const tenantId = requireTenantId();`.
- Line 255: `const tenantId = requireTenantId();`.
- Line 257: `const pipeline = this.pipeline();`.
- Line 258: `const match = { [TENANT_PATH]: tenantObjectId(tenantId) };`.
- Line 260: `const query = pipeline[0].$geoNear.query || {};`.
- Line 264: `const existing = pipeline[0].$match;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
