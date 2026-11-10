# Source explanation: server/utils/emailTemplates.js

**Source:** [server/utils/emailTemplates.js](../../../server/utils/emailTemplates.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `bookingConfirmationEmail` — lines 7–139

Parameters: `{customerName, bookingNumber, tourName, amount, travelDate, paymentMethod, companyName}`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `return \`` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `export const bookingConfirmationEmail = ({`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
