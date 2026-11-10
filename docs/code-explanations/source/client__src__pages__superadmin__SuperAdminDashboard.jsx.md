# Source explanation: client/src/pages/superadmin/SuperAdminDashboard.jsx

**Source:** [client/src/pages/superadmin/SuperAdminDashboard.jsx](../../../client/src/pages/superadmin/SuperAdminDashboard.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Activity`, `Building2`, `CalendarCheck2`, `CarFront`, `CheckCircle2`, `CreditCard`, `Database`, `Gauge`, `Globe2`, `LayoutDashboard`, `Map`, `MapPinned`, `RefreshCw`, `ShieldCheck`, `UserCheck`, `Users`, `WalletCards`, `AlertCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSuperAdminDashboardMetrics` from `../../api/superAdminApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/superAdminApi](../../../client/src/api/superAdminApi.js)
- `SuperAdminTenants` from `./SuperAdminTenants`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/pages/superadmin/SuperAdminTenants](../../../client/src/pages/superadmin/SuperAdminTenants.jsx)

## Runtime declarations and data flow

### `number` — lines 26–26

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `hasValue` — lines 27–27

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `displayCount` — lines 28–28

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `displayMoney` — lines 29–30

Parameters: `value`, `currency`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrapMetrics` — lines 32–51

Parameters: `payload`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `let current = payload?.data ?? payload ?? {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `if (current?.data && typeof current.data === "object" && !Array.isArray(current.data)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `const nested = current.data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `return current;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `unwrapScope` — lines 53–54

Parameters: `payload`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SuperAdminDashboard` — lines 88–211

Parameters: none.
React hooks used: useQuery. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 89:** `const { data, isLoading, isError, error, refetch, isFetching } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 98:** `const stats = unwrapMetrics(data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 99:** `const scope = unwrapScope(data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `const status = error?.response?.status;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 101:** `const message = error?.response?.data?.message;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `const currency = String(stats.revenueCurrency || "KES").toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `const tenantCount = hasValue(scope.tenantCount) ? Number(scope.tenantCount) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const activeTenantCount = hasValue(scope.activeTenantCount) ? Number(scope.activeTenantCount) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `const trialTenantCount = hasValue(scope.trialTenantCount) ? Number(scope.trialTenantCount) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `if (isLoading) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 108:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 124:** `if (isError) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `const sessionExpired = status === 401;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `const forbidden = status === 403;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 127:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 154:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 26: `const number = (value) => Number(value ?? 0).toLocaleString("en-KE");`.
- Line 27: `const hasValue = (value) => value !== undefined && value !== null;`.
- Line 28: `const displayCount = (value) => (hasValue(value) ? number(value) : "—");`.
- Line 29: `const displayMoney = (value, currency) =>`.
- Line 32: `const unwrapMetrics = (payload) => {`.
- Line 33: `let current = payload?.data ?? payload ?? {};`.
- Line 35: `const nested = current.data;`.
- Line 53: `const unwrapScope = (payload) =>`.
- Line 56: `const cards = [`.
- Line 72: `const toneClasses = {`.
- Line 89: `const { data, isLoading, isError, error, refetch, isFetching } = useQuery({`.
- Line 98: `const stats = unwrapMetrics(data);`.
- Line 99: `const scope = unwrapScope(data);`.
- Line 100: `const status = error?.response?.status;`.
- Line 101: `const message = error?.response?.data?.message;`.
- Line 102: `const currency = String(stats.revenueCurrency || "KES").toUpperCase();`.
- Line 103: `const tenantCount = hasValue(scope.tenantCount) ? Number(scope.tenantCount) : null;`.
- Line 104: `const activeTenantCount = hasValue(scope.activeTenantCount) ? Number(scope.activeTenantCount) : null;`.
- Line 105: `const trialTenantCount = hasValue(scope.trialTenantCount) ? Number(scope.trialTenantCount) : null;`.
- Line 125: `const sessionExpired = status === 401;`.
- Line 126: `const forbidden = status === 403;`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
