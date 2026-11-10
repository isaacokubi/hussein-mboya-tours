# Source explanation: server/services/operationsService.js

**Source:** [server/services/operationsService.js](../../../server/services/operationsService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Supplier` from `../models/Supplier.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Supplier.js](../../../server/models/Supplier.js)
- `PurchaseOrder` from `../models/PurchaseOrder.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PurchaseOrder.js](../../../server/models/PurchaseOrder.js)
- `TourCost` from `../models/TourCost.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCost.js](../../../server/models/TourCost.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `CorporateAccount` from `../models/CorporateAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CorporateAccount.js](../../../server/models/CorporateAccount.js)
- `Expense` from `../models/Expense.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Expense.js](../../../server/models/Expense.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `postSupplierPayable`, `postSupplierPayment` from `./financeLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeLifecycleService.js](../../../server/services/financeLifecycleService.js)
- `requireTenantId`, `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `money` — lines 14–14

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tenant` — lines 15–15

Parameters: `filter (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `assertObjectId` — lines 16–16

Parameters: `id`, `label`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `createSupplier` — lines 17–17

Parameters: `data`, `userId`.
Persistent operations detected: Supplier.create; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 17:** `async function createSupplier(data, userId) { requireTenantId(); return Supplier.create({ ...data, createdBy: userId }); }` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `createPurchaseOrder` — lines 18–18

Parameters: `data`, `userId`.
Persistent operations detected: Supplier.findOne, PurchaseOrder.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `async function createPurchaseOrder(data, userId) { requireTenantId(); assertObjectId(data.supplier, "Supplier"); if (data.booking) assertObjectId(data.booking, "Booking"); if (data.tour) assertObjectId(data.tour, "Tour")` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `transitionPurchaseOrder` — lines 19–19

Parameters: `id`, `status`, `userId`.
Persistent operations detected: PurchaseOrder.findOne, SupplierPayable.findOne, SupplierPayable.create, Expense.findOne, Expense.create; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `async function transitionPurchaseOrder(id, status, userId) { requireTenantId(); assertObjectId(id, "Purchase order"); const allowed = { draft: ["submitted", "cancelled"], submitted: ["approved", "cancelled"], approved: [` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createTourCost` — lines 20–20

Parameters: `data`, `userId`.
Persistent operations detected: TourCost.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `async function createTourCost(data, userId) { requireTenantId(); assertObjectId(data.tour, "Tour"); if (!(await Tour.exists(tenant({ _id: data.tour, isDeleted: { $ne: true } })))) throw new Error("Tour not found in this ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getTourProfitability` — lines 21–21

Parameters: `tourId`.
Persistent operations detected: Tour.findOne, TourCost.find, Booking.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `async function getTourProfitability(tourId) { requireTenantId(); assertObjectId(tourId, "Tour"); const filter = tenant(); const tour = await Tour.findOne({ ...filter, _id: tourId, isDeleted: { $ne: true } }).lean(); if (` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createSupplierPayable` — lines 22–22

Parameters: `data`, `userId`.
Persistent operations detected: SupplierPayable.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `async function createSupplierPayable(data, userId) { requireTenantId(); assertObjectId(data.supplier, "Supplier"); if (!(await Supplier.exists(tenant({ _id: data.supplier })))) throw new Error("Supplier not found in this` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `paySupplierPayable` — lines 23–23

Parameters: `id`, `amount`, `paymentReference (defaulted)`.
Persistent operations detected: SupplierPayable.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 23:** `async function paySupplierPayable(id, amount, paymentReference = "") { requireTenantId(); const payable = await SupplierPayable.findOne(tenant({ _id: id })); if (!payable) throw new Error("Supplier payable not found."); ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createCorporateAccount` — lines 24–24

Parameters: `data`, `userId`.
Persistent operations detected: CorporateAccount.create; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 24:** `async function createCorporateAccount(data, userId) { requireTenantId(); return CorporateAccount.create({ ...data, createdBy: userId }); }` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `reconcileCorporateAccountBalance` — lines 25–25

Parameters: `accountId`.
Persistent operations detected: CorporateAccount.findOne, Booking.find, Payment.aggregate; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `async function reconcileCorporateAccountBalance(accountId) { requireTenantId(); assertObjectId(accountId, "Corporate account"); const account = await CorporateAccount.findOne(tenant({ _id: accountId })); if (!account) th` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getResourceConflicts` — lines 26–26

Parameters: `{resourceType, resourceId, travelDate, excludeBookingId}`.
Persistent operations detected: Booking.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `async function getResourceConflicts({ resourceType, resourceId, travelDate, excludeBookingId }) { requireTenantId(); assertObjectId(resourceId, "Resource"); if (!travelDate) throw new Error("travelDate is required."); co` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 14: `const money = (n) => Math.round(Number(n || 0) * 100) / 100;`.
- Line 15: `const tenant = (filter = {}) => mergeTenantFilter(filter);`.
- Line 16: `const assertObjectId = (id, label) => { if (id && !mongoose.isValidObjectId(id)) throw new Error(\`${label} is invalid.\`); };`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
