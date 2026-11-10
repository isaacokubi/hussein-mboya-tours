# Source explanation: client/src/pages/admin/AdminDashboard.jsx

**Source:** [client/src/pages/admin/AdminDashboard.jsx](../../../client/src/pages/admin/AdminDashboard.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `AdminDashboardView` from `../../components/admin/dashboard/AdminDashboard`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/dashboard/AdminDashboard](../../../client/src/components/admin/dashboard/AdminDashboard.jsx)
- `ModuleCoverage` from `../../components/admin/dashboard/ModuleCoverage`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/dashboard/ModuleCoverage](../../../client/src/components/admin/dashboard/ModuleCoverage.jsx)

## Runtime declarations and data flow

### `AdminDashboard` — lines 4–6

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 5:** `return <div className="space-y-6"><AdminDashboardView /><ModuleCoverage /></div>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

No top-level named declarations detected.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
