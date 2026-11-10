# Source explanation: client/src/pages/tourManager/CreateTour.jsx

**Source:** [client/src/pages/tourManager/CreateTour.jsx](../../../client/src/pages/tourManager/CreateTour.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useLocation`, `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CalendarDays`, `CarFront`, `CheckCircle2`, `ChevronLeft`, `CircleAlert`, `Compass`, `ImagePlus`, `MapPin`, `ShieldCheck`, `Users`, `UserRound`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getDestinations` from `../../api/destinationApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/destinationApi](../../../client/src/api/destinationApi.js)
- `createTour`, `getDrivers`, `getGuides`, `getVehicles` from `../../api/tourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourApi](../../../client/src/api/tourApi.js)
- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)

## Runtime declarations and data flow

### `createItineraryDay` — lines 12–12

Parameters: `day`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `linesFromText` — lines 13–13

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrapList` — lines 14–14

Parameters: `response`, `keys (defaulted)`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `cleanLabel` — lines 15–15

Parameters: `value`, `fallback`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `CreateTour` — lines 20–127

Parameters: none.
React hooks used: useState, useQuery, useMemo, useMutation. 25 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `const navigate = useNavigate(); const location = useLocation(); const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const returnPath = location.state?.returnTo === "/admin/tours" ? "/admin/tours" : "/tour-manager/tours";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const companyName = String(settings.companyName || settings.displayName || settings.organizationName || "Global Tours").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const [form, setForm] = useState(emptyForm); const [itineraryDays, setItineraryDays] = useState([createItineraryDay(1)]); const [imageFiles, setImageFiles] = useState([]); const [imageError, setImageError] = useState("")` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const { data: destinationsData, isLoading: destinationsLoading, isError: destinationsError, refetch: refetchDestinations } = useQuery({ queryKey: ["destinations"], queryFn: getDestinations, retry: 1 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const { data: guidesData, isLoading: guidesLoading, error: guidesError, refetch: refetchGuides } = useQuery({ queryKey: ["tour-assignment-guides"], queryFn: getGuides, retry: 1 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const { data: driversData, isLoading: driversLoading, error: driversError, refetch: refetchDrivers } = useQuery({ queryKey: ["tour-assignment-drivers"], queryFn: getDrivers, retry: 1 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const { data: vehiclesData, isLoading: vehiclesLoading, error: vehiclesError, refetch: refetchVehicles } = useQuery({ queryKey: ["tour-assignment-vehicles"], queryFn: getVehicles, retry: 1 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const destinations = unwrapList(destinationsData, ["destinations"]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const guides = unwrapList(guidesData, ["guides"]).filter((item) => item.availability === "available" && !item.assignedTour && !item.assignedTours?.length);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const drivers = unwrapList(driversData, ["drivers"]).filter((item) => item.availability === "available" && !item.assignedTour && !item.assignedTours?.length);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const vehicles = unwrapList(vehiclesData, ["vehicles"]).filter((item) => (item.status === "available" || !item.status) && !item.assignedTour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const selectedDestination = useMemo(() => destinations.find((item) => String(item._id) === String(form.destination)), [destinations, form.destination]);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 35:** `const estimatedTotal = useMemo(() => { const price = Number(form.price) || 0; const discount = Math.min(100, Math.max(0, Number(form.discount) || 0)); return Math.max(0, price * (1 - discount / 100)); }, [form.price, for` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 36:** `const assignmentLoading = guidesLoading || driversLoading || vehiclesLoading; const assignmentError = guidesError || driversError || vehiclesError;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const { mutate: saveTour, isPending } = useMutation({ mutationFn: createTour, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tour-manager-tours"] }); queryClient.invalidateQueries({ queryKey: ["adminTours` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 39:** `const handleChange = (event) => { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })); if (name === "duration") { const days = Number(value); if (Number.isInteger(days) && days > 0` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleChange` — lines 39–39

Parameters: `event`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `updateItineraryDay` — lines 40–40

Parameters: `index`, `field`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `addItineraryDay` — lines 41–41

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `removeItineraryDay` — lines 42–42

Parameters: `index`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `handleImages` — lines 43–43

Parameters: `event`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `removeImage` — lines 44–44

Parameters: `index`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `retryResources` — lines 45–45

Parameters: none.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `submitHandler` — lines 46–77

Parameters: `event`.
13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `const title = form.title.trim(), shortDescription = form.shortDescription.trim(), description = form.description.trim(), location = form.location.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const price = Number(form.price), capacity = Number(form.capacity), duration = Number(form.duration), discount = Number(form.discount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `if (!title || !description) return toast.error("Tour title and description are required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (!form.destination) return toast.error("Select a destination before creating the tour.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `if (!location) return toast.error("Tour location is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `if (!form.date) return toast.error("Select a travel date.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `if (form.date < todayIso) return toast.error("Travel date cannot be in the past.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `if (form.endDate && form.endDate < form.date) return toast.error("The return date cannot be before the departure date.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `if (!Number.isFinite(price) || price < 0) return toast.error("Enter a valid KES tour price.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `if (!Number.isInteger(capacity) || capacity < 1) return toast.error("Capacity must be at least 1 guest.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `if (!Number.isInteger(duration) || duration < 1 || duration > 365) return toast.error("Duration must be a whole number between 1 and 365 days.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `if (!Number.isFinite(discount) || discount < 0 || discount > 100) return toast.error("Discount must be between 0% and 100%.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `if (itineraryDays.length !== duration) return toast.error("Add one itinerary day for each of the " + duration + " tour days. You have added " + itineraryDays.length + ".");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `if (itineraryDays.some((day) => !day.title.trim() || !day.description.trim())) return toast.error("Every itinerary day needs a title and description before the tour can be created.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `const itinerary = itineraryDays.map((day, index) => ({ day: index + 1, title: day.title.trim(), description: day.description.trim(), activities: linesFromText(day.activitiesText), meals: linesFromText(day.mealsText), acc` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const payload = new FormData();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const values = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 11: `const emptyForm = { title: "", shortDescription: "", description: "", category: "Safari", destination: "", country: "Kenya", location: "", meetingPoint: "Nairobi, Kenya", date: "",`.
- Line 12: `const createItineraryDay = (day) => ({ day, title: "", description: "", activitiesText: "", mealsText: "", accommodation: "" });`.
- Line 13: `const linesFromText = (value) => String(value || "").split("\n").map((item) => item.trim()).filter(Boolean);`.
- Line 14: `const unwrapList = (response, keys = []) => { if (Array.isArray(response)) return response; for (const key of keys) if (Array.isArray(response?.[key])) return response[key]; if (Ar`.
- Line 15: `const cleanLabel = (value, fallback) => { const text = String(value ?? "").trim(); return text && !/^undefined|^null$/i.test(text) ? text : fallback; };`.
- Line 16: `const todayIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);`.
- Line 17: `const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:bord`.
- Line 18: `const labelClass = "text-sm font-semibold text-slate-700";`.
- Line 21: `const navigate = useNavigate(); const location = useLocation(); const queryClient = useQueryClient();`.
- Line 22: `const returnPath = location.state?.returnTo === "/admin/tours" ? "/admin/tours" : "/tour-manager/tours";`.
- Line 23: `const { settings = {} } = useSettings() || {};`.
- Line 24: `const companyName = String(settings.companyName || settings.displayName || settings.organizationName || "Global Tours").trim();`.
- Line 25: `const [form, setForm] = useState(emptyForm); const [itineraryDays, setItineraryDays] = useState([createItineraryDay(1)]); const [imageFiles, setImageFiles] = useState([]); const [i`.
- Line 26: `const { data: destinationsData, isLoading: destinationsLoading, isError: destinationsError, refetch: refetchDestinations } = useQuery({ queryKey: ["destinations"], queryFn: getDest`.
- Line 27: `const { data: guidesData, isLoading: guidesLoading, error: guidesError, refetch: refetchGuides } = useQuery({ queryKey: ["tour-assignment-guides"], queryFn: getGuides, retry: 1 });`.
- Line 28: `const { data: driversData, isLoading: driversLoading, error: driversError, refetch: refetchDrivers } = useQuery({ queryKey: ["tour-assignment-drivers"], queryFn: getDrivers, retry:`.
- Line 29: `const { data: vehiclesData, isLoading: vehiclesLoading, error: vehiclesError, refetch: refetchVehicles } = useQuery({ queryKey: ["tour-assignment-vehicles"], queryFn: getVehicles, `.
- Line 30: `const destinations = unwrapList(destinationsData, ["destinations"]);`.
- Line 31: `const guides = unwrapList(guidesData, ["guides"]).filter((item) => item.availability === "available" && !item.assignedTour && !item.assignedTours?.length);`.
- Line 32: `const drivers = unwrapList(driversData, ["drivers"]).filter((item) => item.availability === "available" && !item.assignedTour && !item.assignedTours?.length);`.
- Line 33: `const vehicles = unwrapList(vehiclesData, ["vehicles"]).filter((item) => (item.status === "available" || !item.status) && !item.assignedTour);`.
- Line 34: `const selectedDestination = useMemo(() => destinations.find((item) => String(item._id) === String(form.destination)), [destinations, form.destination]);`.
- Line 35: `const estimatedTotal = useMemo(() => { const price = Number(form.price) || 0; const discount = Math.min(100, Math.max(0, Number(form.discount) || 0)); return Math.max(0, price * (1`.
- Line 36: `const assignmentLoading = guidesLoading || driversLoading || vehiclesLoading; const assignmentError = guidesError || driversError || vehiclesError;`.
- Line 38: `const { mutate: saveTour, isPending } = useMutation({ mutationFn: createTour, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tour-manager-tours"] }); queryClient.in`.
- Line 39: `const handleChange = (event) => { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })); if (name === "duration") { const days = Number(value)`.
- Line 40: `const updateItineraryDay = (index, field, value) => setItineraryDays((current) => current.map((day, dayIndex) => dayIndex === index ? { ...day, [field]: value } : day));`.
- Line 41: `const addItineraryDay = () => setItineraryDays((current) => { const nextDay = current.length + 1; if (nextDay > Number(form.duration) || nextDay > 365) return current; return [...c`.
- Line 42: `const removeItineraryDay = (index) => setItineraryDays((current) => current.filter((_, dayIndex) => dayIndex !== index).map((day, dayIndex) => ({ ...day, day: dayIndex + 1 })));`.
- Line 43: `const handleImages = (event) => { const files = Array.from(event.target.files || []); const allowed = ["image/jpeg", "image/png", "image/webp"]; if (files.some((file) => !allowed.i`.
- Line 44: `const removeImage = (index) => setImageFiles((files) => files.filter((_, itemIndex) => itemIndex !== index));`.
- Line 45: `const retryResources = () => { if (destinationsError) refetchDestinations(); if (guidesError) refetchGuides(); if (driversError) refetchDrivers(); if (vehiclesError) refetchVehicle`.
- Line 46: `const submitHandler = (event) => {`.
- Line 48: `const title = form.title.trim(), shortDescription = form.shortDescription.trim(), description = form.description.trim(), location = form.location.trim();`.
- Line 49: `const price = Number(form.price), capacity = Number(form.capacity), duration = Number(form.duration), discount = Number(form.discount || 0);`.
- Line 62: `const itinerary = itineraryDays.map((day, index) => ({ day: index + 1, title: day.title.trim(), description: day.description.trim(), activities: linesFromText(day.activitiesText), `.
- Line 63: `const payload = new FormData();`.
- Line 64: `const values = {`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
