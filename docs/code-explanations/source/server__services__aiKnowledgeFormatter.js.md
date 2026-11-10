# Source explanation: server/services/aiKnowledgeFormatter.js

**Source:** [server/services/aiKnowledgeFormatter.js](../../../server/services/aiKnowledgeFormatter.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `formatTravelKnowledge` — lines 2–55

Parameters: `knowledge (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 4:** `const tours = (knowledge.tours || [])` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `const destination =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `return \`` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 27:** `const destinations = (knowledge.destinations || [])` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `return \`` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 44:** `return \`` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 2: `export const formatTravelKnowledge = (knowledge = {}) => {`.
- Line 4: `const tours = (knowledge.tours || [])`.
- Line 7: `const destination =`.
- Line 27: `const destinations = (knowledge.destinations || [])`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
