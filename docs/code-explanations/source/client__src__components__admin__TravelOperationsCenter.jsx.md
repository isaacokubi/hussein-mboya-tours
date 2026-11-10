# Source explanation: client/src/components/admin/TravelOperationsCenter.jsx

**Source:** [client/src/components/admin/TravelOperationsCenter.jsx](../../../client/src/components/admin/TravelOperationsCenter.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CalendarClock`, `RefreshCw`, `Trash2`, `Zap` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createOperationalAsset`, `createTravelOperation`, `createTravelRule`, `deleteOperationalAsset`, `deleteTravelOperation`, `deleteTravelRule`, `getOperationalAssets`, `getTravelOperations`, `getTravelRules`, `updateOperationalAsset`, `updateTravelOperation`, `updateTravelRule` from `../../api/travelOperationsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/travelOperationsApi](../../../client/src/api/travelOperationsApi.js)

## Runtime declarations and data flow

### `ActionForm` — lines 12–14

Parameters: `{title, icon, children, onSubmit, label}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 13:** `return <form onSubmit={onSubmit} className="rounded-xl border p-4"><h3 className="flex items-center gap-2 font-bold"><Icon size={17} />{title}</h3><div className="mt-3 space-y-2">{children}</div><button type="submit" cla` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `RecordList` — lines 16–18

Parameters: `{title, rows, rules, onStatus, onDelete}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 17:** `return <div className="rounded-xl border p-4"><h3 className="font-bold">{title} ({rows.length})</h3><div className="mt-3 max-h-72 space-y-2 overflow-y-auto">{rows.map((row) => <div key={row._id} className="rounded-lg bg-` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `useActionMutation` — lines 20–22

Parameters: `fn`, `message`, `refresh`.
React hooks used: useMutation.

Key statements:
- **Line 21:** `return useMutation({ mutationFn: fn, onSuccess: () => { refresh(); toast.success(message); }, onError: (error) => toast.error(error?.response?.data?.message || "Operation failed") });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `TravelOperationsCenter` — lines 24–45

Parameters: none.
React hooks used: useState, useQuery. Error control: try=true, catch=false, finally=false.

Key statements:
- **Line 25:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const [operation, setOperation] = useState({ type: "transfer", name: "", code: "", status: "pending", startAt: "", endAt: "", notes: "" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const [asset, setAsset] = useState({ type: "vehicle", name: "", code: "", status: "available", startAt: "", endAt: "", notes: "" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const [rule, setRule] = useState({ type: "dynamic_price", name: "", priority: 0, active: true, config: "{}" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const operations = useQuery({ queryKey: ["travel-operations"], queryFn: getTravelOperations, refetchInterval: 30000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const assets = useQuery({ queryKey: ["operational-assets"], queryFn: getOperationalAssets, refetchInterval: 30000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 31:** `const rules = useQuery({ queryKey: ["travel-rules"], queryFn: getTravelRules, refetchInterval: 60000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** `const refresh = () => ["travel-operations", "operational-assets", "travel-rules"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const addOperation = useActionMutation(createTravelOperation, "Operation created", refresh);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const addAsset = useActionMutation(createOperationalAsset, "Operational record created", refresh);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const addRule = useActionMutation((payload) => createTravelRule({ ...payload, config: JSON.parse(payload.config || "{}") }), "Commercial rule created", refresh);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const editOperation = useActionMutation(({ id, payload }) => updateTravelOperation(id, payload), "Operation updated", refresh);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const editAsset = useActionMutation(({ id, payload }) => updateOperationalAsset(id, payload), "Record updated", refresh);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const editRule = useActionMutation(({ id, payload }) => updateTravelRule(id, payload), "Rule updated", refresh);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const deleteOperation = useActionMutation(deleteTravelOperation, "Operation deleted", refresh);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const deleteAsset = useActionMutation(deleteOperationalAsset, "Record deleted", refresh);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const deleteRule = useActionMutation(deleteTravelRule, "Rule deleted", refresh);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const submitRule = (event) => { event.preventDefault(); try { addRule.mutate(rule); } catch { toast.error("Commercial rule configuration must be valid JSON"); } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 32–32

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submitRule` — lines 42–42

Parameters: `event`.
Error control: try=true, catch=false, finally=false.

Key statements:

## Module-level declarations

- Line 7: `const types = ["transfer", "vehicle", "driver", "guide", "room", "park_fee", "voucher", "traveller_document", "incident"];`.
- Line 8: `const statuses = ["active", "available", "inactive", "pending", "completed", "cancelled", "expired"];`.
- Line 9: `const ruleTypes = ["dynamic_price", "park_fee", "loyalty", "referral"];`.
- Line 10: `const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";`.
- Line 12: `function ActionForm({ title, icon: Icon, children, onSubmit, label }) {`.
- Line 16: `function RecordList({ title, rows, rules, onStatus, onDelete }) {`.
- Line 20: `function useActionMutation(fn, message, refresh) {`.
- Line 25: `const queryClient = useQueryClient();`.
- Line 26: `const [operation, setOperation] = useState({ type: "transfer", name: "", code: "", status: "pending", startAt: "", endAt: "", notes: "" });`.
- Line 27: `const [asset, setAsset] = useState({ type: "vehicle", name: "", code: "", status: "available", startAt: "", endAt: "", notes: "" });`.
- Line 28: `const [rule, setRule] = useState({ type: "dynamic_price", name: "", priority: 0, active: true, config: "{}" });`.
- Line 29: `const operations = useQuery({ queryKey: ["travel-operations"], queryFn: getTravelOperations, refetchInterval: 30000 });`.
- Line 30: `const assets = useQuery({ queryKey: ["operational-assets"], queryFn: getOperationalAssets, refetchInterval: 30000 });`.
- Line 31: `const rules = useQuery({ queryKey: ["travel-rules"], queryFn: getTravelRules, refetchInterval: 60000 });`.
- Line 32: `const refresh = () => ["travel-operations", "operational-assets", "travel-rules"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));`.
- Line 33: `const addOperation = useActionMutation(createTravelOperation, "Operation created", refresh);`.
- Line 34: `const addAsset = useActionMutation(createOperationalAsset, "Operational record created", refresh);`.
- Line 35: `const addRule = useActionMutation((payload) => createTravelRule({ ...payload, config: JSON.parse(payload.config || "{}") }), "Commercial rule created", refresh);`.
- Line 36: `const editOperation = useActionMutation(({ id, payload }) => updateTravelOperation(id, payload), "Operation updated", refresh);`.
- Line 37: `const editAsset = useActionMutation(({ id, payload }) => updateOperationalAsset(id, payload), "Record updated", refresh);`.
- Line 38: `const editRule = useActionMutation(({ id, payload }) => updateTravelRule(id, payload), "Rule updated", refresh);`.
- Line 39: `const deleteOperation = useActionMutation(deleteTravelOperation, "Operation deleted", refresh);`.
- Line 40: `const deleteAsset = useActionMutation(deleteOperationalAsset, "Record deleted", refresh);`.
- Line 41: `const deleteRule = useActionMutation(deleteTravelRule, "Rule deleted", refresh);`.
- Line 42: `const submitRule = (event) => { event.preventDefault(); try { addRule.mutate(rule); } catch { toast.error("Commercial rule configuration must be valid JSON"); } };`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
