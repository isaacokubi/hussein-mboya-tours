# Source explanation: server/controllers/operationsController.js

**Source:** [server/controllers/operationsController.js](../../../server/controllers/operationsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `CustomTourRequest` from `../models/CustomTourRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CustomTourRequest.js](../../../server/models/CustomTourRequest.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Supplier` from `../models/Supplier.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Supplier.js](../../../server/models/Supplier.js)
- `PurchaseOrder` from `../models/PurchaseOrder.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PurchaseOrder.js](../../../server/models/PurchaseOrder.js)
- `TourCost` from `../models/TourCost.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCost.js](../../../server/models/TourCost.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `CorporateAccount` from `../models/CorporateAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CorporateAccount.js](../../../server/models/CorporateAccount.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `refId` — lines 16–16

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ownedIds` — lines 18–23

Parameters: `Model`, `ids`, `tenantId`.
Persistent operations detected: Model.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const values = [...new Set(ids.map(refId).filter(Boolean))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (!values.length) return new Set();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const rows = await Model.find({ _id: { $in: values }, tenantId }).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `return new Set(rows.map((row) => String(row._id)));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `filterTenantBookings` — lines 25–46

Parameters: `rows`, `tenantId`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `if (!rows.length) return [];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const [customers, users, tours, customTourRequests, staff, vehicles] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `return rows.filter((b) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 36:** `if (!b.tenantId || String(b.tenantId) !== String(tenantId)) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `if (b.customer && !customers.has(refId(b.customer))) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (b.user && !users.has(refId(b.user))) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `if (b.tour && !tours.has(refId(b.tour))) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `if (b.customTourRequest && !customTourRequests.has(refId(b.customTourRequest))) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `if (b.assignedGuide && !staff.has(refId(b.assignedGuide))) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `if (b.assignedDriver && !staff.has(refId(b.assignedDriver))) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `if (b.assignedVehicle && !vehicles.has(refId(b.assignedVehicle))) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `return Boolean(b.tour || b.customTourRequest);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getOperationsOverview` — lines 48–83

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.find, Vehicle.find, Staff.find, Supplier.countDocuments, PurchaseOrder.find, TourCost.find, SupplierPayable.find, CorporateAccount.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 49:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 50:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const bookingFilter = { ...filter, isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const [rawBookings, vehicles, staff, rawSchedule, suppliers, purchaseOrders, tourCosts, payables, corporateAccounts] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 54:** `Booking.find(bookingFilter).populate("tour", "title destination durationDays").populate("user", "name email phone").sort({ travelDate: 1 }).limit(200).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 55:** `Vehicle.find({ ...filter, isDeleted: { $ne: true } }).select("name registrationNumber plateNumber status availability").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 56:** `Staff.find({ ...filter, isDeleted: { $ne: true } }).select("name email role availability status").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 57:** `Booking.find({ ...bookingFilter, status: { $in: ["confirmed", "assigned", "ongoing", "pending"] }, travelDate: { $gte: new Date() } }).populate("tour", "title").populate("customTourRequest", "title destination").sort({ t` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 58:** `Supplier.countDocuments({ ...filter, status: "active" }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 59:** `PurchaseOrder.find({ ...filter, isDeleted: { $ne: true } }).select("status totalAmount").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 60:** `TourCost.find({ ...filter, isDeleted: { $ne: true }, status: { $ne: "cancelled" } }).select("totalCost").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 61:** `SupplierPayable.find({ ...filter, isDeleted: { $ne: true }, status: { $nin: ["paid", "cancelled"] } }).select("balance").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 62:** `CorporateAccount.find({ ...filter, isDeleted: { $ne: true }, status: "active" }).select("creditLimit currentBalance").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 64:** `const bookings = await filterTenantBookings(rawBookings, tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 65:** `const schedule = await filterTenantBookings(rawSchedule, tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 66:** `const guides = staff.filter((s) => ["guide", "tour_guide"].includes(String(s.role || "").toLowerCase()));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `const drivers = staff.filter((s) => String(s.role || "").toLowerCase() === "driver");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 16: `const refId = (value) => value ? String(value._id || value) : "";`.
- Line 18: `const ownedIds = async (Model, ids, tenantId) => {`.
- Line 19: `const values = [...new Set(ids.map(refId).filter(Boolean))];`.
- Line 21: `const rows = await Model.find({ _id: { $in: values }, tenantId }).select("_id").lean();`.
- Line 25: `const filterTenantBookings = async (rows, tenantId) => {`.
- Line 27: `const [customers, users, tours, customTourRequests, staff, vehicles] = await Promise.all([`.
- Line 48: `export const getOperationsOverview = async (req, res, next) => {`.
- Line 50: `const tenantId = requireTenantId();`.
- Line 51: `const filter = tenantFilter(req);`.
- Line 52: `const bookingFilter = { ...filter, isDeleted: { $ne: true } };`.
- Line 53: `const [rawBookings, vehicles, staff, rawSchedule, suppliers, purchaseOrders, tourCosts, payables, corporateAccounts] = await Promise.all([`.
- Line 64: `const bookings = await filterTenantBookings(rawBookings, tenantId);`.
- Line 65: `const schedule = await filterTenantBookings(rawSchedule, tenantId);`.
- Line 66: `const guides = staff.filter((s) => ["guide", "tour_guide"].includes(String(s.role || "").toLowerCase()));`.
- Line 67: `const drivers = staff.filter((s) => String(s.role || "").toLowerCase() === "driver");`.
- Line 68: `const today = new Date(); today.setHours(0, 0, 0, 0);`.
- Line 69: `const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);`.
- Line 70: `const todayBookings = bookings.filter((b) => { const d = new Date(b.travelDate); return d >= today && d < tomorrow; });`.
- Line 71: `const assigned = schedule.filter((b) => b.assignedDriver || b.assignedGuide || b.assignedVehicle).length;`.
- Line 74: `const committedPoStatuses = new Set(["submitted", "approved", "partially_received", "received"]);`.
- Line 75: `const procurementValue = purchaseOrders`.
- Line 78: `const outstandingPayables = payables.reduce((sum, item) => sum + Number(item.balance || 0), 0);`.
- Line 79: `const totalTourCost = tourCosts.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);`.
- Line 80: `const corporateExposure = corporateAccounts.reduce((sum, item) => sum + Number(item.currentBalance || 0), 0);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
