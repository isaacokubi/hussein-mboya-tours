# Source explanation: server/tests/externalWebsiteGoLive.test.js

**Source:** [server/tests/externalWebsiteGoLive.test.js](../../../server/tests/externalWebsiteGoLive.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `node:fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fileURLToPath` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `read` — lines 8–8

Parameters: `relative`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const here = path.dirname(fileURLToPath(import.meta.url));`.
- Line 8: `const read = (relative) => fs.readFileSync(path.join(here, "..", relative), "utf8");`.
- Line 9: `const controller = read("controllers/integrationController.js");`.
- Line 10: `const routes = read("routes/integrationRoutes.js");`.
- Line 11: `const docs = fs.readFileSync(path.join(here, "../../docs/EXTERNAL_WEBSITE_CONNECTOR_GO_LIVE.md"), "utf8");`.
- Line 12: `const settings = fs.readFileSync(path.join(here, "../../client/src/pages/admin/AdminSettings.jsx"), "utf8");`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
