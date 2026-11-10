# Source explanation: client/src/pages/superadmin/SuperAdminPlanFeatures.jsx

**Source:** [client/src/pages/superadmin/SuperAdminPlanFeatures.jsx](../../../client/src/pages/superadmin/SuperAdminPlanFeatures.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `React`, `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Check`, `LockKeyhole`, `RefreshCw`, `Save`, `ShieldCheck`, `X`, `AlertTriangle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getPlatformBillingConfig`, `updatePlatformBillingConfig` from `../../api/platformBillingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/platformBillingApi](../../../client/src/api/platformBillingApi.js)

## Runtime declarations and data flow

### `money` — lines 13–13

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SuperAdminPlanFeatures` — lines 15–47

Parameters: none.
React hooks used: useState, useEffect, useMemo. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `const [billing, setBilling] = useState({ prices: {}, features: {}, featureCatalog: [] });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const [saving, setSaving] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [loading, setLoading] = useState(true);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [loadError, setLoadError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const load = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 25:** `const response = await getPlatformBillingConfig();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `useEffect(() => { void load(); }, []);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 34:** `const updateFeature = (plan, featureId, enabled) => setBilling((current) => ({ ...current, features: { ...current.features, [plan]: enabled ? [...new Set([...(current.features?.[plan] || []), featureId])] : (current.feat` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const save = async () => { try { setSaving(true); const payload = { ...Object.fromEntries(PLAN_ORDER.map((plan) => [plan, Number(billing.prices?.[plan] || 0)])), features: Object.fromEntries(PLAN_ORDER.map((plan) => [pla` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `const catalog = useMemo(() => billing.featureCatalog || [], [billing.featureCatalog]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 37:** `if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3 text-sm font-semibold text-slate-600"><RefreshCw className="animate-spin text-emeral` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return <div className="space-y-5">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `load` — lines 21–31

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 22:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 25:** `const response = await getPlatformBillingConfig();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateFeature` — lines 34–34

Parameters: `plan`, `featureId`, `enabled`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `save` — lines 35–35

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:

## Module-level declarations

- Line 6: `const PLAN_ORDER = ["starter", "professional", "business", "enterprise"];`.
- Line 7: `const PLAN_META = {`.
- Line 13: `const money = (value) => value === undefined || value === null || value === "" ? "—" : \`KES ${Number(value).toLocaleString("en-KE")}\`;`.
- Line 16: `const [billing, setBilling] = useState({ prices: {}, features: {}, featureCatalog: [] });`.
- Line 17: `const [saving, setSaving] = useState(false);`.
- Line 18: `const [loading, setLoading] = useState(true);`.
- Line 19: `const [loadError, setLoadError] = useState("");`.
- Line 21: `const load = async () => {`.
- Line 25: `const response = await getPlatformBillingConfig();`.
- Line 34: `const updateFeature = (plan, featureId, enabled) => setBilling((current) => ({ ...current, features: { ...current.features, [plan]: enabled ? [...new Set([...(current.features?.[pl`.
- Line 35: `const save = async () => { try { setSaving(true); const payload = { ...Object.fromEntries(PLAN_ORDER.map((plan) => [plan, Number(billing.prices?.[plan] || 0)])), features: Object.f`.
- Line 36: `const catalog = useMemo(() => billing.featureCatalog || [], [billing.featureCatalog]);`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
