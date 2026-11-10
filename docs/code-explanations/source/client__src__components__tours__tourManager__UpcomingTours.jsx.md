# Source explanation: client/src/components/tours/tourManager/UpcomingTours.jsx

**Source:** [client/src/components/tours/tourManager/UpcomingTours.jsx](../../../client/src/components/tours/tourManager/UpcomingTours.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `CalendarDays`, `Car`, `CheckCircle2`, `MapPin`, `UserRound`, `Users` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `formatDate` — lines 3–7

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 4:** `if (!value) return "Date not set";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 5:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `return Number.isNaN(date.getTime()) ? "Date not set" : date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `resourceName` — lines 9–14

Parameters: `resource`, `fallback (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `if (!resource) return fallback;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `if (typeof resource === "string") return resource.trim() || fallback;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const name = [resource.name, resource.fullName, [resource.firstName, resource.lastName].filter(Boolean).join(" "), resource.registrationNumber, resource.registration].find((value) => String(value || "").trim());` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 13:** `return name || fallback;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `statusClass` — lines 16–24

Parameters: `status`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `switch (String(status || "").toLowerCase()) {` — This branch selects behavior by the current value; verify every case and the default path.
- **Line 18:** `case "confirmed": return "bg-sky-50 text-sky-700 ring-sky-200";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `case "ongoing":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `case "active": return "bg-emerald-50 text-emerald-700 ring-emerald-200";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `case "cancelled": return "bg-rose-50 text-rose-700 ring-rose-200";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `UpcomingTours` — lines 26–72

Parameters: `{tours}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 27:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 39:** `const status = typeof tour.status === "object" ? tour.status?.status || "upcoming" : tour.status || "upcoming";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const guide = tour.assignedGuide || tour.guide;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const driver = tour.assignedDriver || tour.driver;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const vehicle = tour.assignedVehicle || tour.vehicle;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const guests = Number(tour.guests ?? tour.bookedSlots ?? tour.bookedSeats ?? tour.totalGuests ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const capacity = Number(tour.capacity || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const occupancy = Math.min(100, Math.max(0, Number(tour.occupancyRate ?? (capacity ? Math.round((guests / capacity) * 100) : 0))));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const startDate = tour.startDate || tour.date;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const endDate = tour.endDate;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 3: `const formatDate = (value) => {`.
- Line 5: `const date = new Date(value);`.
- Line 9: `const resourceName = (resource, fallback = "Not assigned") => {`.
- Line 12: `const name = [resource.name, resource.fullName, [resource.firstName, resource.lastName].filter(Boolean).join(" "), resource.registrationNumber, resource.registration].find((value) `.
- Line 16: `const statusClass = (status) => {`.
- Line 39: `const status = typeof tour.status === "object" ? tour.status?.status || "upcoming" : tour.status || "upcoming";`.
- Line 40: `const guide = tour.assignedGuide || tour.guide;`.
- Line 41: `const driver = tour.assignedDriver || tour.driver;`.
- Line 42: `const vehicle = tour.assignedVehicle || tour.vehicle;`.
- Line 43: `const guests = Number(tour.guests ?? tour.bookedSlots ?? tour.bookedSeats ?? tour.totalGuests ?? 0);`.
- Line 44: `const capacity = Number(tour.capacity || 0);`.
- Line 45: `const occupancy = Math.min(100, Math.max(0, Number(tour.occupancyRate ?? (capacity ? Math.round((guests / capacity) * 100) : 0))));`.
- Line 46: `const startDate = tour.startDate || tour.date;`.
- Line 47: `const endDate = tour.endDate;`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
