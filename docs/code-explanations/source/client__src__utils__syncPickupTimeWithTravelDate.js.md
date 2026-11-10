# Source explanation: client/src/utils/syncPickupTimeWithTravelDate.js

**Source:** [client/src/utils/syncPickupTimeWithTravelDate.js](../../../client/src/utils/syncPickupTimeWithTravelDate.js)

## Purpose

A client utility/helper used by pages, hooks, or components; inspect its exported functions for exact transformation rules.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `isCheckoutPage` — lines 2–2

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getDateInput` — lines 3–3

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getPickupDateTimeInput` — lines 4–4

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `setNativeValue` — lines 5–10

Parameters: `input`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 6:** `const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `syncPickupDate` — lines 11–24

Parameters: none.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `if (!isCheckoutPage()) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `const travelDateInput = getDateInput();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const pickupInput = getPickupDateTimeInput();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (!travelDateInput || !pickupInput || !travelDateInput.value) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `const selectedDate = travelDateInput.value;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const current = pickupInput.value;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const time = current && /^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/.test(current) ? current.slice(11, 16) : "09:00";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const expected = \`${selectedDate}T${time}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (pickupInput.value !== expected) setNativeValue(pickupInput, expected);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `installPickupDateSync` — lines 25–46

Parameters: none.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `if (!isCheckoutPage()) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const observer = new MutationObserver(syncPickupDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const target = event.target;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `if (target?.matches?.('input[type="date"]')) { requestAnimationFrame(syncPickupDate); return; }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `if (target?.matches?.('input[type="datetime-local"]')) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const travelDateInput = getDateInput();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `if (!travelDateInput || !target.value) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `const selectedDate = travelDateInput.value;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (!target.value.startsWith(\`${selectedDate}T\`)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `const time = target.value.includes("T") ? target.value.slice(11, 16) : "09:00";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `if (event.target?.matches?.('input[type="date"]')) requestAnimationFrame(syncPickupDate);` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 1: `const CHECKOUT_PATH_PATTERN = /\/checkout\//;`.
- Line 2: `const isCheckoutPage = () => CHECKOUT_PATH_PATTERN.test(window.location.pathname);`.
- Line 3: `const getDateInput = () => document.querySelector('input[type="date"]');`.
- Line 4: `const getPickupDateTimeInput = () => document.querySelector('input[type="datetime-local"]');`.
- Line 5: `const setNativeValue = (input, value) => {`.
- Line 6: `const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;`.
- Line 11: `const syncPickupDate = () => {`.
- Line 13: `const travelDateInput = getDateInput();`.
- Line 14: `const pickupInput = getPickupDateTimeInput();`.
- Line 16: `const selectedDate = travelDateInput.value;`.
- Line 17: `const current = pickupInput.value;`.
- Line 18: `const time = current && /^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/.test(current) ? current.slice(11, 16) : "09:00";`.
- Line 19: `const expected = \`${selectedDate}T${time}\`;`.
- Line 25: `const installPickupDateSync = () => {`.
- Line 27: `const observer = new MutationObserver(syncPickupDate);`.
- Line 30: `const target = event.target;`.
- Line 33: `const travelDateInput = getDateInput();`.
- Line 35: `const selectedDate = travelDateInput.value;`.
- Line 37: `const time = target.value.includes("T") ? target.value.slice(11, 16) : "09:00";`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
