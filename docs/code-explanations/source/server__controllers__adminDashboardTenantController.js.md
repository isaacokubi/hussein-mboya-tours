# Source explanation: server/controllers/adminDashboardTenantController.js

**Source:** [server/controllers/adminDashboardTenantController.js](../../../server/controllers/adminDashboardTenantController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `getPostedRevenueReport` from `../services/financeReportingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeReportingService.js](../../../server/services/financeReportingService.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)

## Runtime declarations and data flow

### `getDashboardStats` — lines 16–70

Parameters: `req`, `res`, `next`.
Persistent operations detected: User.countDocuments, Booking.countDocuments, Tour.countDocuments, Destination.countDocuments, Booking.aggregate, Booking.find, Staff.countDocuments, Agent.countDocuments, Vehicle.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 18:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 19:** `const usersFilter = tenantFilter(req, active);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const bookingsFilter = tenantFilter(req, active);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const toursFilter = tenantFilter(req, active);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const destinationsFilter = tenantFilter(req, { isDeleted: { $ne: true }, active: { $ne: false } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const staffFilter = tenantFilter(req, { isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const vehicleFilter = tenantFilter(req, { isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const agentFilter = tenantFilter(req, { status: { $ne: "deleted" } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const [users, bookings, tours, destinations, customers, revenueReport, bookingStatus, paymentStatus, pending, confirmed, completed, cancelled, recentBookings, popularTours, admins, staff, guides, drivers, agents, approve` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `User.countDocuments(usersFilter), Booking.countDocuments(bookingsFilter), Tour.countDocuments(toursFilter), Destination.countDocuments(destinationsFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 29:** `User.countDocuments(tenantFilter(req, { ...active, $or: [{ role: "customer" }, { legacyRole: "customer" }] })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 32:** `Booking.aggregate([{ $match: bookingsFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 33:** `Booking.aggregate([{ $match: bookingsFilter }, { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }]),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 34:** `Booking.countDocuments(tenantFilter(req, { ...active, status: "pending" })), Booking.countDocuments(tenantFilter(req, { ...active, status: "confirmed" })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 35:** `Booking.countDocuments(tenantFilter(req, { ...active, status: "completed" })), Booking.countDocuments(tenantFilter(req, { ...active, status: "cancelled" })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 36:** `Booking.find(bookingsFilter).sort({ createdAt: -1 }).limit(5).populate("customer", "name firstName lastName email phone").populate("user", "name firstName lastName email phone").populate("tour", "title").populate("custom` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 37:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 44:** `User.countDocuments(tenantFilter(req, { ...active, role: { $in: ["admin", "super_admin", "superadmin", "administrator"] } })), Staff.countDocuments(staffFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `first` — lines 60–60

Parameters: `...values`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 60:** `(...values) => values.map((value) => String(value ?? "").trim().replace(/\s+/g, " ")).find((value) => value && !/^(?:undefined(?:\s+undefined)?|null(?:\s+null)?)$/i.test(value)) || ""` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `getUserAnalytics` — lines 72–72

Parameters: `req`, `res`, `next`.
Persistent operations detected: User.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 72:** `async (req, res, next) => { try { requireTenantId(); const filter = tenantFilter(req, active); const [total, activeUsers, customers, agents] = await Promise.all([User.countDocuments(filter), User.countDocuments(tenantFil` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getBookingAnalytics` — lines 73–73

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 73:** `async (req, res, next) => { try { requireTenantId(); const status = await Booking.aggregate([{ $match: tenantFilter(req, active) }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]); res.json` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getRevenueAnalytics` — lines 74–74

Parameters: `req`, `res`, `next`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 74:** `async (req, res, next) => { try { requireTenantId(); const report = await getPostedRevenueReport(); res.json({ success: true, data: { monthly: report.monthly, revenueBasis: "posted_journals" } }); } catch (error) { next(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 13: `const active = { isDeleted: { $ne: true } };`.
- Line 14: `const paidPaymentStatuses = ["paid", "completed", "success"];`.
- Line 16: `export const getDashboardStats = async (req, res, next) => {`.
- Line 19: `const usersFilter = tenantFilter(req, active);`.
- Line 20: `const bookingsFilter = tenantFilter(req, active);`.
- Line 21: `const toursFilter = tenantFilter(req, active);`.
- Line 22: `const destinationsFilter = tenantFilter(req, { isDeleted: { $ne: true }, active: { $ne: false } });`.
- Line 23: `const staffFilter = tenantFilter(req, { isDeleted: { $ne: true } });`.
- Line 24: `const vehicleFilter = tenantFilter(req, { isDeleted: { $ne: true } });`.
- Line 25: `const agentFilter = tenantFilter(req, { status: { $ne: "deleted" } });`.
- Line 27: `const [users, bookings, tours, destinations, customers, revenueReport, bookingStatus, paymentStatus, pending, confirmed, completed, cancelled, recentBookings, popularTours, admins,`.
- Line 50: `const payments = {`.
- Line 55: `const normalizedBookings = recentBookings.map((booking) => {`.
- Line 56: `const customer = booking.customer || {};`.
- Line 57: `const user = booking.user || {};`.
- Line 58: `const snapshot = booking.customerSnapshot || {};`.
- Line 59: `const contact = booking.contact || {};`.
- Line 60: `const first = (...values) => values.map((value) => String(value ?? "").trim().replace(/\s+/g, " ")).find((value) => value && !/^(?:undefined(?:\s+undefined)?|null(?:\s+null)?)$/i.t`.
- Line 61: `const customerName = first(customer.name, [customer.firstName, customer.lastName].filter(Boolean).join(" "), snapshot.name, [snapshot.firstName, snapshot.lastName].filter(Boolean).`.
- Line 62: `const normalizedCustomer = { ...customer, name: customerName, email: first(customer.email, snapshot.email, contact.email, user.email), phone: first(customer.phone, snapshot.phone, `.
- Line 63: `const tour = booking.tour || (booking.customTourRequest?.destination ? { title: \`Custom tour — ${booking.customTourRequest.destination}\`, custom: true } : { title: "Tour record u`.
- Line 66: `const monthlyRevenue = revenueReport.monthly;`.
- Line 72: `export const getUserAnalytics = async (req, res, next) => { try { requireTenantId(); const filter = tenantFilter(req, active); const [total, activeUsers, customers, agents] = await`.
- Line 73: `export const getBookingAnalytics = async (req, res, next) => { try { requireTenantId(); const status = await Booking.aggregate([{ $match: tenantFilter(req, active) }, { $group: { _`.
- Line 74: `export const getRevenueAnalytics = async (req, res, next) => { try { requireTenantId(); const report = await getPostedRevenueReport(); res.json({ success: true, data: { monthly: re`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
