# Source explanation: server/controllers/adminDashboardMetricsController.js

**Source:** [server/controllers/adminDashboardMetricsController.js](../../../server/controllers/adminDashboardMetricsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getBookingRevenueMetrics` from `../services/bookingRevenueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingRevenueService.js](../../../server/services/bookingRevenueService.js)
- `getPostedRevenueReport` from `../services/financeReportingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeReportingService.js](../../../server/services/financeReportingService.js)

## Runtime declarations and data flow

### `clean` — lines 18–18

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `good` — lines 19–19

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `customerName` — lines 20–20

Parameters: `customer`, `user`, `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getDashboardMetrics` — lines 22–93

Parameters: `req`, `res`.
Persistent operations detected: User.countDocuments, Staff.countDocuments, Agent.countDocuments, Vehicle.countDocuments, Tour.countDocuments, Destination.countDocuments, Booking.countDocuments, Payment.countDocuments, Booking.aggregate, Booking.find, Review.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 23:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 24:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const scoped = (q = {}) => ({ tenantId, ...q });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const [users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, bookings, pendingBookings, confirmedBooking` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `User.countDocuments(scoped({ ...active, status: { $ne: "blocked" } })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 28:** `User.countDocuments(scoped({ ...active, ...customerUserFilter, status: { $ne: "blocked" } })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 29:** `Staff.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] } })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 30:** `Staff.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] }, $or: [{ position: "guide" }, { role: "guide" }] })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 31:** `Staff.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] }, $or: [{ position: "driver" }, { role: "driver" }] })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 32:** `Agent.countDocuments(scoped({ isDeleted: { $ne: true }, status: { $ne: "inactive" } })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 33:** `Agent.countDocuments(scoped({ isDeleted: { $ne: true }, status: { $ne: "inactive" }, $or: [{ isApproved: true }, { status: "approved" }] })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 34:** `Agent.countDocuments(scoped({ isDeleted: { $ne: true }, status: { $nin: ["inactive", "approved"] }, isApproved: { $ne: true } })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 35:** `Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false } })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 36:** `Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: "available" })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 37:** `Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: "assigned" })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 38:** `Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: "maintenance" })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 39:** `Tour.countDocuments(scoped(active)),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 40:** `Destination.countDocuments(scoped(active)),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `scoped` — lines 25–25

Parameters: `q (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getUserAnalytics` — lines 95–95

Parameters: `req`, `res`.
Persistent operations detected: User.countDocuments, Agent.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 95:** `async (req, res) => { try { const tenantId = requireTenantId(); const filter = { tenantId, ...active }; const [total, activeUsers, customers, agents] = await Promise.all([User.countDocuments(filter), User.countDocuments(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getBookingAnalytics` — lines 96–96

Parameters: `req`, `res`.
Persistent operations detected: Booking.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 96:** `async (req, res) => { try { const tenantId = requireTenantId(); const status = await Booking.aggregate([{ $match: { tenantId, ...active } }, { $group: { _id: "$status", count: { $sum: 1 } } }]); return res.json({ success` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getRevenueAnalytics` — lines 97–97

Parameters: `req`, `res`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 97:** `async (req, res) => { try { requireTenantId(); const report = await getPostedRevenueReport(); return res.json({ success: true, data: { monthly: report.monthly, revenueBasis: "posted_journals" } }); } catch (error) { retu` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 15: `const active = { isDeleted: { $ne: true } };`.
- Line 16: `const paidStatuses = ["paid", "completed", "success"];`.
- Line 17: `const customerUserFilter = { $or: [{ role: "customer" }, { legacyRole: "customer" }] };`.
- Line 18: `const clean = (v) => String(v ?? "").trim().replace(/\s+/g, " ");`.
- Line 19: `const good = (v) => { const s = clean(v); return s && !/^undefined(?: undefined)?$/i.test(s) && !/^null(?: null)?$/i.test(s) ? s : ""; };`.
- Line 20: `const customerName = (customer, user, booking) => good(customer?.name) || \`${good(customer?.firstName) || good(user?.firstName) || good(booking?.customerSnapshot?.firstName)} ${go`.
- Line 22: `export const getDashboardMetrics = async (req, res) => {`.
- Line 24: `const tenantId = requireTenantId();`.
- Line 25: `const scoped = (q = {}) => ({ tenantId, ...q });`.
- Line 26: `const [users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, boo`.
- Line 60: `const revenue = Number(revenueResult?.revenue || 0);`.
- Line 61: `const gross = revenue;`.
- Line 62: `const refunds = 0;`.
- Line 63: `const statusData = bookingStatus.map((x) => ({ status: clean(x._id).toLowerCase() || "unknown", count: Number(x.count || 0) }));`.
- Line 64: `const recentBookings = recentBookingsRaw.map((b) => ({ ...b, customer: { ...(b.customer || {}), name: customerName(b.customer, b.user, b), email: b.customer?.email || b.user?.email`.
- Line 65: `const monthly = monthlyRevenue.monthly.map((x) => ({ month: \`${x._id.month}/${x._id.year}\`, amount: Number(x.revenue || 0) }));`.
- Line 66: `const paymentStats = { completed: completedPayments, completedAmount: revenue, pending: pendingPayments, failed: failedPayments };`.
- Line 67: `const conversionRate = bookings > 0 ? Number((((confirmedBookings + completedBookings) / bookings) * 100).toFixed(1)) : 0;`.
- Line 68: `const averageBookingValue = averageBookingResult[0]?.average != null ? Number(averageBookingResult[0].average) : 0;`.
- Line 69: `const customerRating = customerRatingResult[0]?.average != null ? Number(customerRatingResult[0].average.toFixed(1)) : 0;`.
- Line 70: `const topTour = popularTours[0] || null;`.
- Line 95: `export const getUserAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const filter = { tenantId, ...active }; const [total, activeUsers, customers, agents`.
- Line 96: `export const getBookingAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const status = await Booking.aggregate([{ $match: { tenantId, ...active } }, { $g`.
- Line 97: `export const getRevenueAnalytics = async (req, res) => { try { requireTenantId(); const report = await getPostedRevenueReport(); return res.json({ success: true, data: { monthly: r`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
