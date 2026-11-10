# Source explanation: client/src/components/admin/dashboard/StatsGrid.jsx

**Source:** [client/src/components/admin/dashboard/StatsGrid.jsx](../../../client/src/components/admin/dashboard/StatsGrid.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `StatCard` from `./Statcard`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/dashboard/Statcard](../../../client/src/components/admin/dashboard/Statcard.jsx)
- `firstNumeric`, `numeric`, `unwrapData` from `../../../utils/dashboardData`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/dashboardData](../../../client/src/utils/dashboardData.js)

## Runtime declarations and data flow

### `number` — lines 4–4

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `money` — lines 5–5

Parameters: `value`, `currency (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `StatsGrid` — lines 7–89

Parameters: `{stats, summary}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 8:** `const source = unwrapData(stats);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const paymentStats = source.paymentStats || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const paymentCount = firstNumeric(source.payments, paymentStats.completed, paymentStats.pending, paymentStats.failed);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const cards = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const primaryCards = [cards.revenue, cards.bookings, cards.payments, cards.customers];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const operationalCards = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const number = (value) => numeric(value).toLocaleString();`.
- Line 5: `const money = (value, currency = "KES") => \`${currency} ${number(value)}\`;`.
- Line 8: `const source = unwrapData(stats);`.
- Line 9: `const paymentStats = source.paymentStats || {};`.
- Line 13: `const paymentCount = firstNumeric(source.payments, paymentStats.completed, paymentStats.pending, paymentStats.failed);`.
- Line 15: `const cards = {`.
- Line 35: `const primaryCards = [cards.revenue, cards.bookings, cards.payments, cards.customers];`.
- Line 36: `const operationalCards = [`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
