# Source explanation: server/utils/tenantHost.js

**Source:** [server/utils/tenantHost.js](../../../server/utils/tenantHost.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `normalizeHost` — lines 1–1

Parameters: `value (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isTenantSubdomainHost` — lines 3–10

Parameters: `host`, `platformHost`, `reserved (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 4:** `const normalizedHost = normalizeHost(host);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 5:** `const normalizedPlatformHost = normalizeHost(platformHost);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `const suffix = \`.${normalizedPlatformHost}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `if (!normalizedHost || !normalizedPlatformHost || !normalizedHost.endsWith(suffix)) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `const labels = normalizedHost.slice(0, -suffix.length).split(".").filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `return labels.length === 1 && !reserved.includes(labels[0]);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 1: `const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");`.
- Line 3: `export const isTenantSubdomainHost = (host, platformHost, reserved = ["www", "api", "app", "admin"]) => {`.
- Line 4: `const normalizedHost = normalizeHost(host);`.
- Line 5: `const normalizedPlatformHost = normalizeHost(platformHost);`.
- Line 6: `const suffix = \`.${normalizedPlatformHost}\`;`.
- Line 8: `const labels = normalizedHost.slice(0, -suffix.length).split(".").filter(Boolean);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
