# Source explanation: client/src/pages/rbac/RolesPage.jsx

**Source:** [client/src/pages/rbac/RolesPage.jsx](../../../client/src/pages/rbac/RolesPage.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Check`, `ChevronDown`, `ChevronRight`, `CircleAlert`, `Filter`, `KeyRound`, `LockKeyhole`, `Save`, `Search`, `ShieldCheck`, `Users`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminRoles`, `getAdminPermissions`, `updateAdminRolePermissions` from `../../api/admin/adminRoleApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/admin/adminRoleApi](../../../client/src/api/admin/adminRoleApi.js)

## Runtime declarations and data flow

### `permissionId` — lines 43–47

Parameters: `permission`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 44:** `if (permission == null) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (typeof permission === "string") return permission;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `return permission._id || permission.id || permission.key || permission.name || null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `permissionLabel` — lines 49–50

Parameters: `permission`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `permissionDescription` — lines 52–52

Parameters: `permission`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `roleId` — lines 54–54

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `roleKey` — lines 56–56

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `prettyName` — lines 58–58

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `RolesPage` — lines 60–289

Parameters: none.
React hooks used: useState, useQuery, useMemo, useMutation. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 61:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const [selected, setSelected] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 63:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 64:** `const [moduleFilter, setModuleFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 65:** `const [showOnlySelected, setShowOnlySelected] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 67:** `const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: getAdminRoles });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 68:** `const permissionsQuery = useQuery({ queryKey: ["admin-permissions"], queryFn: getAdminPermissions });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 70:** `const roles = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 71:** `const value = rolesQuery.data?.roles || rolesQuery.data?.data || rolesQuery.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `return Array.isArray(value) ? value : [];` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 75:** `const permissions = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 76:** `const value = permissionsQuery.data?.permissions || permissionsQuery.data?.data || permissionsQuery.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `return Array.isArray(value) ? value : [];` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 80:** `const grouped = useMemo(` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 82:** `const key = permission?.module || permission?.category || String(permission?.name || "other").split(/[._]/)[0] || "other";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `return acc;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 89:** `const modules = useMemo(() => Object.keys(grouped).sort((a, b) => a.localeCompare(b)), [grouped]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 91:** `const effectiveSelected = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `PermissionEditor` — lines 291–402

Parameters: `{role, grouped, allPermissions, mutation}`.
React hooks used: useState. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 292:** `const [checked, setChecked] = useState(() => new Set((role?.permissions || []).map(permissionId).filter(Boolean)));` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 294:** `const visibleIds = Object.values(grouped).flat().map(permissionId).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 295:** `const allIds = allPermissions.map(permissionId).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 296:** `const isSuperAdmin = ["super_admin", "superadmin"].includes(roleKey(role));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 298:** `const toggle = (id) => setChecked((previous) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 299:** `const next = new Set(previous);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 300:** `if (next.has(id)) next.delete(id); else next.add(id);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 301:** `return next;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 304:** `const setVisible = (value) => setChecked((previous) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 305:** `const next = new Set(previous);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 307:** `return next;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 310:** `const save = () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 311:** `if (!roleId(role)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 312:** `if (isSuperAdmin && checked.size === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 314:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 319:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 352:** `const moduleIds = items.map(permissionId).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 353:** `const selectedCount = moduleIds.filter((id) => checked.has(id)).length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `toggle` — lines 298–302

Parameters: `id`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 299:** `const next = new Set(previous);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 300:** `if (next.has(id)) next.delete(id); else next.add(id);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 301:** `return next;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `setVisible` — lines 304–308

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 305:** `const next = new Set(previous);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 307:** `return next;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `save` — lines 310–317

Parameters: none.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 311:** `if (!roleId(role)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 312:** `if (isSuperAdmin && checked.size === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 314:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Stat` — lines 404–412

Parameters: `{label, value, icon}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 405:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `LoadingState` — lines 414–423

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 415:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `EmptyState` — lines 425–435

Parameters: `{title, description}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 426:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 20: `const ROLE_META = {`.
- Line 34: `const toneClasses = {`.
- Line 43: `const permissionId = (permission) => {`.
- Line 49: `const permissionLabel = (permission) =>`.
- Line 52: `const permissionDescription = (permission) => permission?.description || permission?.helpText || "Controls access to this capability.";`.
- Line 54: `const roleId = (role) => role?._id || role?.id || null;`.
- Line 56: `const roleKey = (role) => String(role?.name || role?.key || "").toLowerCase().replace(/\s+/g, "_");`.
- Line 58: `const prettyName = (role) => String(role?.displayName || role?.name || "Role").replace(/_/g, " ");`.
- Line 61: `const qc = useQueryClient();`.
- Line 62: `const [selected, setSelected] = useState(null);`.
- Line 63: `const [search, setSearch] = useState("");`.
- Line 64: `const [moduleFilter, setModuleFilter] = useState("all");`.
- Line 65: `const [showOnlySelected, setShowOnlySelected] = useState(false);`.
- Line 67: `const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: getAdminRoles });`.
- Line 68: `const permissionsQuery = useQuery({ queryKey: ["admin-permissions"], queryFn: getAdminPermissions });`.
- Line 70: `const roles = useMemo(() => {`.
- Line 71: `const value = rolesQuery.data?.roles || rolesQuery.data?.data || rolesQuery.data || [];`.
- Line 75: `const permissions = useMemo(() => {`.
- Line 76: `const value = permissionsQuery.data?.permissions || permissionsQuery.data?.data || permissionsQuery.data || [];`.
- Line 80: `const grouped = useMemo(`.
- Line 82: `const key = permission?.module || permission?.category || String(permission?.name || "other").split(/[._]/)[0] || "other";`.
- Line 89: `const modules = useMemo(() => Object.keys(grouped).sort((a, b) => a.localeCompare(b)), [grouped]);`.
- Line 91: `const effectiveSelected = useMemo(() => {`.
- Line 93: `const preferred = roles.find((role) => ["super_admin", "superadmin"].includes(roleKey(role)));`.
- Line 97: `const activeRole = roles.find((role) => roleId(role) === effectiveSelected);`.
- Line 98: `const activePermissionIds = useMemo(`.
- Line 103: `const filteredGrouped = useMemo(() => {`.
- Line 104: `const needle = search.trim().toLowerCase();`.
- Line 107: `const filtered = items.filter((permission) => {`.
- Line 108: `const matchesSearch = !needle || [permissionLabel(permission), permission?.name, permission?.key, permission?.description]`.
- Line 113: `const matchesSelected = !showOnlySelected || activePermissionIds.has(permissionId(permission));`.
- Line 121: `const mutation = useMutation({`.
- Line 135: `const rolesError = rolesQuery.error?.response?.data?.message || rolesQuery.error?.message;`.
- Line 136: `const permissionsError = permissionsQuery.error?.response?.data?.message || permissionsQuery.error?.message;`.
- Line 193: `const id = roleId(role);`.
- Line 194: `const key = roleKey(role);`.
- Line 195: `const meta = ROLE_META[key] || ROLE_META.slate;`.
- Line 196: `const selectedRole = effectiveSelected === id;`.
- Line 291: `function PermissionEditor({ role, grouped, allPermissions, mutation }) {`.
- Line 292: `const [checked, setChecked] = useState(() => new Set((role?.permissions || []).map(permissionId).filter(Boolean)));`.
- Line 294: `const visibleIds = Object.values(grouped).flat().map(permissionId).filter(Boolean);`.
- Line 295: `const allIds = allPermissions.map(permissionId).filter(Boolean);`.
- Line 296: `const isSuperAdmin = ["super_admin", "superadmin"].includes(roleKey(role));`.
- Line 298: `const toggle = (id) => setChecked((previous) => {`.
- Line 299: `const next = new Set(previous);`.
- Line 304: `const setVisible = (value) => setChecked((previous) => {`.
- Line 305: `const next = new Set(previous);`.
- Line 310: `const save = () => {`.
- Line 352: `const moduleIds = items.map(permissionId).filter(Boolean);`.
- Line 353: `const selectedCount = moduleIds.filter((id) => checked.has(id)).length;`.
- Line 368: `const id = permissionId(permission);`.
- Line 369: `const assigned = checked.has(id);`.
- Line 404: `function Stat({ label, value, icon: Icon }) {`.
- Line 414: `function LoadingState() {`.
- Line 425: `function EmptyState({ title, description }) {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
