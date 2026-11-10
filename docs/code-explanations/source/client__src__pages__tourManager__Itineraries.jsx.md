# Source explanation: client/src/pages/tourManager/Itineraries.jsx

**Source:** [client/src/pages/tourManager/Itineraries.jsx](../../../client/src/pages/tourManager/Itineraries.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CalendarRange`, `CheckCircle2`, `ChevronDown`, `Clock3`, `Edit3`, `Eye`, `FilePlus2`, `Loader2`, `MapPin`, `MoreHorizontal`, `Plus`, `RefreshCw`, `Search`, `Trash2`, `Utensils`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createItinerary`, `deleteItinerary`, `getItineraries`, `getItinerary`, `getTours`, `updateItinerary` from `../../api/tourManagerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourManagerApi](../../../client/src/api/tourManagerApi.js)

## Runtime declarations and data flow

### `EMPTY_DAY` — lines 31–31

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `EMPTY_ACTIVITY` — lines 32–42

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrap` — lines 44–50

Parameters: `data`, `key`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 45:** `if (Array.isArray(data)) return data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `if (Array.isArray(data?.[key])) return data[key];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `if (Array.isArray(data?.data?.[key])) return data.data[key];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `if (Array.isArray(data?.data)) return data.data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `return [];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `asArray` — lines 52–52

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clean` — lines 53–53

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tourLabel` — lines 54–54

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `destinationLabel` — lines 55–59

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 56:** `const destination = tour?.destination;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `if (typeof destination === "string") return destination;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `return destination?.name || destination?.title || tour?.location || "Destination not specified";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `statusClasses` — lines 61–65

Parameters: `status`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 62:** `if (status === "published") return "bg-emerald-50 text-emerald-700 ring-emerald-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `if (status === "archived") return "bg-slate-100 text-slate-600 ring-slate-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `return "bg-amber-50 text-amber-700 ring-amber-200";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Modal` — lines 67–79

Parameters: `{children, onClose, title, subtitle}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 68:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ItineraryForm` — lines 81–196

Parameters: `{initial, tours, onCancel, onSaved}`.
React hooks used: useState. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 82:** `const [form, setForm] = useState(() => ({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 97:** `const [saving, setSaving] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 98:** `const updateDay = (index, patch) => setForm((prev) => ({ ...prev, days: prev.days.map((d, i) => i === index ? { ...d, ...patch } : d) }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 99:** `const updateActivity = (dayIndex, activityIndex, patch) => setForm((prev) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `const addDay = () => setForm((prev) => ({ ...prev, days: [...prev.days, { ...EMPTY_DAY(), dayNumber: prev.days.length + 1, title: \`Day ${prev.days.length + 1}\` }] }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const removeDay = (index) => setForm((prev) => ({ ...prev, days: prev.days.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 })) }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `const addActivity = (dayIndex) => setForm((prev) => ({ ...prev, days: prev.days.map((d, i) => i === dayIndex ? { ...d, activities: [...d.activities, EMPTY_ACTIVITY()] } : d) }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `const removeActivity = (dayIndex, activityIndex) => setForm((prev) => ({ ...prev, days: prev.days.map((d, i) => i === dayIndex ? { ...d, activities: d.activities.filter((_, j) => j !== activityIndex) } : d) }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `const submit = async (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `if (!form.tour) return toast.error("Select a tour before saving the itinerary.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 111:** `if (!form.days.length) return toast.error("Add at least one itinerary day.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 112:** `if (form.days.some((d) => !clean(d.title))) return toast.error("Every itinerary day needs a title.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 113:** `const payload = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 137:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 139:** `const response = initial?._id ? await updateItinerary(initial._id, payload) : await createItinerary(payload);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 147:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateDay` — lines 98–98

Parameters: `index`, `patch`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `updateActivity` — lines 99–102

Parameters: `dayIndex`, `activityIndex`, `patch`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `addDay` — lines 103–103

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `removeDay` — lines 104–104

Parameters: `index`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `addActivity` — lines 105–105

Parameters: `dayIndex`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `removeActivity` — lines 106–106

Parameters: `dayIndex`, `activityIndex`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submit` — lines 108–145

Parameters: `event`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 110:** `if (!form.tour) return toast.error("Select a tour before saving the itinerary.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 111:** `if (!form.days.length) return toast.error("Add at least one itinerary day.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 112:** `if (form.days.some((d) => !clean(d.title))) return toast.error("Every itinerary day needs a title.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 113:** `const payload = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 137:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 139:** `const response = initial?._id ? await updateItinerary(initial._id, payload) : await createItinerary(payload);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `Input` — lines 198–200

Parameters: `{label, value, onChange, type, className}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 199:** `return <label className={className}><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span><input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full ro` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ListField` — lines 201–201

Parameters: `{label, value, onChange}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Itineraries` — lines 203–297

Parameters: none.
React hooks used: useState, useQuery, useMemo, useMutation. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 204:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 205:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 206:** `const [status, setStatus] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 207:** `const [modal, setModal] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 208:** `const [menuId, setMenuId] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 210:** `const itineraryQuery = useQuery({ queryKey: ["tour-manager-itineraries"], queryFn: getItineraries, placeholderData: (previous) => previous });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 211:** `const toursQuery = useQuery({ queryKey: ["tour-manager-itinerary-tours"], queryFn: () => getTours({ limit: 200 }), staleTime: 60_000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 212:** `const items = useMemo(() => unwrap(itineraryQuery.data, "itineraries"), [itineraryQuery.data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 213:** `const tours = useMemo(() => unwrap(toursQuery.data, "tours"), [toursQuery.data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 214:** `const filtered = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 215:** `const q = search.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 216:** `return items.filter((item) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 217:** `const haystack = [item.title, item.name, item.overview, tourLabel(item.tour), destinationLabel(item.tour)].join(" ").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 218:** `return (!q || haystack.includes(q)) && (status === "all" || item.status === status);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 222:** `const deleteMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 228:** `const openEdit = async (item) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 229:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 230:** `const response = await getItinerary(item._id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `openEdit` — lines 228–234

Parameters: `item`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 229:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 230:** `const response = await getItinerary(item._id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 233:** `finally { setMenuId(null); }` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `confirmDelete` — lines 236–239

Parameters: `item`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 238:** `if (window.confirm(\`Delete the itinerary for ${tourLabel(item.tour)}? This cannot be undone.\`)) deleteMutation.mutate(item._id);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `Metric` — lines 299–299

Parameters: `{label, value, icon, accent}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `LoadingState` — lines 300–300

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `EmptyState` — lines 301–301

Parameters: `{hasFilters, onCreate}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

## Module-level declarations

- Line 31: `const EMPTY_DAY = () => ({ dayNumber: 1, title: "Day 1", summary: "", activities: [] });`.
- Line 32: `const EMPTY_ACTIVITY = () => ({`.
- Line 44: `const unwrap = (data, key) => {`.
- Line 52: `const asArray = (value) => (Array.isArray(value) ? value : []);`.
- Line 53: `const clean = (value) => String(value ?? "").trim();`.
- Line 54: `const tourLabel = (tour) => tour?.title || tour?.name || tour?.tourName || "Tour not specified";`.
- Line 55: `const destinationLabel = (tour) => {`.
- Line 56: `const destination = tour?.destination;`.
- Line 61: `function statusClasses(status) {`.
- Line 67: `function Modal({ children, onClose, title, subtitle }) {`.
- Line 81: `function ItineraryForm({ initial, tours, onCancel, onSaved }) {`.
- Line 82: `const [form, setForm] = useState(() => ({`.
- Line 97: `const [saving, setSaving] = useState(false);`.
- Line 98: `const updateDay = (index, patch) => setForm((prev) => ({ ...prev, days: prev.days.map((d, i) => i === index ? { ...d, ...patch } : d) }));`.
- Line 99: `const updateActivity = (dayIndex, activityIndex, patch) => setForm((prev) => ({`.
- Line 103: `const addDay = () => setForm((prev) => ({ ...prev, days: [...prev.days, { ...EMPTY_DAY(), dayNumber: prev.days.length + 1, title: \`Day ${prev.days.length + 1}\` }] }));`.
- Line 104: `const removeDay = (index) => setForm((prev) => ({ ...prev, days: prev.days.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 })) }));`.
- Line 105: `const addActivity = (dayIndex) => setForm((prev) => ({ ...prev, days: prev.days.map((d, i) => i === dayIndex ? { ...d, activities: [...d.activities, EMPTY_ACTIVITY()] } : d) }));`.
- Line 106: `const removeActivity = (dayIndex, activityIndex) => setForm((prev) => ({ ...prev, days: prev.days.map((d, i) => i === dayIndex ? { ...d, activities: d.activities.filter((_, j) => j`.
- Line 108: `const submit = async (event) => {`.
- Line 113: `const payload = {`.
- Line 139: `const response = initial?._id ? await updateItinerary(initial._id, payload) : await createItinerary(payload);`.
- Line 198: `function Input({ label, value, onChange, type = "text", className = "" }) {`.
- Line 201: `function ListField({ label, value, onChange }) { return <label><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span><textarea rows="4" value={value} on`.
- Line 204: `const queryClient = useQueryClient();`.
- Line 205: `const [search, setSearch] = useState("");`.
- Line 206: `const [status, setStatus] = useState("all");`.
- Line 207: `const [modal, setModal] = useState(null);`.
- Line 208: `const [menuId, setMenuId] = useState(null);`.
- Line 210: `const itineraryQuery = useQuery({ queryKey: ["tour-manager-itineraries"], queryFn: getItineraries, placeholderData: (previous) => previous });`.
- Line 211: `const toursQuery = useQuery({ queryKey: ["tour-manager-itinerary-tours"], queryFn: () => getTours({ limit: 200 }), staleTime: 60_000 });`.
- Line 212: `const items = useMemo(() => unwrap(itineraryQuery.data, "itineraries"), [itineraryQuery.data]);`.
- Line 213: `const tours = useMemo(() => unwrap(toursQuery.data, "tours"), [toursQuery.data]);`.
- Line 214: `const filtered = useMemo(() => {`.
- Line 215: `const q = search.trim().toLowerCase();`.
- Line 217: `const haystack = [item.title, item.name, item.overview, tourLabel(item.tour), destinationLabel(item.tour)].join(" ").toLowerCase();`.
- Line 222: `const deleteMutation = useMutation({`.
- Line 228: `const openEdit = async (item) => {`.
- Line 230: `const response = await getItinerary(item._id);`.
- Line 236: `const confirmDelete = (item) => {`.
- Line 241: `const published = items.filter((x) => x.status === "published").length;`.
- Line 242: `const drafts = items.filter((x) => x.status === "draft").length;`.
- Line 243: `const days = items.reduce((sum, x) => sum + asArray(x.days).length, 0);`.
- Line 277: `const itemDays = asArray(item.days);`.
- Line 278: `const activityCount = itemDays.reduce((sum, day) => sum + asArray(day.activities).length, 0);`.
- Line 299: `function Metric({ label, value, icon, accent = "slate" }) { const colors = { slate: "bg-white/10 text-white", emerald: "bg-emerald-400/15 text-emerald-300", amber: "bg-amber-400/15`.
- Line 300: `function LoadingState() { return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1,2,3].map((x) => <div key={x} className="h-72 animate-pulse rounded-2xl border border-`.
- Line 301: `function EmptyState({ hasFilters, onCreate }) { return <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm"><div className="`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
