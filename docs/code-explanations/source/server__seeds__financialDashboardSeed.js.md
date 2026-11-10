# Source explanation: server/seeds/financialDashboardSeed.js

**Source:** [server/seeds/financialDashboardSeed.js](../../../server/seeds/financialDashboardSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fileURLToPath` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `Expense` from `../models/Expense.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Expense.js](../../../server/models/Expense.js)
- `CreditDebitNote` from `../models/CreditDebitNote.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CreditDebitNote.js](../../../server/models/CreditDebitNote.js)
- `Supplier` from `../models/Supplier.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Supplier.js](../../../server/models/Supplier.js)
- `PurchaseOrder` from `../models/PurchaseOrder.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PurchaseOrder.js](../../../server/models/PurchaseOrder.js)
- `TourCost` from `../models/TourCost.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCost.js](../../../server/models/TourCost.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `Quotation` from `../models/Quotation.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Quotation.js](../../../server/models/Quotation.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `postInvoiceToLedger`, `postPaymentToLedger`, `postPaymentRefundToLedger` from `../services/operationalAccountingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/operationalAccountingService.js](../../../server/services/operationalAccountingService.js)

## Runtime declarations and data flow

### `round` — lines 40–40

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `daysFromNow` — lines 41–41

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `seededPaymentAmounts` — lines 43–49

Parameters: `status`, `total`, `paid`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 44:** `const netPaid = status === "refunded"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const totalAmount = Math.max(0, Number(total) || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `return { amountPaid: netPaid, balance: round(totalAmount - netPaid) };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `clearTransactionalData` — lines 74–90

Parameters: `tenantId`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 75:** `const filter = { tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `seedTenant` — lines 92–511

Parameters: `tenant`, `tenantIndex`.
Persistent operations detected: Customer.find, Tour.find, User.find, Staff.find, Agent.find, Supplier.find, Vehicle.find, Invoice.create, Payment.create, Commission.create, PurchaseOrder.create, Expense.create, SupplierPayable.create, TourCost.create, CreditDebitNote.create, Customer.updateOne, Tour.updateOne, Review.create, Review.aggregate, Destination.updateOne, Quotation.find, Expense.countDocuments, PurchaseOrder.countDocuments, SupplierPayable.countDocuments, TourCost.countDocuments; verify tenant/ownership filters in the exact query. 28 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 29 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 93:** `return runWithTenant({ tenantId: tenant._id, role: "manager", bypass: false }, async () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 94:** `await clearTransactionalData(tenant._id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 96:** `const [customers, tours, users, staff, agents, suppliers, vehicles] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 97:** `Customer.find({ isDeleted: { $ne: true } }).limit(30).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 98:** `Tour.find({ isDeleted: { $ne: true }, published: true }).limit(50).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 99:** `User.find({ isDeleted: { $ne: true } }).limit(100).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 100:** `Staff.find({ isDeleted: { $ne: true }, status: "active" }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 101:** `Agent.find({ isDeleted: { $ne: true } }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 102:** `Supplier.find({ isDeleted: { $ne: true } }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 103:** `Vehicle.find({ isDeleted: { $ne: true }, status: { $nin: ["maintenance", "retired"] } }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 106:** `if (!customers.length) throw new Error(\`Tenant ${tenant.name || tenant._id} has no customers; refusing to invent replacement master data.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 107:** `if (!tours.length) throw new Error(\`Tenant ${tenant.name || tenant._id} has no tours; refusing to modify master data.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 108:** `if (!suppliers.length) throw new Error(\`Tenant ${tenant.name || tenant._id} has no suppliers; refusing to create transactional records without supplier master data.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 110:** `const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 111:** `const customerUsers = users.filter((u) => String(u.role || "").toLowerCase() === "customer");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 112:** `const paymentUser = customerUsers[0] || actor;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 113:** `const guides = staff.filter((s) => s.position === "guide" || s.role === "guide");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 114:** `const drivers = staff.filter((s) => s.position === "driver" || s.role === "driver");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `main` — lines 513–543

Parameters: none.
Persistent operations detected: Organization.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=true. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 516:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 517:** `await mongoose.connect(process.env.MONGODB_URI, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 525:** `const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 526:** `if (tenants.length !== 3) throw new Error(\`Expected exactly 3 active tenants, found ${tenants.length}. Refusing to seed.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 535:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 536:** `const results = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 537:** `for (let i = 0; i < tenants.length; i += 1) results.push(await seedTenant(tenants[i], i));` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 541:** `await mongoose.disconnect();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 40: `const round = (n) => Math.round(Number(n) * 100) / 100;`.
- Line 41: `const daysFromNow = (n) => new Date(Date.now() + n * 86400000);`.
- Line 43: `export function seededPaymentAmounts(status, total, paid) {`.
- Line 44: `const netPaid = status === "refunded"`.
- Line 47: `const totalAmount = Math.max(0, Number(total) || 0);`.
- Line 51: `const paymentPlans = [`.
- Line 66: `const providers = [`.
- Line 75: `const filter = { tenantId };`.
- Line 96: `const [customers, tours, users, staff, agents, suppliers, vehicles] = await Promise.all([`.
- Line 110: `const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;`.
- Line 111: `const customerUsers = users.filter((u) => String(u.role || "").toLowerCase() === "customer");`.
- Line 112: `const paymentUser = customerUsers[0] || actor;`.
- Line 113: `const guides = staff.filter((s) => s.position === "guide" || s.role === "guide");`.
- Line 114: `const drivers = staff.filter((s) => s.position === "driver" || s.role === "driver");`.
- Line 115: `const vehicleByTour = new Map(vehicles.filter((vehicle) => vehicle.assignedTour)`.
- Line 118: `const bookings = [];`.
- Line 120: `const bookingCountBySlug = { "hussein-mboya": 9, "amani-trails": 12, "demo-safari": 7 };`.
- Line 121: `const bookingCount = bookingCountBySlug[String(tenant.slug || "").toLowerCase()] ?? [9, 12, 7][tenantIndex];`.
- Line 123: `const customer = customers[i % customers.length];`.
- Line 124: `const tour = tours[(i + tenantIndex * 3) % tours.length];`.
- Line 125: `const plan = paymentPlans[(i + tenantIndex * 3) % paymentPlans.length];`.
- Line 126: `const amount = round(Math.max(1500, Number(tour.price || 0) * (1 + (i % 3) * 0.35)));`.
- Line 127: `const guests = 1 + (i % 5);`.
- Line 128: `const status = plan[1];`.
- Line 129: `const travelOffset = status === "completed"`.
- Line 134: `const travelDate = daysFromNow(travelOffset);`.
- Line 135: `const paid = round(amount * plan[2]);`.
- Line 136: `const paymentMethod = ["MPESA", "CARD", "BANK_TRANSFER", "CARD", "CASH"][i % 5];`.
- Line 137: `const booking = new Booking({`.
- Line 194: `const durationDays = Math.max(1, Number(tour.durationDetails?.days || tour.durationDays || 1));`.
- Line 206: `const invoices = [];`.
- Line 207: `const payments = [];`.
- Line 209: `const booking = bookings[i];`.
- Line 210: `const paid = round(booking.depositAmount);`.
- Line 212: `const plan = [booking.paymentStatus, booking.status, 0];`.
- Line 213: `const invoice = await Invoice.create({`.
- Line 243: `const provider = providers[i % providers.length];`.
- Line 244: `const payment = await Payment.create({`.
- Line 295: `const supplier = suppliers[i % suppliers.length];`.
- Line 296: `const tour = tours[i % tours.length];`.
- Line 297: `const booking = bookings[i % bookings.length];`.
- Line 298: `const cost = round(Math.max(4500, Number(tour.price || 0) * (0.35 + (i % 3) * 0.1)));`.
- Line 299: `const po = await PurchaseOrder.create({`.
- Line 314: `const expense = await Expense.create({`.
- Line 371: `const customerBookings = bookings.filter((b) => String(b.customer) === String(customer._id));`.
- Line 372: `const completed = customerBookings.filter((b) => b.status === "completed").length;`.
- Line 373: `const spent = round(customerBookings.reduce((sum, b) => sum + Number(b.amountPaid || 0), 0));`.
- Line 378: `const activeBookings = bookings.filter((b) => String(b.tour) === String(tour._id) && !["cancelled", "refunded"].includes(b.status));`.
- Line 379: `const bookedSlots = activeBookings.reduce((sum, b) => sum + Number(b.numberOfGuests || 0), 0);`.
- Line 380: `const tourBookings = bookings.filter((booking) => String(booking.tour) === String(tour._id));`.
- Line 381: `const availability = (tour.availability || []).map((slot) => ({`.
- Line 399: `const reviewBookings = bookings.filter((booking) => booking.status === "completed").slice(0, 3);`.
- Line 416: `const reviewStats = await Review.aggregate([`.
- Line 420: `const reviewsByTour = new Map(reviewStats.map((row) => [String(row._id), row]));`.
- Line 421: `const bookingsByDestination = new Map();`.
- Line 422: `const toursByDestination = new Map();`.
- Line 423: `const destinationReviewTotals = new Map();`.
- Line 424: `const destinationRatingSums = new Map();`.
- Line 426: `const stats = reviewsByTour.get(String(tour._id));`.
- Line 433: `const destinationId = String(tour.destination);`.
- Line 435: `const reviewCount = Number(stats?.totalReviews || 0);`.
- Line 440: `const destinationBookings = bookings.filter((booking) =>`.
- Line 459: `const tourById = new Map(tours.map((tour) => [String(tour._id), tour]));`.
- Line 460: `const convertedQuotes = await Quotation.find({ tenantId: tenant._id, status: "converted", isDeleted: { $ne: true } });`.
- Line 462: `const booking = bookings.find((row) => String(row.customer) === String(quote.customer)`.
- Line 467: `const tour = tourById.get(String(booking.tour));`.
- Line 468: `const total = Number(booking.totalAmount || 0);`.
- Line 469: `const quantity = Math.max(1, Number(booking.numberOfGuests || 1));`.
- Line 491: `const actualExpenseCount = await Expense.countDocuments({});`.
- Line 492: `const actualPurchaseOrderCount = await PurchaseOrder.countDocuments({});`.
- Line 493: `const actualSupplierPayableCount = await SupplierPayable.countDocuments({});`.
- Line 494: `const actualTourCostCount = await TourCost.countDocuments({});`.
- Line 525: `const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();`.
- Line 536: `const results = [];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
