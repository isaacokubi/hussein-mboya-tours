# Source explanation: client/src/pages/admin/AdminHeroSlider.jsx

**Source:** [client/src/pages/admin/AdminHeroSlider.jsx](../../../client/src/pages/admin/AdminHeroSlider.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Plus`, `Pencil`, `Trash2`, `Save`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminHeroSlides`, `createAdminHeroSlide`, `updateAdminHeroSlide`, `deleteAdminHeroSlide` from `../../api/adminHeroApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminHeroApi](../../../client/src/api/adminHeroApi.js)

## Runtime declarations and data flow

### `AdminHeroSlider` — lines 9–19

Parameters: none.
React hooks used: useState, useQuery, useMutation.

Key statements:
- **Line 10:** `const qc = useQueryClient(); const [editing, setEditing] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 11:** `const { data, isLoading } = useQuery({ queryKey: ["admin-hero-slides"], queryFn: getAdminHeroSlides });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 12:** `const slides = data?.slides || data?.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const save = useMutation({ mutationFn: (payload) => payload._id ? updateAdminHeroSlide({ id: payload._id, ...payload }) : createAdminHeroSlide(payload), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hero-sl` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const remove = useMutation({ mutationFn: deleteAdminHeroSlide, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hero-slides"] }); qc.invalidateQueries({ queryKey: ["heroSlides"] }); toast.success("Hero slide d` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const submit = e => { e.preventDefault(); save.mutate(editing); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `return <div className="min-h-screen bg-slate-50 p-4 md:p-6"><div className="mx-auto max-w-7xl"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold uppercase tr` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `submit` — lines 15–15

Parameters: `e`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 20–20

Parameters: `{label, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const empty = { title: "", subtitle: "", badge: "Discover Africa", imageUrl: "", videoUrl: "", buttonOneText: "Explore Tours", buttonOneLink: "/tours", buttonTwoText: "Book Now", b`.
- Line 10: `const qc = useQueryClient(); const [editing, setEditing] = useState(null);`.
- Line 11: `const { data, isLoading } = useQuery({ queryKey: ["admin-hero-slides"], queryFn: getAdminHeroSlides });`.
- Line 12: `const slides = data?.slides || data?.data || [];`.
- Line 13: `const save = useMutation({ mutationFn: (payload) => payload._id ? updateAdminHeroSlide({ id: payload._id, ...payload }) : createAdminHeroSlide(payload), onSuccess: () => { qc.inval`.
- Line 14: `const remove = useMutation({ mutationFn: deleteAdminHeroSlide, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hero-slides"] }); qc.invalidateQueries({ queryKey: ["hero`.
- Line 15: `const submit = e => { e.preventDefault(); save.mutate(editing); };`.
- Line 20: `function Field({label,children}) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>; }`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
