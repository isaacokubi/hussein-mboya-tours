# Source explanation: client/src/pages/tourManager/EditTour.jsx

**Source:** [client/src/pages/tourManager/EditTour.jsx](../../../client/src/pages/tourManager/EditTour.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useMemo`, `useRef`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useLocation`, `useNavigate`, `useParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assignTourResources`, `getDrivers`, `getGuides`, `getTour`, `getVehicles`, `updateTour` from `../../api/tourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourApi](../../../client/src/api/tourApi.js)
- `getDestinations` from `../../api/destinationApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/destinationApi](../../../client/src/api/destinationApi.js)
- `getTour`, `updateTour` from `../../api/adminTourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminTourApi](../../../client/src/api/adminTourApi.js)

## Runtime declarations and data flow

### `toDateInput` — lines 9–13

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `if (!value) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeTour` — lines 15–15

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeDestinations` — lines 16–19

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 17:** `const candidates = [value, value?.data, value?.destinations, value?.data?.destinations, value?.data?.data];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `return candidates.find(Array.isArray) || [];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `EditTour` — lines 21–221

Parameters: none.
React hooks used: useMemo, useState, useQuery, useEffect, useMutation. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `const { id } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const location = useLocation();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const isAdmin = useMemo(() => location.pathname.startsWith("/admin/"), [location.pathname]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const [form, setForm] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const saveInFlight = useRef(false);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const { data: tourData, isLoading: tourLoading, isError: tourError } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 36:** `const { data: destinationsData, isLoading: destinationsLoading, isError: destinationsError } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 40:** `const destinations = normalizeDestinations(destinationsData);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const { data: guides = [] } = useQuery({ queryKey: ["tour-assignment-guides"], queryFn: getGuides, enabled: !isAdmin });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 43:** `const { data: drivers = [] } = useQuery({ queryKey: ["tour-assignment-drivers"], queryFn: getDrivers, enabled: !isAdmin });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 44:** `const { data: vehicles = [] } = useQuery({ queryKey: ["tour-assignment-vehicles"], queryFn: getVehicles, enabled: !isAdmin });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 46:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 47:** `if (!tourData) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `const saveMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 76:** `if (isAdmin) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `const payload = new FormData();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleChange` — lines 121–124

Parameters: `event`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 122:** `const { name, value, type, checked } = event.target;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `submitHandler` — lines 126–141

Parameters: `event`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 128:** `if (!form || saveInFlight.current || saveMutation.isPending) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 129:** `if (!form.title.trim() || !form.description.trim() || !form.destination || !form.country.trim() || !form.location.trim() || !form.date) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 131:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 133:** `const duration = Number(form.duration);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 134:** `if (!Number.isInteger(duration) || duration < 1 || duration > 365) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 136:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 138:** `const payload = { ...form, duration };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 9: `const toDateInput = (value) => {`.
- Line 11: `const date = new Date(value);`.
- Line 15: `const normalizeTour = (value) => value?.tour || value?.data || value || null;`.
- Line 16: `const normalizeDestinations = (value) => {`.
- Line 17: `const candidates = [value, value?.data, value?.destinations, value?.data?.destinations, value?.data?.data];`.
- Line 22: `const { id } = useParams();`.
- Line 23: `const navigate = useNavigate();`.
- Line 24: `const location = useLocation();`.
- Line 25: `const queryClient = useQueryClient();`.
- Line 26: `const isAdmin = useMemo(() => location.pathname.startsWith("/admin/"), [location.pathname]);`.
- Line 27: `const [form, setForm] = useState(null);`.
- Line 28: `const saveInFlight = useRef(false);`.
- Line 30: `const { data: tourData, isLoading: tourLoading, isError: tourError } = useQuery({`.
- Line 36: `const { data: destinationsData, isLoading: destinationsLoading, isError: destinationsError } = useQuery({`.
- Line 40: `const destinations = normalizeDestinations(destinationsData);`.
- Line 42: `const { data: guides = [] } = useQuery({ queryKey: ["tour-assignment-guides"], queryFn: getGuides, enabled: !isAdmin });`.
- Line 43: `const { data: drivers = [] } = useQuery({ queryKey: ["tour-assignment-drivers"], queryFn: getDrivers, enabled: !isAdmin });`.
- Line 44: `const { data: vehicles = [] } = useQuery({ queryKey: ["tour-assignment-vehicles"], queryFn: getVehicles, enabled: !isAdmin });`.
- Line 74: `const saveMutation = useMutation({`.
- Line 77: `const payload = new FormData();`.
- Line 78: `const fields = [`.
- Line 89: `const { assignedGuide, assignedDriver, assignedVehicle, ...tourFields } = values;`.
- Line 90: `const response = await updateManagerTour(id, {`.
- Line 121: `const handleChange = (event) => {`.
- Line 122: `const { name, value, type, checked } = event.target;`.
- Line 126: `const submitHandler = (event) => {`.
- Line 133: `const duration = Number(form.duration);`.
- Line 138: `const payload = { ...form, duration };`.
- Line 146: `const destinationId = typeof form.destination === "object" ? form.destination?._id : form.destination;`.
- Line 147: `const currentDestination = tourData?.destination && typeof tourData.destination === "object"`.
- Line 150: `const destinationOptions = currentDestination && !destinations.some((item) => String(item?._id) === String(destinationId))`.
- Line 153: `const returnPath = location.state?.returnTo === "/admin/tours"`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
