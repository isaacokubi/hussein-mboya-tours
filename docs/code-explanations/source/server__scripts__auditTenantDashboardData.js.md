# Source explanation: server/scripts/auditTenantDashboardData.js

**Source:** [server/scripts/auditTenantDashboardData.js](../../../server/scripts/auditTenantDashboardData.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Supplier` from `../models/Supplier.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Supplier.js](../../../server/models/Supplier.js)
- `PurchaseOrder` from `../models/PurchaseOrder.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PurchaseOrder.js](../../../server/models/PurchaseOrder.js)
- `Expense` from `../models/Expense.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Expense.js](../../../server/models/Expense.js)
- `TourCost` from `../models/TourCost.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCost.js](../../../server/models/TourCost.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `validateReadOnlyTarget` — lines 28–42

Parameters: `uri`.
Error control: try=true, catch=false, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `if (!uri) throw new Error("MONGODB_URI is required; connection value will not be printed.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `let parsed;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 34:** `throw new Error("MONGODB_URI is not a valid MongoDB URI.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 36:** `const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `throw new Error("Refusing to run: this audit is restricted to the expected Atlas host and husseindb database.");` — Stops the current operation with an error; callers or Express error handling determine the response.

### `count` — lines 44–46

Parameters: `Model`, `tenantId`, `extra (defaulted)`.
Persistent operations detected: Model.countDocuments; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 45:** `return Model.countDocuments({ tenantId, ...active, ...extra });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `grouped` — lines 48–54

Parameters: `Model`, `tenantId`, `field`.
Persistent operations detected: Model.aggregate; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 49:** `return Model.aggregate([` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `postedRevenue` — lines 56–80

Parameters: `tenantId`.
Persistent operations detected: JournalEntry.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 57:** `const [result] = await JournalEntry.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 79:** `return result || { total: 0, journalCount: 0 };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `auditId` — lines 82–82

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `auditMoney` — lines 83–83

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `auditFinancialIntegrity` — lines 85–207

Parameters: `tenantId`.
Persistent operations detected: Booking.find, Payment.find, Invoice.find, Tour.find, Destination.find, Customer.find, User.find, Staff.find, Vehicle.find, Agent.find, Supplier.find, PurchaseOrder.find, Expense.find, TourCost.find, SupplierPayable.find, JournalEntry.find, ChartOfAccount.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 34 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 86:** `const [bookings, paymentRows, invoices, tours, destinations, customers, users, staff, vehicles, agents, suppliers, purchaseOrders, expenses, tourCosts, supplierPayables, journals, accounts] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 87:** `Booking.find({ tenantId, ...active }).select("_id bookingNumber customer user tour agent assignedGuide assignedDriver assignedVehicle totalAmount amountPaid balanceAmount").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 88:** `Payment.find({ tenantId, ...active }).select("_id booking customer user amount status refundedAmount invoiceNumber").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 89:** `Invoice.find({ tenantId, ...active }).select("_id invoiceNumber booking customer user tour agent totalAmount tax amountPaid balance status").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 90:** `Tour.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 91:** `Destination.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 92:** `Customer.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 93:** `User.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 94:** `Staff.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 95:** `Vehicle.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 96:** `Agent.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 97:** `Supplier.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 98:** `PurchaseOrder.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 99:** `Expense.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 100:** `TourCost.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 101:** `SupplierPayable.find({ tenantId, ...active }).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 102:** `JournalEntry.find({ tenantId, status: "posted" }).select("_id sourceType sourceId lines").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 103:** `ChartOfAccount.find({ tenantId }).select("_id code type active").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `owned` — lines 106–106

Parameters: `rows`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `checkRefs` — lines 108–116

Parameters: `rows`, `field`, `set`, `code`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 109:** `const bad = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `for (const row of rows) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 111:** `const value = row[field];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 112:** `if (value == null || value === "") continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 113:** `for (const item of (Array.isArray(value) ? value : [value])) if (!set.has(auditId(item))) bad.push({ recordId: auditId(row), referenceId: auditId(item), field });` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 115:** `if (bad.length) issues.push({ code, count: bad.length, examples: bad.slice(0, 8) });` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `auditTenant` — lines 209–251

Parameters: `tenant`.
Persistent operations detected: Booking.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 210:** `const tenantId = tenant._id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 211:** `return runWithTenant({ tenantId, role: "manager", bypass: false }, async () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 212:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 231:** `Booking.countDocuments({ tenantId, bookingNumber: /^(?:TEST|DEMO)-/i }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 235:** `const integrity = await auditFinancialIntegrity(tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 236:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `main` — lines 253–280

Parameters: none.
Persistent operations detected: Organization.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=true. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 255:** `await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 3, serverSelectionTimeoutMS: 15000 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 256:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 257:** `const tenants = await Organization.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 262:** `const found = new Set(tenants.map((tenant) => tenant.slug));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 263:** `const missing = TENANT_SLUGS.filter((slug) => !found.has(slug));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 264:** `if (missing.length) throw new Error(\`Expected tenant(s) missing from husseindb: ${missing.join(", ")}\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 265:** `if (tenants.length !== TENANT_SLUGS.length) throw new Error("Unexpected tenant set; refusing to audit an ambiguous tenant configuration.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 267:** `const results = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 268:** `for (const slug of TENANT_SLUGS) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 269:** `const tenant = tenants.find((item) => item.slug === slug);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 274:** `const totalIssues = results.reduce((sum, row) => sum + Number(row.integrity?.issueCount || 0), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 276:** `if (totalIssues) process.exitCode = 2;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 278:** `await mongoose.disconnect();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 23: `const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";`.
- Line 24: `const EXPECTED_DATABASE = "husseindb";`.
- Line 25: `const TENANT_SLUGS = ["hussein-mboya", "amani-trails", "demo-safari"];`.
- Line 26: `const active = { isDeleted: { $ne: true } };`.
- Line 28: `function validateReadOnlyTarget(uri) {`.
- Line 30: `let parsed;`.
- Line 36: `const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));`.
- Line 57: `const [result] = await JournalEntry.aggregate([`.
- Line 82: `const auditId = (value) => value == null ? null : String(value._id || value);`.
- Line 83: `const auditMoney = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;`.
- Line 86: `const [bookings, paymentRows, invoices, tours, destinations, customers, users, staff, vehicles, agents, suppliers, purchaseOrders, expenses, tourCosts, supplierPayables, journals, `.
- Line 105: `const issues = [];`.
- Line 106: `const owned = rows => new Set(rows.map(row => auditId(row._id)));`.
- Line 107: `const sets = { booking: owned(bookings), tour: owned(tours), customer: owned(customers), user: owned(users), staff: owned(staff), vehicle: owned(vehicles), agent: owned(agents), su`.
- Line 108: `const checkRefs = (rows, field, set, code) => {`.
- Line 109: `const bad = [];`.
- Line 111: `const value = row[field];`.
- Line 127: `const netByBooking = new Map();`.
- Line 130: `const key = auditId(payment.booking);`.
- Line 133: `const bookingDiffs=[];`.
- Line 135: `const paid=auditMoney(booking.amountPaid), net=auditMoney(netByBooking.get(auditId(booking._id))||0);`.
- Line 136: `const balance=auditMoney(Math.max(0,Number(booking.totalAmount||0)-paid));`.
- Line 141: `const invoiceDiffs=[];`.
- Line 144: `const booking=bookings.find(row=>auditId(row._id)===auditId(invoice.booking));`.
- Line 146: `const paid=Math.min(auditMoney(invoice.totalAmount),auditMoney(netByBooking.get(auditId(booking._id))||0));`.
- Line 147: `const balance=auditMoney(Math.max(0,Number(invoice.totalAmount||0)-paid));`.
- Line 151: `const unbalanced=[],foreignAccounts=[];`.
- Line 153: `const debit=auditMoney((journal.lines||[]).reduce((sum,line)=>sum+Number(line.debit||0),0));`.
- Line 154: `const credit=auditMoney((journal.lines||[]).reduce((sum,line)=>sum+Number(line.credit||0),0));`.
- Line 162: `const accountById = new Map(accounts.map(account => [auditId(account._id), account]));`.
- Line 163: `const invoiceJournalIssues = [];`.
- Line 166: `const journal = journals.find(row => row.sourceType === "invoice" && auditId(row.sourceId) === auditId(invoice._id));`.
- Line 171: `const actualRevenue = auditMoney((journal.lines || []).reduce((sum, line) => {`.
- Line 172: `const account = accountById.get(auditId(line.account));`.
- Line 175: `const total = Math.max(0, auditMoney(invoice.totalAmount));`.
- Line 176: `const tax = Math.max(0, Math.min(total, auditMoney(invoice.tax)));`.
- Line 177: `const expectedRevenue = auditMoney(total - tax);`.
- Line 184: `const refundJournalIssues = [];`.
- Line 186: `const lineTotals = (journal.lines || []).reduce((totals, line) => {`.
- Line 187: `const account = accountById.get(auditId(line.account));`.
- Line 210: `const tenantId = tenant._id;`.
- Line 212: `const [`.
- Line 235: `const integrity = await auditFinancialIntegrity(tenantId);`.
- Line 257: `const tenants = await Organization.find({`.
- Line 262: `const found = new Set(tenants.map((tenant) => tenant.slug));`.
- Line 263: `const missing = TENANT_SLUGS.filter((slug) => !found.has(slug));`.
- Line 267: `const results = [];`.
- Line 269: `const tenant = tenants.find((item) => item.slug === slug);`.
- Line 274: `const totalIssues = results.reduce((sum, row) => sum + Number(row.integrity?.issueCount || 0), 0);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
