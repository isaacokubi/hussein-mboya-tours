# Source explanation: client/src/pages/admin/CustomTourRequests.jsx

**Source:** [client/src/pages/admin/CustomTourRequests.jsx](../../../client/src/pages/admin/CustomTourRequests.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Search`, `RefreshCw`, `SlidersHorizontal`, `MapPin`, `Users`, `Clock3`, `MessageSquareText`, `WalletCards`, `UserRound`, `Car`, `BriefcaseBusiness`, `Save`, `Send`, `XCircle`, `AlertCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminCustomTourRequests`, `quoteCustomTourRequest`, `assignCustomTourResources` from `../../api/customTourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/customTourApi](../../../client/src/api/customTourApi.js)
- `getAgents` from `../../api/adminAgentApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminAgentApi](../../../client/src/api/adminAgentApi.js)
- `getGuides`, `getDrivers` from `../../api/tourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourApi](../../../client/src/api/tourApi.js)

## Runtime declarations and data flow

### `money` — lines 16–16

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `customerName` — lines 17–17

Parameters: `request`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `customerEmail` — lines 18–18

Parameters: `request`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `CustomTourRequests` — lines 21–189

Parameters: none.
React hooks used: useState, useQuery, useMutation, useMemo. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const [amounts, setAmounts] = useState({});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const [notes, setNotes] = useState({});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const [resources, setResources] = useState({});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const [statusFilter, setStatusFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const [actionError, setActionError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const requestsQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 34:** `const agentsQuery = useQuery({ queryKey: ["admin-agents"], queryFn: getAgents });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 35:** `const guidesQuery = useQuery({ queryKey: ["custom-guides"], queryFn: getGuides });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 36:** `const driversQuery = useQuery({ queryKey: ["custom-drivers"], queryFn: getDrivers });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 38:** `const refresh = () => qc.invalidateQueries({ queryKey: ["admin-custom-tour-requests"] });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const assignMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 46:** `const quoteMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 52:** `const requests = requestsQuery.data?.requests || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const filteredRequests = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 54:** `const term = search.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `return requests.filter((r) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 38–38

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const STATUS_STYLES = {`.
- Line 16: `const money = (value) => \`KES ${Number(value || 0).toLocaleString("en-KE")}\`;`.
- Line 17: `const customerName = (request) => request.customer?.name || request.guestContact?.name || "Guest customer";`.
- Line 18: `const customerEmail = (request) => request.customer?.email || request.guestContact?.email || "No email provided";`.
- Line 19: `const terminalStatuses = new Set(["converted", "rejected"]);`.
- Line 22: `const qc = useQueryClient();`.
- Line 23: `const [amounts, setAmounts] = useState({});`.
- Line 24: `const [notes, setNotes] = useState({});`.
- Line 25: `const [resources, setResources] = useState({});`.
- Line 26: `const [search, setSearch] = useState("");`.
- Line 27: `const [statusFilter, setStatusFilter] = useState("all");`.
- Line 28: `const [actionError, setActionError] = useState("");`.
- Line 30: `const requestsQuery = useQuery({`.
- Line 34: `const agentsQuery = useQuery({ queryKey: ["admin-agents"], queryFn: getAgents });`.
- Line 35: `const guidesQuery = useQuery({ queryKey: ["custom-guides"], queryFn: getGuides });`.
- Line 36: `const driversQuery = useQuery({ queryKey: ["custom-drivers"], queryFn: getDrivers });`.
- Line 38: `const refresh = () => qc.invalidateQueries({ queryKey: ["admin-custom-tour-requests"] });`.
- Line 40: `const assignMutation = useMutation({`.
- Line 46: `const quoteMutation = useMutation({`.
- Line 52: `const requests = requestsQuery.data?.requests || [];`.
- Line 53: `const filteredRequests = useMemo(() => {`.
- Line 54: `const term = search.trim().toLowerCase();`.
- Line 56: `const matchesStatus = statusFilter === "all" || String(r.status || "").toLowerCase() === statusFilter;`.
- Line 57: `const haystack = \`${r.destination || ""} ${customerName(r)} ${customerEmail(r)} ${r.requirements || ""}\`.toLowerCase();`.
- Line 62: `const stats = useMemo(() => ({`.
- Line 72: `const guideOptions = (guidesQuery.data || []).filter((x) => x.availability === "available" && x.status !== "inactive" && x.isDeleted !== true);`.
- Line 73: `const driverOptions = (driversQuery.data || []).filter((x) => x.availability === "available" && x.status !== "inactive" && x.isDeleted !== true);`.
- Line 74: `const agentOptions = (agentsQuery.data || []).filter((x) => x.status === "active" && x.isApproved === true);`.
- Line 121: `const status = String(r.status || "pending").toLowerCase();`.
- Line 122: `const isLocked = terminalStatuses.has(status);`.
- Line 123: `const selected = resources[r._id] || {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
