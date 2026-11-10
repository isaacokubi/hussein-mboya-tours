# Source explanation: client/src/pages/admin/AdminNotifications.jsx

**Source:** [client/src/pages/admin/AdminNotifications.jsx](../../../client/src/pages/admin/AdminNotifications.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Bell`, `Check`, `ChevronLeft`, `ChevronRight`, `Loader2`, `RefreshCw`, `Search`, `Send`, `Users`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `roleLabel` — lines 11–11

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `userLabel` — lines 12–12

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AdminNotifications` — lines 16–77

Parameters: none.
HTTP operations detected: api.get, api.post; response/error handling occurs in this function and its caller. React hooks used: useState, useQuery, useMemo, useMutation. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const [roles, setRoles] = useState([]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [recipientIds, setRecipientIds] = useState([]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const [recipientSearch, setRecipientSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const [title, setTitle] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const [message, setMessage] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [type, setType] = useState("system");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const [priority, setPriority] = useState("normal");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const [actionUrl, setActionUrl] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const [page, setPage] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const recipientsQuery = useQuery({ queryKey: ["notification-recipients"], queryFn: async () => (await api.get("/notifications/recipients", { params: { roles: "guide,driver,agent,manager,admin" } })).data });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `const notificationsQuery = useQuery({ queryKey: ["admin-notifications", page], queryFn: async () => (await api.get("/notifications", { params: { page, limit: 5 } })).data });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `const recipients = recipientsQuery.data?.recipients || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const notifications = notificationsQuery.data?.notifications || notificationsQuery.data?.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const totalPages = Math.max(1, Number(notificationsQuery.data?.pages || notificationsQuery.data?.totalPages || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const filteredRecipients = useMemo(() => { const term = recipientSearch.trim().toLowerCase(); if (!term) return recipients; return recipients.filter((user) => \`${userLabel(user)} ${user?.email || ""} ${roleLabel(user)}\` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 34:** `const selectedCount = recipientIds.length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const canSend = Boolean(title.trim() && message.trim() && (roles.length || recipientIds.length));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `toggleRole` — lines 42–42

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `toggleRecipient` — lines 43–43

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `toggleVisibleRecipients` — lines 44–44

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clearComposer` — lines 45–45

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submit` — lines 46–46

Parameters: `event`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `formatDate` — lines 47–47

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

## Module-level declarations

- Line 7: `const groups = [["guide", "Guides"], ["driver", "Drivers"], ["agent", "Agents"], ["manager", "Managers"], ["admin", "Administrators"]];`.
- Line 8: `const types = [["system", "System"], ["assignment", "Assignment"], ["tour_update", "Tour Update"], ["alert", "Alert"], ["promotion", "Promotion"]];`.
- Line 9: `const priorities = [["normal", "Normal"], ["low", "Low"], ["high", "High"], ["urgent", "Urgent"]];`.
- Line 11: `const roleLabel = (user) => user?.roleId?.displayName || user?.role || user?.legacyRole || "Staff";`.
- Line 12: `const userLabel = (user) => user?.name || \`${user?.firstName || ""} ${user?.lastName || ""}\`.trim() || user?.email || "Unnamed user";`.
- Line 13: `const typeClass = { system: "bg-sky-50 text-sky-700 ring-sky-200", assignment: "bg-violet-50 text-violet-700 ring-violet-200", tour_update: "bg-emerald-50 text-emerald-700 ring-eme`.
- Line 14: `const priorityClass = { low: "bg-slate-100 text-slate-600 ring-slate-200", normal: "bg-blue-50 text-blue-700 ring-blue-200", high: "bg-amber-50 text-amber-700 ring-amber-200", urge`.
- Line 17: `const queryClient = useQueryClient();`.
- Line 18: `const [roles, setRoles] = useState([]);`.
- Line 19: `const [recipientIds, setRecipientIds] = useState([]);`.
- Line 20: `const [recipientSearch, setRecipientSearch] = useState("");`.
- Line 21: `const [title, setTitle] = useState("");`.
- Line 22: `const [message, setMessage] = useState("");`.
- Line 23: `const [type, setType] = useState("system");`.
- Line 24: `const [priority, setPriority] = useState("normal");`.
- Line 25: `const [actionUrl, setActionUrl] = useState("");`.
- Line 26: `const [page, setPage] = useState(1);`.
- Line 28: `const recipientsQuery = useQuery({ queryKey: ["notification-recipients"], queryFn: async () => (await api.get("/notifications/recipients", { params: { roles: "guide,driver,agent,ma`.
- Line 29: `const notificationsQuery = useQuery({ queryKey: ["admin-notifications", page], queryFn: async () => (await api.get("/notifications", { params: { page, limit: 5 } })).data });`.
- Line 30: `const recipients = recipientsQuery.data?.recipients || [];`.
- Line 31: `const notifications = notificationsQuery.data?.notifications || notificationsQuery.data?.data || [];`.
- Line 32: `const totalPages = Math.max(1, Number(notificationsQuery.data?.pages || notificationsQuery.data?.totalPages || 1));`.
- Line 33: `const filteredRecipients = useMemo(() => { const term = recipientSearch.trim().toLowerCase(); if (!term) return recipients; return recipients.filter((user) => \`${userLabel(user)} `.
- Line 34: `const selectedCount = recipientIds.length;`.
- Line 35: `const canSend = Boolean(title.trim() && message.trim() && (roles.length || recipientIds.length));`.
- Line 37: `const sendMutation = useMutation({`.
- Line 42: `const toggleRole = (role) => setRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role]);`.
- Line 43: `const toggleRecipient = (id) => setRecipientIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);`.
- Line 44: `const toggleVisibleRecipients = () => { const visibleIds = filteredRecipients.map((user) => user._id).filter(Boolean); const allSelected = visibleIds.length > 0 && visibleIds.every`.
- Line 45: `const clearComposer = () => { setTitle(""); setMessage(""); setActionUrl(""); setRecipientIds([]); setRoles([]); };`.
- Line 46: `const submit = (event) => { event.preventDefault(); if (!title.trim() || !message.trim()) return toast.error("Enter a notification title and message."); if (!roles.length && !recip`.
- Line 47: `const formatDate = (value) => { if (!value) return "Date unavailable"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString(`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
