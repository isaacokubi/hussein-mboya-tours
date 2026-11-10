# Source explanation: server/tests/frontendCoverageContract.test.js

**Source:** [server/tests/frontendCoverageContract.test.js](../../../server/tests/frontendCoverageContract.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `node:fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fileURLToPath` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `exists` — lines 10–10

Parameters: `r`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `read` — lines 11–11

Parameters: `r`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `hasRoute` — lines 14–14

Parameters: `p`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const here = path.dirname(fileURLToPath(import.meta.url));`.
- Line 8: `const root = path.resolve(here, "../..");`.
- Line 9: `const client = path.join(root, "client/src");`.
- Line 10: `const exists = (r) => fs.existsSync(path.join(client, r));`.
- Line 11: `const read = (r) => fs.readFileSync(path.join(client, r), "utf8");`.
- Line 12: `const routeSource = read("routes/AppRoutes.jsx");`.
- Line 13: `const sidebarSource = read("components/admin/AdminSidebar.jsx");`.
- Line 14: `const hasRoute = (p) => routeSource.includes(\`path="${p}"\`) || routeSource.includes(\`path='${p}'\`);`.
- Line 16: `const requiredUiFiles = [`.
- Line 40: `const s = read("pages/admin/AdminCompliance.jsx");`.
- Line 48: `const s = read("components/admin/PaymentGatewayCenter.jsx");`.
- Line 54: `const s = read("pages/admin/AdminSettings.jsx");`.
- Line 55: `const d = read("components/admin/DeveloperPlatformCenter.jsx");`.
- Line 62: `const p = read("pages/PolicyPage.jsx");`.
- Line 63: `const a = read("pages/admin/PrivacyRequests.jsx");`.
- Line 72: `const s = (read("pages/admin/finance/AdminFinance.jsx") + read("components/admin/FinanceLifecycleCenter.jsx")).toLowerCase();`.
- Line 80: `const layout = read("layouts/AdminLayout.jsx");`.
- Line 87: `const guideDashboard = read("pages/guide/TourGuideDashboard.jsx");`.
- Line 93: `const s = (read("pages/admin/OperationsDashboard.jsx") + read("components/admin/OperationsActionCenter.jsx") + read("components/admin/TravelOperationsCenter.jsx")).toLowerCase();`.
- Line 99: `const s = read("components/admin/TravelOperationsCenter.jsx");`.
- Line 115: `const axios = read("api/axios.js");`.
- Line 116: `const auth = read("context/AuthContext.jsx");`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
