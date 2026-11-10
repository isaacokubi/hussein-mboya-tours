# Source explanation: client/src/pages/admin/payments/AdminPayments.jsx

**Source:** [client/src/pages/admin/payments/AdminPayments.jsx](../../../client/src/pages/admin/payments/AdminPayments.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `RefreshCw`, `Search`, `Download`, `Eye`, `RotateCcw`, `CreditCard`, `CheckCircle2`, `Clock3`, `XCircle`, `WalletCards` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminPayments`, `getPaymentStats`, `updatePaymentStatus`, `refundPayment`, `exportPaymentsCSV`, `exportPaymentsPDF` from `../../../api/admin/adminPaymentApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/admin/adminPaymentApi](../../../client/src/api/admin/adminPaymentApi.js)

## Runtime declarations and data flow

### `money` — lines 15–15

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clean` — lines 16–16

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusOf` — lines 17–20

Parameters: `payment`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 18:** `const status = clean(payment?.status || payment?.paymentStatus || "pending").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `return status === "paid" ? "completed" : PAYMENT_STATUSES.includes(status) ? status : "pending";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `customerOf` — lines 21–21

Parameters: `payment`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `bookingOf` — lines 22–22

Parameters: `payment`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `phoneOf` — lines 23–23

Parameters: `payment`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `receiptOf` — lines 24–24

Parameters: `payment`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `labelStatus` — lines 25–25

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Metric` — lines 36–46

Parameters: `{icon, label, value, accent}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 37:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `AdminPayments` — lines 48–166

Parameters: none.
React hooks used: useState, useQuery, useMemo, useMutation. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 49:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 51:** `const [statusFilter, setStatusFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 52:** `const [selectedPayment, setSelectedPayment] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 53:** `const [refundingPaymentId, setRefundingPaymentId] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 55:** `const paymentsQuery = useQuery({ queryKey: ["adminPayments"], queryFn: getAdminPayments, staleTime: 15_000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 56:** `const statsQuery = useQuery({ queryKey: ["paymentStats"], queryFn: getPaymentStats, staleTime: 15_000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 58:** `const payments = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 59:** `const value = paymentsQuery.data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `return Array.isArray(value?.payments) ? value.payments : Array.isArray(value?.data?.payments) ? value.data.payments : Array.isArray(value?.data) ? value.data : Array.isArray(value) ? value : [];` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 63:** `const stats = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 64:** `const value = statsQuery.data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `return Array.isArray(value?.stats) ? value.stats : Array.isArray(value?.data?.stats) ? value.data.stats : Array.isArray(value) ? value : [];` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 68:** `const invalidate = () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `const statusMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 79:** `const refundMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 87:** `const filteredPayments = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 88:** `const term = search.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `invalidate` — lines 68–71

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statCount` — lines 95–95

Parameters: `name`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 95:** `(name) => Number(stats.find((item) => String(item?._id || item?.status).toLowerCase() === name)?.count || 0)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

## Module-level declarations

- Line 14: `const PAYMENT_STATUSES = ["pending", "processing", "completed", "failed", "cancelled", "refunded"];`.
- Line 15: `const money = (value) => \`KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}\`;`.
- Line 16: `const clean = (value) => (value === null || value === undefined ? "" : String(value).trim());`.
- Line 17: `const statusOf = (payment) => {`.
- Line 18: `const status = clean(payment?.status || payment?.paymentStatus || "pending").toLowerCase();`.
- Line 21: `const customerOf = (payment) => clean(payment?.customer?.name || payment?.customer?.fullName || payment?.customerName || "Guest");`.
- Line 22: `const bookingOf = (payment) => clean(payment?.bookingDisplay || payment?.booking?.bookingNumber || payment?.bookingNumber || payment?.booking?.reference || "—");`.
- Line 23: `const phoneOf = (payment) => clean(payment?.phoneNumber || payment?.phone || payment?.customer?.phone || "—");`.
- Line 24: `const receiptOf = (payment) => clean(payment?.receiptDisplay || payment?.receiptNumber || payment?.mpesaReceiptNumber || payment?.mpesaReceipt || payment?.transactionReference || p`.
- Line 25: `const labelStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1);`.
- Line 27: `const statusStyles = {`.
- Line 36: `function Metric({ icon: Icon, label, value, accent }) {`.
- Line 49: `const queryClient = useQueryClient();`.
- Line 50: `const [search, setSearch] = useState("");`.
- Line 51: `const [statusFilter, setStatusFilter] = useState("all");`.
- Line 52: `const [selectedPayment, setSelectedPayment] = useState(null);`.
- Line 53: `const [refundingPaymentId, setRefundingPaymentId] = useState(null);`.
- Line 55: `const paymentsQuery = useQuery({ queryKey: ["adminPayments"], queryFn: getAdminPayments, staleTime: 15_000 });`.
- Line 56: `const statsQuery = useQuery({ queryKey: ["paymentStats"], queryFn: getPaymentStats, staleTime: 15_000 });`.
- Line 58: `const payments = useMemo(() => {`.
- Line 59: `const value = paymentsQuery.data;`.
- Line 63: `const stats = useMemo(() => {`.
- Line 64: `const value = statsQuery.data;`.
- Line 68: `const invalidate = () => {`.
- Line 73: `const statusMutation = useMutation({`.
- Line 79: `const refundMutation = useMutation({`.
- Line 87: `const filteredPayments = useMemo(() => {`.
- Line 88: `const term = search.trim().toLowerCase();`.
- Line 90: `const haystack = [customerOf(payment), bookingOf(payment), receiptOf(payment), phoneOf(payment), clean(payment?.paymentReference)].join(" ").toLowerCase();`.
- Line 95: `const statCount = (name) => Number(stats.find((item) => String(item?._id || item?.status).toLowerCase() === name)?.count || 0);`.
- Line 96: `const revenue = stats.filter((item) => ["completed", "paid"].includes(String(item?._id || item?.status).toLowerCase())).reduce((sum, item) => sum + Number(item?.netAmount ?? item?.`.
- Line 144: `const status = statusOf(payment);`.
- Line 145: `const canRefund = !["refunded"].includes(status) && !["processing", "completed"].includes(clean(payment.refundStatus).toLowerCase());`.
- Line 146: `const canConfirmManually = status === "pending" && ["BANK", "CASH"].includes(clean(payment.provider).toUpperCase());`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
