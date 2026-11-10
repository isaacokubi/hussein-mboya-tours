# Source explanation: server/socket/socketManager.js

**Source:** [server/socket/socketManager.js](../../../server/socket/socketManager.js)

## Purpose

A first-party runtime module; use its import/export and caller map below to determine the specific role.

## Imports and dependencies

- `jwt` from `jsonwebtoken`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `env` from `../config/env.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/env.js](../../../server/config/env.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `normalizeRole` — lines 9–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `initSocket` — lines 11–77

Parameters: `socketServer`.
Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const role = normalizeRole(decoded.role);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const tenantId = decoded.tenantId ? String(decoded.tenantId) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (role !== "super_admin" && !tenantId) return next(new Error("Authentication tenant is required"));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const loadUser = () => User.findById(decoded.sub).select("_id status role tenantId");` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 29:** `const user = role === "super_admin"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (!user || user.status !== "active") return next(new Error("Account inactive or unavailable"));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `if (role !== "super_admin" && String(user.tenantId || "") !== tenantId) return next(new Error("Authentication tenant mismatch"));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `const id = socket.userId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `let sockets = onlineUsers.get(id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (!sockets) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `if (typeof room !== "string" || room.length > 100) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `if (room === \`user:${id}\`) socket.join(room);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `if (socket.tenantId && room === \`tenant:${socket.tenantId}\`) socket.join(room);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `if (room === \`user:${id}\` || (socket.tenantId && room === \`tenant:${socket.tenantId}\`)) socket.leave(room);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `loadUser` — lines 28–28

Parameters: none.
Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 28:** `() => User.findById(decoded.sub).select("_id status role tenantId")` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `getIO` — lines 79–82

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 80:** `if (!io) throw new Error("Socket.io not initialized");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `return io;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendNotificationToUser` — lines 84–89

Parameters: `userId`, `event`, `data`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 85:** `if (!io) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `const sockets = onlineUsers.get(userId.toString());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `if (!sockets) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `broadcast` — lines 91–94

Parameters: `event`, `data`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 92:** `if (!io) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `emitToRoom` — lines 96–99

Parameters: `room`, `event`, `data`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 97:** `if (!io) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 6: `let io = null;`.
- Line 7: `const onlineUsers = new Map();`.
- Line 9: `const normalizeRole = (value) => String(value || "").trim().toLowerCase().replace(/[\s_-]/g, "");`.
- Line 11: `export const initSocket = (socketServer) => {`.
- Line 16: `<sensitive declaration redacted>`.
- Line 19: `<sensitive declaration redacted>`.
- Line 24: `const role = normalizeRole(decoded.role);`.
- Line 25: `const tenantId = decoded.tenantId ? String(decoded.tenantId) : null;`.
- Line 28: `const loadUser = () => User.findById(decoded.sub).select("_id status role tenantId");`.
- Line 29: `const user = role === "super_admin"`.
- Line 46: `const id = socket.userId;`.
- Line 47: `let sockets = onlineUsers.get(id);`.
- Line 69: `const sockets = onlineUsers.get(id);`.
- Line 79: `export const getIO = () => {`.
- Line 84: `export const sendNotificationToUser = (userId, event, data) => {`.
- Line 86: `const sockets = onlineUsers.get(userId.toString());`.
- Line 91: `export const broadcast = (event, data) => {`.
- Line 96: `export const emitToRoom = (room, event, data) => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
