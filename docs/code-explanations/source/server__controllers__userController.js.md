# Source explanation: server/controllers/userController.js

**Source:** [server/controllers/userController.js](../../../server/controllers/userController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)

## Runtime declarations and data flow

### `getUserProfile` — lines 12–34

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 15:** `const user = await User.findById(req.user._id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `if (!user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 26:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateUserProfile` — lines 43–92

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 44:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 45:** `const allowedFields = ["name", "phone", "profileImage"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const update = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `for (const field of allowedFields) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 49:** `if (req.body?.[field] !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `if (update.name !== undefined && !String(update.name).trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 61:** `if (update.phone !== undefined && !String(update.phone).trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 68:** `const user = await User.findByIdAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 76:** `if (!user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 83:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getGuides` — lines 100–131

Parameters: `req`, `res`, `next`.
Persistent operations detected: Staff.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 101:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 109:** `const guides = await Staff.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 121:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteUser` — lines 133–180

Parameters: `req`, `res`.
Reads request/component inputs: req.params. Persistent operations detected: User.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 135:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 137:** `const user = await User.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 144:** `if(!user){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 146:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 154:** `await user.deleteOne();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 157:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 170:** `res.status(500).json({` — Builds an HTTP response with an explicit status and JSON payload.

## Module-level declarations

- Line 12: `export const getUserProfile = async (req, res, next) => {`.
- Line 15: `const user = await User.findById(req.user._id)`.
- Line 43: `export const updateUserProfile = async (req, res, next) => {`.
- Line 45: `const allowedFields = ["name", "phone", "profileImage"];`.
- Line 46: `const update = {};`.
- Line 68: `const user = await User.findByIdAndUpdate(`.
- Line 100: `export const getGuides = async (req, res, next) => {`.
- Line 109: `const guides = await Staff.find({`.
- Line 133: `export const deleteUser = async (req,res)=>{`.
- Line 137: `const user = await User.findOne(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
