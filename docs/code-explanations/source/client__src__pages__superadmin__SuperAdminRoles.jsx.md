# Source explanation: client/src/pages/superadmin/SuperAdminRoles.jsx

**Source:** [client/src/pages/superadmin/SuperAdminRoles.jsx](../../../client/src/pages/superadmin/SuperAdminRoles.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `getUserRole` from `../../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)
- `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSuperAdminRoles`, `getSuperAdminRole`, `getSuperAdminPermissions`, `updateSuperAdminRolePermissions` from `../../api/superadmin/superAdminRoleApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/superadmin/superAdminRoleApi](../../../client/src/api/superadmin/superAdminRoleApi.js)
- `CheckCircle2`, `ChevronRight`, `KeyRound`, `LockKeyhole`, `RefreshCw`, `Search`, `ShieldCheck`, `Users` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `normalizeRoleName` — lines 22–22

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `permissionId` — lines 23–23

Parameters: `permission`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `rolePresentation` — lines 25–40

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 26:** `const key = String(role?.name || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const map = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `return map[key] || { label: role?.displayName || role?.name || "Unnamed role", tone: "slate", description: role?.description || "Custom platform access role." };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `SuperAdminRoles` — lines 54–154

Parameters: none.
React hooks used: useState, useQuery, useMemo, useMutation. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 55:** `const { user, hasPermission } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `const [selectedRole, setSelectedRole] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 58:** `const [selectedPermissions, setSelectedPermissions] = useState([]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 59:** `const [loadError, setLoadError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 60:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 62:** `const isSuperAdmin = normalizeRoleName({ name: getUserRole(user) }) === "superadmin";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const canManageRoles = isSuperAdmin || hasPermission("roles.manage");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const { data: roles = [], isLoading: rolesLoading, isError: rolesError, refetch: refetchRoles } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 68:** `const { data: permissions = [], isLoading: permissionsLoading, isError: permissionsError } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 72:** `const filteredRoles = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 73:** `const term = search.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `if (!term) return roles;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `return roles.filter((role) => \`${role.name} ${role.displayName || ""} ${rolePresentation(role).label}\`.toLowerCase().includes(term));` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 78:** `const updateRole = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 81:** `await queryClient.invalidateQueries({ queryKey: ["superadmin-rbac-roles"] });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 82:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 83:** `const refreshed = await getSuperAdminRole(selectedRole._id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `openRole` — lines 96–103

Parameters: `role`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 98:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 99:** `const fullRole = await getSuperAdminRole(role._id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `togglePermission` — lines 106–110

Parameters: `id`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 107:** `if (selectedIsSuperAdmin) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 108:** `const normalizedId = String(id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 22: `const normalizeRoleName = (role) => String(role?.name || "").trim().toLowerCase().replace(/[\s_-]+/g, "");`.
- Line 23: `const permissionId = (permission) => typeof permission === "object" ? String(permission?._id || "") : String(permission || "");`.
- Line 25: `const rolePresentation = (role) => {`.
- Line 26: `const key = String(role?.name || "").trim().toLowerCase();`.
- Line 27: `const map = {`.
- Line 42: `const toneClasses = {`.
- Line 55: `const { user, hasPermission } = useAuth();`.
- Line 56: `const queryClient = useQueryClient();`.
- Line 57: `const [selectedRole, setSelectedRole] = useState(null);`.
- Line 58: `const [selectedPermissions, setSelectedPermissions] = useState([]);`.
- Line 59: `const [loadError, setLoadError] = useState("");`.
- Line 60: `const [search, setSearch] = useState("");`.
- Line 62: `const isSuperAdmin = normalizeRoleName({ name: getUserRole(user) }) === "superadmin";`.
- Line 63: `const canManageRoles = isSuperAdmin || hasPermission("roles.manage");`.
- Line 65: `const { data: roles = [], isLoading: rolesLoading, isError: rolesError, refetch: refetchRoles } = useQuery({`.
- Line 68: `const { data: permissions = [], isLoading: permissionsLoading, isError: permissionsError } = useQuery({`.
- Line 72: `const filteredRoles = useMemo(() => {`.
- Line 73: `const term = search.trim().toLowerCase();`.
- Line 78: `const updateRole = useMutation({`.
- Line 83: `const refreshed = await getSuperAdminRole(selectedRole._id);`.
- Line 96: `const openRole = async (role) => {`.
- Line 99: `const fullRole = await getSuperAdminRole(role._id);`.
- Line 105: `const selectedIsSuperAdmin = normalizeRoleName(selectedRole) === "superadmin";`.
- Line 106: `const togglePermission = (id) => {`.
- Line 108: `const normalizedId = String(id);`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
