# Source explanation: client/src/components/admin/TravelServiceDesk.jsx

**Source:** [client/src/components/admin/TravelServiceDesk.jsx](../../../client/src/components/admin/TravelServiceDesk.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `CalendarClock`, `Car`, `ClipboardList`, `FileText`, `Hotel`, `ShieldCheck`, `Plane` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createTravelServiceRequest`, `getTravelServiceRequests`, `getTravelServiceSummary`, `updateTravelServiceRequest` from `../../api/travelServiceRequestApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/travelServiceRequestApi](../../../client/src/api/travelServiceRequestApi.js)

## Runtime declarations and data flow

### `labelFor` — lines 13–13

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 13:** `(value) => types.find(([id]) => id === value)?.[1] || String(value || "").replaceAll("_", " ")` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `TravelServiceDesk` — lines 15–35

Parameters: none.
React hooks used: useState, useQuery, useMemo, useMutation.

Key statements:
- **Line 16:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const [filter, setFilter] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [status, setStatus] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [notice, setNotice] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const { data: listResponse, isLoading } = useQuery({ queryKey: ["travel-service-requests", filter, status], queryFn: () => getTravelServiceRequests({ type: filter || undefined, status: status || undefined }), refetchInte` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const { data: summaryResponse } = useQuery({ queryKey: ["travel-service-summary"], queryFn: getTravelServiceSummary, refetchInterval: 60000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const rows = useMemo(() => listResponse?.data?.data || listResponse?.data || [], [listResponse]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const summary = summaryResponse?.data?.data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const createMutation = useMutation({ mutationFn: createTravelServiceRequest, onSuccess: () => { setNotice("Service request created."); qc.invalidateQueries({ queryKey: ["travel-service-requests"] }); qc.invalidateQueries` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const updateMutation = useMutation({ mutationFn: ({ id, payload }) => updateTravelServiceRequest(id, payload), onSuccess: () => { setNotice("Request updated."); qc.invalidateQueries({ queryKey: ["travel-service-requests"` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const submit = (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); createMutation.mutate({ type: f.get("type"), title: f.get("title"), description: f.get("description"), requestedDate: f.get("requestedD` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `return <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Open" value={summary.byStatus?.find(x => x._id === "open")?.count || 0}/><Stat label="In progress" value={summary.byStatus?.find(x => x._id === ` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `submit` — lines 26–26

Parameters: `e`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `RequestRow` — lines 36–36

Parameters: `{row, onUpdate, busy}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Stat` — lines 37–37

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 38–38

Parameters: `{name, label, type, required}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Select` — lines 39–39

Parameters: `{name, label, options, labels}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const types = [`.
- Line 11: `const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";`.
- Line 12: `const btn = "rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50";`.
- Line 13: `const labelFor = (value) => types.find(([id]) => id === value)?.[1] || String(value || "").replaceAll("_", " ");`.
- Line 16: `const qc = useQueryClient();`.
- Line 17: `const [filter, setFilter] = useState("");`.
- Line 18: `const [status, setStatus] = useState("");`.
- Line 19: `const [notice, setNotice] = useState("");`.
- Line 20: `const { data: listResponse, isLoading } = useQuery({ queryKey: ["travel-service-requests", filter, status], queryFn: () => getTravelServiceRequests({ type: filter || undefined, sta`.
- Line 21: `const { data: summaryResponse } = useQuery({ queryKey: ["travel-service-summary"], queryFn: getTravelServiceSummary, refetchInterval: 60000 });`.
- Line 22: `const rows = useMemo(() => listResponse?.data?.data || listResponse?.data || [], [listResponse]);`.
- Line 23: `const summary = summaryResponse?.data?.data || {};`.
- Line 24: `const createMutation = useMutation({ mutationFn: createTravelServiceRequest, onSuccess: () => { setNotice("Service request created."); qc.invalidateQueries({ queryKey: ["travel-ser`.
- Line 25: `const updateMutation = useMutation({ mutationFn: ({ id, payload }) => updateTravelServiceRequest(id, payload), onSuccess: () => { setNotice("Request updated."); qc.invalidateQuerie`.
- Line 26: `const submit = (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); createMutation.mutate({ type: f.get("type"), title: f.get("title"), description: f.get("descrip`.
- Line 36: `function RequestRow({ row, onUpdate, busy }) { return <tr className="border-t"><td className="p-3 capitalize">{labelFor(row.type)}</td><td className="p-3"><div className="font-semi`.
- Line 37: `function Stat({ label, value }) { return <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-b`.
- Line 38: `function Field({ name, label, type="text", required }) { return <label className="block text-xs font-semibold text-slate-600">{label}<input name={name} type={type} required={requir`.
- Line 39: `function Select({ name, label, options, labels={} }) { return <label className="block text-xs font-semibold text-slate-600">{label}<select name={name} className={input}>{options.ma`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
