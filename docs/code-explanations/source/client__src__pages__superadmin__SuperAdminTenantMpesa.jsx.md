# Source explanation: client/src/pages/superadmin/SuperAdminTenantMpesa.jsx

**Source:** [client/src/pages/superadmin/SuperAdminTenantMpesa.jsx](../../../client/src/pages/superadmin/SuperAdminTenantMpesa.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ArrowLeft`, `CheckCircle2`, `KeyRound`, `Save`, `ShieldCheck`, `Smartphone`, `XCircle`, `Wifi` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link`, `useNavigate`, `useParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `disableSuperAdminTenantMpesa`, `getSuperAdminTenantMpesa`, `saveSuperAdminTenantMpesa`, `validateSuperAdminTenantMpesa` from `../../api/superAdminTenantsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/superAdminTenantsApi](../../../client/src/api/superAdminTenantsApi.js)

## Runtime declarations and data flow

### `SuperAdminTenantMpesa` — lines 11–92

Parameters: none.
React hooks used: useState, useQuery, useEffect, useMutation. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `const { tenantId } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const [form, setForm] = useState(emptyForm);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const [validation, setValidation] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const query = useQuery({ queryKey: ["superadmin-tenant-mpesa", tenantId, form.environment], queryFn: () => getSuperAdminTenantMpesa(tenantId, form.environment), enabled: Boolean(tenantId) });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const data = query.data?.data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const tenant = query.data?.tenant;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `if (!data) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const refresh = () => queryClient.invalidateQueries({ queryKey: ["superadmin-tenant-mpesa", tenantId] });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const save = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 43:** `const disable = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 48:** `const check = useMutation({ mutationFn: () => validateSuperAdminTenantMpesa(tenantId, form.environment), onSuccess: (result) => { setValidation(result.data); refresh(); }, onError: (error) => setValidation({ status: "err` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 49:** `const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `if (query.isLoading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">Loading tenant payment settings…</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `if (query.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{query.error?.response?.data?.message || "Unable to load tenant M-Pesa settings."}</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `return <main className="mx-auto max-w-5xl space-y-6">` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 33–33

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `set` — lines 49–49

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `<sensitive declaration redacted>`.
- Line 9: `const fieldClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50";`.
- Line 12: `const { tenantId } = useParams();`.
- Line 13: `const navigate = useNavigate();`.
- Line 14: `const queryClient = useQueryClient();`.
- Line 15: `const [form, setForm] = useState(emptyForm);`.
- Line 16: `const [validation, setValidation] = useState(null);`.
- Line 17: `const query = useQuery({ queryKey: ["superadmin-tenant-mpesa", tenantId, form.environment], queryFn: () => getSuperAdminTenantMpesa(tenantId, form.environment), enabled: Boolean(te`.
- Line 18: `const data = query.data?.data;`.
- Line 19: `const tenant = query.data?.tenant;`.
- Line 33: `const refresh = () => queryClient.invalidateQueries({ queryKey: ["superadmin-tenant-mpesa", tenantId] });`.
- Line 34: `const save = useMutation({`.
- Line 43: `const disable = useMutation({`.
- Line 48: `const check = useMutation({ mutationFn: () => validateSuperAdminTenantMpesa(tenantId, form.environment), onSuccess: (result) => { setValidation(result.data); refresh(); }, onError:`.
- Line 49: `const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
