# Source explanation: client/src/pages/MyCustomTours.jsx

**Source:** [client/src/pages/MyCustomTours.jsx](../../../client/src/pages/MyCustomTours.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useTenant` from `../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `useSettings` from `../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `convertCustomTourRequest`, `getMyCustomTourRequests` from `../api/customTourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/customTourApi](../../../client/src/api/customTourApi.js)
- `MobileDashboardNav` from `../components/common/MobileDashboardNav`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/common/MobileDashboardNav](../../../client/src/components/common/MobileDashboardNav.jsx)

## Runtime declarations and data flow

### `statusLabel` — lines 19–22

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `MyCustomTours` — lines 24–157

Parameters: none.
React hooks used: useQuery, useMutation. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `const { tenant } = useTenant();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const { settings } = useSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const { data, isLoading, isError, error } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 33:** `const convertMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 37:** `const bookingId = result?.booking?._id || result?.data?.booking?._id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `if (bookingId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `const requests = Array.isArray(data)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const handleProceed = (request) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `if (!request?._id || convertMutation.isPending) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `if (!window.confirm("Proceed with this quoted custom tour and continue to secure checkout?")) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 107:** `const status = String(request?.status || request?.requestStatus || "pending").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `const quotedAmount = Number(request?.quotedAmount ?? request?.quotedTotal ?? request?.totalAmount ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `const destination = request?.destination || request?.title || request?.tourName || "Custom Tour";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `const duration = Number(request?.durationDays || request?.duration || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 111:** `const people = Number(request?.people || request?.numberOfPeople || request?.guests || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 112:** `const travelDate = request?.startDate || request?.travelDate || request?.date;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleProceed` — lines 63–67

Parameters: `request`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 64:** `if (!request?._id || convertMutation.isPending) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `if (!window.confirm("Proceed with this quoted custom tour and continue to secure checkout?")) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 10: `const statusClasses = {`.
- Line 19: `const statusLabel = (value) =>`.
- Line 25: `const { tenant } = useTenant();`.
- Line 26: `const { settings } = useSettings();`.
- Line 27: `const queryClient = useQueryClient();`.
- Line 28: `const { data, isLoading, isError, error } = useQuery({`.
- Line 33: `const convertMutation = useMutation({`.
- Line 37: `const bookingId = result?.booking?._id || result?.data?.booking?._id;`.
- Line 53: `const requests = Array.isArray(data)`.
- Line 63: `const handleProceed = (request) => {`.
- Line 107: `const status = String(request?.status || request?.requestStatus || "pending").toLowerCase();`.
- Line 108: `const quotedAmount = Number(request?.quotedAmount ?? request?.quotedTotal ?? request?.totalAmount ?? 0);`.
- Line 109: `const destination = request?.destination || request?.title || request?.tourName || "Custom Tour";`.
- Line 110: `const duration = Number(request?.durationDays || request?.duration || 0);`.
- Line 111: `const people = Number(request?.people || request?.numberOfPeople || request?.guests || 0);`.
- Line 112: `const travelDate = request?.startDate || request?.travelDate || request?.date;`.
- Line 113: `const requirements = request?.requirements || request?.specialRequests || "No additional requirements provided.";`.
- Line 114: `const message = request?.adminMessage || request?.message || request?.quoteMessage;`.
- Line 115: `const canProceed = status === "quoted" || status === "approved";`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
