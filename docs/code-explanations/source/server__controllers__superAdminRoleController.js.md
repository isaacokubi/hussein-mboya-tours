# Source explanation: server/controllers/superAdminRoleController.js

**Source:** [server/controllers/superAdminRoleController.js](../../../server/controllers/superAdminRoleController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Permission` from `../models/Permission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Permission.js](../../../server/models/Permission.js)

## Runtime declarations and data flow

### `normalizeIds` — lines 5–5

Parameters: `values (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeRoleName` — lines 6–6

Parameters: `value (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `canonicalizePlatformRoles` — lines 19–51

Parameters: `roles`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const grouped = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `for (const role of roles) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 22:** `const key = normalizeRoleName(role.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const existing = grouped.get(key);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!existing) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `const existingPreferred = Boolean(existing.isSystem) && Number(existing.level) <= 100;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const candidatePreferred = Boolean(role.isSystem) && Number(role.level) <= 100;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const preferred = candidatePreferred && !existingPreferred ? role : existing;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const mergedPermissions = normalizeIds([` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `return [...grouped.values()].map((role) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 40:** `const key = normalizeRoleName(role.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const metadata = PLATFORM_ROLE_METADATA[key];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (!metadata) return role;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `populateRolePermissions` — lines 53–65

Parameters: `roles`.
Persistent operations detected: Permission.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 54:** `const permissionIds = normalizeIds(roles.flatMap((role) => (role.permissions || []).map((permission) => permission?._id || permission)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const permissionDocs = permissionIds.length` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `? await Permission.find({ _id: { $in: permissionIds }, isActive: { $ne: false } }).lean()` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 58:** `const permissionMap = new Map(permissionDocs.map((permission) => [String(permission._id), permission]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `return roles.map((role) => ({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPlatformRoles` — lines 67–74

Parameters: `req`, `res`, `next`.
Persistent operations detected: Role.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 68:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 69:** `const roles = await Role.find({}).populate("permissions", "name label description module category isActive").sort({ level: -1, createdAt: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 70:** `const canonicalRoles = canonicalizePlatformRoles(roles);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `const hydratedRoles = await populateRolePermissions(canonicalRoles);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `return res.json({ success: true, count: hydratedRoles.length, roles: hydratedRoles, data: hydratedRoles });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPlatformPermissions` — lines 76–81

Parameters: `req`, `res`, `next`.
Persistent operations detected: Permission.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 77:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 78:** `const permissions = await Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 79:** `return res.json({ success: true, count: permissions.length, permissions, data: permissions });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPlatformRole` — lines 83–94

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Role.findById; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 84:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 85:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `const role = await Role.findById(req.params.id).populate("permissions", "name label description module category isActive").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 87:** `if (!role) return res.status(404).json({ success: false, message: "Role not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `const [hydrated] = await populateRolePermissions([role]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `const key = normalizeRoleName(hydrated.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const metadata = PLATFORM_ROLE_METADATA[key];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `const normalizedRole = metadata ? { ...hydrated, displayName: metadata.displayName, level: metadata.level, isSystem: true, status: "active" } : hydrated;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `return res.json({ success: true, role: normalizedRole, data: normalizedRole });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updatePlatformRolePermissions` — lines 96–114

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Role.findById, Permission.countDocuments; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 97:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 98:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `const role = await Role.findById(req.params.id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 100:** `if (!role) return res.status(404).json({ success: false, message: "Role not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 101:** `const normalized = normalizeRoleName(role.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `if (["super_admin", "superadmin"].includes(normalized)) return res.status(403).json({ success: false, message: "The Super Admin role permissions are protected." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 103:** `const ids = normalizeIds(req.body?.permissions);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const valid = ids.length ? await Permission.countDocuments({ _id: { $in: ids }, isActive: { $ne: false } }) : 0;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 105:** `if (valid !== ids.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 107:** `await role.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 108:** `const updated = await Role.findById(role._id).populate("permissions", "name label description module category isActive").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 109:** `const [hydrated] = await populateRolePermissions([updated]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 110:** `const metadata = PLATFORM_ROLE_METADATA[normalizeRoleName(hydrated.name)];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 111:** `const normalizedRole = metadata ? { ...hydrated, displayName: metadata.displayName, level: metadata.level, isSystem: true, status: "active" } : hydrated;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 112:** `return res.json({ success: true, message: "Role permissions updated successfully.", role: normalizedRole, data: normalizedRole });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const normalizeIds = (values = []) => Array.from(new Set((Array.isArray(values) ? values : []).filter((v) => mongoose.Types.ObjectId.isValid(v)).map(String)));`.
- Line 6: `const normalizeRoleName = (value = "") => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");`.
- Line 8: `const PLATFORM_ROLE_METADATA = {`.
- Line 19: `const canonicalizePlatformRoles = (roles) => {`.
- Line 20: `const grouped = new Map();`.
- Line 22: `const key = normalizeRoleName(role.name);`.
- Line 23: `const existing = grouped.get(key);`.
- Line 29: `const existingPreferred = Boolean(existing.isSystem) && Number(existing.level) <= 100;`.
- Line 30: `const candidatePreferred = Boolean(role.isSystem) && Number(role.level) <= 100;`.
- Line 31: `const preferred = candidatePreferred && !existingPreferred ? role : existing;`.
- Line 32: `const mergedPermissions = normalizeIds([`.
- Line 40: `const key = normalizeRoleName(role.name);`.
- Line 41: `const metadata = PLATFORM_ROLE_METADATA[key];`.
- Line 53: `const populateRolePermissions = async (roles) => {`.
- Line 54: `const permissionIds = normalizeIds(roles.flatMap((role) => (role.permissions || []).map((permission) => permission?._id || permission)));`.
- Line 55: `const permissionDocs = permissionIds.length`.
- Line 58: `const permissionMap = new Map(permissionDocs.map((permission) => [String(permission._id), permission]));`.
- Line 67: `export const getPlatformRoles = async (req, res, next) => {`.
- Line 69: `const roles = await Role.find({}).populate("permissions", "name label description module category isActive").sort({ level: -1, createdAt: 1 }).lean();`.
- Line 70: `const canonicalRoles = canonicalizePlatformRoles(roles);`.
- Line 71: `const hydratedRoles = await populateRolePermissions(canonicalRoles);`.
- Line 76: `export const getPlatformPermissions = async (req, res, next) => {`.
- Line 78: `const permissions = await Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean();`.
- Line 83: `export const getPlatformRole = async (req, res, next) => {`.
- Line 86: `const role = await Role.findById(req.params.id).populate("permissions", "name label description module category isActive").lean();`.
- Line 88: `const [hydrated] = await populateRolePermissions([role]);`.
- Line 89: `const key = normalizeRoleName(hydrated.name);`.
- Line 90: `const metadata = PLATFORM_ROLE_METADATA[key];`.
- Line 91: `const normalizedRole = metadata ? { ...hydrated, displayName: metadata.displayName, level: metadata.level, isSystem: true, status: "active" } : hydrated;`.
- Line 96: `export const updatePlatformRolePermissions = async (req, res, next) => {`.
- Line 99: `const role = await Role.findById(req.params.id);`.
- Line 101: `const normalized = normalizeRoleName(role.name);`.
- Line 103: `const ids = normalizeIds(req.body?.permissions);`.
- Line 104: `const valid = ids.length ? await Permission.countDocuments({ _id: { $in: ids }, isActive: { $ne: false } }) : 0;`.
- Line 108: `const updated = await Role.findById(role._id).populate("permissions", "name label description module category isActive").lean();`.
- Line 109: `const [hydrated] = await populateRolePermissions([updated]);`.
- Line 110: `const metadata = PLATFORM_ROLE_METADATA[normalizeRoleName(hydrated.name)];`.
- Line 111: `const normalizedRole = metadata ? { ...hydrated, displayName: metadata.displayName, level: metadata.level, isSystem: true, status: "active" } : hydrated;`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
