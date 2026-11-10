# Source explanation: server/controllers/adminAIFinanceForecastController.js

**Source:** [server/controllers/adminAIFinanceForecastController.js](../../../server/controllers/adminAIFinanceForecastController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)

## Runtime declarations and data flow

### `getAIFinancialForecast` — lines 6–215

Parameters: `req`, `res`, `next`.
Persistent operations detected: Payment.aggregate, Booking.aggregate; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** `const revenueHistory =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `await Payment.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 57:** `const bookingHistory =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 93:** `const totalRevenue =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `const totalBookings =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 111:** `const averageRevenue =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `const averageBookings =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 133:** `const forecast = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 152:** `const recommendations=[];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 156:** `if(averageBookings > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 166:** `if(averageRevenue < 100000){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 176:** `if(!recommendations.length){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 186:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 6: `export const getAIFinancialForecast = async(`.
- Line 16: `const revenueHistory =`.
- Line 57: `const bookingHistory =`.
- Line 93: `const totalRevenue =`.
- Line 102: `const totalBookings =`.
- Line 111: `const averageRevenue =`.
- Line 122: `const averageBookings =`.
- Line 133: `const forecast = {`.
- Line 152: `const recommendations=[];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
