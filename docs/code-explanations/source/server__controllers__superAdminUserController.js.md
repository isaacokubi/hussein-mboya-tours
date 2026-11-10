# Source explanation: server/controllers/superAdminUserController.js

**Source:** [server/controllers/superAdminUserController.js](../../../server/controllers/superAdminUserController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)

## Runtime declarations and data flow

### `normalizeRole` — lines 10–10

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getSuperAdminUsers` — lines 11–11

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: User.find, User.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createCompanyAccount` — lines 12–12

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Role.findOne, User.create, Staff.create, Agent.create, User.findById; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateSuperAdminUserStatus` — lines 14–14

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `deleteSuperAdminUser` — lines 15–15

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: User.findById, User.deleteOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `async (req, res, next) => { try { const { id } = req.params; if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" }); if (String(req.user?._id) === String(id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 7: `const STATUS_VALUES = ["active", "inactive", "disabled", "suspended", "blocked"];`.
- Line 8: `const ROLE_MAP = { admin: "admin", administrator: "admin", manager: "manager", tour_manager: "manager", "tour manager": "manager", tour_guide: "tour_guide", guide: "tour_guide", "t`.
- Line 9: `const SUPERADMIN_USER_PAGE_SIZE = 10;`.
- Line 10: `const normalizeRole = (value) => ROLE_MAP[String(value || "").toLowerCase().replace(/-/g, "_")] || null;`.
- Line 11: `<sensitive declaration redacted>`.
- Line 12: `<sensitive declaration redacted>`.
- Line 13: `export const createSuperAdminCompanyAccount = createCompanyAccount;`.
- Line 14: `<sensitive declaration redacted>`.
- Line 15: `export const deleteSuperAdminUser = async (req, res, next) => { try { const { id } = req.params; if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: fa`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
