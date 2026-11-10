# Source explanation: client/src/pages/admin/finance/AdminFinance.jsx

**Source:** [client/src/pages/admin/finance/AdminFinance.jsx](../../../client/src/pages/admin/finance/AdminFinance.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQueries`, `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Activity`, `ArrowRight`, `Banknote`, `BarChart3`, `Building2`, `Calculator`, `CheckCircle2`, `CreditCard`, `Landmark`, `Receipt`, `RefreshCw`, `ShieldCheck`, `Wallet` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getFinanceStats` from `../../../api/financeApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/financeApi](../../../client/src/api/financeApi.js)
- `getSupplierPayables`, `getCorporateAccounts` from `../../../api/operationsModuleApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/operationsModuleApi](../../../client/src/api/operationsModuleApi.js)
- `getLedgerSummary` from `../../../api/accountingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/accountingApi](../../../client/src/api/accountingApi.js)
- `AccountingLedger` from `../AccountingLedger`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/pages/admin/AccountingLedger](../../../client/src/pages/admin/AccountingLedger.jsx)
- `KenyaTaxCenter` from `../../../components/admin/KenyaTaxCenter`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/KenyaTaxCenter](../../../client/src/components/admin/KenyaTaxCenter.jsx)
- `FinanceLifecycleCenter` from `../../../components/admin/FinanceLifecycleCenter`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/FinanceLifecycleCenter](../../../client/src/components/admin/FinanceLifecycleCenter.jsx)
- `GoLiveReadiness` from `../GoLiveReadiness`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/pages/admin/GoLiveReadiness](../../../client/src/pages/admin/GoLiveReadiness.jsx)
- `getTenantSubscription` from `../../../api/tenantSubscriptionApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tenantSubscriptionApi](../../../client/src/api/tenantSubscriptionApi.js)
- `useAuth` from `../../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `getUserRole` from `../../../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)

## Runtime declarations and data flow

### `money` — lines 16–16

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrap` — lines 17–17

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `list` — lines 18–18

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `pct` — lines 19–19

Parameters: `a`, `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `displayAmount` — lines 20–20

Parameters: `value`, `label (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `errorMessage` — lines 21–21

Parameters: `query`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AdminFinance` — lines 24–49

Parameters: none.
React hooks used: useQuery, useState, useMemo. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `const { user } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const role = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const isSuperAdmin = ["super_admin", "superadmin"].includes(String(role || "").toLowerCase());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const subscriptionQ = useQuery({ queryKey: ["tenant-subscription"], queryFn: getTenantSubscription, staleTime: 30000, retry: 2, enabled: Boolean(user) && !isSuperAdmin });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const planFeatures = subscriptionQ.data?.features;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const canUseFeature = (feature) => isSuperAdmin || subscriptionQ.isError || (Array.isArray(planFeatures) && planFeatures.includes(feature));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const [refreshError, setRefreshError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** `const [financeQ, payablesQ, corporateQ] = useQueries({ queries: [{ queryKey: ["admin-finance-accounting"], queryFn: getFinanceStats, staleTime: 30000, refetchInterval: false, refetchOnWindowFocus: false, retry: 3 }, { qu` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const ledgerQ = useQuery({ queryKey: ["accounting-summary"], queryFn: getLedgerSummary, staleTime: 30000, refetchInterval: false, refetchOnWindowFocus: false, retry: 3 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 34:** `const finance = unwrap(financeQ.data); const payables = list(payablesQ.data); const corporate = list(corporateQ.data); const ledger = unwrap(ledgerQ.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const outstandingPayables = payables.reduce((sum, item) => sum + Number(item.balance ?? item.outstanding ?? item.amount ?? 0), 0); const corporateExposure = corporate.reduce((sum, item) => sum + Number(item.outstandingBa` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const profit = Number(ledger.profitLoss?.netProfit || 0); const revenue = Number(finance.revenue || 0); const postedRevenue = Number(ledger.profitLoss?.revenue || 0); const cashAccounts = useMemo(() => (ledger.accounts |` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 37:** `const cards = [["Completed collections", money(finance.revenue), "Completed payment value, including later-refunded payments", Banknote, "text-sky-600"], ["Net collections", money(finance.netRevenue), \`${pct(finance.net` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const queries = [financeQ, payablesQ, corporateQ, ledgerQ]; const initialErrors = queries.filter((q) => q.isError && !q.data); const refreshing = queries.some((q) => q.isFetching);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const refreshFinance = async () => { setRefreshError(""); const results = []; for (const [label, query] of [["Finance totals", financeQ], ["Supplier payables", payablesQ], ["Corporate accounts", corporateQ], ["General le` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `return <div className="space-y-8 pb-10">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `canUseFeature` — lines 30–30

Parameters: `feature`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `refreshFinance` — lines 39–39

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `Metric` — lines 50–50

Parameters: `{label, value, emphasis}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Health` — lines 51–51

Parameters: `{label, value, good}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Control` — lines 52–52

Parameters: `{text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 16: `const money = (value) => \`KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;`.
- Line 17: `const unwrap = (value) => value?.data?.data ?? value?.data ?? value ?? {};`.
- Line 18: `const list = (value) => Array.isArray(value) ? value : value?.items || value?.data || [];`.
- Line 19: `const pct = (a, b) => Number(b) ? \`${((Number(a || 0) / Number(b)) * 100).toFixed(1)}%\` : "—";`.
- Line 20: `const displayAmount = (value, label = "Amount") => Number(value || 0) === 0 ? \`KES 0.00 · ${label === "Expenses" ? "no posted expense journals" : "none recorded"}\` : money(value)`.
- Line 21: `const errorMessage = (query) => query?.error?.response?.data?.message || query?.error?.message || "The service did not respond successfully.";`.
- Line 22: `const workspaceCards = [["Finance Reports", "/admin/finance/reports", "P&L trends, revenue and transaction reporting", BarChart3], ["M-Pesa Transactions", "/admin/finance/transacti`.
- Line 25: `const { user } = useAuth();`.
- Line 26: `const role = getUserRole(user);`.
- Line 27: `const isSuperAdmin = ["super_admin", "superadmin"].includes(String(role || "").toLowerCase());`.
- Line 28: `const subscriptionQ = useQuery({ queryKey: ["tenant-subscription"], queryFn: getTenantSubscription, staleTime: 30000, retry: 2, enabled: Boolean(user) && !isSuperAdmin });`.
- Line 29: `const planFeatures = subscriptionQ.data?.features;`.
- Line 30: `const canUseFeature = (feature) => isSuperAdmin || subscriptionQ.isError || (Array.isArray(planFeatures) && planFeatures.includes(feature));`.
- Line 31: `const [refreshError, setRefreshError] = useState("");`.
- Line 32: `const [financeQ, payablesQ, corporateQ] = useQueries({ queries: [{ queryKey: ["admin-finance-accounting"], queryFn: getFinanceStats, staleTime: 30000, refetchInterval: false, refet`.
- Line 33: `const ledgerQ = useQuery({ queryKey: ["accounting-summary"], queryFn: getLedgerSummary, staleTime: 30000, refetchInterval: false, refetchOnWindowFocus: false, retry: 3 });`.
- Line 34: `const finance = unwrap(financeQ.data); const payables = list(payablesQ.data); const corporate = list(corporateQ.data); const ledger = unwrap(ledgerQ.data);`.
- Line 35: `const outstandingPayables = payables.reduce((sum, item) => sum + Number(item.balance ?? item.outstanding ?? item.amount ?? 0), 0); const corporateExposure = corporate.reduce((sum, `.
- Line 36: `const profit = Number(ledger.profitLoss?.netProfit || 0); const revenue = Number(finance.revenue || 0); const postedRevenue = Number(ledger.profitLoss?.revenue || 0); const cashAcc`.
- Line 37: `const cards = [["Completed collections", money(finance.revenue), "Completed payment value, including later-refunded payments", Banknote, "text-sky-600"], ["Net collections", money(`.
- Line 38: `const queries = [financeQ, payablesQ, corporateQ, ledgerQ]; const initialErrors = queries.filter((q) => q.isError && !q.data); const refreshing = queries.some((q) => q.isFetching);`.
- Line 39: `const refreshFinance = async () => { setRefreshError(""); const results = []; for (const [label, query] of [["Finance totals", financeQ], ["Supplier payables", payablesQ], ["Corpor`.
- Line 50: `function Metric({ label, value, emphasis }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}`.
- Line 51: `function Health({ label, value, good }) { return <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><span className="text-sm text-slate-500">`.
- Line 52: `function Control({ text }) { return <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"><CheckCircle2 size={16} classNa`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
