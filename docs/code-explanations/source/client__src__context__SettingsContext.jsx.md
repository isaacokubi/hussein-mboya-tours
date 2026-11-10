# Source explanation: client/src/context/SettingsContext.jsx

**Source:** [client/src/context/SettingsContext.jsx](../../../client/src/context/SettingsContext.jsx)

## Purpose

A React context/provider module for state shared across component branches.

## Imports and dependencies

- `createContext`, `useCallback`, `useContext`, `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `useAuth` from `./AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)

## Runtime declarations and data flow

### `getTenantId` — lines 15–15

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getSettingsStorageKey` — lines 16–16

Parameters: `tenantId (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalize` — lines 17–17

Parameters: `next (defaulted)`, `previous (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizePlatformSettings` — lines 18–18

Parameters: `next (defaulted)`, `previous (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeRole` — lines 19–19

Parameters: `user`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `isSuperAdminUser` — lines 20–20

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `applyTenantTheme` — lines 21–21

Parameters: `settings`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `applyDocumentMetadata` — lines 22–22

Parameters: `settings`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `SettingsProvider` — lines 24–95

Parameters: `{children}`.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. React hooks used: useCallback, useState, useEffect, useMemo. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `const { user } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const isPlatformScope = isSuperAdminUser(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const tenantId = getTenantId(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const settingsKey = isPlatformScope ? "platform-settings:global" : getSettingsStorageKey(tenantId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const readCachedSettings = useCallback(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 31:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 32:** `const cached = typeof window !== "undefined" ? localStorage.getItem(settingsKey) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (!cached) return isPlatformScope ? PLATFORM_SETTINGS : DEFAULT_SETTINGS;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `return isPlatformScope ? normalizePlatformSettings(JSON.parse(cached)) : normalize(JSON.parse(cached), DEFAULT_SETTINGS);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 36:** `return isPlatformScope ? PLATFORM_SETTINGS : DEFAULT_SETTINGS;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 40:** `const [settings, setSettings] = useState(() => readCachedSettings());` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 41:** `const [loading, setLoading] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 43:** `const applySettings = useCallback((nextSettings) => setSettings((previous) => isPlatformScope ? normalizePlatformSettings(nextSettings, previous) : normalize(nextSettings, previous)), [isPlatformScope]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 45:** `const refreshSettings = useCallback(async () => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 46:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 47:** `if (!isPlatformScope && !tenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `const fallback = readCachedSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `return fallback;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `load` — lines 70–70

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=true. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `handleStorage` — lines 72–72

Parameters: `event`.
Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `handleSettingsChanged` — lines 73–79

Parameters: `event`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 74:** `if (event.detail && typeof event.detail === "object") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `useSettings` — lines 97–97

Parameters: none.
React hooks used: useContext.

Key statements:
- **Line 97:** `function useSettings() { return useContext(SettingsContext); }` — Uses a React hook to manage component state, side effects, memoization, or server state.

## Module-level declarations

- Line 5: `export const PUBLIC_BRAND_NAME = "Kenya Tours";`.
- Line 6: `export const PLATFORM_BRAND_NAME = "Kenya Tours";`.
- Line 8: `const DEFAULT_SETTINGS = {`.
- Line 12: `const PLATFORM_SETTINGS = { ...DEFAULT_SETTINGS, companyName: PLATFORM_BRAND_NAME, seoTitle: PLATFORM_BRAND_NAME };`.
- Line 13: `const SettingsContext = createContext(null);`.
- Line 15: `const getTenantId = (user) => String(user?.tenantId?._id || user?.tenantId || (typeof window !== "undefined" ? window.localStorage.getItem("tenantId") : "") || "").trim();`.
- Line 16: `const getSettingsStorageKey = (tenantId = "") => tenantId ? \`tenant-settings:${tenantId}\` : "tenant-settings:public";`.
- Line 17: `const normalize = (next = {}, previous = DEFAULT_SETTINGS) => ({ ...DEFAULT_SETTINGS, ...previous, ...next, companyName: String(next.companyName ?? previous.companyName ?? "").trim`.
- Line 18: `const normalizePlatformSettings = (next = {}, previous = PLATFORM_SETTINGS) => ({ ...normalize(next, previous), companyName: PLATFORM_BRAND_NAME, seoTitle: PLATFORM_BRAND_NAME });`.
- Line 19: `function normalizeRole(user) { if (!user) return ""; if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\s-]/g, "_"); if (user.role?.name) return String(us`.
- Line 20: `const isSuperAdminUser = (user) => ["super_admin", "superadmin"].includes(normalizeRole(user));`.
- Line 21: `function applyTenantTheme(settings) { const root = document.documentElement; const css = { "--tenant-primary": settings.primaryColor, "--tenant-secondary": settings.secondaryColor,`.
- Line 22: `function applyDocumentMetadata(settings) { if (typeof document === "undefined") return; if (settings.seoTitle || settings.companyName) document.title = settings.seoTitle || setting`.
- Line 24: `export function SettingsProvider({ children }) {`.
- Line 25: `const { user } = useAuth();`.
- Line 26: `const isPlatformScope = isSuperAdminUser(user);`.
- Line 27: `const tenantId = getTenantId(user);`.
- Line 28: `const settingsKey = isPlatformScope ? "platform-settings:global" : getSettingsStorageKey(tenantId);`.
- Line 30: `const readCachedSettings = useCallback(() => {`.
- Line 32: `const cached = typeof window !== "undefined" ? localStorage.getItem(settingsKey) : null;`.
- Line 40: `const [settings, setSettings] = useState(() => readCachedSettings());`.
- Line 41: `const [loading, setLoading] = useState(false);`.
- Line 43: `const applySettings = useCallback((nextSettings) => setSettings((previous) => isPlatformScope ? normalizePlatformSettings(nextSettings, previous) : normalize(nextSettings, previous`.
- Line 45: `const refreshSettings = useCallback(async () => {`.
- Line 48: `const fallback = readCachedSettings();`.
- Line 52: `const endpoint = isPlatformScope ? "/superadmin/settings" : "/settings/public";`.
- Line 53: `const response = await api.get(endpoint, { params: { _t: Date.now() } });`.
- Line 54: `const data = response.data?.settings || response.data?.data || response.data || {};`.
- Line 55: `const normalized = isPlatformScope ? normalizePlatformSettings(data, PLATFORM_SETTINGS) : normalize(data, DEFAULT_SETTINGS);`.
- Line 69: `let mounted = true;`.
- Line 70: `const load = async () => { setLoading(true); try { await refreshSettings(); } finally { if (mounted) setLoading(false); } };`.
- Line 72: `const handleStorage = (event) => { if (event.key !== settingsKey || !event.newValue) return; try { applySettings(JSON.parse(event.newValue)); } catch (parseError) { console.warn("U`.
- Line 73: `const handleSettingsChanged = (event) => {`.
- Line 86: `const updateSettings = useCallback((nextSettings) => {`.
- Line 87: `const merged = isPlatformScope ? normalizePlatformSettings(nextSettings, settings) : normalize(nextSettings, settings);`.
- Line 92: `const companyName = String(settings.companyName || (isPlatformScope ? PLATFORM_BRAND_NAME : "")).trim();`.
- Line 93: `const value = useMemo(() => ({ settings: { ...settings, companyName }, companyName, supportEmail: settings.supportEmail || "", supportPhone: settings.supportPhone || "", loading, r`.
- Line 97: `export function useSettings() { return useContext(SettingsContext); }`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
