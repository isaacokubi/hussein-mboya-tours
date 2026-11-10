# Source explanation: server/utils/bookingPaymentAccess.js

**Source:** [server/utils/bookingPaymentAccess.js](../../../server/utils/bookingPaymentAccess.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `normalizeRole` — lines 1–3

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isBookingPaymentStaff` — lines 10–10

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ownsBookingPayment` — lines 12–17

Parameters: `booking`, `user`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `if (!booking || !user?._id) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `const userId = String(user._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `return String(booking.user?._id || booking.user || "") === userId` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `canAccessBookingPayment` — lines 19–21

Parameters: `booking`, `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 1: `const normalizeRole = (user) => String(`.
- Line 5: `const STAFF_ROLES = new Set([`.
- Line 10: `export const isBookingPaymentStaff = (user) => STAFF_ROLES.has(normalizeRole(user));`.
- Line 12: `export const ownsBookingPayment = (booking, user) => {`.
- Line 14: `const userId = String(user._id);`.
- Line 19: `export const canAccessBookingPayment = (booking, user) => (`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
