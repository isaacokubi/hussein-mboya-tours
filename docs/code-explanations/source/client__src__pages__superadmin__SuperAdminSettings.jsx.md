# Source explanation: client/src/pages/superadmin/SuperAdminSettings.jsx

**Source:** [client/src/pages/superadmin/SuperAdminSettings.jsx](../../../client/src/pages/superadmin/SuperAdminSettings.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `React`, `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Save`, `RefreshCw`, `Shield`, `Database`, `Bell`, `CreditCard`, `Building2`, `Settings`, `CheckCircle`, `AlertTriangle`, `Percent`, `Smartphone`, `LockKeyhole`, `Server`, `Palette`, `CircleDollarSign` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `getSettings`, `updateSettings` from `../../api/superAdminApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/superAdminApi](../../../client/src/api/superAdminApi.js)
- `getPlatformBillingConfig`, `updatePlatformBillingConfig` from `../../api/platformBillingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/platformBillingApi](../../../client/src/api/platformBillingApi.js)
- `SuperAdminPlanFeatures` from `./SuperAdminPlanFeatures`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/pages/superadmin/SuperAdminPlanFeatures](../../../client/src/pages/superadmin/SuperAdminPlanFeatures.jsx)
- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)

## Runtime declarations and data flow

### `Card` — lines 10–10

Parameters: `{icon, title, description, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Toggle` — lines 11–11

Parameters: `{checked, onChange, label}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `RateInput` — lines 12–12

Parameters: `{label, description, value, onChange}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `PriceInput` — lines 13–13

Parameters: `{label, value, onChange}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 14–14

Parameters: `{label, value, onChange, placeholder}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SuperAdminSettings` — lines 16–114

Parameters: none.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. React hooks used: useState, useEffect. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 14 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `const [settings, setSettings] = useState({});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [billing, setBilling] = useState({ prices: {}, mpesa: {} });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [loading, setLoading] = useState(true);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const [settingsError, setSettingsError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const [billingError, setBillingError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const [saving, setSaving] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [savingBilling, setSavingBilling] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const { updateSettings: updateGlobalSettings } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const load = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const [settingsResult, billingResult] = await Promise.allSettled([getSettings(), getPlatformBillingConfig()]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `if (settingsResult.status === "fulfilled") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const response = settingsResult.value;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const nextSettings = response?.settings || response?.data || response || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (billingResult.status === "fulfilled") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `const response = billingResult.value;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `useEffect(() => { void load(); }, []);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 54:** `const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const updatePrice = (key, value) => setBilling((prev) => ({ ...prev, prices: { ...prev.prices, [key]: value } }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `load` — lines 26–51

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `const [settingsResult, billingResult] = await Promise.allSettled([getSettings(), getPlatformBillingConfig()]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `if (settingsResult.status === "fulfilled") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const response = settingsResult.value;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const nextSettings = response?.settings || response?.data || response || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (billingResult.status === "fulfilled") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `const response = billingResult.value;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `update` — lines 54–54

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `updatePrice` — lines 55–55

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `save` — lines 57–68

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 58:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 60:** `const payload = { ...settings, companyName: String(settings.companyName || "Global Tours").trim(), taxRate: Number(settings.taxRate ?? 0), taxServiceType: settings.taxServiceType || "service_fee", bookingDepositPercentag` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const response = await updateSettings(payload);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `const savedSettings = response?.settings || response?.data?.settings || response?.data || payload;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `saveBilling` — lines 70–79

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 71:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 73:** `const payload = Object.fromEntries(["starter", "professional", "business", "enterprise"].map((key) => [key, Number(billing.prices?.[key] || 0)]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `const response = await updatePlatformBillingConfig(payload);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `runMaintenance` — lines 81–88

Parameters: `action`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 82:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 83:** `if (!window.confirm(action === "backup" ? "Create database backup now?" : "Clear system cache now?")) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `const endpoint = action === "backup" ? "/superadmin/maintenance/backup" : "/superadmin/maintenance/cache";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const response = await api.post(endpoint); if (!response.data?.success) throw new Error(response.data?.message || "Maintenance action failed");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 10: `const Card = ({ icon: Icon, title, description, children }) => <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-`.
- Line 11: `const Toggle = ({ checked, onChange, label }) => <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 trans`.
- Line 12: `const RateInput = ({ label, description, value, onChange }) => <div className="space-y-2"><label className="block text-sm font-bold text-slate-800">{label}</label><div className="r`.
- Line 13: `const PriceInput = ({ label, value, onChange }) => <label className="block text-sm font-bold text-slate-800">{label}<div className="mt-2 flex overflow-hidden rounded-xl border bord`.
- Line 14: `const Field = ({ label, value, onChange, placeholder }) => <label className="block text-sm font-bold text-slate-800">{label}<input className="mt-2 w-full rounded-xl border border-s`.
- Line 17: `const [settings, setSettings] = useState({});`.
- Line 18: `const [billing, setBilling] = useState({ prices: {}, mpesa: {} });`.
- Line 19: `const [loading, setLoading] = useState(true);`.
- Line 20: `const [settingsError, setSettingsError] = useState("");`.
- Line 21: `const [billingError, setBillingError] = useState("");`.
- Line 22: `const [saving, setSaving] = useState(false);`.
- Line 23: `const [savingBilling, setSavingBilling] = useState(false);`.
- Line 24: `const { updateSettings: updateGlobalSettings } = useSettings() || {};`.
- Line 26: `const load = async () => {`.
- Line 30: `const [settingsResult, billingResult] = await Promise.allSettled([getSettings(), getPlatformBillingConfig()]);`.
- Line 33: `const response = settingsResult.value;`.
- Line 34: `const nextSettings = response?.settings || response?.data || response || {};`.
- Line 43: `const response = billingResult.value;`.
- Line 54: `const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));`.
- Line 55: `const updatePrice = (key, value) => setBilling((prev) => ({ ...prev, prices: { ...prev.prices, [key]: value } }));`.
- Line 57: `const save = async () => {`.
- Line 60: `const payload = { ...settings, companyName: String(settings.companyName || "Global Tours").trim(), taxRate: Number(settings.taxRate ?? 0), taxServiceType: settings.taxServiceType |`.
- Line 61: `const response = await updateSettings(payload);`.
- Line 62: `const savedSettings = response?.settings || response?.data?.settings || response?.data || payload;`.
- Line 70: `const saveBilling = async () => {`.
- Line 73: `const payload = Object.fromEntries(["starter", "professional", "business", "enterprise"].map((key) => [key, Number(billing.prices?.[key] || 0)]));`.
- Line 74: `const response = await updatePlatformBillingConfig(payload);`.
- Line 81: `const runMaintenance = async (action) => {`.
- Line 84: `const endpoint = action === "backup" ? "/superadmin/maintenance/backup" : "/superadmin/maintenance/cache";`.
- Line 85: `const response = await api.post(endpoint); if (!response.data?.success) throw new Error(response.data?.message || "Maintenance action failed");`.
- Line 92: `const mpesaReady = Boolean(billing.mpesa?.configured && billing.mpesa?.callbackConfigured && billing.mpesa?.shortcodeConfigured);`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
