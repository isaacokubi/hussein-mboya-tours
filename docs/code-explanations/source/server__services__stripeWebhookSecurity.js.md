# Source explanation: server/services/stripeWebhookSecurity.js

**Source:** [server/services/stripeWebhookSecurity.js](../../../server/services/stripeWebhookSecurity.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `crypto` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `verifyStripeWebhookSignature` — lines 3–15

Parameters: `{payload, signature, secret, now, toleranceSeconds}`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 4:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 5:** `const parts = String(signature).split(",").map((part) => part.split("=", 2));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 7:** `const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `if (!Number.isFinite(timestamp) || Math.abs(Math.floor(now / 1000) - timestamp) > toleranceSeconds || !signatures.length) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `return signatures.some((value) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 11:** `if (!/^[a-f\d]{64}$/i.test(value)) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const candidate = Buffer.from(value, "hex");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 3: `<sensitive declaration redacted>`.
- Line 5: `const parts = String(signature).split(",").map((part) => part.split("=", 2));`.
- Line 6: `const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);`.
- Line 7: `const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);`.
- Line 9: `<sensitive declaration redacted>`.
- Line 12: `const candidate = Buffer.from(value, "hex");`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
