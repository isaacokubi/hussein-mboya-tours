# Source explanation: client/src/components/admin/PaymentGatewayCenter.jsx

**Source:** [client/src/components/admin/PaymentGatewayCenter.jsx](../../../client/src/components/admin/PaymentGatewayCenter.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useEffect`, `useMemo`, `useRef`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CheckCircle2`, `CreditCard`, `EyeOff`, `KeyRound`, `Save`, `ShieldCheck`, `Smartphone`, `Trash2`, `XCircle`, `Wifi` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `disablePaymentGateway`, `getPaymentGateway`, `listPaymentGateways`, `savePaymentGateway`, `validatePaymentGateway` from `../../api/paymentGatewayApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/paymentGatewayApi](../../../client/src/api/paymentGatewayApi.js)

## Runtime declarations and data flow

### `PaymentGatewayCenter` — lines 16–65

Parameters: `{mpesaOnly, providerOnly, initialProvider}`.
Persistent operations detected: PROVIDERS.find; verify tenant/ownership filters in the exact query. React hooks used: useState, useQuery, useMemo, useEffect, useMutation. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const [provider, setProvider] = useState(initialProvider);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [validationResult, setValidationResult] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const initializedEnvironment = useRef(false);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** Sensitive-configuration/data operation; inspect source without copying secret values. — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const query = useQuery({ queryKey: ["payment-gateways"], queryFn: listPaymentGateways });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const detailQuery = useQuery({ queryKey: ["payment-gateway", provider, form.environment], queryFn: () => getPaymentGateway(provider, form.environment), enabled: ["MPESA", "PAYPAL"].includes(provider) });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const configs = Array.isArray(query.data?.data) ? query.data.data : Array.isArray(query.data) ? query.data : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const current = useMemo(() => configs.find((x) => String(x?.provider || "").toUpperCase() === provider), [configs, provider]);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 26:** `const detail = detailQuery.data?.data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const isEnabled = provider === "PAYPAL" ? Boolean(detail?.checkoutAvailable) : provider === "MPESA" ? Boolean(detail?.enabled && detail?.environment === form.environment) : Boolean(current?.enabled);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const isConfigured = ["MPESA", "PAYPAL"].includes(provider) ? Boolean(detail?.configured) : Boolean(current?.configured);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 31:** `if (!["MPESA", "PAYPAL"].includes(provider) || !detailQuery.isSuccess) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `const saved = detailQuery.data?.data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (!initializedEnvironment.current && ["sandbox", "production"].includes(saved.activeEnvironment) && saved.activeEnvironment !== form.environment) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 42:** `const selectProvider = (id) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `selectProvider` — lines 42–48

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 46:** `const item = configs.find((x) => String(x?.provider || "").toUpperCase() === id);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `set` — lines 49–49

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const PROVIDERS = [`.
- Line 14: `<sensitive declaration redacted>`.
- Line 17: `const qc = useQueryClient();`.
- Line 18: `const [provider, setProvider] = useState(initialProvider);`.
- Line 19: `const [validationResult, setValidationResult] = useState(null);`.
- Line 20: `const initializedEnvironment = useRef(false);`.
- Line 21: `<sensitive declaration redacted>`.
- Line 22: `const query = useQuery({ queryKey: ["payment-gateways"], queryFn: listPaymentGateways });`.
- Line 23: `const detailQuery = useQuery({ queryKey: ["payment-gateway", provider, form.environment], queryFn: () => getPaymentGateway(provider, form.environment), enabled: ["MPESA", "PAYPAL"]`.
- Line 24: `const configs = Array.isArray(query.data?.data) ? query.data.data : Array.isArray(query.data) ? query.data : [];`.
- Line 25: `const current = useMemo(() => configs.find((x) => String(x?.provider || "").toUpperCase() === provider), [configs, provider]);`.
- Line 26: `const detail = detailQuery.data?.data;`.
- Line 27: `const isEnabled = provider === "PAYPAL" ? Boolean(detail?.checkoutAvailable) : provider === "MPESA" ? Boolean(detail?.enabled && detail?.environment === form.environment) : Boolean`.
- Line 28: `const isConfigured = ["MPESA", "PAYPAL"].includes(provider) ? Boolean(detail?.configured) : Boolean(current?.configured);`.
- Line 32: `const saved = detailQuery.data?.data || {};`.
- Line 42: `const selectProvider = (id) => {`.
- Line 46: `const item = configs.find((x) => String(x?.provider || "").toUpperCase() === id);`.
- Line 49: `const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));`.
- Line 50: `<sensitive declaration redacted>`.
- Line 51: `const disable = useMutation({ mutationFn: () => disablePaymentGateway(provider), onSuccess: () => { qc.invalidateQueries({ queryKey: ["payment-gateways"] }); set("enabled", false);`.
- Line 52: `const check = useMutation({ mutationFn: () => validatePaymentGateway(provider, form.environment), onSuccess: (result) => { setValidationResult(result.data || null); toast.info(resu`.
- Line 54: `const visibleProviders = mpesaOnly ? PROVIDERS.filter(({ id }) => id === "MPESA") : providerOnly ? PROVIDERS.filter(({ id }) => id === providerOnly) : PROVIDERS;`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
