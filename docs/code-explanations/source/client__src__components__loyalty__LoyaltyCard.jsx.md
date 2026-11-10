# Source explanation: client/src/components/loyalty/LoyaltyCard.jsx

**Source:** [client/src/components/loyalty/LoyaltyCard.jsx](../../../client/src/components/loyalty/LoyaltyCard.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `Award`, `Star`, `Gift` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `LoyaltyCard` — lines 3–126

Parameters: `{loyalty}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 4:** `const tier = loyalty.tier || "Bronze";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 5:** `const points = loyalty.points || 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const tiers = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const nextTarget = tiers[tier] || 1000;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const progress = Math.min(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const tier = loyalty.tier || "Bronze";`.
- Line 5: `const points = loyalty.points || 0;`.
- Line 13: `const tiers = {`.
- Line 20: `const nextTarget = tiers[tier] || 1000;`.
- Line 22: `const progress = Math.min(`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
