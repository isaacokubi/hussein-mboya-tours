# Source explanation: client/src/pages/superadmin/SuperAdminTenants.jsx

**Source:** [client/src/pages/superadmin/SuperAdminTenants.jsx](../../../client/src/pages/superadmin/SuperAdminTenants.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `deleteSuperAdminTenant`, `getSuperAdminTenants`, `updateSuperAdminTenantStatus`, `switchSuperAdminTenantPlan` from `../../api/superAdminTenantsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/superAdminTenantsApi](../../../client/src/api/superAdminTenantsApi.js)
- `activateTenantSubscription` from `../../api/tenantSubscriptionApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tenantSubscriptionApi](../../../client/src/api/tenantSubscriptionApi.js)

## Runtime declarations and data flow

### `tenantUrl` — lines 15–15

Parameters: `tenant`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `planLabel` — lines 16–16

Parameters: `plan`.
Persistent operations detected: PLANS.find; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 16:** `(plan) => PLANS.find((item) => item.value === String(plan || "").toLowerCase())?.label || String(plan || "—")` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `formatDate` — lines 17–17

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SuperAdminTenants` — lines 19–146

Parameters: none.
React hooks used: useState, useQuery, useMutation. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const [deleteTarget, setDeleteTarget] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [confirmation, setConfirmation] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const [activateTarget, setActivateTarget] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const [switchTarget, setSwitchTarget] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const [switchPlan, setSwitchPlan] = useState("starter");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const [activation, setActivation] = useState({ plan: "starter", periodDays: 30, amount: "", reference: "" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const { data, isLoading, isError, error } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 35:** `const tenants = data?.tenants || data?.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const refresh = () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const statusMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 48:** `const switchMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 58:** `const activateMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 64:** `const deleteMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 70:** `const openSwitcher = (tenant) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 97:** `const c = tenant.counts || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 37–40

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `openSwitcher` — lines 70–73

Parameters: `tenant`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const PLATFORM_HOST = String(import.meta.env.VITE_PLATFORM_HOST || "globaltours.com").replace(/^https?:\/\//, "").replace(/\/$/, "");`.
- Line 9: `const PLANS = [`.
- Line 15: `const tenantUrl = (tenant) => \`https://${tenant.slug}.${PLATFORM_HOST}\`;`.
- Line 16: `const planLabel = (plan) => PLANS.find((item) => item.value === String(plan || "").toLowerCase())?.label || String(plan || "—");`.
- Line 17: `const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—";`.
- Line 20: `const qc = useQueryClient();`.
- Line 21: `const [search, setSearch] = useState("");`.
- Line 22: `const [deleteTarget, setDeleteTarget] = useState(null);`.
- Line 23: `const [confirmation, setConfirmation] = useState("");`.
- Line 24: `const [activateTarget, setActivateTarget] = useState(null);`.
- Line 25: `const [switchTarget, setSwitchTarget] = useState(null);`.
- Line 26: `const [switchPlan, setSwitchPlan] = useState("starter");`.
- Line 27: `const [activation, setActivation] = useState({ plan: "starter", periodDays: 30, amount: "", reference: "" });`.
- Line 29: `const { data, isLoading, isError, error } = useQuery({`.
- Line 35: `const tenants = data?.tenants || data?.data || [];`.
- Line 37: `const refresh = () => {`.
- Line 42: `const statusMutation = useMutation({`.
- Line 48: `const switchMutation = useMutation({`.
- Line 58: `const activateMutation = useMutation({`.
- Line 64: `const deleteMutation = useMutation({`.
- Line 70: `const openSwitcher = (tenant) => {`.
- Line 97: `const c = tenant.counts || {};`.
- Line 98: `const protectedTenant = tenant.slug === "platform" || tenant.isSystem;`.
- Line 99: `const sub = tenant.subscription || {};`.
- Line 100: `const date = tenant.status === "trial" ? sub.trialEndsAt : sub.renewsAt;`.
- Line 101: `const currentPlan = String(sub.plan || "starter").toLowerCase();`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
