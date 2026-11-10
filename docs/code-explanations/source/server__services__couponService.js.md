# Source explanation: server/services/couponService.js

**Source:** [server/services/couponService.js](../../../server/services/couponService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Coupon` from `../models/Coupon.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Coupon.js](../../../server/models/Coupon.js)

## Runtime declarations and data flow

### `applyCoupon` — lines 20–136

Parameters: `code`, `amount`.
Persistent operations detected: Coupon.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `if (!code) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 32:** `const coupon = await Coupon.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 37:** `if (!coupon) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 53:** `if (coupon.expiryDate && coupon.expiryDate < new Date()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 69:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 88:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 107:** `let discount = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `if (coupon.discountType === "percentage") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 112:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `const finalAmount = Number(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 129:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 20: `export const applyCoupon = async (code, amount) => {`.
- Line 32: `const coupon = await Coupon.findOne({`.
- Line 107: `let discount = 0;`.
- Line 125: `const finalAmount = Number(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
