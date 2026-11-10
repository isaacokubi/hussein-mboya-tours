# Source explanation: client/src/hooks/useAgentCustomers.js

**Source:** [client/src/hooks/useAgentCustomers.js](../../../client/src/hooks/useAgentCustomers.js)

## Purpose

A reusable React hook that packages state, query, or interaction behavior for components.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAgentCustomers` from `../api/customerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/customerApi](../../../client/src/api/customerApi.js)

## Runtime declarations and data flow

### `useAgentCustomers` — lines 14–66

Parameters: `params (defaulted)`.
React hooks used: useQuery. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 19:** `return useQuery({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 31:** `const response =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `await getAgentCustomers(params);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 31: `const response =`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
