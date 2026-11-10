# Source explanation: server/controllers/customerController.js

**Source:** [server/controllers/customerController.js](../../../server/controllers/customerController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `Quotation` from `../models/Quotation.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Quotation.js](../../../server/models/Quotation.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)

## Runtime declarations and data flow

### `isValidId` — lines 14–14

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getConfirmedSpend` — lines 19–32

Parameters: `booking`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const bookingStatus = String(booking.status || "pending").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const paymentStatus = String(booking.paymentStatus || "pending").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const bookingValue = Number(booking.totalAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `return Math.max(0, bookingValue - Number(booking.refundAmount || 0));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCustomers` — lines 34–56

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Role.find, User.find, User.countDocuments, Customer.find, Booking.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 36:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 37:** `const { search = "", page = 1 } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const currentPage = Math.max(Number(page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const pageSize = CUSTOMER_PAGE_SIZE;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const skip = (currentPage - 1) * pageSize;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const nonCustomerRoleIds = await Role.find(mergeTenantFilter({ name: { $nin: ["customer", "Customer"] } })).distinct("_id");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `const filter = mergeTenantFilter({ isDeleted: { $ne: true }, $and: [{ $or: [{ role: "customer" }, { legacyRole: "customer" }] }, { $or: [{ roleId: null }, { roleId: { $nin: nonCustomerRoleIds } }] }] });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const trimmedSearch = String(search).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `if (trimmedSearch) { const regex = { $regex: trimmedSearch, $options: "i" }; filter.$and = [{ $or: [{ role: "customer" }, { legacyRole: "customer" }] }, { $or: [{ name: regex }, { email: regex }, { phone: regex }] }, { $` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `const [customers, total] = await Promise.all([User.find(filter).select("name email phone role roleId legacyRole status createdAt").populate("roleId", "name displayName").sort({ createdAt: -1 }).skip(skip).limit(pageSize)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `const customerIds = customers.map((customer) => customer._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const customerRecords = await Customer.find(mergeTenantFilter({ user: { $in: customerIds } })).select("_id user customerType").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `const legacyCustomerIds = customerRecords.map((customer) => customer._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const legacyToUser = new Map(customerRecords.map((customer) => [customer._id.toString(), customer.user?.toString()]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const bookingStats = await Booking.find(mergeTenantFilter({ isDeleted: { $ne: true }, $or: [{ user: { $in: customerIds } }, { customer: { $in: legacyCustomerIds } }] })).select("user customer status totalAmount depositAm` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 51:** `const statsMap = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `for (const booking of bookingStats) { const ownerId = booking.user?.toString() || legacyToUser.get(booking.customer?.toString()); if (!ownerId) continue; if (!statsMap[ownerId]) statsMap[ownerId] = { totalBookings: 0, co` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 53:** `const data = customers.map((customer) => { const stats = statsMap[customer._id.toString()] || { totalBookings: 0, confirmedBookings: 0, confirmedSpend: 0 }; const legacy = customerRecords.find((record) => record.user?.to` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getCustomerProfile` — lines 58–58

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: User.findOne, Customer.findOne, Booking.find, Invoice.find, Quotation.find, Review.find, Notification.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 58:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 14: `const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);`.
- Line 15: `const successfulBookingStatuses = new Set(["confirmed", "assigned", "ongoing", "completed"]);`.
- Line 16: `const excludedPaymentStatuses = new Set(["failed", "cancelled", "refunded"]);`.
- Line 17: `const CUSTOMER_PAGE_SIZE = 10;`.
- Line 19: `const getConfirmedSpend = (booking) => {`.
- Line 20: `const bookingStatus = String(booking.status || "pending").toLowerCase();`.
- Line 21: `const paymentStatus = String(booking.paymentStatus || "pending").toLowerCase();`.
- Line 30: `const bookingValue = Number(booking.totalAmount || 0);`.
- Line 34: `export const getCustomers = async (req, res, next) => {`.
- Line 37: `const { search = "", page = 1 } = req.query;`.
- Line 38: `const currentPage = Math.max(Number(page) || 1, 1);`.
- Line 39: `const pageSize = CUSTOMER_PAGE_SIZE;`.
- Line 40: `const skip = (currentPage - 1) * pageSize;`.
- Line 41: `const nonCustomerRoleIds = await Role.find(mergeTenantFilter({ name: { $nin: ["customer", "Customer"] } })).distinct("_id");`.
- Line 42: `const filter = mergeTenantFilter({ isDeleted: { $ne: true }, $and: [{ $or: [{ role: "customer" }, { legacyRole: "customer" }] }, { $or: [{ roleId: null }, { roleId: { $nin: nonCust`.
- Line 43: `const trimmedSearch = String(search).trim();`.
- Line 45: `const [customers, total] = await Promise.all([User.find(filter).select("name email phone role roleId legacyRole status createdAt").populate("roleId", "name displayName").sort({ cre`.
- Line 46: `const customerIds = customers.map((customer) => customer._id);`.
- Line 47: `const customerRecords = await Customer.find(mergeTenantFilter({ user: { $in: customerIds } })).select("_id user customerType").lean();`.
- Line 48: `const legacyCustomerIds = customerRecords.map((customer) => customer._id);`.
- Line 49: `const legacyToUser = new Map(customerRecords.map((customer) => [customer._id.toString(), customer.user?.toString()]));`.
- Line 50: `const bookingStats = await Booking.find(mergeTenantFilter({ isDeleted: { $ne: true }, $or: [{ user: { $in: customerIds } }, { customer: { $in: legacyCustomerIds } }] })).select("us`.
- Line 51: `const statsMap = {};`.
- Line 53: `const data = customers.map((customer) => { const stats = statsMap[customer._id.toString()] || { totalBookings: 0, confirmedBookings: 0, confirmedSpend: 0 }; const legacy = customer`.
- Line 58: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
