# Source explanation: client/src/pages/admin/Vehicles.jsx

**Source:** [client/src/pages/admin/Vehicles.jsx](../../../client/src/pages/admin/Vehicles.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Car`, `CheckCircle2`, `ChevronDown`, `Image`, `RefreshCw`, `Search`, `Users`, `Wrench`, `X`, `Trash2`, `Pencil` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getVehicles`, `deleteVehicle`, `assignDriver`, `getDrivers` from `../../api/vehicleApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/vehicleApi](../../../client/src/api/vehicleApi.js)
- `AddVehicleModal` from `../../components/admin/AddVehicleModal`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/AddVehicleModal](../../../client/src/components/admin/AddVehicleModal.jsx)

## Runtime declarations and data flow

### `statusLabel` — lines 8–8

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusTone` — lines 9–15

Parameters: `value`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `const s = String(value || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (s === "available") return "bg-emerald-50 text-emerald-700 ring-emerald-100";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `if (s === "assigned") return "blue";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (s === "maintenance") return "amber";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `return "red";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `imageUrl` — lines 16–16

Parameters: `vehicle`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Vehicles` — lines 18–115

Parameters: none.
React hooks used: useState, useQuery, useMutation, useMemo. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const [showAdd, setShowAdd] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const [editingVehicle, setEditingVehicle] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [statusFilter, setStatusFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const { data, isLoading, isError, error, isFetching, refetch } = useQuery({ queryKey: ["vehicles"], queryFn: getVehicles, staleTime: 15000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const { data: driversData } = useQuery({ queryKey: ["admin-vehicle-drivers"], queryFn: getDrivers, staleTime: 30000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const vehicles = Array.isArray(data?.data) ? data.data : Array.isArray(data?.vehicles) ? data.vehicles : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const drivers = Array.isArray(driversData?.data) ? driversData.data : Array.isArray(driversData?.drivers) ? driversData.drivers : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const removeMutation = useMutation({ mutationFn: deleteVehicle, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["vehicles"] }); toast.success("Vehicle removed successfully"); }, onError: (e) => ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `const assignMutation = useMutation({ mutationFn: ({ vehicleId, driverId }) => assignDriver(vehicleId, driverId), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["vehicles"] }); toast.success("Dr` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `const filteredVehicles = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 33:** `const q = search.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `return vehicles.filter((v) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 35:** `const matchesSearch = !q || [v.name, v.registrationNumber, v.registration, v.type, v.model, v.manufacturer, v.driver?.name].some((value) => String(value || "").toLowerCase().includes(q));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const matchesStatus = statusFilter === "all" || String(v.status || "").toLowerCase() === statusFilter;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `return matchesSearch && matchesStatus;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 41:** `const stats = useMemo(() => ({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleAssign` — lines 48–58

Parameters: `vehicleId`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 49:** `if (!drivers.length) return toast.info("No active drivers are available to assign.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `const vehicle = vehicles.find((v) => v._id === vehicleId);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 51:** `const current = vehicle?.driver?._id || vehicle?.driver || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const name = window.prompt(\`Enter driver name (available: ${drivers.map((d) => d.name).join(", ")})\`, vehicle?.driver?.name || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `if (!name?.trim()) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `const driver = drivers.find((d) => String(d.name || "").trim().toLowerCase() === name.trim().toLowerCase());` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 55:** `if (!driver) return toast.error("Driver not found. Use one of the names shown.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `if (String(driver._id) === String(current)) return toast.info("This driver is already assigned.");` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `handleRemove` — lines 60–62

Parameters: `id`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 61:** `if (window.confirm("Remove this vehicle from the active fleet? This is a soft delete.")) removeMutation.mutate(id);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `VehicleRow` — lines 117–131

Parameters: `{vehicle, onEdit, onAssign, onDelete, busy}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 118:** `const src = imageUrl(vehicle);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 119:** `const tone = statusTone(vehicle.status);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 120:** `const statusClasses = tone === "blue" ? "bg-blue-50 text-blue-700 ring-blue-100" : tone === "amber" ? "bg-amber-50 text-amber-700 ring-amber-100" : tone === "red" ? "bg-red-50 text-red-700 ring-red-100" : tone;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 121:** `return <tr className="border-b border-slate-100 transition hover:bg-emerald-50/40 last:border-0">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Metric` — lines 133–133

Parameters: `{title, value, icon}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Header` — lines 134–134

Parameters: `{children, align}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `LoadingState` — lines 135–135

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ErrorState` — lines 136–136

Parameters: `{message, retry}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const statusLabel = (value) => String(value || "available").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());`.
- Line 9: `const statusTone = (value) => {`.
- Line 10: `const s = String(value || "").toLowerCase();`.
- Line 16: `const imageUrl = (vehicle) => vehicle?.image?.url || vehicle?.image?.secure_url || (typeof vehicle?.image === "string" ? vehicle.image : "");`.
- Line 19: `const queryClient = useQueryClient();`.
- Line 20: `const [showAdd, setShowAdd] = useState(false);`.
- Line 21: `const [editingVehicle, setEditingVehicle] = useState(null);`.
- Line 22: `const [search, setSearch] = useState("");`.
- Line 23: `const [statusFilter, setStatusFilter] = useState("all");`.
- Line 24: `const { data, isLoading, isError, error, isFetching, refetch } = useQuery({ queryKey: ["vehicles"], queryFn: getVehicles, staleTime: 15000 });`.
- Line 25: `const { data: driversData } = useQuery({ queryKey: ["admin-vehicle-drivers"], queryFn: getDrivers, staleTime: 30000 });`.
- Line 26: `const vehicles = Array.isArray(data?.data) ? data.data : Array.isArray(data?.vehicles) ? data.vehicles : [];`.
- Line 27: `const drivers = Array.isArray(driversData?.data) ? driversData.data : Array.isArray(driversData?.drivers) ? driversData.drivers : [];`.
- Line 29: `const removeMutation = useMutation({ mutationFn: deleteVehicle, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["vehicles"] }); toast.success("Vehicle rem`.
- Line 30: `const assignMutation = useMutation({ mutationFn: ({ vehicleId, driverId }) => assignDriver(vehicleId, driverId), onSuccess: async () => { await queryClient.invalidateQueries({ quer`.
- Line 32: `const filteredVehicles = useMemo(() => {`.
- Line 33: `const q = search.trim().toLowerCase();`.
- Line 35: `const matchesSearch = !q || [v.name, v.registrationNumber, v.registration, v.type, v.model, v.manufacturer, v.driver?.name].some((value) => String(value || "").toLowerCase().includ`.
- Line 36: `const matchesStatus = statusFilter === "all" || String(v.status || "").toLowerCase() === statusFilter;`.
- Line 41: `const stats = useMemo(() => ({`.
- Line 48: `const handleAssign = (vehicleId) => {`.
- Line 50: `const vehicle = vehicles.find((v) => v._id === vehicleId);`.
- Line 51: `const current = vehicle?.driver?._id || vehicle?.driver || "";`.
- Line 52: `const name = window.prompt(\`Enter driver name (available: ${drivers.map((d) => d.name).join(", ")})\`, vehicle?.driver?.name || "");`.
- Line 54: `const driver = drivers.find((d) => String(d.name || "").trim().toLowerCase() === name.trim().toLowerCase());`.
- Line 60: `const handleRemove = (id) => {`.
- Line 117: `function VehicleRow({ vehicle, onEdit, onAssign, onDelete, busy }) {`.
- Line 118: `const src = imageUrl(vehicle);`.
- Line 119: `const tone = statusTone(vehicle.status);`.
- Line 120: `const statusClasses = tone === "blue" ? "bg-blue-50 text-blue-700 ring-blue-100" : tone === "amber" ? "bg-amber-50 text-amber-700 ring-amber-100" : tone === "red" ? "bg-red-50 text`.
- Line 133: `function Metric({ title, value, icon: Icon }) { return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between ga`.
- Line 134: `function Header({ children, align = "left" }) { return <th className={\`${align === "right" ? "text-right" : "text-left"} whitespace-nowrap p-4 text-xs font-black uppercase trackin`.
- Line 135: `function LoadingState() { return <div className="min-h-screen bg-slate-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-36 rounded-3xl bg`.
- Line 136: `function ErrorState({ message, retry }) { return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
