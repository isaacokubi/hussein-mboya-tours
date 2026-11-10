# Source explanation: server/controllers/adminRoleController.js

**Source:** [server/controllers/adminRoleController.js](../../../server/controllers/adminRoleController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Permission` from `../models/Permission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Permission.js](../../../server/models/Permission.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `normalizeRole` from `../utils/roleUtils.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/roleUtils.js](../../../server/utils/roleUtils.js)

## Runtime declarations and data flow

### `consolidateRoleAliases` — lines 40–92

Parameters: none.
Persistent operations detected: Role.find, Role.create, User.updateMany, Role.updateOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `for (const [canonical, aliases] of Object.entries(ROLE_ALIAS_GROUPS)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 42:** `const names = [canonical, ...aliases];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const roles = await Role.find({ name: { $in: names } })` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 47:** `if (!roles.length) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `const canonicalRole = roles.find((role) => role.name === canonical);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 50:** `let target = canonicalRole;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `if (!target) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `const source = roles[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `target = await Role.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 68:** `const targetPermissions = new Set((target.permissions || []).map((id) => String(id)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const aliasIds = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `for (const role of roles) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 72:** `if (String(role._id) === String(target._id)) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `for (const permissionId of role.permissions || []) targetPermissions.add(String(permissionId));` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 77:** `if (aliasIds.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `await User.updateMany(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 82:** `await Role.deleteMany({ _id: { $in: aliasIds } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 85:** `if (targetPermissions.size !== (target.permissions || []).length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `validObjectId` — lines 94–94

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `sanitizePermissionIds` — lines 96–98

Parameters: `values (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ensureRoleIndexes` — lines 100–134

Parameters: none.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 101:** `if (roleIndexesPromise) return roleIndexesPromise;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `const indexes = await Role.collection.indexes();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 105:** `const legacyNameIndex = indexes.find(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 109:** `if (legacyNameIndex) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 110:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 111:** `await Role.collection.dropIndex(legacyNameIndex.name);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 113:** `if (error?.codeName !== "IndexNotFound" && error?.code !== 27) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 117:** `const refreshed = await Role.collection.indexes();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 118:** `const tenantNameIndex = refreshed.find(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 122:** `if (!tenantNameIndex) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 123:** `await Role.collection.createIndex(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 130:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 133:** `return roleIndexesPromise;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ensureDefaultPermissions` — lines 136–198

Parameters: none.
Persistent operations detected: Permission.find, Role.findOne, Role.updateOne; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 138:** `if (defaultsBootstrapPromise) return defaultsBootstrapPromise;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 141:** `await ensureRoleIndexes();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 142:** `await consolidateRoleAliases();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 144:** `const allNames = [...new Set(Object.values(DEFAULT_PERMISSIONS).flat())];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 145:** `await Permission.bulkWrite(allNames.map((name) => ({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 161:** `if (error?.code !== 11000 && !error?.writeErrors?.every((e) => e?.code === 11000)) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 164:** `const permissions = await Permission.find({ name: { $in: allNames } }).select("_id name").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 165:** `const byName = new Map(permissions.map((permission) => [permission.name, permission._id]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 167:** `for (const [roleName, names] of Object.entries(DEFAULT_PERMISSIONS)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 168:** `const role = await Role.findOne({ name: roleName }).select("_id name permissions level").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 169:** `const ids = names.map((name) => byName.get(name)).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 170:** `const merged = new Map(sanitizePermissionIds(role?.permissions || []).map((id) => [String(id), id]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 172:** `const metadata = ROLE_METADATA[roleName] || { displayName: roleName, level: 20, isSystem: false, isDefault: false };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 174:** `await Role.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 193:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 194:** `return await defaultsBootstrapPromise;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `hydrateRoles` — lines 200–211

Parameters: `roleDocs`.
Persistent operations detected: Permission.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 201:** `const permissionIds = Array.from(new Set(roleDocs.flatMap((role) => sanitizePermissionIds(role.permissions))));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 202:** `const permissionDocs = permissionIds.length` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 203:** `? await Permission.find({ _id: { $in: permissionIds } }).lean()` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 205:** `const permissionMap = new Map(permissionDocs.map((permission) => [String(permission._id), permission]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 207:** `return roleDocs.map((role) => ({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getRoles` — lines 213–221

Parameters: `req`, `res`, `next`.
Persistent operations detected: Role.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 214:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 215:** `await ensureDefaultPermissions();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 216:** `const roleDocs = await Role.find(tenantFilter(req)).sort({ level: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 217:** `return res.json({ success: true, count: roleDocs.length, roles: await hydrateRoles(roleDocs) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPermissions` — lines 223–231

Parameters: `req`, `res`, `next`.
Persistent operations detected: Permission.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 224:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 225:** `await ensureDefaultPermissions();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 226:** `const permissions = await Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 227:** `return res.json({ success: true, count: permissions.length, permissions });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getRole` — lines 233–243

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Role.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 234:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 235:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 236:** `const roleDoc = await Role.findOne(tenantFilter(req, { _id: req.params.id })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 237:** `if (!roleDoc) return res.status(404).json({ success: false, message: "Role not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 238:** `const [role] = await hydrateRoles([roleDoc]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 239:** `return res.json({ success: true, role });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createRole` — lines 245–281

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Permission.countDocuments, Role.findOne, Role.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 246:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 247:** `await ensureRoleIndexes();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 248:** `const { name, displayName, description = "", permissions = [], level = 1, status = "active", isDefault = false } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 249:** `if (!name || !displayName) return res.status(400).json({ success: false, message: "Role name and display name are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 251:** `const normalizedName = normalizeRole(String(name).trim());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 252:** `if (!normalizedName) return res.status(400).json({ success: false, message: "A valid role name is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 253:** `if (normalizedName !== String(name).trim().toLowerCase().replace(/\s+/g, "_")) return res.status(400).json({ success: false, message: "Use the canonical role name for this role." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 254:** `const permissionIds = sanitizePermissionIds(permissions);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 255:** `if (permissionIds.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 256:** `const validPermissions = await Permission.countDocuments({ _id: { $in: permissionIds }, isActive: { $ne: false } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 257:** `if (validPermissions !== permissionIds.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 260:** `if (await Role.findOne(tenantFilter(req, { name: normalizedName }))) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 261:** `return res.status(409).json({ success: false, message: "A role with this name already exists." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 264:** `const role = await Role.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 276:** `return res.status(201).json({ success: true, role });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 278:** `if (error?.code === 11000) return res.status(409).json({ success: false, message: "A role with this name already exists." });` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `updateRole` — lines 283–301

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Role.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 284:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 285:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 286:** `const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 287:** `if (!role) return res.status(404).json({ success: false, message: "Role not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 288:** `if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role is protected and cannot be modified." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 290:** `if (Object.prototype.hasOwnProperty.call(req.body, "displayName")) role.displayName = String(req.body.displayName || "").trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 291:** `if (Object.prototype.hasOwnProperty.call(req.body, "description")) role.description = String(req.body.description || "").trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 292:** `if (Object.prototype.hasOwnProperty.call(req.body, "level")) role.level = Math.max(1, Number(req.body.level) || 1);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 293:** `if (Object.prototype.hasOwnProperty.call(req.body, "status")) role.status = req.body.status === "inactive" ? "inactive" : "active";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 294:** `if (Object.prototype.hasOwnProperty.call(req.body, "isDefault")) role.isDefault = Boolean(req.body.isDefault);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 296:** `await role.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 297:** `return res.json({ success: true, role });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteRole` — lines 303–315

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Role.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 304:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 305:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 306:** `const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 307:** `if (!role) return res.status(404).json({ success: false, message: "Role not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 308:** `if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role cannot be deleted." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 309:** `if (role.isSystem) return res.status(403).json({ success: false, message: "System roles cannot be deleted. You may modify their permissions instead." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 310:** `await role.deleteOne();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 311:** `return res.json({ success: true, message: "Role deleted" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updatePermissions` — lines 317–336

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Role.findOne, Permission.countDocuments; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 318:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 319:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 320:** `const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 321:** `if (!role) return res.status(404).json({ success: false, message: "Role not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 322:** `if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role permissions cannot be modified." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 324:** `const permissionIds = sanitizePermissionIds(req.body.permissions);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 325:** `if (permissionIds.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 326:** `const validPermissions = await Permission.countDocuments({ _id: { $in: permissionIds }, isActive: { $ne: false } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 327:** `if (validPermissions !== permissionIds.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 331:** `await role.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 332:** `return res.json({ success: true, role });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getRolesAndPermissions` — lines 338–349

Parameters: `req`, `res`, `next`.
Persistent operations detected: Role.find, Permission.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 339:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 340:** `await ensureDefaultPermissions();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 341:** `const [roleDocs, permissions] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 342:** `Role.find(tenantFilter(req)).sort({ level: -1 }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 343:** `Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 345:** `return res.json({ success: true, roles: await hydrateRoles(roleDocs), permissions });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 9: `const DEFAULT_PERMISSIONS = {`.
- Line 19: `const ROLE_METADATA = {`.
- Line 29: `let defaultsBootstrapPromise = null;`.
- Line 30: `let roleIndexesPromise = null;`.
- Line 32: `const ROLE_ALIAS_GROUPS = {`.
- Line 40: `const consolidateRoleAliases = async () => {`.
- Line 42: `const names = [canonical, ...aliases];`.
- Line 43: `const roles = await Role.find({ name: { $in: names } })`.
- Line 49: `const canonicalRole = roles.find((role) => role.name === canonical);`.
- Line 50: `let target = canonicalRole;`.
- Line 53: `const source = roles[0];`.
- Line 68: `const targetPermissions = new Set((target.permissions || []).map((id) => String(id)));`.
- Line 69: `const aliasIds = [];`.
- Line 94: `const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);`.
- Line 96: `const sanitizePermissionIds = (values = []) => Array.from(new Set(`.
- Line 100: `const ensureRoleIndexes = async () => {`.
- Line 104: `const indexes = await Role.collection.indexes();`.
- Line 105: `const legacyNameIndex = indexes.find(`.
- Line 117: `const refreshed = await Role.collection.indexes();`.
- Line 118: `const tenantNameIndex = refreshed.find(`.
- Line 136: `export const ensureDefaultPermissions = async () => {`.
- Line 144: `const allNames = [...new Set(Object.values(DEFAULT_PERMISSIONS).flat())];`.
- Line 164: `const permissions = await Permission.find({ name: { $in: allNames } }).select("_id name").lean();`.
- Line 165: `const byName = new Map(permissions.map((permission) => [permission.name, permission._id]));`.
- Line 168: `const role = await Role.findOne({ name: roleName }).select("_id name permissions level").lean();`.
- Line 169: `const ids = names.map((name) => byName.get(name)).filter(Boolean);`.
- Line 170: `const merged = new Map(sanitizePermissionIds(role?.permissions || []).map((id) => [String(id), id]));`.
- Line 172: `const metadata = ROLE_METADATA[roleName] || { displayName: roleName, level: 20, isSystem: false, isDefault: false };`.
- Line 200: `const hydrateRoles = async (roleDocs) => {`.
- Line 201: `const permissionIds = Array.from(new Set(roleDocs.flatMap((role) => sanitizePermissionIds(role.permissions))));`.
- Line 202: `const permissionDocs = permissionIds.length`.
- Line 205: `const permissionMap = new Map(permissionDocs.map((permission) => [String(permission._id), permission]));`.
- Line 213: `export const getRoles = async (req, res, next) => {`.
- Line 216: `const roleDocs = await Role.find(tenantFilter(req)).sort({ level: -1 }).lean();`.
- Line 223: `export const getPermissions = async (req, res, next) => {`.
- Line 226: `const permissions = await Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean();`.
- Line 233: `export const getRole = async (req, res, next) => {`.
- Line 236: `const roleDoc = await Role.findOne(tenantFilter(req, { _id: req.params.id })).lean();`.
- Line 238: `const [role] = await hydrateRoles([roleDoc]);`.
- Line 245: `export const createRole = async (req, res, next) => {`.
- Line 248: `const { name, displayName, description = "", permissions = [], level = 1, status = "active", isDefault = false } = req.body;`.
- Line 251: `const normalizedName = normalizeRole(String(name).trim());`.
- Line 254: `const permissionIds = sanitizePermissionIds(permissions);`.
- Line 256: `const validPermissions = await Permission.countDocuments({ _id: { $in: permissionIds }, isActive: { $ne: false } });`.
- Line 264: `const role = await Role.create({`.
- Line 283: `export const updateRole = async (req, res, next) => {`.
- Line 286: `const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));`.
- Line 303: `export const deleteRole = async (req, res, next) => {`.
- Line 306: `const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));`.
- Line 317: `export const updatePermissions = async (req, res, next) => {`.
- Line 320: `const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));`.
- Line 324: `const permissionIds = sanitizePermissionIds(req.body.permissions);`.
- Line 326: `const validPermissions = await Permission.countDocuments({ _id: { $in: permissionIds }, isActive: { $ne: false } });`.
- Line 338: `export const getRolesAndPermissions = async (req, res, next) => {`.
- Line 341: `const [roleDocs, permissions] = await Promise.all([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
