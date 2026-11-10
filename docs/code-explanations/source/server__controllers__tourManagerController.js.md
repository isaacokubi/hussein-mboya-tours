# Source explanation: server/controllers/tourManagerController.js

**Source:** [server/controllers/tourManagerController.js](../../../server/controllers/tourManagerController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `getBookingRevenueMetrics` from `../services/bookingRevenueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingRevenueService.js](../../../server/services/bookingRevenueService.js)
- `cancelTourAndBookings` from `../services/tourCancellationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tourCancellationService.js](../../../server/services/tourCancellationService.js)

## Runtime declarations and data flow

### `getTourManagerDashboard` — lines 15–109

Parameters: `req`, `res`, `next`.
Persistent operations detected: Tour.countDocuments, User.countDocuments, Tour.find, Booking.find, Booking.aggregate; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 17:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 18:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const tourFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const bookingFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const customerFilter = mergeTenantFilter(req, { $or: [{ role: "customer" }, { legacyRole: "customer" }] });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const paymentFilter = mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const upcomingFilter = mergeTenantFilter(req, {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const [totalTours, upcomingToursCount, totalCustomers, revenueResult, upcomingTours, recentBookings] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `Tour.countDocuments(tourFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 31:** `Tour.countDocuments(upcomingFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 32:** `User.countDocuments(customerFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 34:** `Tour.find(upcomingFilter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 40:** `Booking.find(bookingFilter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 48:** `const tourIds = upcomingTours.map((tour) => tour._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const guestStats = tourIds.length ? await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** `const guestMap = new Map(guestStats.map((item) => [item._id.toString(), Number(item.guests || 0)]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const formattedTours = upcomingTours.map((tour) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const guests = guestMap.get(tour._id.toString()) || 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `cleanText` — lines 70–73

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 71:** `const text = String(value ?? "").trim().replace(/\s+/g, " ");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `return text && !/^(?:undefined(?:\s+undefined)?|null(?:\s+null)?)$/i.test(text) ? text : "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTours` — lines 111–130

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Tour.find, Tour.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 113:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 114:** `const { upcoming, page = 1, limit = 10, status } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 115:** `const filter = mergeTenantFilter(req, { isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 116:** `if (status) filter.status = status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 117:** `if (upcoming === "true" || upcoming === "1") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 118:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `const currentPage = Math.max(Number(page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 123:** `const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `const [tours, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 125:** `Tour.find(filter).populate("assignedGuide", "name email phone position availability").populate("assignedDriver", "name email phone position availability").populate("assignedVehicle", "name registrationNumber type capacit` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 126:** `Tour.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 128:** `return res.status(200).json({ success: true, count: tours.length, total, data: tours, tours, pagination: { total, page: currentPage, limit: pageLimit, pages: Math.ceil(total / pageLimit) } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 12: `const ACTIVE_TOUR_STATUSES = ["scheduled", "upcoming", "confirmed", "active", "ongoing"];`.
- Line 13: `const BOOKING_GUEST_STATUSES = ["confirmed", "assigned", "ongoing", "completed"];`.
- Line 15: `export const getTourManagerDashboard = async (req, res, next) => {`.
- Line 18: `const now = new Date();`.
- Line 19: `const tourFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });`.
- Line 20: `const bookingFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });`.
- Line 21: `const customerFilter = mergeTenantFilter(req, { $or: [{ role: "customer" }, { legacyRole: "customer" }] });`.
- Line 22: `const paymentFilter = mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } });`.
- Line 23: `const upcomingFilter = mergeTenantFilter(req, {`.
- Line 29: `const [totalTours, upcomingToursCount, totalCustomers, revenueResult, upcomingTours, recentBookings] = await Promise.all([`.
- Line 48: `const tourIds = upcomingTours.map((tour) => tour._id);`.
- Line 49: `const guestStats = tourIds.length ? await Booking.aggregate([`.
- Line 53: `const guestMap = new Map(guestStats.map((item) => [item._id.toString(), Number(item.guests || 0)]));`.
- Line 55: `const formattedTours = upcomingTours.map((tour) => {`.
- Line 56: `const guests = guestMap.get(tour._id.toString()) || 0;`.
- Line 57: `const capacity = Number(tour.capacity || tour.availabilitySettings?.totalSlots || 0);`.
- Line 70: `const cleanText = (value) => {`.
- Line 71: `const text = String(value ?? "").trim().replace(/\s+/g, " ");`.
- Line 74: `const formattedBookings = recentBookings.map((booking) => {`.
- Line 75: `const customer = booking.customer || {};`.
- Line 76: `const user = booking.user || {};`.
- Line 77: `const snapshot = booking.customerSnapshot || {};`.
- Line 78: `const contact = booking.contact || {};`.
- Line 79: `const customerName = [`.
- Line 86: `const customerEmail = [customer.email, snapshot.email, contact.email, user.email].map(cleanText).find(Boolean);`.
- Line 87: `const customerPhone = [customer.phone, snapshot.phone, contact.phone, user.phone].map(cleanText).find(Boolean);`.
- Line 88: `const tour = booking.tour || (booking.customTourRequest?.destination`.
- Line 111: `export const getTours = async (req, res, next) => {`.
- Line 114: `const { upcoming, page = 1, limit = 10, status } = req.query;`.
- Line 115: `const filter = mergeTenantFilter(req, { isDeleted: { $ne: true } });`.
- Line 118: `const now = new Date();`.
- Line 122: `const currentPage = Math.max(Number(page) || 1, 1);`.
- Line 123: `const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);`.
- Line 124: `const [tours, total] = await Promise.all([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
