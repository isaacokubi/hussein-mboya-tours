# Source explanation: client/src/pages/superadmin/SuperAdminAudit.jsx

**Source:** [client/src/pages/superadmin/SuperAdminAudit.jsx](../../../client/src/pages/superadmin/SuperAdminAudit.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Activity`, `AlertTriangle`, `Ban`, `CheckCircle2`, `ChevronRight`, `Clock3`, `FileSearch`, `Filter`, `RefreshCw`, `Search`, `ShieldAlert`, `X`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAuditLogs` from `../../api/auditApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/auditApi](../../../client/src/api/auditApi.js)
- `Pagination` from `../../components/admin/Pagination`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/Pagination](../../../client/src/components/admin/Pagination.jsx)

## Runtime declarations and data flow

### `numberValue` — lines 39–39

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `label` — lines 40–43

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `formatDate` — lines 45–54

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 46:** `if (!value) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (Number.isNaN(date.getTime())) return "Invalid date";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `return new Intl.DateTimeFormat("en-KE", {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getInitials` — lines 56–63

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SuperAdminAudit` — lines 65–288

Parameters: none.
React hooks used: useState, useQuery, useMemo. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 66:** `const [page, setPage] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 67:** `const [selected, setSelected] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 68:** `const [filters, setFilters] = useState(INITIAL_FILTERS);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 70:** `const query = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 78:** `const { data, isLoading, isFetching, error, refetch } = query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `const logs = Array.isArray(data?.logs) ? data.logs : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `const statistics = data?.statistics || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const pagination = data?.pagination || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `const pages = Math.max(1, numberValue(pagination.pages) || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `const total = numberValue(pagination.total);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const hasStatistics = ["total", "success", "failed", "critical"].some((key) => statistics[key] !== undefined && statistics[key] !== null);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const activeFilterCount = Object.values(filters).filter(Boolean).length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `const filteredView = activeFilterCount > 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const counts = useMemo(() => ({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 95:** `const changeFilter = (key, value) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 101:** `const clearFilters = () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `if (isLoading) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 108:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `changeFilter` — lines 95–99

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clearFilters` — lines 101–105

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SelectFilter` — lines 290–297

Parameters: `{value, onChange, label, options}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 291:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `MetricCard` — lines 299–319

Parameters: `{icon, title, value, hint, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 300:** `const tones = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 306:** `const style = tones[tone] || tones.slate;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 307:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Badge` — lines 321–330

Parameters: `{value, type}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 322:** `const normalized = String(value || "unknown").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 323:** `const classes = type === "status"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 328:** `const Icon = type === "status" ? (normalized === "success" ? CheckCircle2 : normalized === "failed" ? XCircle : AlertTriangle) : type === "severity" && normalized === "critical" ? ShieldAlert : ChevronRight;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 329:** `return <span className={\`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${classes}\`}><Icon className="h-3.5 w-3.5" />{label(value || "Unknown")}</span>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `InfoCard` — lines 332–344

Parameters: `{icon, title, text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 333:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `AuditDrawer` — lines 346–380

Parameters: `{log, onClose}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 347:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Detail` — lines 382–389

Parameters: `{label, value, mono}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 383:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 21: `const PAGE_SIZE = 10;`.
- Line 22: `const INITIAL_FILTERS = { search: "", severity: "", status: "", action: "", resource: "" };`.
- Line 23: `const ACTIONS = ["login", "create", "update", "delete", "logout", "approve", "reject", "export"];`.
- Line 24: `const SEVERITIES = ["critical", "high", "medium", "low"];`.
- Line 25: `const STATUSES = ["success", "failed"];`.
- Line 26: `const RESOURCES = [`.
- Line 39: `const numberValue = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);`.
- Line 40: `const label = (value) =>`.
- Line 45: `const formatDate = (value) => {`.
- Line 47: `const date = new Date(value);`.
- Line 56: `const getInitials = (value) =>`.
- Line 66: `const [page, setPage] = useState(1);`.
- Line 67: `const [selected, setSelected] = useState(null);`.
- Line 68: `const [filters, setFilters] = useState(INITIAL_FILTERS);`.
- Line 70: `const query = useQuery({`.
- Line 78: `const { data, isLoading, isFetching, error, refetch } = query;`.
- Line 79: `const logs = Array.isArray(data?.logs) ? data.logs : [];`.
- Line 80: `const statistics = data?.statistics || {};`.
- Line 81: `const pagination = data?.pagination || {};`.
- Line 82: `const pages = Math.max(1, numberValue(pagination.pages) || 1);`.
- Line 83: `const total = numberValue(pagination.total);`.
- Line 84: `const hasStatistics = ["total", "success", "failed", "critical"].some((key) => statistics[key] !== undefined && statistics[key] !== null);`.
- Line 85: `const activeFilterCount = Object.values(filters).filter(Boolean).length;`.
- Line 86: `const filteredView = activeFilterCount > 0;`.
- Line 88: `const counts = useMemo(() => ({`.
- Line 95: `const changeFilter = (key, value) => {`.
- Line 101: `const clearFilters = () => {`.
- Line 290: `function SelectFilter({ value, onChange, label: placeholder, options }) {`.
- Line 299: `function MetricCard({ icon: Icon, title, value, hint, tone }) {`.
- Line 300: `const tones = {`.
- Line 306: `const style = tones[tone] || tones.slate;`.
- Line 321: `function Badge({ value, type }) {`.
- Line 322: `const normalized = String(value || "unknown").toLowerCase();`.
- Line 323: `const classes = type === "status"`.
- Line 328: `const Icon = type === "status" ? (normalized === "success" ? CheckCircle2 : normalized === "failed" ? XCircle : AlertTriangle) : type === "severity" && normalized === "critical" ? `.
- Line 332: `function InfoCard({ icon: Icon, title, text }) {`.
- Line 346: `function AuditDrawer({ log, onClose }) {`.
- Line 382: `function Detail({ label: title, value, mono = false }) {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
