# Source explanation: server/scripts/tenantModelContractCheck.js

**Source:** [server/scripts/tenantModelContractCheck.js](../../../server/scripts/tenantModelContractCheck.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `fs` from `node:fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fileURLToPath` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 5: `const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../models");`.
- Line 6: `const allowedGlobalTenantLookup = new Set(["WebsiteIntegrationKey"]);`.
- Line 7: `const failures = [];`.
- Line 10: `const fullPath = path.join(root, file);`.
- Line 11: `const source = fs.readFileSync(fullPath, "utf8");`.
- Line 14: `const modelName = file.replace(/\.js$/, "");`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
