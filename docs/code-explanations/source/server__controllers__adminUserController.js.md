# Source explanation: server/controllers/adminUserController.js

**Source:** [server/controllers/adminUserController.js](../../../server/controllers/adminUserController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `ensureSystemRoles` from `../services/onboardingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/onboardingService.js](../../../server/services/onboardingService.js)
- `createWithTenantIndexRepair`, `isTenantIndexConflict` from `../services/tenantIndexRepair.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tenantIndexRepair.js](../../../server/services/tenantIndexRepair.js)

## Runtime declarations and data flow

### `isDuplicateKeyError` — lines 12–12

Parameters: `error`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `duplicateMessage` — lines 13–13

Parameters: `error`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `canonicalizeUsers` — lines 15–44

Parameters: `users`, `tenantId`.
Persistent operations detected: Customer.find, Staff.find, Agent.find, Role.findOne, User.updateOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `if (!users.length || !tenantId) return users;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const ids = users.map((user) => user._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const [customers, staff, agents] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `Customer.find({ tenantId, user: { $in: ids }, isDeleted: { $ne: true } }).select("user").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 20:** `Staff.find({ tenantId, user: { $in: ids }, isDeleted: { $ne: true } }).select("user").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 21:** `Agent.find({ tenantId, user: { $in: ids } }).select("user").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 23:** `const customerIds = new Set(customers.filter((item) => item.user).map((item) => String(item.user)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const operationalIds = new Set([...staff, ...agents].filter((item) => item.user).map((item) => String(item.user)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const customerRole = await Role.findOne({ name: "customer" }).select("_id name").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `for (const user of users) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 28:** `const id = String(user._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const hasCustomerProfile = customerIds.has(id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const hasOperationalIdentity = operationalIds.has(id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const isProtected = ["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const shouldBeCustomer = hasCustomerProfile && !hasOperationalIdentity && !isProtected;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (shouldBeCustomer) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const needsRepair = String(user.role || "").toLowerCase() !== "customer" || String(user.legacyRole || "").toLowerCase() !== "customer" || (customerRole && String(user.roleId || "") !== String(customerRole._id));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `if (needsRepair) await User.updateOne({ _id: user._id, tenantId }, { $set: { role: "customer", legacyRole: "customer", ...(customerRole ? { roleId: customerRole._id } : {}) } });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getUsers` — lines 46–64

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: User.find, User.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 47:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 49:** `const page = Math.max(Number(req.query.page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const search = String(req.query.search || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const query = { tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `if (search) { const regex = { $regex: search, $options: "i" }; query.$or = [{ name: regex }, { email: regex }, { phone: regex }, { role: regex }, { legacyRole: regex }, { status: regex }]; }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `const skip = (page - 1) * limit;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const [users, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** Sensitive-configuration/data operation; inspect source without copying secret values. — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 57:** `User.countDocuments(query),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 59:** `await canonicalizeUsers(users, tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `const pages = Math.max(1, Math.ceil(total / limit));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const data = users.map((user) => ({ ...user, role: user.role || user.roleId?.name || user.legacyRole || "customer", isActive: user.status === "active" }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `return res.json({ success: true, page, limit, total, pages, count: data.length, data, users: data, pagination: { page, limit, total, pages } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createStaffAccount` — lines 66–112

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: User.findOne, Staff.findOne, Role.findOne, User.findById, Staff.deleteOne, Agent.deleteOne, User.deleteOne; verify tenant/ownership filters in the exact query. 13 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 19 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 67:** `let createdUser = null; let createdStaff = null; let createdAgent = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 69:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `if (!tenantId) return res.status(400).json({ success: false, message: "Select a company before creating a staff account." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `const normalizedRole = String(role || "").toLowerCase().replace(/[\s-]/g, "_");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `const allowed = { admin: "admin", manager: "manager", tour_manager: "manager", guide: "tour_guide", tour_guide: "tour_guide", driver: "driver", agent: "agent", travel_agent: "agent" };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `const canonicalRole = allowed[normalizedRole];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `if (!canonicalRole) return res.status(400).json({ success: false, message: "Choose admin, manager, agent, guide or driver." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `if (!name?.trim() || !email?.trim() || !/^\d{10}$/.test(String(phone || ""))) return res.status(400).json({ success: false, message: "Name, email and a 10-digit phone are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `const agentCompanyName = String(req.body?.companyName || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `if (canonicalRole === "agent" && !agentCompanyName) return res.status(400).json({ success: false, message: "Agent company name is required when creating an agent account." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 80:** `if (canonicalRole === "agent" && agentCompanyName.length > 150) return res.status(400).json({ success: false, message: "Agent company name must be 150 characters or fewer." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `const normalizedEmail = String(email).trim().toLowerCase(); const normalizedPhone = String(phone).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `const existingUser = await User.findOne({ tenantId, $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }).select("_id role email phone tenantId").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 83:** `if (existingUser) { const field = existingUser.email === normalizedEmail ? "email" : "phone number"; return res.status(409).json({ success: false, message: \`A user with this ${field} already exists for this company.\` }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `const existingStaff = await Staff.findOne({ tenantId, isDeleted: { $ne: true }, $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }).select("_id user email phone position tenantId").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `updateUserStatus` — lines 114–124

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 115:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 116:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 117:** `const { id } = req.params; const { status } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 118:** `if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 119:** `if (!STATUS_VALUES.includes(status)) return res.status(400).json({ success: false, message: "Invalid user status" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 120:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 121:** `if (!user) return res.status(404).json({ success: false, message: "User not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 122:** `const result = { ...user, isActive: user.status === "active" }; return res.status(200).json({ success: true, message: \`User status changed to ${status}\`, user: result, data: result });` — Builds an HTTP response with an explicit status and JSON payload.

### `deleteUser` — lines 126–138

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: User.findOne, User.deleteOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 127:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 128:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 129:** `const { id } = req.params;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 130:** `if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 131:** `if (String(req.user?._id) === String(id)) return res.status(400).json({ success: false, message: "You cannot delete your own account." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 132:** `const user = await User.findOne({ _id: id, tenantId }).select("_id role");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 133:** `if (!user) return res.status(404).json({ success: false, message: "User not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 134:** `if (["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase())) return res.status(403).json({ success: false, message: "SuperAdmin accounts cannot be deleted." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 135:** `await Promise.all([Staff.deleteMany({ tenantId, user: user._id }), Agent.deleteMany({ tenantId, user: user._id }), User.deleteOne({ _id: user._id, tenantId })]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 136:** `return res.json({ success: true, deleted: true, message: "User account deleted successfully." });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 11: `const STATUS_VALUES = ["active", "inactive", "disabled", "suspended", "blocked"];`.
- Line 12: `const isDuplicateKeyError = (error) => error?.code === 11000;`.
- Line 13: `const duplicateMessage = (error) => { const pattern = error?.keyPattern || {}; const keys = Object.keys(pattern); const key = keys[0]; if (keys.length === 1 && key === "tenantId") `.
- Line 15: `const canonicalizeUsers = async (users, tenantId) => {`.
- Line 17: `const ids = users.map((user) => user._id);`.
- Line 18: `const [customers, staff, agents] = await Promise.all([`.
- Line 23: `const customerIds = new Set(customers.filter((item) => item.user).map((item) => String(item.user)));`.
- Line 24: `const operationalIds = new Set([...staff, ...agents].filter((item) => item.user).map((item) => String(item.user)));`.
- Line 25: `const customerRole = await Role.findOne({ name: "customer" }).select("_id name").lean();`.
- Line 28: `const id = String(user._id);`.
- Line 29: `const hasCustomerProfile = customerIds.has(id);`.
- Line 30: `const hasOperationalIdentity = operationalIds.has(id);`.
- Line 31: `const isProtected = ["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase());`.
- Line 32: `const shouldBeCustomer = hasCustomerProfile && !hasOperationalIdentity && !isProtected;`.
- Line 34: `const needsRepair = String(user.role || "").toLowerCase() !== "customer" || String(user.legacyRole || "").toLowerCase() !== "customer" || (customerRole && String(user.roleId || "")`.
- Line 46: `export const getUsers = async (req, res, next) => {`.
- Line 47: `const tenantId = requireTenantId();`.
- Line 49: `const page = Math.max(Number(req.query.page) || 1, 1);`.
- Line 50: `const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);`.
- Line 51: `const search = String(req.query.search || "").trim();`.
- Line 52: `const query = { tenantId };`.
- Line 54: `const skip = (page - 1) * limit;`.
- Line 55: `const [users, total] = await Promise.all([`.
- Line 60: `const pages = Math.max(1, Math.ceil(total / limit));`.
- Line 61: `const data = users.map((user) => ({ ...user, role: user.role || user.roleId?.name || user.legacyRole || "customer", isActive: user.status === "active" }));`.
- Line 66: `export const createStaffAccount = async (req, res, next) => {`.
- Line 67: `let createdUser = null; let createdStaff = null; let createdAgent = null;`.
- Line 69: `const tenantId = requireTenantId();`.
- Line 71: `<sensitive declaration redacted>`.
- Line 72: `const normalizedRole = String(role || "").toLowerCase().replace(/[\s-]/g, "_");`.
- Line 73: `const allowed = { admin: "admin", manager: "manager", tour_manager: "manager", guide: "tour_guide", tour_guide: "tour_guide", driver: "driver", agent: "agent", travel_agent: "agent`.
- Line 74: `const canonicalRole = allowed[normalizedRole];`.
- Line 78: `const agentCompanyName = String(req.body?.companyName || "").trim();`.
- Line 81: `const normalizedEmail = String(email).trim().toLowerCase(); const normalizedPhone = String(phone).trim();`.
- Line 82: `const existingUser = await User.findOne({ tenantId, $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }).select("_id role email phone tenantId").lean();`.
- Line 84: `const existingStaff = await Staff.findOne({ tenantId, isDeleted: { $ne: true }, $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }).select("_id user email phone positi`.
- Line 86: `const permissionNamesByRole = {`.
- Line 94: `let roleDoc = await Role.findOne({ name: { $in: [canonicalRole, canonicalRole.replace("tour_", "")] } });`.
- Line 96: `const permissionIds = [];`.
- Line 105: `<sensitive declaration redacted>`.
- Line 114: `export const updateUserStatus = async (req, res, next) => {`.
- Line 116: `const tenantId = requireTenantId();`.
- Line 117: `const { id } = req.params; const { status } = req.body;`.
- Line 120: `<sensitive declaration redacted>`.
- Line 122: `const result = { ...user, isActive: user.status === "active" }; return res.status(200).json({ success: true, message: \`User status changed to ${status}\`, user: result, data: resu`.
- Line 126: `export const deleteUser = async (req, res, next) => {`.
- Line 128: `const tenantId = requireTenantId();`.
- Line 129: `const { id } = req.params;`.
- Line 132: `const user = await User.findOne({ _id: id, tenantId }).select("_id role");`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
