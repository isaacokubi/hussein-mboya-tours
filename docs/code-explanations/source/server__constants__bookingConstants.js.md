# Source explanation: server/constants/bookingConstants.js

**Source:** [server/constants/bookingConstants.js](../../../server/constants/bookingConstants.js)

## Purpose

A first-party runtime module; use its import/export and caller map below to determine the specific role.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `isValidBookingStatus` — lines 211–212

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isValidBookingPaymentStatus` — lines 215–216

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isValidPaymentStatus` — lines 219–220

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isValidPaymentMethod` — lines 223–224

Parameters: `method`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `canTransitionBookingStatus` — lines 233–239

Parameters: `currentStatus`, `newStatus`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `canTransitionBookingPaymentStatus` — lines 242–248

Parameters: `currentStatus`, `newStatus`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `canTransitionPaymentStatus` — lines 251–257

Parameters: `currentStatus`, `newStatus`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 16: `export const BOOKING_STATUSES = [`.
- Line 36: `export const BOOKING_PAYMENT_STATUSES = [`.
- Line 54: `export const PAYMENT_STATUSES = [`.
- Line 70: `export const PAYMENT_METHODS = {`.
- Line 85: `export const BOOKING_STATUS_TRANSITIONS = {`.
- Line 131: `export const BOOKING_PAYMENT_STATUS_TRANSITIONS = {`.
- Line 172: `export const PAYMENT_STATUS_TRANSITIONS = {`.
- Line 211: `export const isValidBookingStatus = (status) =>`.
- Line 215: `export const isValidBookingPaymentStatus = (status) =>`.
- Line 219: `export const isValidPaymentStatus = (status) =>`.
- Line 223: `export const isValidPaymentMethod = (method) =>`.
- Line 233: `export const canTransitionBookingStatus = (`.
- Line 242: `export const canTransitionBookingPaymentStatus = (`.
- Line 251: `export const canTransitionPaymentStatus = (`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
