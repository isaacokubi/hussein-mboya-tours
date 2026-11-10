# Source explanation: server/services/operationsCopilotCalculations.js

**Source:** [server/services/operationsCopilotCalculations.js](../../../server/services/operationsCopilotCalculations.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `toMoney` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `buildTripOperations` — lines 8–43

Parameters: `tour`, `booking (defaulted)`, `costs (defaulted)`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `const bookedValue = toMoney(booking.bookedValue);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const collectedValue = toMoney(booking.collectedValue);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const estimatedCost = toMoney(costs.estimatedCost);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const actualCost = toMoney(costs.actualCost);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const hasActualCosts = toMoney(costs.actualCostItems) > 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const alerts = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!tour.assignedGuide) alerts.push("Guide not assigned");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (!tour.assignedDriver) alerts.push("Driver not assigned");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (!tour.assignedVehicle) alerts.push("Vehicle not assigned");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `if (bookedValue > 0 && estimatedCost === 0) alerts.push("No tour costs entered; margin is incomplete");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (collectedValue < bookedValue) alerts.push("Booking balances may remain outstanding");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `buildPaymentFollowUp` — lines 45–70

Parameters: `booking`, `now (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 46:** `const total = toMoney(booking.totalAmount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const paid = toMoney(booking.amountPaid);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const balance = toMoney(Math.max(0, total - paid));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `if (balance <= 0 || ["cancelled", "refunded"].includes(booking.status)) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `const travelDate = booking.travelDate ? new Date(booking.travelDate) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const daysUntilTravel = travelDate && Number.isFinite(travelDate.getTime())` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `buildAssetAlerts` — lines 77–114

Parameters: `asset`, `now (defaulted)`, `horizonDays (defaulted)`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 78:** `const metadata = asset.metadata && typeof asset.metadata === "object" ? asset.metadata : {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `const alerts = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `if (asset.status === "expired") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `const dateFields = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const horizon = new Date(now.getTime() + horizonDays * 86400000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `for (const [key, label, kind] of dateFields) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 92:** `if (!metadata[key]) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `const dueAt = new Date(metadata[key]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `if (!Number.isFinite(dueAt.getTime())) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 95:** `if (dueAt <= horizon) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `if (!alerts.length) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `buildQuoteDraft` — lines 120–153

Parameters: `tour`, `travelerCount`, `discountPercent (defaulted)`, `taxPercent (defaulted)`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 121:** `const guests = Number(travelerCount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `const discountRate = Number(discountPercent);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 123:** `const taxRate = Number(taxPercent);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `if (!Number.isInteger(guests) || guests < 1 || guests > 100) throw new Error("Travellers must be a whole number between 1 and 100.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `if (!Number.isFinite(discountRate) || discountRate < 0 || discountRate > 100) throw new Error("Discount must be between 0 and 100 percent.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 126:** `if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) throw new Error("Tax rate must be between 0 and 100 percent.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 127:** `const listedPrice = Number(tour.discountPrice ?? tour.price);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `if (!Number.isFinite(listedPrice) || listedPrice < 0) throw new Error("Tour has no valid price configured.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 129:** `const subtotal = toMoney(listedPrice * guests);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 130:** `const discountAmount = toMoney(subtotal * discountRate / 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 131:** `const taxableAmount = toMoney(Math.max(0, subtotal - discountAmount));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 132:** `const taxAmount = toMoney(taxableAmount * taxRate / 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 133:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `export const toMoney = (value) => Math.round(Number(value || 0) * 100) / 100;`.
- Line 8: `export function buildTripOperations(tour, booking = {}, costs = {}) {`.
- Line 9: `const bookedValue = toMoney(booking.bookedValue);`.
- Line 10: `const collectedValue = toMoney(booking.collectedValue);`.
- Line 11: `const estimatedCost = toMoney(costs.estimatedCost);`.
- Line 12: `const actualCost = toMoney(costs.actualCost);`.
- Line 13: `const hasActualCosts = toMoney(costs.actualCostItems) > 0;`.
- Line 14: `const alerts = [];`.
- Line 45: `export function buildPaymentFollowUp(booking, now = new Date()) {`.
- Line 46: `const total = toMoney(booking.totalAmount);`.
- Line 47: `const paid = toMoney(booking.amountPaid);`.
- Line 48: `const balance = toMoney(Math.max(0, total - paid));`.
- Line 51: `const travelDate = booking.travelDate ? new Date(booking.travelDate) : null;`.
- Line 52: `const daysUntilTravel = travelDate && Number.isFinite(travelDate.getTime())`.
- Line 77: `export function buildAssetAlerts(asset, now = new Date(), horizonDays = 30) {`.
- Line 78: `const metadata = asset.metadata && typeof asset.metadata === "object" ? asset.metadata : {};`.
- Line 79: `const alerts = [];`.
- Line 83: `const dateFields = [`.
- Line 90: `const horizon = new Date(now.getTime() + horizonDays * 86400000);`.
- Line 93: `const dueAt = new Date(metadata[key]);`.
- Line 120: `export function buildQuoteDraft(tour, travelerCount, discountPercent = 0, taxPercent = 0) {`.
- Line 121: `const guests = Number(travelerCount);`.
- Line 122: `const discountRate = Number(discountPercent);`.
- Line 123: `const taxRate = Number(taxPercent);`.
- Line 127: `const listedPrice = Number(tour.discountPrice ?? tour.price);`.
- Line 129: `const subtotal = toMoney(listedPrice * guests);`.
- Line 130: `const discountAmount = toMoney(subtotal * discountRate / 100);`.
- Line 131: `const taxableAmount = toMoney(Math.max(0, subtotal - discountAmount));`.
- Line 132: `const taxAmount = toMoney(taxableAmount * taxRate / 100);`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
