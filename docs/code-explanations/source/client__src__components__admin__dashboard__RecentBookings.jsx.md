# Source explanation: client/src/components/admin/dashboard/RecentBookings.jsx

**Source:** [client/src/components/admin/dashboard/RecentBookings.jsx](../../../client/src/components/admin/dashboard/RecentBookings.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useSettings` from `../../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)

## Runtime declarations and data flow

### `clean` — lines 3–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 4:** `const text = String(value ?? "").trim().replace(/\s+/g, " ");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 5:** `return text && !/^undefined( undefined)?$/i.test(text) && !/^null( null)?$/i.test(text) ? text : "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `customerName` — lines 7–14

Parameters: `booking`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `const customer = booking?.customer || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const snapshot = booking?.customerSnapshot || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const direct = clean(customer.name) || clean(snapshot.name) || clean(booking?.contact?.name) || clean(booking?.user?.name) || clean(booking?.customerDisplayName);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (direct) return direct;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const combined = \`${clean(customer.firstName) || clean(snapshot.firstName)} ${clean(customer.lastName) || clean(snapshot.lastName)}\`.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `return combined || "Customer";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tourName` — lines 15–15

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusText` — lines 16–16

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `badgeClass` — lines 17–29

Parameters: `value`, `type`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `const status = String(value || "pending").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (type === "payment") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (["paid", "completed", "success"].includes(status)) return "bg-emerald-100 text-emerald-800 ring-emerald-300";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (["failed", "cancelled"].includes(status)) return "bg-red-100 text-red-800 ring-red-300";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return "bg-amber-100 text-amber-800 ring-amber-300";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 24:** `if (["confirmed", "completed"].includes(status)) return "bg-emerald-100 text-emerald-800 ring-emerald-300";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `if (["cancelled"].includes(status)) return "bg-red-100 text-red-800 ring-red-300";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (["refunded"].includes(status)) return "bg-violet-100 text-violet-800 ring-violet-300";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `if (["ongoing"].includes(status)) return "bg-indigo-100 text-indigo-800 ring-indigo-300";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `return "bg-amber-100 text-amber-800 ring-amber-300";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `RecentBookings` — lines 31–47

Parameters: `{bookings}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 32:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const companyName = String(settings.companyName || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const currency = String(settings.currencySymbol || settings.currency || "KSh").trim() || "KSh";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const list = (Array.isArray(bookings) ? bookings : []).filter((booking) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const hasCustomer = Boolean(clean(booking?.customer?.name) || clean(booking?.customer?.email) || clean(booking?.customerSnapshot?.name) || clean(booking?.customerSnapshot?.email) || clean(booking?.contact?.name) || clean` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const hasTour = Boolean(tourName(booking));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `return hasCustomer && hasTour;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 43:** `return <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm sm:p-6">` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 3: `const clean = (value) => {`.
- Line 4: `const text = String(value ?? "").trim().replace(/\s+/g, " ");`.
- Line 7: `const customerName = (booking) => {`.
- Line 8: `const customer = booking?.customer || {};`.
- Line 9: `const snapshot = booking?.customerSnapshot || {};`.
- Line 10: `const direct = clean(customer.name) || clean(snapshot.name) || clean(booking?.contact?.name) || clean(booking?.user?.name) || clean(booking?.customerDisplayName);`.
- Line 12: `const combined = \`${clean(customer.firstName) || clean(snapshot.firstName)} ${clean(customer.lastName) || clean(snapshot.lastName)}\`.trim();`.
- Line 15: `const tourName = (booking) => booking?.tour?.title || booking?.tourName || "";`.
- Line 16: `const statusText = (value) => { if (!value) return "pending"; return typeof value === "string" ? value.toLowerCase() : String(value.status || value.paymentStatus || "pending").toLo`.
- Line 17: `const badgeClass = (value, type) => {`.
- Line 18: `const status = String(value || "pending").toLowerCase();`.
- Line 32: `const { settings = {} } = useSettings() || {};`.
- Line 33: `const companyName = String(settings.companyName || "").trim();`.
- Line 34: `const currency = String(settings.currencySymbol || settings.currency || "KSh").trim() || "KSh";`.
- Line 37: `const list = (Array.isArray(bookings) ? bookings : []).filter((booking) => {`.
- Line 38: `const hasCustomer = Boolean(clean(booking?.customer?.name) || clean(booking?.customer?.email) || clean(booking?.customerSnapshot?.name) || clean(booking?.customerSnapshot?.email) |`.
- Line 39: `const hasTour = Boolean(tourName(booking));`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
