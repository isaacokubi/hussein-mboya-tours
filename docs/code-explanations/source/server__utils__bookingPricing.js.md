# Source explanation: server/utils/bookingPricing.js

**Source:** [server/utils/bookingPricing.js](../../../server/utils/bookingPricing.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `roundMoney` — lines 9–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `calculateBookingAmounts` — lines 11–57

Parameters: `tour`, `travelerCount`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `if (!tour) throw new Error("Tour is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (!Number.isInteger(travelerCount) || travelerCount <= 0) throw new Error("Invalid traveler count.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `const rawPrice = Number(tour.price);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!Number.isFinite(rawPrice) || rawPrice < 0) throw new Error("Invalid tour price.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const overridePrice = Number(tour.discountPrice);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const unitPrice = Number.isFinite(overridePrice) && overridePrice > 0 ? overridePrice : rawPrice;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const subtotal = roundMoney(unitPrice * travelerCount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const rules = Array.isArray(tour.pricingRules) ? tour.pricingRules : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const matchingRules = rules.filter((rule) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const min = Number(rule?.minTravelers);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const max = Number(rule?.maxTravelers);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `return (!Number.isFinite(min) || travelerCount >= min) && (!Number.isFinite(max) || travelerCount <= max);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 31:** `const matchingRule = matchingRules.sort((a, b) => Number(b?.discount || 0) - Number(a?.discount || 0))[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const configuredDiscount = matchingRule ? Number(matchingRule.discount || 0) : Number(tour.discount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const discountPercentage = Math.min(Math.max(Number.isFinite(configuredDiscount) ? configuredDiscount : 0, 0), 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const discountAmount = roundMoney(Math.min(subtotal, subtotal * (discountPercentage / 100)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const totalAmount = roundMoney(Math.max(subtotal - discountAmount, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const depositConfigured = Number(tour.depositRequired || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 9: `const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;`.
- Line 11: `export const calculateBookingAmounts = (tour, travelerCount) => {`.
- Line 15: `const rawPrice = Number(tour.price);`.
- Line 21: `const overridePrice = Number(tour.discountPrice);`.
- Line 22: `const unitPrice = Number.isFinite(overridePrice) && overridePrice > 0 ? overridePrice : rawPrice;`.
- Line 23: `const subtotal = roundMoney(unitPrice * travelerCount);`.
- Line 25: `const rules = Array.isArray(tour.pricingRules) ? tour.pricingRules : [];`.
- Line 26: `const matchingRules = rules.filter((rule) => {`.
- Line 27: `const min = Number(rule?.minTravelers);`.
- Line 28: `const max = Number(rule?.maxTravelers);`.
- Line 31: `const matchingRule = matchingRules.sort((a, b) => Number(b?.discount || 0) - Number(a?.discount || 0))[0];`.
- Line 32: `const configuredDiscount = matchingRule ? Number(matchingRule.discount || 0) : Number(tour.discount || 0);`.
- Line 33: `const discountPercentage = Math.min(Math.max(Number.isFinite(configuredDiscount) ? configuredDiscount : 0, 0), 100);`.
- Line 34: `const discountAmount = roundMoney(Math.min(subtotal, subtotal * (discountPercentage / 100)));`.
- Line 35: `const totalAmount = roundMoney(Math.max(subtotal - discountAmount, 0));`.
- Line 37: `const depositConfigured = Number(tour.depositRequired || 0);`.
- Line 39: `const depositType = String(tour.depositType || "fixed").toLowerCase();`.
- Line 41: `const depositAmount = depositType === "percentage"`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
