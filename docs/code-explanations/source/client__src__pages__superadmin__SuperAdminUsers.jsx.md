# Source explanation: client/src/pages/superadmin/SuperAdminUsers.jsx

**Source:** [client/src/pages/superadmin/SuperAdminUsers.jsx](../../../client/src/pages/superadmin/SuperAdminUsers.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `React`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Activity`, `Ban`, `Building2`, `CheckCircle2`, `ChevronRight`, `Clock3`, `Plus`, `RefreshCw`, `Search`, `ShieldCheck`, `Trash2`, `UserCheck`, `Users`, `UserCog`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `getSuperAdminDashboardMetrics` from `../../api/superAdminApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/superAdminApi](../../../client/src/api/superAdminApi.js)
- `createSuperAdminTenant`, `getSuperAdminTenantPlans` from `../../api/superAdminTenantsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/superAdminTenantsApi](../../../client/src/api/superAdminTenantsApi.js)
- `Pagination` from `../../components/admin/Pagination`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/Pagination](../../../client/src/components/admin/Pagination.jsx)

## Runtime declarations and data flow

### `getUsers` — lines 50–51

Parameters: `search`, `page`.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 51:** `(await api.get("/superadmin/users", { params: { search, page, limit: PAGE_SIZE } })).data` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateStatus` — lines 52–53

Parameters: `id`, `status`.
HTTP operations detected: api.put; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 53:** `(await api.put(\`/superadmin/users/${id}/status\`, { status })).data` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `removeUser` — lines 54–54

Parameters: `id`.
HTTP operations detected: api.delete; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 54:** `async (id) => (await api.delete(\`/superadmin/users/${id}\`)).data` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `roleLabel` — lines 56–59

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusLabel` — lines 61–64

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `CompanyTenantForm` — lines 66–219

Parameters: `{onCreated, onCancel}`.
React hooks used: useState, useQuery. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 67:** `const [form, setForm] = useState(INITIAL_FORM);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 68:** `const [saving, setSaving] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 69:** `const [error, setError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 70:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 80:** `const plans = planData?.plans || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const selectedPlan = plans.find((plan) => plan.value === form.plan);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 82:** `const tenantSlug = String(form.slug || form.companyName || "")` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `const platformUrl = tenantSlug` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `const handleChange = ({ target: { name, value } }) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `if (name === "plan") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `const nextPlan = plans.find((plan) => plan.value === value);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 99:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 104:** `const submit = async (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 109:** `const result = await createSuperAdminTenant({ ...form, seats: Number(form.seats) });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 111:** `await onCreated?.();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 114:** `const message = err?.response?.data?.message || err?.message || "Unable to create company.";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleChange` — lines 91–102

Parameters: `{target}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 92:** `if (name === "plan") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `const nextPlan = plans.find((plan) => plan.value === value);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 99:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `submit` — lines 104–120

Parameters: `event`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 108:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 109:** `const result = await createSuperAdminTenant({ ...form, seats: Number(form.seats) });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 111:** `await onCreated?.();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 114:** `const message = err?.response?.data?.message || err?.message || "Unable to create company.";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `Field` — lines 221–235

Parameters: `{label, name, value, onChange, type, ...}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 222:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `SectionTitle` — lines 237–244

Parameters: `{title, subtitle}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 238:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `MetricCard` — lines 246–273

Parameters: `{icon, title, value, hint, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 247:** `const tones = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 254:** `const iconTones = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 261:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `StatusBadge` — lines 275–290

Parameters: `{status}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 276:** `const value = String(status || "active").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 277:** `const styles = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 284:** `const Icon = value === "active" ? CheckCircle2 : value === "blocked" ? Ban : Clock3;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 285:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `SuperAdminUsers` — lines 292–568

Parameters: none.
React hooks used: useState, useQuery, useMemo. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 293:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 294:** `const [page, setPage] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 295:** `const [showCreateAccount, setShowCreateAccount] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 296:** `const [busyUserId, setBusyUserId] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 298:** `const { data, isLoading, isError, error, refetch, isFetching } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 305:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 310:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 319:** `const users = data?.users || data?.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 320:** `const totalUsers = Number(data?.total ?? metricsData?.data?.users ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 321:** `const pages = Math.max(1, Number(data?.pages || Math.ceil(totalUsers / PAGE_SIZE) || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 322:** `const metrics = metricsData?.data || metricsData || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 323:** `const tenantMap = useMemo(` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 328:** `const refreshAll = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 329:** `await Promise.all([refetch(), refetchMetrics()]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 332:** `const status = async (id, value) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 334:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 335:** `await updateStatus(id, value);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 336:** `await refreshAll();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refreshAll` — lines 328–330

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 329:** `await Promise.all([refetch(), refetchMetrics()]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `status` — lines 332–343

Parameters: `id`, `value`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 334:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 335:** `await updateStatus(id, value);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 336:** `await refreshAll();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `remove` — lines 345–359

Parameters: `id`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 346:** `const user = users.find((item) => item._id === id);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 347:** `const label = user?.name || user?.email || "this user";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 348:** `if (!window.confirm(\`Delete ${label} permanently? This action cannot be undone.\`)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 350:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 351:** `await removeUser(id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 352:** `await refreshAll();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `InfoCard` — lines 570–582

Parameters: `{icon, title, text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 571:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 26: `const PAGE_SIZE = 10;`.
- Line 27: `const STATUS_VALUES = ["active", "inactive", "disabled", "suspended", "blocked"];`.
- Line 28: `const PLATFORM_HOST = String(import.meta.env.VITE_PLATFORM_HOST || "globaltours.com")`.
- Line 31: `const INITIAL_FORM = {`.
- Line 50: `const getUsers = async (search, page) =>`.
- Line 52: `const updateStatus = async (id, status) =>`.
- Line 54: `const removeUser = async (id) => (await api.delete(\`/superadmin/users/${id}\`)).data;`.
- Line 56: `const roleLabel = (role) =>`.
- Line 61: `const statusLabel = (status) =>`.
- Line 66: `function CompanyTenantForm({ onCreated, onCancel }) {`.
- Line 67: `const [form, setForm] = useState(INITIAL_FORM);`.
- Line 68: `const [saving, setSaving] = useState(false);`.
- Line 69: `const [error, setError] = useState("");`.
- Line 70: `const {`.
- Line 80: `const plans = planData?.plans || [];`.
- Line 81: `const selectedPlan = plans.find((plan) => plan.value === form.plan);`.
- Line 82: `const tenantSlug = String(form.slug || form.companyName || "")`.
- Line 87: `const platformUrl = tenantSlug`.
- Line 91: `const handleChange = ({ target: { name, value } }) => {`.
- Line 93: `const nextPlan = plans.find((plan) => plan.value === value);`.
- Line 104: `const submit = async (event) => {`.
- Line 109: `const result = await createSuperAdminTenant({ ...form, seats: Number(form.seats) });`.
- Line 114: `const message = err?.response?.data?.message || err?.message || "Unable to create company.";`.
- Line 221: `function Field({ label, name, value, onChange, type = "text", ...props }) {`.
- Line 237: `function SectionTitle({ title, subtitle }) {`.
- Line 246: `function MetricCard({ icon: Icon, title, value, hint, tone = "slate" }) {`.
- Line 247: `const tones = {`.
- Line 254: `const iconTones = {`.
- Line 275: `function StatusBadge({ status }) {`.
- Line 276: `const value = String(status || "active").toLowerCase();`.
- Line 277: `const styles = {`.
- Line 284: `const Icon = value === "active" ? CheckCircle2 : value === "blocked" ? Ban : Clock3;`.
- Line 293: `const [search, setSearch] = useState("");`.
- Line 294: `const [page, setPage] = useState(1);`.
- Line 295: `const [showCreateAccount, setShowCreateAccount] = useState(false);`.
- Line 296: `const [busyUserId, setBusyUserId] = useState("");`.
- Line 298: `const { data, isLoading, isError, error, refetch, isFetching } = useQuery({`.
- Line 305: `const {`.
- Line 319: `const users = data?.users || data?.data || [];`.
- Line 320: `const totalUsers = Number(data?.total ?? metricsData?.data?.users ?? 0);`.
- Line 321: `const pages = Math.max(1, Number(data?.pages || Math.ceil(totalUsers / PAGE_SIZE) || 1));`.
- Line 322: `const metrics = metricsData?.data || metricsData || {};`.
- Line 323: `const tenantMap = useMemo(`.
- Line 328: `const refreshAll = async () => {`.
- Line 332: `const status = async (id, value) => {`.
- Line 345: `const remove = async (id) => {`.
- Line 346: `const user = users.find((item) => item._id === id);`.
- Line 347: `const label = user?.name || user?.email || "this user";`.
- Line 361: `const metricFailure = metricsError && !metricsData;`.
- Line 494: `const role = String(user.role || "customer").toLowerCase();`.
- Line 495: `const userStatus = String(user.status || "active").toLowerCase();`.
- Line 496: `const tenant = user.tenantId ? tenantMap.get(String(user.tenantId)) : null;`.
- Line 497: `const isBusy = busyUserId === user._id;`.
- Line 498: `const isSuperAdmin = ["super_admin", "superadmin"].includes(role);`.
- Line 570: `function InfoCard({ icon: Icon, title, text }) {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
