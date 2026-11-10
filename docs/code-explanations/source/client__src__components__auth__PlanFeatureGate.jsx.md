# Source explanation: client/src/components/auth/PlanFeatureGate.jsx

**Source:** [client/src/components/auth/PlanFeatureGate.jsx](../../../client/src/components/auth/PlanFeatureGate.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `LockKeyhole`, `RefreshCw`, `ShieldCheck`, `Sparkles` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link`, `useLocation` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `getUserRole` from `../../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)
- `api` from `../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)

## Runtime declarations and data flow

### `labelFor` — lines 30–30

Parameters: `feature (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `resolveFeature` — lines 32–39

Parameters: `pathname`, `search`.
Persistent operations detected: PATH_FEATURES.find; verify tenant/ownership filters in the exact query. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `if (/^\/admin\/hospitality(?:\/|$)/.test(pathname)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const tab = new URLSearchParams(search).get("tab");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `if (tab === "hotels") return "hotels";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `if (tab === "transfers") return "airport_transfers";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `return PATH_FEATURES.find(([pattern]) => pattern.test(pathname))?.[1] || null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `PlanFeatureGate` — lines 41–144

Parameters: `{children}`.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. React hooks used: useState, useMemo, useEffect. Error control: try=false, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 42:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const location = useLocation();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const [state, setState] = useState({ loading: false, plan: "", features: null, error: null });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 45:** `const role = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const isSuperAdmin = ["super_admin", "superadmin"].includes(String(role || "").toLowerCase());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const feature = useMemo(() => resolveFeature(location.pathname, location.search), [location.pathname, location.search]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 49:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 50:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `let active = true;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `api.get("/subscription", { timeout: 12_000 }).then(({ data }) => {` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 58:** `if (!active) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `if (!active) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 67:** `return () => { active = false; };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 70:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `if (state.loading || state.features === null) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 92:** `if (state.error || state.features.includes(feature)) return children;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 94:** `const featureLabel = labelFor(feature);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `Info` — lines 146–156

Parameters: `{icon, label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 147:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `const PATH_FEATURES = [`.
- Line 30: `const labelFor = (feature = "") => feature.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());`.
- Line 32: `function resolveFeature(pathname, search) {`.
- Line 34: `const tab = new URLSearchParams(search).get("tab");`.
- Line 42: `<sensitive declaration redacted>`.
- Line 43: `const location = useLocation();`.
- Line 44: `const [state, setState] = useState({ loading: false, plan: "", features: null, error: null });`.
- Line 45: `const role = getUserRole(user);`.
- Line 46: `const isSuperAdmin = ["super_admin", "superadmin"].includes(String(role || "").toLowerCase());`.
- Line 47: `const feature = useMemo(() => resolveFeature(location.pathname, location.search), [location.pathname, location.search]);`.
- Line 51: `let active = true;`.
- Line 94: `const featureLabel = labelFor(feature);`.
- Line 95: `const planLabel = labelFor(state.plan || "starter");`.
- Line 146: `function Info({ icon: Icon, label, value }) {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
