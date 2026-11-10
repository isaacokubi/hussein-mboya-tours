# Source explanation: server/controllers/adminAgentController.js

**Source:** [server/controllers/adminAgentController.js](../../../server/controllers/adminAgentController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `requireTenantId`, `getTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)

## Runtime declarations and data flow

### `extractId` — lines 11–23

Parameters: `value`.
8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `if (value == null) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (typeof value === "string" || typeof value === "number") return String(value).trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (mongoose.isValidObjectId(value)) return String(value);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (value._id != null) return extractId(value._id);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (value.id != null) return extractId(value.id);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (typeof value.toHexString === "function") return value.toHexString();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (typeof value.toString === "function") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `const stringValue = value.toString();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (stringValue && stringValue !== "[object Object]") return stringValue.trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `toObjectId` — lines 25–34

Parameters: `value`, `fieldName`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `const id = extractId(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `if (!mongoose.isValidObjectId(id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const error = new Error(\`Invalid ${fieldName}.\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 33:** `return new mongoose.Types.ObjectId(id);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getSafeTenantId` — lines 36–36

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tenantScopedFilter` — lines 37–37

Parameters: `filter (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `formatTenantLocation` — lines 38–38

Parameters: `organization`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getAgents` — lines 40–138

Parameters: `req`, `res`.
Persistent operations detected: Agent.find, Organization.findById, Booking.aggregate, Commission.aggregate; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 42:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 43:** `const tenantId = getSafeTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const [agents, organization] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `Agent.find(tenantFilter(req))` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 49:** `Organization.findById(tenantId).select("address country").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 52:** `const tenantLocation = formatTenantLocation(organization);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const agentIds = agents.map((agent) => agent._id).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const bookingStats = agentIds.length` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `? await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `let commissionStats = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `if (agentIds.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 64:** `commissionStats = await Commission.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 109:** `const bookingMap = new Map(bookingStats.map((item) => [String(item._id), Number(item.totalBookings || 0)]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `const commissionMap = new Map(commissionStats.map((item) => [String(item._id), item]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 112:** `const normalized = agents.map((agent) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 113:** `const bookingCount = bookingMap.get(String(agent._id));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 114:** `const commission = commissionMap.get(String(agent._id));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getAgentById` — lines 140–153

Parameters: `req`, `res`.
Reads request/component inputs: req.params. Persistent operations detected: Agent.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 142:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 143:** `const agentId = toObjectId(req.params.id, "agent ID");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 144:** `const agent = await Agent.findOne(tenantScopedFilter({ _id: agentId }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 147:** `if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 148:** `return res.json({ success: true, data: agent });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 151:** `return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `approveAgent` — lines 155–203

Parameters: `req`, `res`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Agent.findOne, User.findOne, User.updateOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 157:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 158:** `const agentId = toObjectId(req.params.id, "agent ID");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 159:** `const approverId = toObjectId(req.user?._id ?? req.user?.id ?? req.auth?.userId, "approver ID");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 160:** `const tenantId = getSafeTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 161:** `const filter = { _id: agentId, tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 162:** `const agent = await Agent.findOne(filter).select("_id tenantId user isApproved status approvedBy approvedAt").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 163:** `if (!agent) return res.status(404).json({ success: false, code: "AGENT_NOT_FOUND", message: "Agent not found in the current tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 165:** `const linkedUserId = toObjectId(agent.user, "agent user ID");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 166:** `const linkedUser = await User.findOne({ _id: linkedUserId, tenantId })` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 169:** `if (!linkedUser) return res.status(422).json({ success: false, code: "AGENT_USER_NOT_FOUND", message: "The agent's linked user account could not be found in this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 171:** `const activatedUser = await User.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 176:** `if (!activatedUser) return res.status(422).json({ success: false, code: "AGENT_USER_ACTIVATION_FAILED", message: "The linked agent user account could not be activated." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 178:** `const approvedAt = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 179:** `const updatedAgent = await Agent.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 185:** `if (!updatedAgent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 186:** `await User.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 190:** `return res.status(422).json({ success: false, code: "AGENT_APPROVAL_UPDATE_FAILED", message: "The agent approval could not be completed." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 193:** `return res.json({ success: true, message: "Agent approved successfully", data: updatedAgent });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `updateAgentStatus` — lines 205–247

Parameters: `req`, `res`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Agent.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 207:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 208:** `const status = String(req.body?.status || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 209:** `if (!["active", "inactive", "suspended"].includes(status)) return res.status(400).json({ success: false, message: "Invalid agent status" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 210:** `const agentId = toObjectId(req.params.id, "agent ID");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 211:** `const agent = await Agent.findOne(tenantScopedFilter({ _id: agentId }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 214:** `if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 216:** `const linkedUserId = agent.user ? toObjectId(agent.user, "agent user ID") : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 217:** `if (linkedUserId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 218:** `const userUpdate = status === "active"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 221:** `const linkedUser = await User.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 226:** `if (!linkedUser) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 227:** `return res.status(422).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 235:** `const updatedAgent = await Agent.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 241:** `if (!updatedAgent) return res.status(404).json({ success: false, message: "Agent not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 242:** `return res.json({ success: true, message: "Agent status and access updated", data: updatedAgent });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 245:** `return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 11: `const extractId = (value) => {`.
- Line 19: `const stringValue = value.toString();`.
- Line 25: `const toObjectId = (value, fieldName) => {`.
- Line 26: `const id = extractId(value);`.
- Line 28: `const error = new Error(\`Invalid ${fieldName}.\`);`.
- Line 36: `const getSafeTenantId = () => toObjectId(getTenantId(), "tenant ID");`.
- Line 37: `const tenantScopedFilter = (filter = {}) => ({ ...filter, tenantId: getSafeTenantId() });`.
- Line 38: `const formatTenantLocation = (organization) => [String(organization?.address || "").trim(), String(organization?.country || "").trim()].filter(Boolean).join(", ");`.
- Line 40: `export const getAgents = async (req, res) => {`.
- Line 43: `const tenantId = getSafeTenantId();`.
- Line 44: `const [agents, organization] = await Promise.all([`.
- Line 52: `const tenantLocation = formatTenantLocation(organization);`.
- Line 53: `const agentIds = agents.map((agent) => agent._id).filter(Boolean);`.
- Line 54: `const bookingStats = agentIds.length`.
- Line 61: `let commissionStats = [];`.
- Line 109: `const bookingMap = new Map(bookingStats.map((item) => [String(item._id), Number(item.totalBookings || 0)]));`.
- Line 110: `const commissionMap = new Map(commissionStats.map((item) => [String(item._id), item]));`.
- Line 112: `const normalized = agents.map((agent) => {`.
- Line 113: `const bookingCount = bookingMap.get(String(agent._id));`.
- Line 114: `const commission = commissionMap.get(String(agent._id));`.
- Line 140: `export const getAgentById = async (req, res) => {`.
- Line 143: `const agentId = toObjectId(req.params.id, "agent ID");`.
- Line 144: `const agent = await Agent.findOne(tenantScopedFilter({ _id: agentId }))`.
- Line 155: `export const approveAgent = async (req, res) => {`.
- Line 158: `const agentId = toObjectId(req.params.id, "agent ID");`.
- Line 159: `const approverId = toObjectId(req.user?._id ?? req.user?.id ?? req.auth?.userId, "approver ID");`.
- Line 160: `const tenantId = getSafeTenantId();`.
- Line 161: `const filter = { _id: agentId, tenantId };`.
- Line 162: `const agent = await Agent.findOne(filter).select("_id tenantId user isApproved status approvedBy approvedAt").lean();`.
- Line 165: `const linkedUserId = toObjectId(agent.user, "agent user ID");`.
- Line 166: `const linkedUser = await User.findOne({ _id: linkedUserId, tenantId })`.
- Line 171: `const activatedUser = await User.findOneAndUpdate(`.
- Line 178: `const approvedAt = new Date();`.
- Line 179: `const updatedAgent = await Agent.findOneAndUpdate(`.
- Line 196: `const message = error?.status === 400`.
- Line 205: `export const updateAgentStatus = async (req, res) => {`.
- Line 208: `const status = String(req.body?.status || "").trim().toLowerCase();`.
- Line 210: `const agentId = toObjectId(req.params.id, "agent ID");`.
- Line 211: `const agent = await Agent.findOne(tenantScopedFilter({ _id: agentId }))`.
- Line 216: `const linkedUserId = agent.user ? toObjectId(agent.user, "agent user ID") : null;`.
- Line 218: `const userUpdate = status === "active"`.
- Line 221: `const linkedUser = await User.findOneAndUpdate(`.
- Line 235: `const updatedAgent = await Agent.findOneAndUpdate(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
