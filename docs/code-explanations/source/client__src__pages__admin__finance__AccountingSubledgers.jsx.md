# Source explanation: client/src/pages/admin/finance/AccountingSubledgers.jsx

**Source:** [client/src/pages/admin/finance/AccountingSubledgers.jsx](../../../client/src/pages/admin/finance/AccountingSubledgers.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
-  from `./AccountingSubledgers.css`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/pages/admin/finance/AccountingSubledgers.css](../../../client/src/pages/admin/finance/AccountingSubledgers.css)

## Runtime declarations and data flow

### `localDate` — lines 9–13

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 10:** `const d = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const offset = d.getTimezoneOffset();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 10);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `number` — lines 15–18

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `return Number(value).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `money` — lines 20–23

Parameters: `value`, `currency (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `titleCase` — lines 25–25

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `apiMessage` — lines 26–26

Parameters: `error`, `fallback`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `initialForm` — lines 28–41

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AccountingSubledgers` — lines 43–293

Parameters: none.
HTTP operations detected: api.get, api.post; response/error handling occurs in this function and its caller. React hooks used: useState, useQuery, useMemo, useMutation. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 44:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const [form, setForm] = useState(initialForm);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 46:** `const [registerType, setRegisterType] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 47:** `const [clientError, setClientError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 49:** `const query = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 52:** `const suffix = registerType === "all" ? "" : \`?type=${registerType}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `return (await api.get(\`/admin/finance/accounting/subledgers${suffix}\`)).data;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 58:** `const rows = query.data?.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const serverSummary = query.data?.summary;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const summary = useMemo(() => ({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 67:** `const update = (key, value) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `const create = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 74:** `const amount = Number(form.amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `const rate = Number(form.exchangeRate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const quantity = form.quantity === "" ? 0 : Number(form.quantity);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `const unitCost = form.unitCost === "" ? 0 : Number(form.unitCost);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `const currency = String(form.currency).toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `if (!form.reference.trim()) throw new Error("Reference is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `update` — lines 67–70

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submit` — lines 106–110

Parameters: `event`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 295–303

Parameters: `{label, required, hint, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 296:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const TYPES = ["inventory", "payroll", "accrual", "prepayment", "fx"];`.
- Line 7: `const CURRENCIES = ["KES", "USD", "EUR", "GBP", "TZS", "UGX", "ZAR"];`.
- Line 9: `const localDate = () => {`.
- Line 10: `const d = new Date();`.
- Line 11: `const offset = d.getTimezoneOffset();`.
- Line 15: `const number = (value) => {`.
- Line 20: `const money = (value, currency = "KES") =>`.
- Line 25: `const titleCase = (value) => String(value || "").replace(/\b\w/g, (c) => c.toUpperCase());`.
- Line 26: `const apiMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;`.
- Line 28: `const initialForm = () => ({`.
- Line 44: `const qc = useQueryClient();`.
- Line 45: `const [form, setForm] = useState(initialForm);`.
- Line 46: `const [registerType, setRegisterType] = useState("all");`.
- Line 47: `const [clientError, setClientError] = useState("");`.
- Line 49: `const query = useQuery({`.
- Line 52: `const suffix = registerType === "all" ? "" : \`?type=${registerType}\`;`.
- Line 58: `const rows = query.data?.data || [];`.
- Line 59: `const serverSummary = query.data?.summary;`.
- Line 61: `const summary = useMemo(() => ({`.
- Line 67: `const update = (key, value) => {`.
- Line 72: `const create = useMutation({`.
- Line 74: `const amount = Number(form.amount);`.
- Line 75: `const rate = Number(form.exchangeRate);`.
- Line 76: `const quantity = form.quantity === "" ? 0 : Number(form.quantity);`.
- Line 77: `const unitCost = form.unitCost === "" ? 0 : Number(form.unitCost);`.
- Line 78: `const currency = String(form.currency).toUpperCase();`.
- Line 106: `const submit = (event) => {`.
- Line 112: `const rateHelp = form.currency === "KES"`.
- Line 116: `const registerLabel = registerType === "all" ? "All subledgers" : \`${titleCase(registerType)} register\`;`.
- Line 263: `const currency = String(row.currency || "KES").toUpperCase();`.
- Line 264: `const status = String(row.status || "draft").toLowerCase();`.
- Line 265: `const hasRate = Number.isFinite(Number(row.exchangeRate)) && Number(row.exchangeRate) > 0;`.
- Line 266: `const baseAmount = Number.isFinite(Number(row.baseAmount)) && Number(row.baseAmount) >= 0 ? Number(row.baseAmount) : null;`.
- Line 295: `function Field({ label, required, hint, children }) {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
