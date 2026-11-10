# Source explanation: client/src/components/admin/TenantHeroManager.jsx

**Source:** [client/src/components/admin/TenantHeroManager.jsx](../../../client/src/components/admin/TenantHeroManager.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Plus`, `Pencil`, `Trash2`, `Save`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminHeroSlides`, `createAdminHeroSlide`, `updateAdminHeroSlide`, `deleteAdminHeroSlide` from `../../api/adminHeroApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminHeroApi](../../../client/src/api/adminHeroApi.js)

## Runtime declarations and data flow

### `TenantHeroManager` — lines 8–21

Parameters: none.
React hooks used: useState, useQuery, useMutation.

Key statements:
- **Line 9:** `const qc = useQueryClient(); const [form, setForm] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 10:** `const { data, isLoading } = useQuery({ queryKey: ["admin-hero-slides"], queryFn: getAdminHeroSlides });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 11:** `const slides = data?.slides || data?.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const save = useMutation({ mutationFn: x => x._id ? updateAdminHeroSlide({ id: x._id, ...x }) : createAdminHeroSlide(x), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hero-slides"] }); qc.invalidateQueries(` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const remove = useMutation({ mutationFn: deleteAdminHeroSlide, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hero-slides"] }); qc.invalidateQueries({ queryKey: ["heroSlides"] }); toast.success("Hero slide d` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const edit = s => setForm({ ...blank, _id: s._id, title: s.title || "", subtitle: s.subtitle || "", badge: s.badge || "", imageUrl: s.image?.url || "", videoUrl: s.video?.url || "", buttonOneText: s.buttonOne?.text || "E` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const field = (key, label, type="text") => <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>{type === "textarea" ? <textarea rows="2" value={form[key]} onChange={e=` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const submit = () => save.mutate(form);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-bold">Tenant Hero Slider</h2><p className="text-sm` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `edit` — lines 14–14

Parameters: `s`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `field` — lines 15–15

Parameters: `key`, `label`, `type (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submit` — lines 16–16

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const blank = { title: "", subtitle: "", badge: "Discover Africa", imageUrl: "", videoUrl: "", buttonOneText: "Explore Tours", buttonOneLink: "/tours", buttonTwoText: "Book Now", b`.
- Line 9: `const qc = useQueryClient(); const [form, setForm] = useState(null);`.
- Line 10: `const { data, isLoading } = useQuery({ queryKey: ["admin-hero-slides"], queryFn: getAdminHeroSlides });`.
- Line 11: `const slides = data?.slides || data?.data || [];`.
- Line 12: `const save = useMutation({ mutationFn: x => x._id ? updateAdminHeroSlide({ id: x._id, ...x }) : createAdminHeroSlide(x), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin`.
- Line 13: `const remove = useMutation({ mutationFn: deleteAdminHeroSlide, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hero-slides"] }); qc.invalidateQueries({ queryKey: ["hero`.
- Line 14: `const edit = s => setForm({ ...blank, _id: s._id, title: s.title || "", subtitle: s.subtitle || "", badge: s.badge || "", imageUrl: s.image?.url || "", videoUrl: s.video?.url || ""`.
- Line 15: `const field = (key, label, type="text") => <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>{type === "textarea" ? <textarea`.
- Line 16: `const submit = () => save.mutate(form);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
