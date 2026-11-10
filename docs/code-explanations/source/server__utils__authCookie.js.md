# Source explanation: server/utils/authCookie.js

**Source:** [server/utils/authCookie.js](../../../server/utils/authCookie.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

- `crypto` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `isProduction` — lines 3–3

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `cookieOptions` — lines 5–10

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `setAuthCookie` — lines 12–27

Parameters: `res`, `token`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 13:** `const options = cookieOptions();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.

### `clearAuthCookies` — lines 29–33

Parameters: `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 30:** `const options = cookieOptions();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 3: `const isProduction = () => String(process.env.NODE_ENV || "development").toLowerCase() === "production";`.
- Line 5: `const cookieOptions = () => ({`.
- Line 12: `<sensitive declaration redacted>`.
- Line 13: `const options = cookieOptions();`.
- Line 14: `<sensitive declaration redacted>`.
- Line 29: `export const clearAuthCookies = (res) => {`.
- Line 30: `const options = cookieOptions();`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
