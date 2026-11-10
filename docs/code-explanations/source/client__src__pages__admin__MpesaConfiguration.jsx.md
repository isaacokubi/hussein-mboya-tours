# Source explanation: client/src/pages/admin/MpesaConfiguration.jsx

**Source:** [client/src/pages/admin/MpesaConfiguration.jsx](../../../client/src/pages/admin/MpesaConfiguration.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CreditCard`, `Banknote`, `Building2`, `Smartphone`, `Wifi` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `PaymentGatewayCenter` from `../../components/admin/PaymentGatewayCenter`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/PaymentGatewayCenter](../../../client/src/components/admin/PaymentGatewayCenter.jsx)
- `getSettings`, `updateSettings` from `../../api/settingsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/settingsApi](../../../client/src/api/settingsApi.js)
- `api` from `../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)

## Runtime declarations and data flow

### `MpesaConfiguration` — lines 15–46

Parameters: none.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. React hooks used: useState, useQuery, useEffect, useMutation. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const [tab, setTab] = useState("MPESA");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [settings, setSettings] = useState(defaults);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [stripeCheck, setStripeCheck] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const query = useQuery({ queryKey: ["payment-center-settings"], queryFn: getSettings });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `useEffect(() => { const saved = query.data?.data || query.data?.settings; if (saved) setSettings((s) => ({ ...s, ...saved })); }, [query.data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const save = useMutation({ mutationFn: updateSettings, onSuccess: async (r) => { const saved = r?.data || r?.settings || {}; setSettings((s) => ({ ...s, ...saved })); await qc.invalidateQueries({ queryKey: ["payment-cent` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `const validateStripe = useMutation({ mutationFn: async () => (await api.post("/admin/payment-gateways/STRIPE/validate")).data, onSuccess: (r) => setStripeCheck(r?.data), onError: () => setStripeCheck({ status: "unverifie` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const submit = (e) => { e.preventDefault(); const fields = tab === "BANK" ? ["enableBankTransfer", "bankName", "bankAccountName", "bankAccountNumber", "bankBranch", "bankSwiftCode", "bankInstructions", "bankReferenceInst` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const ready = (key) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `if (!settings[key]) return "Disabled";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const complete = key === "enableBankTransfer"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `return complete ? "Configured · manual confirmation required" : "Validation required · checkout unavailable";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 34:** `return <div className="mx-auto max-w-7xl space-y-5">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `update` — lines 24–24

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submit` — lines 25–25

Parameters: `e`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ready` — lines 26–32

Parameters: `key`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 27:** `if (!settings[key]) return "Disabled";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const complete = key === "enableBankTransfer"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `return complete ? "Configured · manual confirmation required" : "Validation required · checkout unavailable";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `PanelHeader` — lines 48–48

Parameters: `{title, status, detail}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Toggle` — lines 49–49

Parameters: `{checked, onChange, label}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SaveButton` — lines 50–50

Parameters: `{busy, disabled}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 9: `const tabs = [`.
- Line 13: `const defaults = { enableBankTransfer: false, bankName: "", bankAccountName: "", bankAccountNumber: "", bankBranch: "", bankSwiftCode: "", bankInstructions: "", bankReferenceInstru`.
- Line 16: `const qc = useQueryClient();`.
- Line 17: `const [tab, setTab] = useState("MPESA");`.
- Line 18: `const [settings, setSettings] = useState(defaults);`.
- Line 19: `const [stripeCheck, setStripeCheck] = useState(null);`.
- Line 20: `const query = useQuery({ queryKey: ["payment-center-settings"], queryFn: getSettings });`.
- Line 22: `const save = useMutation({ mutationFn: updateSettings, onSuccess: async (r) => { const saved = r?.data || r?.settings || {}; setSettings((s) => ({ ...s, ...saved })); await qc.inva`.
- Line 23: `const validateStripe = useMutation({ mutationFn: async () => (await api.post("/admin/payment-gateways/STRIPE/validate")).data, onSuccess: (r) => setStripeCheck(r?.data), onError: (`.
- Line 24: `const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));`.
- Line 25: `const submit = (e) => { e.preventDefault(); const fields = tab === "BANK" ? ["enableBankTransfer", "bankName", "bankAccountName", "bankAccountNumber", "bankBranch", "bankSwiftCode"`.
- Line 26: `const ready = (key) => {`.
- Line 28: `const complete = key === "enableBankTransfer"`.
- Line 48: `function PanelHeader({ title, status, detail }) { return <div className="mb-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold t`.
- Line 49: `function Toggle({ checked, onChange, label }) { return <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"><span classN`.
- Line 50: `function SaveButton({ busy, disabled = false }) { return <button type="submit" disabled={busy || disabled} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white d`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
