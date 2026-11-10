# Source explanation: client/src/pages/tourManager/TourManagerCopilot.jsx

**Source:** [client/src/pages/tourManager/TourManagerCopilot.jsx](../../../client/src/pages/tourManager/TourManagerCopilot.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMutation`, `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `Bot`, `CalendarClock`, `CheckCircle2`, `RefreshCw`, `Wallet` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createOperationsQuoteDraft`, `getOperationsCopilotSummary`, `getTours`, `sendBookingNotification` from `../../api/tourManagerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourManagerApi](../../../client/src/api/tourManagerApi.js)

## Runtime declarations and data flow

### `money` — lines 6–10

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Metric` — lines 12–19

Parameters: `{label, value, hint, icon}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 13:** `return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `TourManagerCopilot` — lines 21–120

Parameters: none.
React hooks used: useState, useMutation, useQuery. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `const [tourId, setTourId] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [travelerCount, setTravelerCount] = useState("2");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const [discountPercent, setDiscountPercent] = useState("0");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const [taxPercent, setTaxPercent] = useState("0");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const quoteMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const toursQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 35:** `const toursPayload = toursQuery.data?.data ?? toursQuery.data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const quoteTours = Array.isArray(toursPayload) ? toursPayload : (toursPayload?.tours || toursPayload?.data || toursPayload?.results || []);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const reminderMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 42:** `const query = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 49:** `const result = query.data?.data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const summary = result?.summary || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const trips = Array.isArray(result?.trips) ? result.trips : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const followUps = Array.isArray(result?.paymentFollowUps) ? result.paymentFollowUps : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `return <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const money = (value) => new Intl.NumberFormat("en-KE", {`.
- Line 12: `function Metric({ label, value, hint, icon: Icon }) {`.
- Line 22: `const [tourId, setTourId] = useState("");`.
- Line 23: `const [travelerCount, setTravelerCount] = useState("2");`.
- Line 24: `const [discountPercent, setDiscountPercent] = useState("0");`.
- Line 25: `const [taxPercent, setTaxPercent] = useState("0");`.
- Line 26: `const quoteMutation = useMutation({`.
- Line 29: `const toursQuery = useQuery({`.
- Line 35: `const toursPayload = toursQuery.data?.data ?? toursQuery.data;`.
- Line 36: `const quoteTours = Array.isArray(toursPayload) ? toursPayload : (toursPayload?.tours || toursPayload?.data || toursPayload?.results || []);`.
- Line 37: `const reminderMutation = useMutation({`.
- Line 42: `const query = useQuery({`.
- Line 49: `const result = query.data?.data;`.
- Line 50: `const summary = result?.summary || {};`.
- Line 51: `const trips = Array.isArray(result?.trips) ? result.trips : [];`.
- Line 52: `const followUps = Array.isArray(result?.paymentFollowUps) ? result.paymentFollowUps : [];`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
