# Source explanation: client/src/pages/admin/AdminSettings.jsx

**Source:** [client/src/pages/admin/AdminSettings.jsx](../../../client/src/pages/admin/AdminSettings.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Building2`, `Globe2`, `Palette`, `Phone`, `Save`, `ShieldCheck`, `WalletCards`, `LayoutDashboard`, `Bell`, `Search`, `Users`, `CreditCard`, `UserCircle`, `Lock`, `PlugZap`, `Copy`, `Trash2` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSettings`, `updateSettings` from `../../api/settingsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/settingsApi](../../../client/src/api/settingsApi.js)
- `TenantHeroManager` from `../../components/admin/TenantHeroManager`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/TenantHeroManager](../../../client/src/components/admin/TenantHeroManager.jsx)
- `listWebsiteIntegrations`, `createWebsiteIntegration`, `revokeWebsiteIntegration` from `../../api/integrationApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/integrationApi](../../../client/src/api/integrationApi.js)

## Runtime declarations and data flow

### `AdminSettings` — lines 14–126

Parameters: none.
React hooks used: useState, useQuery, useEffect, useMutation. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const { settings: globalSettings = {}, updateSettings: updatePublicSettings } = useSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const [settings, setSettings] = useState(DEFAULTS);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [tenantProfile, setTenantProfile] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [logoFile, setLogoFile] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin-settings"], queryFn: getSettings });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const incoming = data?.data || data?.settings;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const profile = data?.tenantProfile || incoming?.tenantProfile;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (profile) setTenantProfile(profile);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (incoming) setSettings(s => ({ ...s, ...incoming, homepageSections: { ...SECTIONS, ...(incoming.homepageSections || {}) } }));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `if (globalSettings && Object.keys(globalSettings).length) setSettings(s => ({ ...s, ...globalSettings, homepageSections: { ...SECTIONS, ...(globalSettings.homepageSections || {}) } }));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `const [integrationName, setIntegrationName] = useState("Existing Website");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 33:** `const [integrationOrigins, setIntegrationOrigins] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 34:** Sensitive-configuration/data operation; inspect source without copying secret values. — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 35:** `const integrationsQuery = useQuery({ queryKey: ["website-integrations"], queryFn: listWebsiteIntegrations });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 36:** `const integrationCreate = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `createConnector` — lines 50–50

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `copyText` — lines 51–51

Parameters: `text`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false.

Key statements:

### `update` — lines 70–70

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `section` — lines 71–71

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `save` — lines 72–72

Parameters: `e`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Section` — lines 127–127

Parameters: `{icon, title, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 128–128

Parameters: `{label, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ReadOnlyField` — lines 129–129

Parameters: `{label, value, hint}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `InfoCard` — lines 130–130

Parameters: `{icon, title, value, text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Toggle` — lines 131–131

Parameters: `{label, value, onChange}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 10: `const SECTIONS = { stats: true, tours: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true };`.
- Line 11: `const THEME = { primaryColor: "#047857", secondaryColor: "#064e3b", accentColor: "#10b981", backgroundColor: "#f8fafc", surfaceColor: "#ffffff", textColor: "#0f172a", fontFamily: "`.
- Line 12: `const DEFAULTS = { companyName: "", websiteUrl: "", companyLogo: "", address: "", city: "Nairobi", country: "Kenya", supportPhone: "", supportEmail: "", currency: "KES", currencySy`.
- Line 15: `const qc = useQueryClient();`.
- Line 16: `const { settings: globalSettings = {}, updateSettings: updatePublicSettings } = useSettings();`.
- Line 17: `const [settings, setSettings] = useState(DEFAULTS);`.
- Line 18: `const [tenantProfile, setTenantProfile] = useState(null);`.
- Line 19: `const [logoFile, setLogoFile] = useState(null);`.
- Line 20: `const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin-settings"], queryFn: getSettings });`.
- Line 23: `const incoming = data?.data || data?.settings;`.
- Line 24: `const profile = data?.tenantProfile || incoming?.tenantProfile;`.
- Line 32: `const [integrationName, setIntegrationName] = useState("Existing Website");`.
- Line 33: `const [integrationOrigins, setIntegrationOrigins] = useState("");`.
- Line 34: `<sensitive declaration redacted>`.
- Line 35: `const integrationsQuery = useQuery({ queryKey: ["website-integrations"], queryFn: listWebsiteIntegrations });`.
- Line 36: `const integrationCreate = useMutation({`.
- Line 45: `const integrationRevoke = useMutation({`.
- Line 50: `const createConnector = () => integrationCreate.mutate({ name: integrationName, environment: "live", allowedOrigins: integrationOrigins.split(/\s*,\s*|\n/).map(v => v.trim()).filte`.
- Line 51: `const copyText = async (text) => { try { await navigator.clipboard.writeText(text); toast.success("Copied to clipboard."); } catch { toast.error("Copy failed. Copy it manually."); `.
- Line 53: `const mutation = useMutation({`.
- Line 56: `const saved = r?.data || r?.settings;`.
- Line 70: `const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));`.
- Line 71: `const section = (key, value) => setSettings(s => ({ ...s, homepageSections: { ...(s.homepageSections || {}), [key]: value } }));`.
- Line 72: `const save = e => { e.preventDefault(); mutation.mutate({ ...settings, logoFile }); };`.
- Line 77: `const planLabel = { starter: "Starter", professional: "Professional", business: "Business", enterprise: "Enterprise" }[tenantProfile?.subscriptionPlan] || tenantProfile?.subscripti`.
- Line 127: `function Section({icon,title,children}) { return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7"><div className="mb-5 flex items-center gap-3">`.
- Line 128: `function Field({label,children}) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>; }`.
- Line 129: `function ReadOnlyField({label,value,hint}) { return <div><span className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700"><Lock size={13}/>{label}</span><div cla`.
- Line 130: `function InfoCard({icon,title,value,text}) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-bold t`.
- Line 131: `function Toggle({label,value,onChange}) { return <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4"><span className="font-medium capitalize">`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
