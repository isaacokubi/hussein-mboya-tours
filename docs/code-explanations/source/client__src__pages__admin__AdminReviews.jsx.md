# Source explanation: client/src/pages/admin/AdminReviews.jsx

**Source:** [client/src/pages/admin/AdminReviews.jsx](../../../client/src/pages/admin/AdminReviews.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Search`, `RefreshCw`, `CheckCircle2`, `Clock3`, `XCircle`, `MessageSquare`, `Star`, `Trash2`, `ShieldCheck` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminReviews`, `approveReview`, `rejectReview`, `deleteReview` from `../../api/adminReviewApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminReviewApi](../../../client/src/api/adminReviewApi.js)

## Runtime declarations and data flow

### `statusOf` — lines 6–6

Parameters: `r`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `dateOf` — lines 7–7

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `rating` — lines 8–8

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Badge` — lines 14–14

Parameters: `{status}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AdminReviews` — lines 16–51

Parameters: none.
React hooks used: useState, useQuery, useMutation, useMemo, useEffect. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [filter, setFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const [page, setPage] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const limit = 10;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["admin-reviews"], queryFn: getAdminReviews });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const reviews = Array.isArray(data?.reviews) ? data.reviews : Array.isArray(data) ? data : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const mutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const filtered = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const q = search.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `return reviews.filter((r) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 31:** `const text = \`${r?.user?.name || r?.customer?.name || ""} ${r?.user?.email || r?.customer?.email || ""} ${r?.tour?.title || ""} ${r?.title || ""} ${r?.comment || ""}\`.toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `return (!q || text.includes(q)) && (filter === "all" || statusOf(r) === filter);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 35:** `const pages = Math.max(1, Math.ceil(filtered.length / limit));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const currentPage = Math.min(page, pages);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const visible = filtered.slice((currentPage - 1) * limit, currentPage * limit);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `useEffect(() => setPage(1), [search, filter]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 39:** `const counts = { total: reviews.length, pending: reviews.filter(r => statusOf(r) === "pending").length, approved: reviews.filter(r => statusOf(r) === "approved").length, rejected: reviews.filter(r => statusOf(r) === "rej` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `const statusOf = (r) => r?.approved ? "approved" : r?.rejected ? "rejected" : "pending";`.
- Line 7: `const dateOf = (v) => v ? new Date(v).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—";`.
- Line 8: `const rating = (v) => Math.max(0, Math.min(5, Number(v) || 0));`.
- Line 9: `const META = {`.
- Line 14: `function Badge({ status }) { const [label, cls, Icon] = META[status]; return <span className={\`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibo`.
- Line 17: `const qc = useQueryClient();`.
- Line 18: `const [search, setSearch] = useState("");`.
- Line 19: `const [filter, setFilter] = useState("all");`.
- Line 20: `const [page, setPage] = useState(1);`.
- Line 21: `const limit = 10;`.
- Line 22: `const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["admin-reviews"], queryFn: getAdminReviews });`.
- Line 23: `const reviews = Array.isArray(data?.reviews) ? data.reviews : Array.isArray(data) ? data : [];`.
- Line 24: `const mutation = useMutation({`.
- Line 28: `const filtered = useMemo(() => {`.
- Line 29: `const q = search.trim().toLowerCase();`.
- Line 31: `const text = \`${r?.user?.name || r?.customer?.name || ""} ${r?.user?.email || r?.customer?.email || ""} ${r?.tour?.title || ""} ${r?.title || ""} ${r?.comment || ""}\`.toLowerCase`.
- Line 35: `const pages = Math.max(1, Math.ceil(filtered.length / limit));`.
- Line 36: `const currentPage = Math.min(page, pages);`.
- Line 37: `const visible = filtered.slice((currentPage - 1) * limit, currentPage * limit);`.
- Line 39: `const counts = { total: reviews.length, pending: reviews.filter(r => statusOf(r) === "pending").length, approved: reviews.filter(r => statusOf(r) === "approved").length, rejected: `.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
