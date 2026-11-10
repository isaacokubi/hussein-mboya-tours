# Source explanation: server/controllers/financeController.js

**Source:** [server/controllers/financeController.js](../../../server/controllers/financeController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `getPostedRevenueReport` from `../services/financeReportingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeReportingService.js](../../../server/services/financeReportingService.js)

## Runtime declarations and data flow

### `tenantPaymentFilter` — lines 10–10

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tenantBookingFilter` — lines 11–11

Parameters: `extra (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getFinanceStats` — lines 13–13

Parameters: `req`, `res`, `next`.
Persistent operations detected: Payment.countDocuments, Payment.aggregate, Booking.countDocuments, Commission.aggregate; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 13:** `async (req, res, next) => { requireTenantId(); try { const [revenueReport, completedPayments, pendingPayments, failedPayments, refundedPayments, refundedAmountResult, paidBookings, commissionResult] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getTransactions` — lines 15–15

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: User.find, Booking.find, Payment.find, Payment.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `async (req, res, next) => { requireTenantId(); try { const { page = 1, status, search, startDate, endDate } = req.query; const currentPage = Math.max(Number(page) || 1, 1); const pageSize = TRANSACTION_PAGE_SIZE; const s` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getReports` — lines 17–42

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Payment.aggregate; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 20:** `const { from, to } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const dateFilter = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `if (from) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `const start = new Date(\`${from}T00:00:00.000Z\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!Number.isNaN(start.getTime())) dateFilter.$gte = start;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (to) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const end = new Date(\`${to}T23:59:59.999Z\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `if (!Number.isNaN(end.getTime())) dateFilter.$lte = end;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const revenueReport = await getPostedRevenueReport({ from: from ? \`${from}T00:00:00.000Z\` : undefined, to: to ? \`${to}T23:59:59.999Z\` : undefined });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `const monthlyRevenue = revenueReport.monthly;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const collectionMatch = tenantPaymentFilter("completed");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (Object.keys(dateFilter).length) collectionMatch.createdAt = dateFilter;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const monthlyCollections = await Payment.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `return res.status(200).json({ success: true, data: { monthlyRevenue, monthlyCollections, revenueBasis: "posted_journals", collectionBasis: "completed_payments" } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `const PAYMENT_STATUSES = ["pending", "completed", "failed", "cancelled", "refunded"];`.
- Line 9: `const TRANSACTION_PAGE_SIZE = 10;`.
- Line 10: `const tenantPaymentFilter = (status) => mergeTenantFilter({ status });`.
- Line 11: `const tenantBookingFilter = (extra = {}) => mergeTenantFilter(extra);`.
- Line 13: `export const getFinanceStats = async (req, res, next) => { requireTenantId(); try { const [revenueReport, completedPayments, pendingPayments, failedPayments, refundedPayments, refu`.
- Line 15: `export const getTransactions = async (req, res, next) => { requireTenantId(); try { const { page = 1, status, search, startDate, endDate } = req.query; const currentPage = Math.max`.
- Line 17: `export const getReports = async (req, res, next) => {`.
- Line 20: `const { from, to } = req.query;`.
- Line 21: `const dateFilter = {};`.
- Line 23: `const start = new Date(\`${from}T00:00:00.000Z\`);`.
- Line 27: `const end = new Date(\`${to}T23:59:59.999Z\`);`.
- Line 30: `const revenueReport = await getPostedRevenueReport({ from: from ? \`${from}T00:00:00.000Z\` : undefined, to: to ? \`${to}T23:59:59.999Z\` : undefined });`.
- Line 31: `const monthlyRevenue = revenueReport.monthly;`.
- Line 32: `const collectionMatch = tenantPaymentFilter("completed");`.
- Line 34: `const monthlyCollections = await Payment.aggregate([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
