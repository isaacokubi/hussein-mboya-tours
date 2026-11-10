# Source explanation: client/src/context/AuthContext.jsx

**Source:** [client/src/context/AuthContext.jsx](../../../client/src/context/AuthContext.jsx)

## Purpose

A React context/provider module for state shared across component branches.

## Imports and dependencies

- `createContext`, `useContext`, `useEffect`, `useMemo`, `useRef`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api`, `advanceAuthenticationGeneration` from `../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `queryClient` from `../lib/queryClient`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/lib/queryClient](../../../client/src/lib/queryClient.js)
- `getUserRole`, `normalizeRole` from `../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)

## Runtime declarations and data flow

### `useAuth` — lines 7–7

Parameters: none.
React hooks used: useContext.

Key statements:
- **Line 7:** `() => useContext(AuthContext)` — Uses a React hook to manage component state, side effects, memoization, or server state.

### `normalizePermissions` — lines 19–33

Parameters: `permissions`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `if (!Array.isArray(permissions)) return [];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const seen = new Set();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `return permissions.map((permission) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 23:** `if (typeof permission === "string") return { name: permission.trim() };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (!permission?.name) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `return { ...permission, name: String(permission.name).trim() };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 27:** `if (!permission?.name) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const key = permission.name.toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (seen.has(key)) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `extractRolePermissions` — lines 35–39

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 36:** `const roleIdPermissions = user?.roleId && typeof user.roleId === "object" ? user.roleId.permissions || [] : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const roleObjectPermissions = user?.role && typeof user.role === "object" ? user.role.permissions || [] : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `return [...roleIdPermissions, ...roleObjectPermissions];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeUser` — lines 41–53

Parameters: `user`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 42:** `if (!user) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `const role = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const rolePermissions = extractRolePermissions(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const overridePermissions = user.permissionsOverride || user.permissionOverrides || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const directPermissions = user.permissions || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const fallbackPermissions = ["admin", "super_admin"].includes(role) ? ADMIN_BASE_PERMISSIONS : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `readStoredUser` — lines 55–64

Parameters: none.
Error control: try=true, catch=false, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 56:** `if (typeof window === "undefined") return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 58:** `const raw = localStorage.getItem("user");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `return raw ? normalizeUser(JSON.parse(raw)) : null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 62:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `preloadTenantSettings` — lines 66–88

Parameters: none.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 67:** `if (typeof window === "undefined") return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 69:** `const storedUser = JSON.parse(localStorage.getItem("user") || "null");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const role = String(storedUser?.role?.name || storedUser?.role || storedUser?.legacyRole || "")` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `if (["super_admin", "superadmin"].includes(role)) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 77:** `const response = await api.get("/settings/public", { params: { _t: Date.now() } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `const settings = response.data?.settings || response.data?.data || response.data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `const tenantId = String(localStorage.getItem("tenantId") || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `const storageKey = tenantId ? \`tenant-settings:${tenantId}\` : "tenant-settings:public";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `return settings;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 86:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `AuthProvider` — lines 90–252

Parameters: `{children}`.
HTTP operations detected: api.post, api.get; response/error handling occurs in this function and its caller. React hooks used: useState, useEffect, useMemo. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 20 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 91:** `const [user, setUser] = useState(() => readStoredUser());` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 92:** Sensitive-configuration/data operation; inspect source without copying secret values. — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 93:** `const [loading, setLoading] = useState(true);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 95:** `const authOperation = useRef(0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `const persistUser = (nextUser) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 98:** `const normalized = normalizeUser(nextUser);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `if (normalized) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 103:** `const tenantId = normalized.tenantId?._id || normalized.tenantId || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `if (tenantId) localStorage.setItem("tenantId", String(tenantId));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `else localStorage.removeItem("tenantId");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `if (normalized.tenantSlug) localStorage.setItem("tenantSlug", String(normalized.tenantSlug));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 107:** `else localStorage.removeItem("tenantSlug");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `return normalized;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 112:** `const clearAuthStorage = () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 116:** `const logout = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 119:** `try { await api.post("/auth/logout"); } catch (error) { console.warn("AUTH LOGOUT REQUEST FAILED", error?.message || error); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 127:** `const fetchCurrentUser = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `const { data } = await api.get("/auth/me");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `persistUser` — lines 97–110

Parameters: `nextUser`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 98:** `const normalized = normalizeUser(nextUser);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `if (normalized) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 103:** `const tenantId = normalized.tenantId?._id || normalized.tenantId || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `if (tenantId) localStorage.setItem("tenantId", String(tenantId));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `else localStorage.removeItem("tenantId");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `if (normalized.tenantSlug) localStorage.setItem("tenantSlug", String(normalized.tenantSlug));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 107:** `else localStorage.removeItem("tenantSlug");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `return normalized;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `clearAuthStorage` — lines 112–114

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `logout` — lines 116–125

Parameters: none.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 119:** `try { await api.post("/auth/logout"); } catch (error) { console.warn("AUTH LOGOUT REQUEST FAILED", error?.message || error); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `fetchCurrentUser` — lines 127–132

Parameters: none.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 128:** `const { data } = await api.get("/auth/me");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 129:** `const currentUser = persistUser(data.user || data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 130:** `await preloadTenantSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 131:** `return currentUser;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `onInvalidSession` — lines 135–146

Parameters: `event`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 136:** `const message = event?.detail?.message || "Your authentication session is no longer valid. Please log in again.";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 143:** `if (window.location.pathname !== "/login") {` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `login` — lines 179–216

Parameters: `email`, `password`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=true. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 194:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 195:** `const { data } = await api.post("/auth/login", {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 199:** `if (data?.mfaRequired) return data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 200:** `if (!data?.user) throw new Error("Authentication response did not contain a user.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 201:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 205:** `const normalizedUser = persistUser(data.user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 206:** `if (!normalizedUser) throw new Error("Authentication response did not contain a user.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 211:** `await preloadTenantSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 212:** `return { ...data, user: normalizedUser };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `register` — lines 218–227

Parameters: `userData`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 219:** `const { data } = await api.post("/auth/register", userData);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 220:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 224:** `await preloadTenantSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 226:** `return data;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `hasPermission` — lines 230–237

Parameters: `permission`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 231:** `if (!user || !permission) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 232:** `const role = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 233:** `const wanted = String(permission).trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 234:** `if (role === "super_admin") return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 235:** `if (role === "admin" && ADMIN_BASE_PERMISSIONS.includes(wanted)) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 236:** `return permissions.some((p) => String(p?.name || "").trim().toLowerCase() === wanted && p?.enabled !== false);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `hasAnyPermission` — lines 238–238

Parameters: `items (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `hasAllPermissions` — lines 239–239

Parameters: `items (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `hasRole` — lines 240–240

Parameters: `roleName`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getMenuPermissions` — lines 242–242

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `export const AuthContext = createContext();`.
- Line 7: `export const useAuth = () => useContext(AuthContext);`.
- Line 9: `const ADMIN_BASE_PERMISSIONS = [`.
- Line 16: `<sensitive declaration redacted>`.
- Line 17: `const TENANT_SESSION_KEYS = ["tenantId", "tenantSlug", "tenantKey"];`.
- Line 19: `const normalizePermissions = (permissions) => {`.
- Line 21: `const seen = new Set();`.
- Line 28: `const key = permission.name.toLowerCase();`.
- Line 35: `const extractRolePermissions = (user) => {`.
- Line 36: `const roleIdPermissions = user?.roleId && typeof user.roleId === "object" ? user.roleId.permissions || [] : [];`.
- Line 37: `const roleObjectPermissions = user?.role && typeof user.role === "object" ? user.role.permissions || [] : [];`.
- Line 41: `const normalizeUser = (user) => {`.
- Line 43: `const role = getUserRole(user);`.
- Line 44: `const rolePermissions = extractRolePermissions(user);`.
- Line 45: `const overridePermissions = user.permissionsOverride || user.permissionOverrides || [];`.
- Line 46: `const directPermissions = user.permissions || [];`.
- Line 47: `const fallbackPermissions = ["admin", "super_admin"].includes(role) ? ADMIN_BASE_PERMISSIONS : [];`.
- Line 55: `const readStoredUser = () => {`.
- Line 58: `const raw = localStorage.getItem("user");`.
- Line 66: `const preloadTenantSettings = async () => {`.
- Line 69: `const storedUser = JSON.parse(localStorage.getItem("user") || "null");`.
- Line 70: `const role = String(storedUser?.role?.name || storedUser?.role || storedUser?.legacyRole || "")`.
- Line 77: `const response = await api.get("/settings/public", { params: { _t: Date.now() } });`.
- Line 78: `const settings = response.data?.settings || response.data?.data || response.data || {};`.
- Line 79: `const tenantId = String(localStorage.getItem("tenantId") || "").trim();`.
- Line 80: `const storageKey = tenantId ? \`tenant-settings:${tenantId}\` : "tenant-settings:public";`.
- Line 90: `export function AuthProvider({ children }) {`.
- Line 91: `const [user, setUser] = useState(() => readStoredUser());`.
- Line 92: `<sensitive declaration redacted>`.
- Line 93: `const [loading, setLoading] = useState(true);`.
- Line 95: `const authOperation = useRef(0);`.
- Line 97: `const persistUser = (nextUser) => {`.
- Line 98: `const normalized = normalizeUser(nextUser);`.
- Line 103: `const tenantId = normalized.tenantId?._id || normalized.tenantId || "";`.
- Line 112: `const clearAuthStorage = () => {`.
- Line 116: `const logout = async () => {`.
- Line 127: `const fetchCurrentUser = async () => {`.
- Line 128: `const { data } = await api.get("/auth/me");`.
- Line 129: `const currentUser = persistUser(data.user || data);`.
- Line 135: `const onInvalidSession = (event) => {`.
- Line 136: `const message = event?.detail?.message || "Your authentication session is no longer valid. Please log in again.";`.
- Line 153: `const savedUser = readStoredUser();`.
- Line 155: `const operation = authOperation.current;`.
- Line 162: `const currentUser = persistUser(data.user || data);`.
- Line 168: `const status = error?.response?.status;`.
- Line 179: `<sensitive declaration redacted>`.
- Line 195: `const { data } = await api.post("/auth/login", {`.
- Line 205: `const normalizedUser = persistUser(data.user);`.
- Line 218: `const register = async (userData) => {`.
- Line 219: `const { data } = await api.post("/auth/register", userData);`.
- Line 229: `const permissions = user?.permissions || [];`.
- Line 230: `const hasPermission = (permission) => {`.
- Line 232: `const role = getUserRole(user);`.
- Line 233: `const wanted = String(permission).trim().toLowerCase();`.
- Line 238: `const hasAnyPermission = (items = []) => items.some(hasPermission);`.
- Line 239: `const hasAllPermissions = (items = []) => items.every(hasPermission);`.
- Line 240: `const hasRole = (roleName) => getUserRole(user) === normalizeRole(roleName);`.
- Line 241: `const canAccess = hasPermission;`.
- Line 242: `const getMenuPermissions = () => permissions;`.
- Line 244: `const value = useMemo(() => ({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
