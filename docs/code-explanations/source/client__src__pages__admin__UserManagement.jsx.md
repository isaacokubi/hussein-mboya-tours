# Source explanation: client/src/pages/admin/UserManagement.jsx

**Source:** [client/src/pages/admin/UserManagement.jsx](../../../client/src/pages/admin/UserManagement.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Search`, `Trash2`, `UserCheck`, `UserX`, `UserPlus`, `Pencil`, `X`, `ShieldCheck`, `Users`, `UserRoundCheck`, `UserRoundX` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useDebouncedValue` from `../../hooks/useDebouncedValue`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/hooks/useDebouncedValue](../../../client/src/hooks/useDebouncedValue.js)
- `getAdminUsers`, `updateUserStatus`, `updateUserProfile`, `deleteUser`, `createStaffAccount` from `../../api/adminUserApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminUserApi](../../../client/src/api/adminUserApi.js)

## Runtime declarations and data flow

### `labelRole` — lines 10–10

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `roleTone` — lines 11–11

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `UserManagement` — lines 13–42

Parameters: none.
React hooks used: useState, useQuery, useMemo, useMutation. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const [page, setPage] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const [modal, setModal] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [form, setForm] = useState(emptyForm);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const debouncedSearch = useDebouncedValue(search, 350);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const query = useQuery({ queryKey: ["admin-users", debouncedSearch, page], queryFn: () => getAdminUsers({ search: debouncedSearch, page, limit: 10 }), placeholderData: (previous) => previous, staleTime: 15_000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const users = useMemo(() => Array.isArray(query.data?.data) ? query.data.data : [], [query.data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const totalPages = Math.max(1, Number(query.data?.pages || query.data?.pagination?.pages || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const active = users.filter((u) => u.isActive).length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const disabled = users.length - active;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const refresh = () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); queryClient.invalidateQueries({ queryKey: ["staff", "admin"] }); queryClient.invalidateQueries({ queryKey: ["agents"] }); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const statusMutation = useMutation({ mutationFn: updateUserStatus, onSuccess: () => { refresh(); toast.success("User status updated."); }, onError: (e) => toast.error(e?.response?.data?.message || "Could not update user.` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const saveMutation = useMutation({ mutationFn: modal?.mode === "edit" ? updateUserProfile : createStaffAccount, onSuccess: () => { setModal(null); setForm(emptyForm); refresh(); toast.success(modal?.mode === "edit" ? "Us` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const deleteMutation = useMutation({ mutationFn: deleteUser, onSuccess: () => { refresh(); toast.success("User account deleted."); }, onError: (e) => toast.error(e?.response?.data?.message || "Could not delete user.") })` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const openCreate = () => { setForm(emptyForm); setModal({ mode: "create" }); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 25–25

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `openCreate` — lines 29–29

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `openEdit` — lines 30–30

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submit` — lines 31–31

Parameters: `e`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `Metric` — lines 43–43

Parameters: `{icon, label, value, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 44–44

Parameters: `{label, hint, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Modal` — lines 45–45

Parameters: `{title, onClose, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const roles = ["admin", "manager", "agent", "guide", "driver"];`.
- Line 9: `<sensitive declaration redacted>`.
- Line 10: `const labelRole = (role) => String(role || "customer").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());`.
- Line 11: `const roleTone = (role) => ({ customer: "bg-sky-100 text-sky-700 ring-sky-200", admin: "bg-violet-100 text-violet-700 ring-violet-200", manager: "bg-indigo-100 text-indigo-700 ring`.
- Line 14: `const queryClient = useQueryClient();`.
- Line 15: `const [search, setSearch] = useState("");`.
- Line 16: `const [page, setPage] = useState(1);`.
- Line 17: `const [modal, setModal] = useState(null);`.
- Line 18: `const [form, setForm] = useState(emptyForm);`.
- Line 19: `const debouncedSearch = useDebouncedValue(search, 350);`.
- Line 20: `const query = useQuery({ queryKey: ["admin-users", debouncedSearch, page], queryFn: () => getAdminUsers({ search: debouncedSearch, page, limit: 10 }), placeholderData: (previous) =`.
- Line 21: `const users = useMemo(() => Array.isArray(query.data?.data) ? query.data.data : [], [query.data]);`.
- Line 22: `const totalPages = Math.max(1, Number(query.data?.pages || query.data?.pagination?.pages || 1));`.
- Line 23: `const active = users.filter((u) => u.isActive).length;`.
- Line 24: `const disabled = users.length - active;`.
- Line 25: `const refresh = () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); queryClient.invalidateQueries({ queryKey: ["staff", "admin"] }); queryClient.invalidateQueries`.
- Line 26: `const statusMutation = useMutation({ mutationFn: updateUserStatus, onSuccess: () => { refresh(); toast.success("User status updated."); }, onError: (e) => toast.error(e?.response?.`.
- Line 27: `const saveMutation = useMutation({ mutationFn: modal?.mode === "edit" ? updateUserProfile : createStaffAccount, onSuccess: () => { setModal(null); setForm(emptyForm); refresh(); to`.
- Line 28: `const deleteMutation = useMutation({ mutationFn: deleteUser, onSuccess: () => { refresh(); toast.success("User account deleted."); }, onError: (e) => toast.error(e?.response?.data?`.
- Line 29: `const openCreate = () => { setForm(emptyForm); setModal({ mode: "create" }); };`.
- Line 30: `<sensitive declaration redacted>`.
- Line 31: `<sensitive declaration redacted>`.
- Line 32: `const roleOptions = modal?.mode === "edit" && form.role === "customer" ? ["customer", ...roles] : roles;`.
- Line 33: `const customerLocked = modal?.mode === "edit" && form.role === "customer";`.
- Line 43: `function Metric({ icon: Icon, label, value, tone }) { const tones = { sky: "bg-gradient-to-br from-sky-500 to-indigo-600", emerald: "bg-gradient-to-br from-emerald-500 to-teal-600"`.
- Line 44: `function Field({ label, hint, children }) { return <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>{children}{hint && <span c`.
- Line 45: `function Modal({ title, onClose, children }) { return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="w`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
