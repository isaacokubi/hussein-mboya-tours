# Source explanation: client/src/pages/admin/AdminGallery.jsx

**Source:** [client/src/pages/admin/AdminGallery.jsx](../../../client/src/pages/admin/AdminGallery.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `RefreshCw`, `Image`, `Pencil`, `Trash2`, `Plus`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `getAdminGallery`, `createGallery`, `updateGallery`, `deleteGallery` from `../../api/adminGalleryApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminGalleryApi](../../../client/src/api/adminGalleryApi.js)
- `getAdminExperiences`, `createExperience`, `updateExperience`, `deleteExperience` from `../../api/adminExperienceApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminExperienceApi](../../../client/src/api/adminExperienceApi.js)

## Runtime declarations and data flow

### `imageUrl` — lines 10–10

Parameters: `item`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeList` — lines 11–11

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AdminGallery` — lines 13–84

Parameters: none.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. React hooks used: useState, useQuery, useMemo, useMutation. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const [tab, setTab] = useState("gallery");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const [editingGallery, setEditingGallery] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const [editingExperience, setEditingExperience] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [galleryForm, setGalleryForm] = useState(emptyGallery);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [experienceForm, setExperienceForm] = useState(emptyExperience);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const [uploading, setUploading] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const galleryQuery = useQuery({ queryKey: ["admin-gallery"], queryFn: getAdminGallery, staleTime: 0, refetchOnWindowFocus: true });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const experienceQuery = useQuery({ queryKey: ["admin-experiences"], queryFn: getAdminExperiences, staleTime: 0, refetchOnWindowFocus: true });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const gallery = useMemo(() => normalizeList(galleryQuery.data), [galleryQuery.data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const experiences = useMemo(() => normalizeList(experienceQuery.data), [experienceQuery.data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const refresh = () => { galleryQuery.refetch(); experienceQuery.refetch(); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const saveGallery = useMutation({ mutationFn: () => editingGallery ? updateGallery(editingGallery, galleryForm) : createGallery(galleryForm), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-gallery"] }); setE` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const removeGallery = useMutation({ mutationFn: deleteGallery, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-gallery"] }) });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const saveExperience = useMutation({ mutationFn: () => editingExperience ? updateExperience(editingExperience, experienceForm) : createExperience(experienceForm), onSuccess: () => { qc.invalidateQueries({ queryKey: ["adm` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 31:** `const removeExperience = useMutation({ mutationFn: deleteExperience, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-experiences"] }) });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 33:** `const uploadImage = async (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const file = event.target.files?.[0]; if (!file) return;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 27–27

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `uploadImage` — lines 33–40

Parameters: `event`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `const file = event.target.files?.[0]; if (!file) return;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `if (!file.type.startsWith("image/")) return window.alert("Please select an image file.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `const data = new FormData(); data.append("image", file);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `try { setUploading(true); const response = await api.post("/admin/gallery/upload", data, { headers: { "Content-Type": "multipart/form-data" } }); const uploaded = response.data?.image || {}; setGalleryForm((prev) => ({ .` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 38:** `catch (error) { window.alert(error.response?.data?.message || "Image upload failed"); }` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.
- **Line 39:** `finally { setUploading(false); }` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `startGalleryEdit` — lines 42–42

Parameters: `item`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `startExperienceEdit` — lines 43–43

Parameters: `item`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const emptyGallery = { title: "", category: "Safari", imageUrl: "", publicId: "", featured: false, active: true };`.
- Line 9: `const emptyExperience = { name: "", slug: "", icon: "Map", description: "", image: "", active: true };`.
- Line 10: `const imageUrl = (item) => item?.image?.url || item?.image?.secure_url || item?.image?.path || item?.imageUrl || "";`.
- Line 11: `const normalizeList = (value) => Array.isArray(value) ? value : value?.data || value?.gallery || value?.images || value?.categories || value?.experiences || [];`.
- Line 14: `const qc = useQueryClient();`.
- Line 15: `const [tab, setTab] = useState("gallery");`.
- Line 16: `const [editingGallery, setEditingGallery] = useState(null);`.
- Line 17: `const [editingExperience, setEditingExperience] = useState(null);`.
- Line 18: `const [galleryForm, setGalleryForm] = useState(emptyGallery);`.
- Line 19: `const [experienceForm, setExperienceForm] = useState(emptyExperience);`.
- Line 20: `const [uploading, setUploading] = useState(false);`.
- Line 22: `const galleryQuery = useQuery({ queryKey: ["admin-gallery"], queryFn: getAdminGallery, staleTime: 0, refetchOnWindowFocus: true });`.
- Line 23: `const experienceQuery = useQuery({ queryKey: ["admin-experiences"], queryFn: getAdminExperiences, staleTime: 0, refetchOnWindowFocus: true });`.
- Line 24: `const gallery = useMemo(() => normalizeList(galleryQuery.data), [galleryQuery.data]);`.
- Line 25: `const experiences = useMemo(() => normalizeList(experienceQuery.data), [experienceQuery.data]);`.
- Line 27: `const refresh = () => { galleryQuery.refetch(); experienceQuery.refetch(); };`.
- Line 28: `const saveGallery = useMutation({ mutationFn: () => editingGallery ? updateGallery(editingGallery, galleryForm) : createGallery(galleryForm), onSuccess: () => { qc.invalidateQuerie`.
- Line 29: `const removeGallery = useMutation({ mutationFn: deleteGallery, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-gallery"] }) });`.
- Line 30: `const saveExperience = useMutation({ mutationFn: () => editingExperience ? updateExperience(editingExperience, experienceForm) : createExperience(experienceForm), onSuccess: () => `.
- Line 31: `const removeExperience = useMutation({ mutationFn: deleteExperience, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-experiences"] }) });`.
- Line 33: `const uploadImage = async (event) => {`.
- Line 34: `const file = event.target.files?.[0]; if (!file) return;`.
- Line 36: `const data = new FormData(); data.append("image", file);`.
- Line 42: `const startGalleryEdit = (item) => { setEditingGallery(item._id); setGalleryForm({ title: item.title || "", category: item.category || "Safari", imageUrl: imageUrl(item), publicId:`.
- Line 43: `const startExperienceEdit = (item) => { setEditingExperience(item._id); setExperienceForm({ name: item.name || "", slug: item.slug || "", icon: item.icon || "Map", description: ite`.
- Line 44: `const loading = galleryQuery.isLoading || experienceQuery.isLoading;`.
- Line 45: `const error = galleryQuery.error || experienceQuery.error;`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
