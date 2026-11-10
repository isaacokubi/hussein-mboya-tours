# Source explanation: client/src/lib/dateRange.js

**Source:** [client/src/lib/dateRange.js](../../../client/src/lib/dateRange.js)

## Purpose

A client utility/helper used by pages, hooks, or components; inspect its exported functions for exact transformation rules.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `toDateInputValue` — lines 2–9

Parameters: `value`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 3:** `if (!value) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 4:** `const raw = String(value).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 5:** `if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 6:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `if (Number.isNaN(date.getTime())) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `return \`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `parseDurationDays` — lines 11–15

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 12:** `const match = String(value ?? "").match(/\d+(?:\.\d+)?/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const days = match ? Number(match[0]) : Number(fallback);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `return Number.isFinite(days) && days >= 1 ? Math.max(1, Math.round(days)) : 1;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getDurationDays` — lines 17–17

Parameters: `...values`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `getTourDateRange` — lines 19–35

Parameters: `tour`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `if (!tour) return { min: "", max: "" };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const min = toDateInputValue(tour.startDate || tour.date || tour.travelDate || tour.departureDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `if (!min) return { min: "", max: "" };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const durationDays = getDurationDays(tour.durationDays, tour.durationDetails?.days, tour.duration);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const end = new Date(\`${min}T00:00:00Z\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (Number.isNaN(end.getTime())) return { min, max: min };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `const durationEnd = toDateInputValue(end);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const storedEnd = toDateInputValue(tour.endDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const max = durationDays > 1 && storedEnd >= min && storedEnd < durationEnd ? storedEnd : durationEnd;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `return { min, max };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCustomTourDateRange` — lines 37–46

Parameters: `request`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 38:** `if (!request?.startDate) return { min: "", max: "" };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `const min = toDateInputValue(request.startDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `if (!min) return { min: "", max: "" };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `const durationDays = getDurationDays(request.durationDays, request.duration);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const end = new Date(\`${min}T00:00:00\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `if (Number.isNaN(end.getTime())) return { min: "", max: "" };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `return { min, max: toDateInputValue(end) };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isDateWithinRange` — lines 48–51

Parameters: `value`, `min`, `max`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 49:** `if (!value || !min || !max) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `return value >= min && value <= max;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 2: `export const toDateInputValue = (value) => {`.
- Line 4: `const raw = String(value).trim();`.
- Line 6: `const date = new Date(value);`.
- Line 11: `export const parseDurationDays = (value, fallback = 1) => {`.
- Line 12: `const match = String(value ?? "").match(/\d+(?:\.\d+)?/);`.
- Line 13: `const days = match ? Number(match[0]) : Number(fallback);`.
- Line 17: `const getDurationDays = (...values) => { for (const value of values) { if (value !== undefined && value !== null && String(value).trim() !== "") return parseDurationDays(value, 1);`.
- Line 19: `export const getTourDateRange = (tour) => {`.
- Line 21: `const min = toDateInputValue(tour.startDate || tour.date || tour.travelDate || tour.departureDate);`.
- Line 24: `const durationDays = getDurationDays(tour.durationDays, tour.durationDetails?.days, tour.duration);`.
- Line 28: `const end = new Date(\`${min}T00:00:00Z\`);`.
- Line 31: `const durationEnd = toDateInputValue(end);`.
- Line 32: `const storedEnd = toDateInputValue(tour.endDate);`.
- Line 33: `const max = durationDays > 1 && storedEnd >= min && storedEnd < durationEnd ? storedEnd : durationEnd;`.
- Line 37: `export const getCustomTourDateRange = (request) => {`.
- Line 39: `const min = toDateInputValue(request.startDate);`.
- Line 41: `const durationDays = getDurationDays(request.durationDays, request.duration);`.
- Line 42: `const end = new Date(\`${min}T00:00:00\`);`.
- Line 48: `export const isDateWithinRange = (value, min, max) => {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
