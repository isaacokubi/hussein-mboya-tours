# Source explanation: server/utils/publicError.js

**Source:** [server/utils/publicError.js](../../../server/utils/publicError.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `publicErrorMessage` — lines 1–11

Parameters: `error`, `fallback (defaulted)`, `statusOverride`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 2:** `if (error?.type === "entity.parse.failed") return "Invalid JSON request body.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 3:** `if (process.env.NODE_ENV !== "production") return error?.message || fallback;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 5:** `const status = Number(statusOverride ?? error?.statusCode ?? error?.status ?? 500);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `if (error?.code === 11000) return "A record with these unique details already exists.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `if (["ValidationError", "CastError"].includes(error?.name)) return "Invalid request data.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `if (error?.expose === true && status >= 400 && status < 600) return error.message || fallback;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `if (status >= 500 || !Number.isInteger(status)) return fallback;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `return error?.message || fallback;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 1: `export function publicErrorMessage(error, fallback = "Internal server error", statusOverride) {`.
- Line 5: `const status = Number(statusOverride ?? error?.statusCode ?? error?.status ?? 500);`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
