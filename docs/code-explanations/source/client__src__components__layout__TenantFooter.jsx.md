# Source explanation: client/src/components/layout/TenantFooter.jsx

**Source:** [client/src/components/layout/TenantFooter.jsx](../../../client/src/components/layout/TenantFooter.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useTenant` from `../../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `FaEnvelope`, `FaFacebookF`, `FaInstagram`, `FaLocationDot`, `FaPhone`, `FaXTwitter`, `FaYoutube` from `react-icons/fa6`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `cleanPhone` — lines 6–6

Parameters: `value (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `TenantFooter` — lines 8–107

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 9:** `const { tenant } = useTenant() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const companyName = settings.companyName || tenant?.name || "Hussein Mboya Tours";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const supportEmail = settings.supportEmail || tenant?.contactEmail || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const supportPhone = settings.supportPhone || tenant?.contactPhone || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const address = settings.address || tenant?.address || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const city = settings.city || tenant?.city || "Nairobi";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const country = settings.country || tenant?.country || "Kenya";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const social = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const year = new Date().getFullYear();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const cleanPhone = (value = "") => String(value).replace(/\s+/g, "");`.
- Line 9: `const { tenant } = useTenant() || {};`.
- Line 10: `const { settings = {} } = useSettings() || {};`.
- Line 12: `const companyName = settings.companyName || tenant?.name || "Hussein Mboya Tours";`.
- Line 13: `const supportEmail = settings.supportEmail || tenant?.contactEmail || "";`.
- Line 14: `const supportPhone = settings.supportPhone || tenant?.contactPhone || "";`.
- Line 15: `const address = settings.address || tenant?.address || "";`.
- Line 16: `const city = settings.city || tenant?.city || "Nairobi";`.
- Line 17: `const country = settings.country || tenant?.country || "Kenya";`.
- Line 18: `const social = {`.
- Line 24: `const year = new Date().getFullYear();`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
