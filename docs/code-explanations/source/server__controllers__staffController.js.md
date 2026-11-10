# Source explanation: server/controllers/staffController.js

**Source:** [server/controllers/staffController.js](../../../server/controllers/staffController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)

## Runtime declarations and data flow

### `duplicateMessage` — lines 6–12

Parameters: `error`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `const key = Object.keys(error?.keyPattern || {})[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `if (key === "email") return "A staff member with this email already exists for this company.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `if (key === "phone") return "A staff member with this phone number already exists for this company.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `if (key === "user") return "This user already has a staff profile.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `return "A staff record with these details already exists.";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `roleToStaffIdentity` — lines 14–26

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 15:** `const normalized = String(role || "").toLowerCase().replace(/[\s-]/g, "_");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const map = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `return map[normalized] || null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ensureManagerStaffProfiles` — lines 28–58

Parameters: `req`.
Reads request/component inputs: req.user. Persistent operations detected: User.find, Staff.find, Staff.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=false, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const managerUsers = await User.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `if (!managerUsers.length) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `const userIds = managerUsers.map((user) => user._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const existing = await Staff.find({ tenantId, user: { $in: userIds } }).select("user").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `const existingIds = new Set(existing.filter((staff) => staff.user).map((staff) => String(staff.user)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const missing = managerUsers.filter((user) => !existingIds.has(String(user._id)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `if (!missing.length) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `await Promise.all(missing.map((user) => Staff.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `if (error?.code !== 11000) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `synchronizeStaffIdentities` — lines 60–75

Parameters: `staff`, `tenantId`.
Persistent operations detected: User.find, Staff.updateOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 61:** `if (!staff.length || !tenantId) return staff;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `const userIds = staff.map((member) => member.user).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `if (!userIds.length) return staff;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `const users = await User.find({ tenantId, _id: { $in: userIds } }).select("_id role legacyRole roleId").populate("roleId", "name").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 65:** `const userMap = new Map(users.map((user) => [String(user._id), user]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `await Promise.all(staff.map(async (member) => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 67:** `const user = userMap.get(String(member.user));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `const canonical = roleToStaffIdentity(user?.roleId?.name || user?.role || user?.legacyRole);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `if (!canonical || (member.position === canonical.position && member.role === canonical.role)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `await Staff.updateOne({ _id: member._id, tenantId }, { $set: canonical });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 74:** `return staff;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createStaff` — lines 77–96

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: Staff.findOne, Staff.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 78:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 79:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `const body = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const email = String(body.email || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `const phone = String(body.phone || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `if (!body.name?.trim() || !email || !phone || !body.position) return res.status(400).json({ success: false, message: "Name, email, phone and position are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `const existing = await Staff.findOne(mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: [{ email }, { phone }, ...(body.user ? [{ user: body.user }] : [])] })).select("_id email phone user position").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 85:** `if (existing) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `const field = String(existing.email).toLowerCase() === email ? "email" : String(existing.phone) === phone ? "phone number" : "user account";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `return res.status(409).json({ success: false, message: \`A staff member with this ${field} already exists for this company.\` });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 89:** `const requestedIdentity = roleToStaffIdentity(body.role || body.position);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const staff = await Staff.create({ ...body, tenantId, email, phone, ...(requestedIdentity || {}) });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 91:** `return res.status(201).json({ success: true, message: "Staff created successfully", data: staff });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 93:** `if (error?.code === 11000) return res.status(409).json({ success: false, message: duplicateMessage(error) });` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `getStaff` — lines 98–122

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query, req.user. Persistent operations detected: Staff.find, Staff.countDocuments; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 99:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 100:** `await ensureManagerStaffProfiles(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 101:** `const { position, availability, status, search, page = 1, limit = 20 } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `const filter = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `if (status) filter.status = status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `else {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `const role = String(req.user?.roleId?.name || req.user?.role || "").toLowerCase().replace(/[\s_-]/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `const includeInactive = role === "admin" && String(req.query.includeInactive || "").toLowerCase() === "true";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `if (!includeInactive) filter.isActive = true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 109:** `if (position) filter.position = position === "guide" ? { $in: ["guide", "tour_guide", "tourguide"] } : position === "driver" ? { $in: ["driver", "tour_driver"] } : position;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 110:** `if (availability) filter.availability = availability;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 111:** `if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }, { position: { $regex: search, $options: "i" } }, { status` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 112:** `const scopedFilter = mergeTenantFilter(req, filter);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 113:** `const skip = Math.max(Number(page) - 1, 0) * Number(limit);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 114:** `const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 115:** `const [staff, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 116:** `Staff.find(scopedFilter).populate("assignedTours", "title startDate endDate tourStatus").sort({ createdAt: -1 }).skip(skip).limit(safeLimit),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 117:** `Staff.countDocuments(scopedFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getStaffById` — lines 124–131

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Staff.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 125:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 126:** `const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("assignedTours", "title startDate endDate tourStatus");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 127:** `if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 128:** `await synchronizeStaffIdentities([staff], requireTenantId());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 129:** `return res.status(200).json({ success: true, data: staff });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateStaff` — lines 133–168

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Staff.findOne, User.findOne, Role.findOne; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 134:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 135:** `const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 136:** `if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 137:** `if (req.body.email) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 138:** `const email = String(req.body.email).trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 139:** `const duplicate = await Staff.findOne(mergeTenantFilter(req, { _id: { $ne: staff._id }, isDeleted: { $ne: true }, email })).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 140:** `if (duplicate) return res.status(409).json({ success: false, message: "A staff member with this email already exists for this company." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 143:** `if (req.body.phone) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 144:** `const phone = String(req.body.phone).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 145:** `const duplicate = await Staff.findOne(mergeTenantFilter(req, { _id: { $ne: staff._id }, isDeleted: { $ne: true }, phone })).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 146:** `if (duplicate) return res.status(409).json({ success: false, message: "A staff member with this phone number already exists for this company." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 149:** `const requestedIdentity = roleToStaffIdentity(req.body.role || req.body.position);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 151:** `await staff.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 152:** `if (staff.user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 153:** `const user = await User.findOne(mergeTenantFilter(req, { _id: staff.user }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 154:** `const userRole = roleToStaffIdentity(staff.role || staff.position);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 155:** `if (user && userRole) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 156:** `const roleDoc = await Role.findOne(mergeTenantFilter(req, { name: userRole.role })).select("_id name").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `deleteStaff` — lines 170–179

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Staff.findOne, Staff.deleteOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 171:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 172:** `const filter = mergeTenantFilter(req, { _id: req.params.id });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 173:** `const staff = await Staff.findOne(filter).select("_id name").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 174:** `if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 175:** `const result = await Staff.deleteOne(filter);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 176:** `if (result.deletedCount !== 1) return res.status(409).json({ success: false, message: "Staff member could not be deleted. Please refresh and try again." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 177:** `return res.status(200).json({ success: true, message: "Staff member permanently deleted", data: { id: staff._id } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `restoreStaff` — lines 181–187

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 182:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 183:** `const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { isActive: true, status: "active", availability: "available", isDeleted: false }, { new: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 184:** `if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 185:** `return res.status(200).json({ success: true, message: "Staff restored successfully", data: staff });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getGuides` — lines 189–194

Parameters: `req`, `res`, `next`.
Persistent operations detected: Staff.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 190:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 191:** `const guides = await Staff.find(mergeTenantFilter(req, { position: { $in: ["guide", "tour_guide", "tourguide"] }, isActive: true, isDeleted: { $ne: true }, status: "active" })).sort({ createdAt: -1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 192:** `return res.status(200).json({ success: true, count: guides.length, data: guides });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getDrivers` — lines 196–201

Parameters: `req`, `res`, `next`.
Persistent operations detected: Staff.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 197:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 198:** `const drivers = await Staff.find(mergeTenantFilter(req, { position: { $in: ["driver", "tour_driver"] }, isActive: true, isDeleted: { $ne: true }, status: "active" })).populate("assignedTours", "title startDate endDate").` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 199:** `return res.status(200).json({ success: true, count: drivers.length, data: drivers });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateStaffAvailability` — lines 203–211

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 204:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 205:** `const { availability } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 206:** `if (!availability) return res.status(400).json({ success: false, message: "Availability is required" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 207:** `const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { availability }, { new: true, runValidators: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 208:** `if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 209:** `return res.status(200).json({ success: true, message: "Availability updated successfully", data: staff });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const duplicateMessage = (error) => {`.
- Line 7: `const key = Object.keys(error?.keyPattern || {})[0];`.
- Line 14: `const roleToStaffIdentity = (role) => {`.
- Line 15: `const normalized = String(role || "").toLowerCase().replace(/[\s-]/g, "_");`.
- Line 16: `const map = {`.
- Line 28: `const ensureManagerStaffProfiles = async (req) => {`.
- Line 29: `const tenantId = requireTenantId();`.
- Line 30: `const managerUsers = await User.find({`.
- Line 37: `const userIds = managerUsers.map((user) => user._id);`.
- Line 38: `const existing = await Staff.find({ tenantId, user: { $in: userIds } }).select("user").lean();`.
- Line 39: `const existingIds = new Set(existing.filter((staff) => staff.user).map((staff) => String(staff.user)));`.
- Line 40: `const missing = managerUsers.filter((user) => !existingIds.has(String(user._id)));`.
- Line 60: `const synchronizeStaffIdentities = async (staff, tenantId) => {`.
- Line 62: `const userIds = staff.map((member) => member.user).filter(Boolean);`.
- Line 64: `const users = await User.find({ tenantId, _id: { $in: userIds } }).select("_id role legacyRole roleId").populate("roleId", "name").lean();`.
- Line 65: `const userMap = new Map(users.map((user) => [String(user._id), user]));`.
- Line 67: `const user = userMap.get(String(member.user));`.
- Line 68: `const canonical = roleToStaffIdentity(user?.roleId?.name || user?.role || user?.legacyRole);`.
- Line 77: `export const createStaff = async (req, res, next) => {`.
- Line 79: `const tenantId = requireTenantId();`.
- Line 80: `const body = req.body || {};`.
- Line 81: `const email = String(body.email || "").trim().toLowerCase();`.
- Line 82: `const phone = String(body.phone || "").trim();`.
- Line 84: `const existing = await Staff.findOne(mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: [{ email }, { phone }, ...(body.user ? [{ user: body.user }] : [])] })).select("_id ema`.
- Line 86: `const field = String(existing.email).toLowerCase() === email ? "email" : String(existing.phone) === phone ? "phone number" : "user account";`.
- Line 89: `const requestedIdentity = roleToStaffIdentity(body.role || body.position);`.
- Line 90: `const staff = await Staff.create({ ...body, tenantId, email, phone, ...(requestedIdentity || {}) });`.
- Line 98: `export const getStaff = async (req, res, next) => {`.
- Line 101: `const { position, availability, status, search, page = 1, limit = 20 } = req.query;`.
- Line 102: `const filter = {};`.
- Line 105: `const role = String(req.user?.roleId?.name || req.user?.role || "").toLowerCase().replace(/[\s_-]/g, "");`.
- Line 106: `const includeInactive = role === "admin" && String(req.query.includeInactive || "").toLowerCase() === "true";`.
- Line 112: `const scopedFilter = mergeTenantFilter(req, filter);`.
- Line 113: `const skip = Math.max(Number(page) - 1, 0) * Number(limit);`.
- Line 114: `const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);`.
- Line 115: `const [staff, total] = await Promise.all([`.
- Line 124: `export const getStaffById = async (req, res, next) => {`.
- Line 126: `const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("assignedTours", "title startDate endDate tourStatus");`.
- Line 133: `export const updateStaff = async (req, res, next) => {`.
- Line 135: `const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 138: `const email = String(req.body.email).trim().toLowerCase();`.
- Line 139: `const duplicate = await Staff.findOne(mergeTenantFilter(req, { _id: { $ne: staff._id }, isDeleted: { $ne: true }, email })).select("_id").lean();`.
- Line 144: `const phone = String(req.body.phone).trim();`.
- Line 145: `const duplicate = await Staff.findOne(mergeTenantFilter(req, { _id: { $ne: staff._id }, isDeleted: { $ne: true }, phone })).select("_id").lean();`.
- Line 149: `const requestedIdentity = roleToStaffIdentity(req.body.role || req.body.position);`.
- Line 153: `const user = await User.findOne(mergeTenantFilter(req, { _id: staff.user }));`.
- Line 154: `const userRole = roleToStaffIdentity(staff.role || staff.position);`.
- Line 156: `const roleDoc = await Role.findOne(mergeTenantFilter(req, { name: userRole.role })).select("_id name").lean();`.
- Line 170: `export const deleteStaff = async (req, res, next) => {`.
- Line 172: `const filter = mergeTenantFilter(req, { _id: req.params.id });`.
- Line 173: `const staff = await Staff.findOne(filter).select("_id name").lean();`.
- Line 175: `const result = await Staff.deleteOne(filter);`.
- Line 181: `export const restoreStaff = async (req, res, next) => {`.
- Line 183: `const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { isActive: true, status: "active", availability: "available", isDeleted: false }, { new:`.
- Line 189: `export const getGuides = async (req, res, next) => {`.
- Line 191: `const guides = await Staff.find(mergeTenantFilter(req, { position: { $in: ["guide", "tour_guide", "tourguide"] }, isActive: true, isDeleted: { $ne: true }, status: "active" })).sor`.
- Line 196: `export const getDrivers = async (req, res, next) => {`.
- Line 198: `const drivers = await Staff.find(mergeTenantFilter(req, { position: { $in: ["driver", "tour_driver"] }, isActive: true, isDeleted: { $ne: true }, status: "active" })).populate("ass`.
- Line 203: `export const updateStaffAvailability = async (req, res, next) => {`.
- Line 205: `const { availability } = req.body;`.
- Line 207: `const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { availability }, { new: true, runValidators: true });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
