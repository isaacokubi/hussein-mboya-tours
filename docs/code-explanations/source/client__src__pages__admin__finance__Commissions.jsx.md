# Source explanation: client/src/pages/admin/finance/Commissions.jsx

**Source:** [client/src/pages/admin/finance/Commissions.jsx](../../../client/src/pages/admin/finance/Commissions.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `WalletCards`, `CheckCircle2`, `Clock3`, `CircleDollarSign`, `Search`, `RefreshCw`, `AlertCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getCommissions`, `approveCommission`, `payCommission` from `../../../api/commissionApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/commissionApi](../../../client/src/api/commissionApi.js)

## Runtime declarations and data flow

### `money` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `titleCase` — lines 8–8

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusClass` — lines 9–16

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Commissions` — lines 18–105

Parameters: none.
React hooks used: useState, useQuery, useMutation, useMemo. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const [filter, setFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const { data = [], isLoading, isError, refetch, isFetching } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const approve = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 33:** `const pay = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 39:** `const summary = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 40:** `const active = data.filter((c) => !["cancelled", "rejected"].includes(String(c.status).toLowerCase()));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const accrued = active.reduce((sum, c) => sum + Number(c.netAmount ?? c.amount ?? 0), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const paid = data.filter((c) => c.status === "paid").reduce((sum, c) => sum + Number(c.netAmount ?? c.amount ?? 0), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `return { accrued, paid, outstanding: Math.max(0, accrued - paid) };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 46:** `const filtered = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 47:** `const q = search.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `return data.filter((c) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 49:** `const status = String(c.status || "pending").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `if (filter !== "all" && status !== filter) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (!q) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `confirmPayment` — lines 59–66

Parameters: `commission`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 60:** `const reference = window.prompt(\`Enter the actual payment reference for ${money(commission.netAmount ?? commission.amount)}:\`, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `if (reference === null) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `if (!reference.trim()) { toast.error("Payment reference is required."); return; }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `const method = window.prompt("Payment method (MPESA, BANK_TRANSFER, CASH, CHEQUE):", "MPESA")?.trim().toUpperCase() || "MPESA";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `if (!["MPESA", "BANK_TRANSFER", "CASH", "CHEQUE"].includes(method)) { toast.error("Invalid payment method."); return; }` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 7: `const money = (value) => \`KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;`.
- Line 8: `const titleCase = (value) => String(value || "pending").replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());`.
- Line 9: `const statusClass = (status) => ({`.
- Line 19: `const qc = useQueryClient();`.
- Line 20: `const [search, setSearch] = useState("");`.
- Line 21: `const [filter, setFilter] = useState("all");`.
- Line 22: `const { data = [], isLoading, isError, refetch, isFetching } = useQuery({`.
- Line 27: `const approve = useMutation({`.
- Line 33: `const pay = useMutation({`.
- Line 39: `const summary = useMemo(() => {`.
- Line 40: `const active = data.filter((c) => !["cancelled", "rejected"].includes(String(c.status).toLowerCase()));`.
- Line 41: `const accrued = active.reduce((sum, c) => sum + Number(c.netAmount ?? c.amount ?? 0), 0);`.
- Line 42: `const paid = data.filter((c) => c.status === "paid").reduce((sum, c) => sum + Number(c.netAmount ?? c.amount ?? 0), 0);`.
- Line 46: `const filtered = useMemo(() => {`.
- Line 47: `const q = search.trim().toLowerCase();`.
- Line 49: `const status = String(c.status || "pending").toLowerCase();`.
- Line 59: `const confirmPayment = (commission) => {`.
- Line 60: `const reference = window.prompt(\`Enter the actual payment reference for ${money(commission.netAmount ?? commission.amount)}:\`, "");`.
- Line 63: `const method = window.prompt("Payment method (MPESA, BANK_TRANSFER, CASH, CHEQUE):", "MPESA")?.trim().toUpperCase() || "MPESA";`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
