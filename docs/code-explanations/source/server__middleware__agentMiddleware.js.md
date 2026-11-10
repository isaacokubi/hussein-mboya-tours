# Source explanation: server/middleware/agentMiddleware.js

**Source:** [server/middleware/agentMiddleware.js](../../../server/middleware/agentMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `getUserRole` from `../utils/roleUtils.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/roleUtils.js](../../../server/utils/roleUtils.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `agentMiddleware` — lines 7–53

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: User.findById, Agent.findOne, Agent.updateOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 10:** `if (!req.user?._id) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `return res.status(401).json({ success: false, message: "Authentication required" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 14:** `const user = await User.findById(req.user._id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `if (!user) return res.status(401).json({ success: false, message: "User not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (user.status !== "active" || user.isActive === false) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return res.status(403).json({ success: false, message: "Your account is inactive" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 25:** `if (getUserRole(user) !== "agent") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `return res.status(403).json({ success: false, message: "Travel Agent access required" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `let agent = await Agent.findOne(mergeTenantFilter({ user: user._id })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `if (!agent && user.email) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `agent = await Agent.findOne(mergeTenantFilter({ email: String(user.email).trim().toLowerCase() })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `if (agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `await Agent.updateOne(mergeTenantFilter({ _id: agent._id }), { $set: { user: user._id } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return res.status(403).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 51:** `return res.status(500).json({ success: false, message: "Server error while authorizing agent" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `requireApprovedAgent` — lines 57–71

Parameters: `req`, `res`, `next`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 58:** `if (req.agentPendingApproval) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `return res.status(403).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 64:** `if (String(req.agent?.status || "").toLowerCase() !== "active") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `return res.status(403).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const agentMiddleware = async (req, res, next) => {`.
- Line 14: `const user = await User.findById(req.user._id)`.
- Line 29: `let agent = await Agent.findOne(mergeTenantFilter({ user: user._id })).lean();`.
- Line 57: `export const requireApprovedAgent = (req, res, next) => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
