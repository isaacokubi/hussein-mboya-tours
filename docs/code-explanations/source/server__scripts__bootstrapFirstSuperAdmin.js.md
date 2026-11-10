# Source explanation: server/scripts/bootstrapFirstSuperAdmin.js

**Source:** [server/scripts/bootstrapFirstSuperAdmin.js](../../../server/scripts/bootstrapFirstSuperAdmin.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `../tenancy/bootstrap.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/bootstrap.js](../../../server/tenancy/bootstrap.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `readline` from `node:readline/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `stdin`, `stdout` from `node:process`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `env` from `../config/env.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/env.js](../../../server/config/env.js)
- `bootstrapFirstSuperAdmin` from `../services/onboardingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/onboardingService.js](../../../server/services/onboardingService.js)

## Runtime declarations and data flow

### `ask` — lines 10–13

Parameters: `label`, `fallback (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 11:** `const value = await rl.question(fallback ? \`${label} [${fallback}]: \` : \`${label}: \`);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 12:** `return String(value || fallback).trim();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `askSecret` — lines 15–18

Parameters: `label`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 16:** `const value = await rl.question(\`${label}: \`, { hideEchoBack: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 17:** `return String(value || "").trim();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `envOrAsk` — lines 20–20

Parameters: `key`, `label`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const rl = readline.createInterface({ input, output });`.
- Line 10: `const ask = async (label, fallback = "") => {`.
- Line 11: `const value = await rl.question(fallback ? \`${label} [${fallback}]: \` : \`${label}: \`);`.
- Line 15: `<sensitive declaration redacted>`.
- Line 16: `const value = await rl.question(\`${label}: \`, { hideEchoBack: true });`.
- Line 20: `const envOrAsk = async (key, label) => process.env[key]?.trim() || ask(label);`.
- Line 23: `const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI;`.
- Line 35: `const companyName = await envOrAsk("BOOTSTRAP_COMPANY_NAME", "Company name");`.
- Line 36: `const companySlug = await envOrAsk("BOOTSTRAP_COMPANY_SLUG", "Company slug");`.
- Line 37: `const country = await envOrAsk("BOOTSTRAP_COUNTRY", "Country");`.
- Line 38: `const timezone = await envOrAsk("BOOTSTRAP_TIMEZONE", "Timezone");`.
- Line 39: `const currency = await envOrAsk("BOOTSTRAP_CURRENCY", "Currency");`.
- Line 42: `const superAdminName = await envOrAsk("BOOTSTRAP_SUPERADMIN_NAME", "SuperAdmin full name");`.
- Line 43: `const superAdminEmail = await envOrAsk("BOOTSTRAP_SUPERADMIN_EMAIL", "SuperAdmin email");`.
- Line 44: `const superAdminPhone = await envOrAsk("BOOTSTRAP_SUPERADMIN_PHONE", "SuperAdmin phone (10 digits)");`.
- Line 45: `<sensitive declaration redacted>`.
- Line 48: `const adminName = await envOrAsk("BOOTSTRAP_ADMIN_NAME", "Admin full name");`.
- Line 49: `const adminEmail = await envOrAsk("BOOTSTRAP_ADMIN_EMAIL", "Admin email");`.
- Line 50: `const adminPhone = await envOrAsk("BOOTSTRAP_ADMIN_PHONE", "Admin phone (10 digits)");`.
- Line 51: `<sensitive declaration redacted>`.
- Line 53: `const result = await bootstrapFirstSuperAdmin({`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
