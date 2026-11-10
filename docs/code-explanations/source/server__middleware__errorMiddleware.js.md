# Source explanation: server/middleware/errorMiddleware.js

**Source:** [server/middleware/errorMiddleware.js](../../../server/middleware/errorMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `multer` from `multer`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `env` from `../config/env.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/env.js](../../../server/config/env.js)

## Runtime declarations and data flow

### `errorHandler` — lines 23–140

Parameters: `err`, `req`, `res`, `next`.
10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `let statusCode = err.statusCode || err.status || 500;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `let message = err.message || "Internal Server Error";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (err instanceof mongoose.Error.ValidationError) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `if (err instanceof mongoose.Error.CastError) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `if (err.code === 11000) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `const field = Object.keys(err.keyValue)[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `if (err instanceof multer.MulterError) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 100:** `switch (err.code) {` — This branch selects behavior by the current value; verify every case and the default path.
- **Line 101:** `case "LIMIT_FILE_SIZE":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `case "LIMIT_UNEXPECTED_FILE":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 120:** `if (err.name === "FileTypeError") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 131:** `res.status(statusCode).json({` — Builds an HTTP response with an explicit status and JSON payload.

## Module-level declarations

- Line 23: `const errorHandler = (err, req, res, next) => {`.
- Line 26: `let statusCode = err.statusCode || err.status || 500;`.
- Line 28: `let message = err.message || "Internal Server Error";`.
- Line 64: `const field = Object.keys(err.keyValue)[0];`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
