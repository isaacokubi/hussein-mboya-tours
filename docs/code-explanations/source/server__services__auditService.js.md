# Source explanation: server/services/auditService.js

**Source:** [server/services/auditService.js](../../../server/services/auditService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `AuditLog` from `../models/AuditLog.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AuditLog.js](../../../server/models/AuditLog.js)

## Runtime declarations and data flow

### `createAuditLog` — lines 6–55

Parameters: `{user, action, resource, resourceId, description, status, severity, ipAddress, userAgent, method, endpoint, metadata}`.
Persistent operations detected: AuditLog.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 24:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 26:** `return await AuditLog.create({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 51:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `export const createAuditLog = async({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
