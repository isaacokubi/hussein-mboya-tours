# Source explanation: client/src/pages/admin/finance/MpesaTransactions.jsx

**Source:** [client/src/pages/admin/finance/MpesaTransactions.jsx](../../../client/src/pages/admin/finance/MpesaTransactions.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertCircle`, `CheckCircle2`, `Clock3`, `CreditCard`, `Download`, `FileWarning`, `Filter`, `Loader2`, `RefreshCw`, `Search`, `ShieldCheck`, `Smartphone`, `WalletCards`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getMpesaTransactions` from `../../../api/financeApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/financeApi](../../../client/src/api/financeApi.js)

## Runtime declarations and data flow

### `money` — lines 29–32

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `displayValue` — lines 34–37

Parameters: `value`, `fallback (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `if (value === null || value === undefined || value === "") return fallback;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `return String(value);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getStatus` — lines 39–39

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `StatusBadge` — lines 41–56

Parameters: `{status}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 42:** `const normalized = getStatus(status);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const meta = STATUS_META[normalized] || {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const Icon = meta.icon;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `MetricCard` — lines 58–80

Parameters: `{label, value, hint, icon, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 59:** `const tones = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `MpesaTransactions` — lines 82–279

Parameters: none.
React hooks used: useState, useQuery, useMemo. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 83:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 84:** `const [status, setStatus] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 86:** `const { data, isLoading, isError, refetch, isFetching } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 91:** `const payments = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 92:** `if (Array.isArray(data?.data)) return data.data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `if (Array.isArray(data?.payments)) return data.payments;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 94:** `if (Array.isArray(data?.data?.payments)) return data.data.payments;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 95:** `return [];` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 98:** `const stats = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 99:** `const completed = payments.filter((t) => getStatus(t.status) === "completed");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `const refunded = payments.filter((t) => getStatus(t.status) === "refunded");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 101:** `const failed = payments.filter((t) => getStatus(t.status) === "failed");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `const pending = payments.filter((t) => getStatus(t.status) === "pending");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `const completedRevenue = completed.reduce((sum, t) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const amount = Number(t.amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `return Number.isFinite(amount) ? sum + amount : sum;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 108:** `return { completed, refunded, failed, pending, completedRevenue };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 111:** `const hasData = !isLoading && !isError && payments.length > 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `exportCsv` — lines 113–136

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 114:** `if (!payments.length) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 115:** `const headers = ["Receipt", "Customer", "Phone", "Booking", "Amount", "Method", "Status", "Date"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 116:** `const rows = payments.map((payment) => [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `const csv = [headers, ...rows]` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 129:** `const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 130:** `const url = URL.createObjectURL(blob);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 131:** `const anchor = document.createElement("a");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 21: `const STATUS_META = {`.
- Line 29: `const money = (value) =>`.
- Line 34: `const displayValue = (value, fallback = "Unavailable") => {`.
- Line 39: `const getStatus = (status) => String(status || "pending").toLowerCase();`.
- Line 41: `function StatusBadge({ status }) {`.
- Line 42: `const normalized = getStatus(status);`.
- Line 43: `const meta = STATUS_META[normalized] || {`.
- Line 48: `const Icon = meta.icon;`.
- Line 58: `function MetricCard({ label, value, hint, icon: Icon, tone = "emerald" }) {`.
- Line 59: `const tones = {`.
- Line 83: `const [search, setSearch] = useState("");`.
- Line 84: `const [status, setStatus] = useState("");`.
- Line 86: `const { data, isLoading, isError, refetch, isFetching } = useQuery({`.
- Line 91: `const payments = useMemo(() => {`.
- Line 98: `const stats = useMemo(() => {`.
- Line 99: `const completed = payments.filter((t) => getStatus(t.status) === "completed");`.
- Line 100: `const refunded = payments.filter((t) => getStatus(t.status) === "refunded");`.
- Line 101: `const failed = payments.filter((t) => getStatus(t.status) === "failed");`.
- Line 102: `const pending = payments.filter((t) => getStatus(t.status) === "pending");`.
- Line 103: `const completedRevenue = completed.reduce((sum, t) => {`.
- Line 104: `const amount = Number(t.amount);`.
- Line 111: `const hasData = !isLoading && !isError && payments.length > 0;`.
- Line 113: `const exportCsv = () => {`.
- Line 115: `const headers = ["Receipt", "Customer", "Phone", "Booking", "Amount", "Method", "Status", "Date"];`.
- Line 116: `const rows = payments.map((payment) => [`.
- Line 126: `const csv = [headers, ...rows]`.
- Line 129: `const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });`.
- Line 130: `const url = URL.createObjectURL(blob);`.
- Line 131: `const anchor = document.createElement("a");`.
- Line 249: `const receipt = payment.mpesaReceiptNumber || payment.mpesaReceipt || payment.booking?.mpesaReceipt || payment.transactionId || payment.transactionReference;`.
- Line 250: `const customerName = payment.customer?.name;`.
- Line 251: `const customerPhone = payment.customer?.phone;`.
- Line 252: `const bookingNumber = payment.booking?.bookingNumber;`.
- Line 253: `const amount = Number(payment.amount);`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
