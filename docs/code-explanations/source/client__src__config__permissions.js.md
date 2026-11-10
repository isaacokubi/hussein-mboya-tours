# Source explanation: client/src/config/permissions.js

**Source:** [client/src/config/permissions.js](../../../client/src/config/permissions.js)

## Purpose

Client-side configuration/constants consumed by routes, layouts, or permission-aware UI.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 8: `export const PERMISSION_GROUPS = {`.
- Line 87: `export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flat();`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
