# Source explanation: server/controllers/adminController.js

**Source:** [server/controllers/adminController.js](../../../server/controllers/adminController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `getBookingRevenueMetrics` from `../services/bookingRevenueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingRevenueService.js](../../../server/services/bookingRevenueService.js)
- `getPostedRevenueReport` from `../services/financeReportingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeReportingService.js](../../../server/services/financeReportingService.js)

## Runtime declarations and data flow

### `cleanName` — lines 11–14

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 12:** `const text = String(value ?? "").trim().replace(/\s+/g, " ");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `return text && !/^undefined( undefined)?$/i.test(text) && !/^null( null)?$/i.test(text) ? text : "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `bookingCustomerFallback` — lines 16–33

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 17:** `const customer = booking?.customer || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const snapshot = booking?.customerSnapshot || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const contact = booking?.contact || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const user = booking?.user || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const name = cleanName(customer.name)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `bookingTourFallback` — lines 35–41

Parameters: `booking`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 36:** `if (booking?.tour) return booking.tour;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `if (booking?.customTourRequest?.destination) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `return { title: \`Custom tour — ${booking.customTourRequest.destination}\`, custom: true };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 40:** `return { title: "Tour unavailable", deleted: true };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getDashboardStats` — lines 43–127

Parameters: `req`, `res`, `next`.
Persistent operations detected: User.countDocuments, Booking.countDocuments, Tour.countDocuments, Destination.countDocuments, Booking.aggregate, Booking.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 44:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 46:** `const userFilter = mergeTenantFilter({ isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const bookingFilter = mergeTenantFilter({ isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const tourFilter = mergeTenantFilter({ isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const destinationFilter = mergeTenantFilter({ isDeleted: false, active: true });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const [users, bookings, tours, destinations, revenueData, status, monthlyRevenue, popularTours, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, paymentStatsData] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `User.countDocuments(userFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 53:** `Booking.countDocuments(bookingFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 54:** `Tour.countDocuments(tourFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 55:** `Destination.countDocuments(destinationFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 57:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 63:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 75:** `Booking.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, status: "pending" })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 76:** `Booking.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, status: "confirmed" })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 77:** `Booking.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, status: "completed" })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 78:** `Booking.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, status: "cancelled" })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 79:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 85:** `const paymentStats = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getUserAnalytics` — lines 129–139

Parameters: `req`, `res`, `next`.
Persistent operations detected: User.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 130:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 131:** `const [total, active, customers, agents] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 132:** `User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true } })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 133:** `User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, isActive: { $ne: false } })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 134:** `User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, $or: [{ role: "customer" }, { legacyRole: "customer" }] })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 135:** `User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, role: "agent" })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 137:** `return res.status(200).json({ success: true, data: { total, active, customers, agents } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getBookingAnalytics` — lines 141–150

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 142:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 143:** `const status = await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 148:** `return res.status(200).json({ success: true, data: { status } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getRevenueAnalytics` — lines 152–158

Parameters: `req`, `res`, `next`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 153:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 154:** `const report = await getPostedRevenueReport();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 155:** `const monthly = report.monthly;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 156:** `return res.status(200).json({ success: true, data: { monthly, revenueBasis: "posted_journals" } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 11: `const cleanName = (value) => {`.
- Line 12: `const text = String(value ?? "").trim().replace(/\s+/g, " ");`.
- Line 16: `const bookingCustomerFallback = (booking) => {`.
- Line 17: `const customer = booking?.customer || {};`.
- Line 18: `const snapshot = booking?.customerSnapshot || {};`.
- Line 19: `const contact = booking?.contact || {};`.
- Line 20: `const user = booking?.user || {};`.
- Line 21: `const name = cleanName(customer.name)`.
- Line 35: `const bookingTourFallback = (booking) => {`.
- Line 43: `export const getDashboardStats = async (req, res, next) => {`.
- Line 46: `const userFilter = mergeTenantFilter({ isDeleted: { $ne: true } });`.
- Line 47: `const bookingFilter = mergeTenantFilter({ isDeleted: { $ne: true } });`.
- Line 48: `const tourFilter = mergeTenantFilter({ isDeleted: { $ne: true } });`.
- Line 49: `const destinationFilter = mergeTenantFilter({ isDeleted: false, active: true });`.
- Line 51: `const [users, bookings, tours, destinations, revenueData, status, monthlyRevenue, popularTours, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, paymentSta`.
- Line 85: `const paymentStats = {`.
- Line 91: `const recentRaw = await Booking.find(bookingFilter)`.
- Line 100: `const recentBookings = recentRaw.map((booking) => ({`.
- Line 129: `export const getUserAnalytics = async (req, res, next) => {`.
- Line 131: `const [total, active, customers, agents] = await Promise.all([`.
- Line 141: `export const getBookingAnalytics = async (req, res, next) => {`.
- Line 143: `const status = await Booking.aggregate([`.
- Line 152: `export const getRevenueAnalytics = async (req, res, next) => {`.
- Line 154: `const report = await getPostedRevenueReport();`.
- Line 155: `const monthly = report.monthly;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
