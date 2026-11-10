# Source explanation: client/src/pages/admin/TenantBilling.jsx

**Source:** [client/src/pages/admin/TenantBilling.jsx](../../../client/src/pages/admin/TenantBilling.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertCircle`, `CheckCircle2`, `ChevronRight`, `Clock3`, `CreditCard`, `FileText`, `History`, `Info`, `LockKeyhole`, `RefreshCw`, `ShieldCheck`, `Smartphone`, `WalletCards`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getTenantSubscription`, `startTenantSubscriptionPayment`, `getTenantSubscriptionPaymentStatus` from `../../api/tenantSubscriptionApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tenantSubscriptionApi](../../../client/src/api/tenantSubscriptionApi.js)

## Runtime declarations and data flow

### `money` — lines 55–55

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `safeDate` — lines 56–63

Parameters: `value`, `withTime (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 57:** `if (!value) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `if (Number.isNaN(date.getTime())) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `return withTime` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `TenantBilling` — lines 65–248

Parameters: none.
React hooks used: useState, useQuery, useMutation, useEffect, useMemo. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 66:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `const [phone, setPhone] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 68:** `const [selectedPlan, setSelectedPlan] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 69:** `const [checkoutRequestId, setCheckoutRequestId] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 71:** `const subscriptionQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 77:** `const paymentQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 82:** `const status = String(query.state.data?.payment?.status || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `return ["completed", "failed", "cancelled"].includes(status) ? false : 5000;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 87:** `const payMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 90:** `const id = response?.payment?.checkoutRequestID || response?.payment?.checkoutRequestId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `if (id) setCheckoutRequestId(id);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 100:** `const data = subscriptionQuery.data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 101:** `const tenant = data.tenant || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `const currentPlan = String(data.plan || tenant.subscription?.plan || "starter").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `const plan = selectedPlan || currentPlan;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const planPrices = data.planPrices && typeof data.planPrices === "object" ? data.planPrices : {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `const amount = Number(planPrices[plan] || (plan === currentPlan ? data.amountDue : 0) || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `const accountStatus = String(tenant.status || data.subscription?.status || "trial").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `LoadingState` — lines 250–252

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 251:** `return <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><div className="flex items-center gap-3 text-slate-600"><RefreshCw size={18} className="animate-spin" /> Loading subscription and billing` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Summary` — lines 254–256

Parameters: `{icon, label, value, detail}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 255:** `return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">{icon}</div><p className="t` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `InfoCard` — lines 258–260

Parameters: `{icon, title, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 259:** `return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 font-black text-slate-950">{icon}<span>{title}</span></div><p className="mt-2 text-sm leading` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 26: `const labels = {`.
- Line 33: `const descriptions = {`.
- Line 40: `const statusStyles = {`.
- Line 48: `const paymentStyles = {`.
- Line 55: `const money = (value) => \`KES ${Number(value || 0).toLocaleString("en-KE")}\`;`.
- Line 56: `const safeDate = (value, withTime = false) => {`.
- Line 58: `const date = new Date(value);`.
- Line 66: `const qc = useQueryClient();`.
- Line 67: `const [phone, setPhone] = useState("");`.
- Line 68: `const [selectedPlan, setSelectedPlan] = useState("");`.
- Line 69: `const [checkoutRequestId, setCheckoutRequestId] = useState("");`.
- Line 71: `const subscriptionQuery = useQuery({`.
- Line 77: `const paymentQuery = useQuery({`.
- Line 82: `const status = String(query.state.data?.payment?.status || "").toLowerCase();`.
- Line 87: `const payMutation = useMutation({`.
- Line 90: `const id = response?.payment?.checkoutRequestID || response?.payment?.checkoutRequestId;`.
- Line 100: `const data = subscriptionQuery.data || {};`.
- Line 101: `const tenant = data.tenant || {};`.
- Line 102: `const currentPlan = String(data.plan || tenant.subscription?.plan || "starter").toLowerCase();`.
- Line 103: `const plan = selectedPlan || currentPlan;`.
- Line 104: `const planPrices = data.planPrices && typeof data.planPrices === "object" ? data.planPrices : {};`.
- Line 105: `const amount = Number(planPrices[plan] || (plan === currentPlan ? data.amountDue : 0) || 0);`.
- Line 106: `const accountStatus = String(tenant.status || data.subscription?.status || "trial").toLowerCase();`.
- Line 107: `const isTrial = accountStatus === "trial" || accountStatus === "trialing";`.
- Line 108: `const trialEnds = tenant.subscription?.trialEndsAt || data.subscription?.trialEndsAt;`.
- Line 109: `const renewsAt = tenant.subscription?.renewsAt || data.subscription?.currentPeriodEndsAt;`.
- Line 110: `const payments = Array.isArray(data.payments) ? data.payments : [];`.
- Line 111: `const pendingPayment = paymentQuery.data?.payment;`.
- Line 118: `const status = String(pendingPayment?.status || "").toLowerCase();`.
- Line 129: `const plans = useMemo(`.
- Line 134: `const normalizedPhone = phone.trim().replace(/\s+/g, "").replace(/^\+/, "");`.
- Line 135: `const validKenyanPhone = /^(?:0[17]\d{8}|254[17]\d{8})$/.test(normalizedPhone);`.
- Line 136: `const priceConfigured = amount > 0;`.
- Line 137: `const canPay = priceConfigured && validKenyanPhone && !payMutation.isPending && !checkoutRequestId;`.
- Line 138: `const statusClass = statusStyles[accountStatus] || "bg-slate-50 text-slate-700 ring-slate-200";`.
- Line 139: `const latestPayment = payments[0];`.
- Line 203: `const selected = plan === key;`.
- Line 204: `const current = currentPlan === key;`.
- Line 205: `const configured = price > 0;`.
- Line 250: `function LoadingState() {`.
- Line 254: `function Summary({ icon, label, value, detail }) {`.
- Line 258: `function InfoCard({ icon, title, children }) {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
