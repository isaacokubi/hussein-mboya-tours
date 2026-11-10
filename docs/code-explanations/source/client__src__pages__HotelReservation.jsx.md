# Source explanation: client/src/pages/HotelReservation.jsx

**Source:** [client/src/pages/HotelReservation.jsx](../../../client/src/pages/HotelReservation.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link`, `useNavigate`, `useParams`, `useSearchParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ArrowLeft`, `BedDouble`, `CheckCircle2`, `Clock3`, `MapPin`, `ShieldCheck`, `Users` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createHotelBooking`, `getPublicHotel`, `getHotelAvailability`, `hotelQueryScope` from `../api/hotelApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hotelApi](../../../client/src/api/hotelApi.js)

## Runtime declarations and data flow

### `dateOnly` — lines 8–8

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `money` — lines 9–9

Parameters: `value`, `currency (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `HotelReservation` — lines 18–51

Parameters: none.
React hooks used: useState, useQuery, useMutation. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const { id } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const [params] = useSearchParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const [stay, setStay] = useState({ checkIn: "", checkOut: "", rooms: 1, adults: 2, children: 0 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", mealPlan: "", estimatedArrivalTime: "", bedPreference: "", dietaryRequirements: "", accessibilityNeeds: "", airportTransferRequired: f` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const { data: hotel, isLoading, isError } = useQuery({ queryKey: ["public-hotel", hotelQueryScope(), id], queryFn: () => getPublicHotel(id), enabled: Boolean(id), staleTime: 30000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const validDates = Boolean(stay.checkIn && stay.checkOut && dateOnly(stay.checkOut) > dateOnly(stay.checkIn));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const hotelId = String(hotel?._id || id || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const availability = useQuery({ queryKey: ["hotel-reservation-availability", hotelQueryScope(), hotelId, stay.checkIn, stay.checkOut], queryFn: () => getHotelAvailability({ hotelId, checkIn: stay.checkIn, checkOut: stay.` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const rooms = availability.data?.roomTypes || hotel?.roomTypes || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const [roomId, setRoomId] = useState(params.get("room") || "");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const selectedRoom = rooms.find(room => String(room._id) === String(roomId)) || rooms[0];` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 31:** `const ratePlans = selectedRoom?.ratePlans || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const mealPlans = [...new Set(ratePlans.map(rate => rate.mealPlan).filter(Boolean).concat(selectedRoom?.mealPlans || []))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const selectedRatePlan = ratePlans.find(rate => rate.mealPlan === form.mealPlan) || ratePlans.find(rate => rate._id === selectedRoom?.selectedRatePlan?._id) || ratePlans[0];` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 34:** `const effectiveMealPlan = form.mealPlan || selectedRatePlan?.mealPlan || selectedRoom?.mealPlans?.[0] || "room_only";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const effectiveRatePlan = ratePlans.find(rate => rate.mealPlan === effectiveMealPlan) || selectedRatePlan;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 36:** `const nights = validDates ? Math.ceil((dateOnly(stay.checkOut) - dateOnly(stay.checkIn)) / 86400000) : 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `updateStay` — lines 41–41

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `updateForm` — lines 42–42

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `selectRoom` — lines 43–47

Parameters: `room`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 45:** `const firstMealPlan = room.ratePlans?.find(rate => rate.mealPlan)?.mealPlan || room.mealPlans?.[0] || "room_only";` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

## Module-level declarations

- Line 7: `const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-em`.
- Line 8: `const dateOnly = value => value ? new Date(\`${value}T00:00:00\`) : null;`.
- Line 9: `const money = (value, currency = "KES") => \`${currency} ${Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 0 })}\`;`.
- Line 10: `const MEAL_PLAN_LABELS = {`.
- Line 19: `const { id } = useParams();`.
- Line 20: `const [params] = useSearchParams();`.
- Line 21: `const navigate = useNavigate();`.
- Line 22: `const [stay, setStay] = useState({ checkIn: "", checkOut: "", rooms: 1, adults: 2, children: 0 });`.
- Line 23: `const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", mealPlan: "", estimatedArrivalTime: "", bedPreference: "", dietaryRequirements: "", accessibil`.
- Line 24: `const { data: hotel, isLoading, isError } = useQuery({ queryKey: ["public-hotel", hotelQueryScope(), id], queryFn: () => getPublicHotel(id), enabled: Boolean(id), staleTime: 30000 `.
- Line 25: `const validDates = Boolean(stay.checkIn && stay.checkOut && dateOnly(stay.checkOut) > dateOnly(stay.checkIn));`.
- Line 26: `const hotelId = String(hotel?._id || id || "");`.
- Line 27: `const availability = useQuery({ queryKey: ["hotel-reservation-availability", hotelQueryScope(), hotelId, stay.checkIn, stay.checkOut], queryFn: () => getHotelAvailability({ hotelId`.
- Line 28: `const rooms = availability.data?.roomTypes || hotel?.roomTypes || [];`.
- Line 29: `const [roomId, setRoomId] = useState(params.get("room") || "");`.
- Line 30: `const selectedRoom = rooms.find(room => String(room._id) === String(roomId)) || rooms[0];`.
- Line 31: `const ratePlans = selectedRoom?.ratePlans || [];`.
- Line 32: `const mealPlans = [...new Set(ratePlans.map(rate => rate.mealPlan).filter(Boolean).concat(selectedRoom?.mealPlans || []))];`.
- Line 33: `const selectedRatePlan = ratePlans.find(rate => rate.mealPlan === form.mealPlan) || ratePlans.find(rate => rate._id === selectedRoom?.selectedRatePlan?._id) || ratePlans[0];`.
- Line 34: `const effectiveMealPlan = form.mealPlan || selectedRatePlan?.mealPlan || selectedRoom?.mealPlans?.[0] || "room_only";`.
- Line 35: `const effectiveRatePlan = ratePlans.find(rate => rate.mealPlan === effectiveMealPlan) || selectedRatePlan;`.
- Line 36: `const nights = validDates ? Math.ceil((dateOnly(stay.checkOut) - dateOnly(stay.checkIn)) / 86400000) : 0;`.
- Line 37: `const nightlyRate = Number(effectiveRatePlan?.nightlyRate ?? selectedRoom?.nightlyRate ?? 0);`.
- Line 38: `const total = nights * nightlyRate * Number(stay.rooms || 1);`.
- Line 39: `const canSubmit = Boolean(validDates && selectedRoom && Number(selectedRoom.availableRooms ?? selectedRoom.totalRooms ?? 0) >= Number(stay.rooms) && Number(stay.adults) <= Number(s`.
- Line 40: `const booking = useMutation({ mutationFn: createHotelBooking, onSuccess: result => { const bookingId = result?.data?._id || result?._id; if (bookingId) navigate(\`/hospitality-paym`.
- Line 41: `const updateStay = (key, value) => setStay(current => ({ ...current, [key]: value }));`.
- Line 42: `const updateForm = (key, value) => setForm(current => ({ ...current, [key]: value }));`.
- Line 43: `const selectRoom = room => {`.
- Line 45: `const firstMealPlan = room.ratePlans?.find(rate => rate.mealPlan)?.mealPlan || room.mealPlans?.[0] || "room_only";`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
