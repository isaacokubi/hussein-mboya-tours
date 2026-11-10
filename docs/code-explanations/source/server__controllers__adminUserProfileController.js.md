# Source explanation: server/controllers/adminUserProfileController.js

**Source:** [server/controllers/adminUserProfileController.js](../../../server/controllers/adminUserProfileController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `normalizeRole` — lines 9–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `updateUserProfile` — lines 12–60

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: User.findOne, Customer.findOne, Staff.findOne, Agent.findOne, Role.findOne, User.findById; verify tenant/ownership filters in the exact query. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 14:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const { id } = req.params;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const user = await User.findOne({ _id: id, tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `if (!user) return res.status(404).json({ success: false, message: "User not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `if (["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase())) return res.status(403).json({ success: false, message: "SuperAdmin accounts cannot be edited here." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const name = String(req.body?.name ?? user.name).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const email = String(req.body?.email ?? user.email).trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const phone = String(req.body?.phone ?? user.phone).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!name || !email || !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: "Name, email and a 10-digit phone are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const duplicate = await User.findOne({ tenantId, _id: { $ne: user._id }, $or: [{ email }, { phone }] }).select("email phone").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `if (duplicate) return res.status(409).json({ success: false, message: \`Another user with this ${duplicate.email === email ? "email" : "phone number"} already exists for this company.\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const [customerProfile, staffProfile, agentProfile] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `Customer.findOne({ tenantId, user: user._id, isDeleted: { $ne: true } }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 30:** `Staff.findOne({ tenantId, user: user._id, isDeleted: { $ne: true } }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 31:** `Agent.findOne({ tenantId, user: user._id }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 33:** `const customerOnly = Boolean(customerProfile && !staffProfile && !agentProfile);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 9: `const normalizeRole = (value) => String(value || "").toLowerCase().replace(/[\s-]/g, "_");`.
- Line 10: `const roleMap = { customer: "customer", admin: "admin", manager: "manager", tour_manager: "manager", guide: "tour_guide", tour_guide: "tour_guide", driver: "driver", agent: "agent"`.
- Line 12: `export const updateUserProfile = async (req, res, next) => {`.
- Line 14: `const tenantId = requireTenantId();`.
- Line 15: `const { id } = req.params;`.
- Line 17: `const user = await User.findOne({ _id: id, tenantId });`.
- Line 21: `const name = String(req.body?.name ?? user.name).trim();`.
- Line 22: `const email = String(req.body?.email ?? user.email).trim().toLowerCase();`.
- Line 23: `const phone = String(req.body?.phone ?? user.phone).trim();`.
- Line 25: `const duplicate = await User.findOne({ tenantId, _id: { $ne: user._id }, $or: [{ email }, { phone }] }).select("email phone").lean();`.
- Line 28: `const [customerProfile, staffProfile, agentProfile] = await Promise.all([`.
- Line 33: `const customerOnly = Boolean(customerProfile && !staffProfile && !agentProfile);`.
- Line 37: `const requested = normalizeRole(req.body.role);`.
- Line 39: `const canonicalRole = customerOnly ? "customer" : roleMap[requested];`.
- Line 41: `const roleDoc = await Role.findOne({ name: canonicalRole }).select("_id name");`.
- Line 44: `const staff = await Staff.findOne({ tenantId, user: user._id, isDeleted: { $ne: true } });`.
- Line 53: `<sensitive declaration redacted>`.
- Line 54: `const result = { ...safe, role: safe.roleId?.name || safe.role || safe.legacyRole, isActive: safe.status === "active" };`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
