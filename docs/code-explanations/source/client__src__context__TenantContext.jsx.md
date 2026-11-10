# Source explanation: client/src/context/TenantContext.jsx

**Source:** [client/src/context/TenantContext.jsx](../../../client/src/context/TenantContext.jsx)

## Purpose

A React context/provider module for state shared across component branches.

## Imports and dependencies

- `React`, `createContext`, `useContext`, `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getTenantBranding` from `../api/tenantBrandingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tenantBrandingApi](../../../client/src/api/tenantBrandingApi.js)
- `useAuth` from `./AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `useSettings` from `./SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)

## Runtime declarations and data flow

### `normalizeRole` — lines 28–34

Parameters: `user`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `if (!user) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\s-]/g, "_");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `if (user.role?.name) return String(user.role.name).toLowerCase().replace(/[\s-]/g, "_");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `if (Array.isArray(user.roles) && user.roles[0]?.name) return String(user.roles[0].name).toLowerCase().replace(/[\s-]/g, "_");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `return "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isSuperAdminUser` — lines 36–36

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getTenantSlugFromHost` — lines 38–45

Parameters: none.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `if (typeof window === "undefined") return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const host = window.location.hostname.toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const platformHost = String(import.meta.env.VITE_PLATFORM_HOST || "globaltours.com").toLowerCase();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 42:** `const suffix = \`.${platformHost}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `if (host.endsWith(suffix)) return host.slice(0, -suffix.length).split(".").filter(Boolean).pop() || "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `return "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `applyTenantIdentity` — lines 47–66

Parameters: `tenant`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `if (typeof document === "undefined") return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (tenant.favicon) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `let favicon = document.querySelector('link[rel="icon"]');` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `if (!favicon) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `const root = document.documentElement;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const colors = tenant.brandColors || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `if (colors.primary) root.style.setProperty("--tenant-primary", colors.primary);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `if (colors.secondary) root.style.setProperty("--tenant-secondary", colors.secondary);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `if (colors.accent) root.style.setProperty("--tenant-accent", colors.accent);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `TenantProvider` — lines 68–150

Parameters: `{children}`.
React hooks used: useState, useEffect. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 69:** `const { user } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const { settings = {}, isPlatformScope } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `const [tenant, setTenant] = useState(DEFAULT_TENANT);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 73:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 74:** `let mounted = true;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const loadTenant = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `if (isSuperAdminUser(user)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `if (!mounted) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 84:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 85:** `const res = await getTenantBranding();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 86:** `if (!mounted) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `const branding = res?.branding || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `const name = branding.name || branding.companyName || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const legalName = branding.legalName || name;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `const hostSlug = getTenantSlugFromHost();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const nextTenant = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `if (mounted) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `loadTenant` — lines 76–109

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 77:** `if (isSuperAdminUser(user)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `if (!mounted) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 84:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 85:** `const res = await getTenantBranding();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 86:** `if (!mounted) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `const branding = res?.branding || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `const name = branding.name || branding.companyName || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const legalName = branding.legalName || name;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `const hostSlug = getTenantSlugFromHost();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const nextTenant = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `if (mounted) {` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `useTenant` — lines 152–154

Parameters: none.
React hooks used: useContext.

Key statements:
- **Line 153:** `return useContext(TenantContext);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `export const PLATFORM_BRAND_NAME = "Kenya Tours";`.
- Line 8: `const DEFAULT_TENANT = {`.
- Line 19: `const PLATFORM_TENANT = {`.
- Line 26: `const TenantContext = createContext();`.
- Line 28: `const normalizeRole = (user) => {`.
- Line 36: `const isSuperAdminUser = (user) => ["super_admin", "superadmin"].includes(normalizeRole(user));`.
- Line 38: `const getTenantSlugFromHost = () => {`.
- Line 40: `const host = window.location.hostname.toLowerCase();`.
- Line 41: `const platformHost = String(import.meta.env.VITE_PLATFORM_HOST || "globaltours.com").toLowerCase();`.
- Line 42: `const suffix = \`.${platformHost}\`;`.
- Line 47: `const applyTenantIdentity = (tenant) => {`.
- Line 52: `let favicon = document.querySelector('link[rel="icon"]');`.
- Line 61: `const root = document.documentElement;`.
- Line 62: `const colors = tenant.brandColors || {};`.
- Line 68: `export function TenantProvider({ children }) {`.
- Line 69: `const { user } = useAuth();`.
- Line 70: `const { settings = {}, isPlatformScope } = useSettings() || {};`.
- Line 71: `const [tenant, setTenant] = useState(DEFAULT_TENANT);`.
- Line 74: `let mounted = true;`.
- Line 76: `const loadTenant = async () => {`.
- Line 85: `const res = await getTenantBranding();`.
- Line 88: `const branding = res?.branding || {};`.
- Line 89: `const name = branding.name || branding.companyName || "";`.
- Line 90: `const legalName = branding.legalName || name;`.
- Line 91: `const hostSlug = getTenantSlugFromHost();`.
- Line 92: `const nextTenant = {`.
- Line 123: `const next = {`.
- Line 152: `export function useTenant() {`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
