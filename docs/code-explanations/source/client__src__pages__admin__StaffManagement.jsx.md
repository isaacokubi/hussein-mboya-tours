# Source explanation: client/src/pages/admin/StaffManagement.jsx

**Source:** [client/src/pages/admin/StaffManagement.jsx](../../../client/src/pages/admin/StaffManagement.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Search`, `UserCheck`, `UserX`, `UserPlus`, `Pencil`, `Trash2`, `X`, `Users`, `UserRoundCheck`, `UserRoundX`, `BriefcaseBusiness`, `AlertTriangle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `createStaff`, `updateStaff`, `updateStaffStatus`, `deleteStaff` from `../../api/adminUserApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminUserApi](../../../client/src/api/adminUserApi.js)

## Runtime declarations and data flow

### `StaffManagement` — lines 12–37

Parameters: none.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. React hooks used: useState, useEffect, useQuery, useMemo, useMutation. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const [searchInput, setSearchInput] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const [modal, setModal] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const [deleteTarget, setDeleteTarget] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [form, setForm] = useState(emptyForm);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `useEffect(() => { const timer = setTimeout(() => setSearch(searchInput), 350); return () => clearTimeout(timer); }, [searchInput]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const staffQuery = useQuery({ queryKey: ["staff", "admin", search], queryFn: async () => (await api.get("/staff", { params: { includeInactive: true, limit: 100, search } })).data, staleTime: 15_000 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `const staff = useMemo(() => Array.isArray(staffQuery.data?.data) ? staffQuery.data.data : [], [staffQuery.data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const active = staff.filter((member) => member.isActive !== false && member.status === "active").length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const refresh = () => { qc.invalidateQueries({ queryKey: ["staff", "admin"] }); qc.invalidateQueries({ queryKey: ["admin-users"] }); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const saveMutation = useMutation({ mutationFn: modal?.mode === "edit" ? updateStaff : createStaff, onSuccess: () => { setModal(null); setForm(emptyForm); refresh(); toast.success(modal?.mode === "edit" ? "Staff member up` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const statusMutation = useMutation({ mutationFn: updateStaffStatus, onSuccess: () => { refresh(); toast.success("Staff status updated."); }, onError: (e) => toast.error(e?.response?.data?.message || "Could not update sta` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const deleteMutation = useMutation({ mutationFn: deleteStaff, onSuccess: () => { setDeleteTarget(null); refresh(); toast.success("Staff member permanently deleted."); }, onError: (e) => toast.error(e?.response?.data?.mes` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const openCreate = () => { setForm(emptyForm); setModal({ mode: "create" }); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const openEdit = (member) => { setForm({ id: member._id, name: member.name || "", email: member.email || "", phone: member.phone || "", position: member.position || "guide", role: member.role || "guide", department: memb` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (staffQuery.isLoading) return <div className="min-h-full bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-8 text-slate-600">Loading staff...</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (staffQuery.isError) return <div className="min-h-full bg-gradient-to-br from-slate-100 via-rose-50 to-indigo-100 p-8 text-red-600">Failed to load staff. Please refresh and try again.</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 23–23

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `openCreate` — lines 27–27

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `openEdit` — lines 28–28

Parameters: `member`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Metric` — lines 38–38

Parameters: `{icon, label, value, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 39–39

Parameters: `{label, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Modal` — lines 40–40

Parameters: `{title, onClose, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const emptyForm = { name: "", email: "", phone: "", position: "guide", role: "guide", department: "", employeeNumber: "", employmentType: "full_time", availability: "available", no`.
- Line 9: `const positionLabels = { admin: "Administrator", tour_manager: "Tour Manager", guide: "Guide", driver: "Driver", support: "Support" };`.
- Line 10: `const positionTone = { admin: "bg-violet-100 text-violet-700 ring-violet-200", tour_manager: "bg-indigo-100 text-indigo-700 ring-indigo-200", guide: "bg-cyan-100 text-cyan-700 ring`.
- Line 13: `const qc = useQueryClient();`.
- Line 14: `const [searchInput, setSearchInput] = useState("");`.
- Line 15: `const [search, setSearch] = useState("");`.
- Line 16: `const [modal, setModal] = useState(null);`.
- Line 17: `const [deleteTarget, setDeleteTarget] = useState(null);`.
- Line 18: `const [form, setForm] = useState(emptyForm);`.
- Line 20: `const staffQuery = useQuery({ queryKey: ["staff", "admin", search], queryFn: async () => (await api.get("/staff", { params: { includeInactive: true, limit: 100, search } })).data, `.
- Line 21: `const staff = useMemo(() => Array.isArray(staffQuery.data?.data) ? staffQuery.data.data : [], [staffQuery.data]);`.
- Line 22: `const active = staff.filter((member) => member.isActive !== false && member.status === "active").length;`.
- Line 23: `const refresh = () => { qc.invalidateQueries({ queryKey: ["staff", "admin"] }); qc.invalidateQueries({ queryKey: ["admin-users"] }); };`.
- Line 24: `const saveMutation = useMutation({ mutationFn: modal?.mode === "edit" ? updateStaff : createStaff, onSuccess: () => { setModal(null); setForm(emptyForm); refresh(); toast.success(m`.
- Line 25: `const statusMutation = useMutation({ mutationFn: updateStaffStatus, onSuccess: () => { refresh(); toast.success("Staff status updated."); }, onError: (e) => toast.error(e?.response`.
- Line 26: `const deleteMutation = useMutation({ mutationFn: deleteStaff, onSuccess: () => { setDeleteTarget(null); refresh(); toast.success("Staff member permanently deleted."); }, onError: (`.
- Line 27: `const openCreate = () => { setForm(emptyForm); setModal({ mode: "create" }); };`.
- Line 28: `const openEdit = (member) => { setForm({ id: member._id, name: member.name || "", email: member.email || "", phone: member.phone || "", position: member.position || "guide", role: `.
- Line 38: `function Metric({ icon: Icon, label, value, tone }) { const tones = { sky: "bg-gradient-to-br from-sky-500 to-indigo-600", emerald: "bg-gradient-to-br from-emerald-500 to-teal-600"`.
- Line 39: `function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>{children}</label>; }`.
- Line 40: `function Modal({ title, onClose, children }) { return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="w`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
