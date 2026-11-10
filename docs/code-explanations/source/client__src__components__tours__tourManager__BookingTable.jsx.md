# Source explanation: client/src/components/tours/tourManager/BookingTable.jsx

**Source:** [client/src/components/tours/tourManager/BookingTable.jsx](../../../client/src/components/tours/tourManager/BookingTable.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `CalendarDays`, `ChevronRight`, `CircleAlert`, `CreditCard`, `UserRound` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `clean` — lines 3–3

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `validText` — lines 4–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 5:** `const text = clean(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `return text && !/^undefined(?:\s+undefined)?$/i.test(text) && !/^null(?:\s+null)?$/i.test(text) ? text : "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `customerName` — lines 9–26

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 10:** `const customer = booking.customer || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const user = booking.user || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const snapshot = booking.customerSnapshot || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const contact = booking.contact || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const candidates = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `return candidates.map(validText).find(Boolean) || "Customer record unavailable";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tourName` — lines 28–31

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 29:** `const tour = booking.tour || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `return [tour.title, tour.name, booking.tourTitle].map(validText).find(Boolean) || (booking.customTourRequest ? "Custom Tour Package" : "Tour record unavailable");` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `statusClass` — lines 33–45

Parameters: `status`.
9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `switch (String(status || "").toLowerCase()) {` — This branch selects behavior by the current value; verify every case and the default path.
- **Line 35:** `case "completed": return "bg-emerald-50 text-emerald-700 ring-emerald-200";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `case "confirmed": return "bg-sky-50 text-sky-700 ring-sky-200";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `case "ongoing":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `case "assigned": return "bg-violet-50 text-violet-700 ring-violet-200";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `case "pending": return "bg-amber-50 text-amber-700 ring-amber-200";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `case "cancelled":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `case "failed":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `case "refunded": return "bg-rose-50 text-rose-700 ring-rose-200";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `formatDate` — lines 47–51

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `if (!value) return "Date not set";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `return Number.isNaN(date.getTime()) ? "Date not set" : date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `BookingTable` — lines 53–111

Parameters: `{bookings}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 54:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 79:** `const status = typeof booking.status === "object"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `const bookingNumber = validText(booking.bookingNumber) || (booking._id ? \`BK-${String(booking._id).slice(-6).toUpperCase()}\` : "Booking");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `const customer = customerName(booking);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const tour = tourName(booking);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const travelDate = booking.travelDate || booking.date || booking.createdAt;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `const customerUnavailable = customer === "Customer record unavailable";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 3: `const clean = (value) => String(value ?? "").trim().replace(/\s+/g, " ");`.
- Line 4: `const validText = (value) => {`.
- Line 5: `const text = clean(value);`.
- Line 9: `const customerName = (booking) => {`.
- Line 10: `const customer = booking.customer || {};`.
- Line 11: `const user = booking.user || {};`.
- Line 12: `const snapshot = booking.customerSnapshot || {};`.
- Line 13: `const contact = booking.contact || {};`.
- Line 14: `const candidates = [`.
- Line 28: `const tourName = (booking) => {`.
- Line 29: `const tour = booking.tour || {};`.
- Line 33: `const statusClass = (status) => {`.
- Line 47: `const formatDate = (value) => {`.
- Line 49: `const date = new Date(value);`.
- Line 79: `const status = typeof booking.status === "object"`.
- Line 82: `const bookingNumber = validText(booking.bookingNumber) || (booking._id ? \`BK-${String(booking._id).slice(-6).toUpperCase()}\` : "Booking");`.
- Line 83: `const customer = customerName(booking);`.
- Line 84: `const tour = tourName(booking);`.
- Line 85: `const travelDate = booking.travelDate || booking.date || booking.createdAt;`.
- Line 86: `const customerUnavailable = customer === "Customer record unavailable";`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
