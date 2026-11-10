# Source explanation: server/controllers/accountingControlReportsController.js

**Source:** [server/controllers/accountingControlReportsController.js](../../../server/controllers/accountingControlReportsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `money` — lines 7–7

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `startOfDay` — lines 14–14

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `startOfNextDay` — lines 15–20

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `const date = startOfDay(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (!date || Number.isNaN(date.getTime())) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `return date;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `bounds` — lines 21–28

Parameters: `from`, `to`, `field (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `const filter = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const start = startOfDay(from);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const end = startOfNextDay(to);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (start && !Number.isNaN(start.getTime())) filter.$gte = start;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (end && !Number.isNaN(end.getTime())) filter.$lt = end;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return Object.keys(filter).length ? { [field]: filter } : {};` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `before` — lines 29–32

Parameters: `from`, `field (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 30:** `const start = startOfDay(from);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `return start && !Number.isNaN(start.getTime()) ? { [field]: { $lt: start } } : {};` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isWithin` — lines 33–42

Parameters: `value`, `from`, `to`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `if (!value) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `const timestamp = new Date(value).getTime();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (!Number.isFinite(timestamp)) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `const start = startOfDay(from)?.getTime();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const end = startOfNextDay(to)?.getTime();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (Number.isFinite(start) && timestamp < start) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `if (Number.isFinite(end) && timestamp >= end) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `pagination` — lines 43–46

Parameters: `query`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 44:** `const page = Math.max(1, Number.parseInt(query?.page, 10) || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `return { page, pageSize: DEFAULT_PAGE_SIZE };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `periodFilter` — lines 47–47

Parameters: `from`, `to`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `journalBalances` — lines 49–79

Parameters: `tenantId`, `from`, `to`, `codes (defaulted)`.
Persistent operations detected: ChartOfAccount.find, JournalEntry.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 50:** `const accounts = await ChartOfAccount.find({ tenantId, code: { $in: codes }, active: true }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 51:** `const ids = new Map(accounts.map((account) => [String(account._id), account]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const entries = await JournalEntry.find({ tenantId, status: "posted", ...bounds(from, to) })` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 55:** `const balances = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `for (const entry of entries) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 57:** `for (const line of entry.lines || []) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 58:** `const account = ids.get(String(line.account));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `if (!account) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `const row = balances.get(account.code) || {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTaxControlReport` — lines 81–130

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Invoice.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 82:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 83:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const { from, to } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const journal = await journalBalances(tenantId, from, to);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 86:** `const rows = journal.rows;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `const by = new Map(rows.map((row) => [row.code, row]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const valueFor = (code) => by.has(code) ? by.get(code).balance : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `const outputVat = valueFor("2110");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const inputVat = valueFor("2120");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `const wht = valueFor("2130");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const generalTaxPayable = valueFor("2100");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const invoiceFilter = mergeTenantFilter(req, {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 98:** `const invoices = await Invoice.find(invoiceFilter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 101:** `const invoiceVatBasis = money(invoices.reduce((sum, invoice) => sum + Math.max(0, Number(invoice.tax || 0)), 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `const postedTaxActivity = money(rows` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `const invoiceOutputVatVariance = outputVat == null ? null : money(invoiceVatBasis - outputVat);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `const configuredTaxAccounts = journal.accounts.filter((account) => TAX_ACCOUNT_CODES.includes(account.code));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `const configuredStatutoryAccounts = journal.accounts.filter((account) => STATUTORY_CONTROL_ACCOUNT_CODES.includes(account.code));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `valueFor` — lines 88–88

Parameters: `code`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getControlLedger` — lines 132–150

Parameters: `{tenantId, code, from, to, normalDebit, page, pageSize}`.
Persistent operations detected: ChartOfAccount.findOne, JournalEntry.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 133:** `const account = await ChartOfAccount.findOne({ tenantId, code, active: true }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 134:** `if (!account) return { account: code, rows: [], openingBalance: null, periodDebit: null, periodCredit: null, closingBalance: null, accountFound: false, pagination: { page, pageSize, total: 0, pages: 0 } };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 135:** `const openingEntries = from ? await JournalEntry.find({ tenantId, status: "posted", ...before(from) }).select("lines").lean() : [];` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 136:** `let openingBalance = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 137:** `for (const entry of openingEntries) for (const line of entry.lines || []) if (String(line.account) === String(account._id)) openingBalance += normalDebit ? Number(line.debit || 0) - Number(line.credit || 0) : Number(line` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 138:** `const entries = await JournalEntry.find({ tenantId, status: "posted", ...bounds(from, to) }).select("entryDate entryNumber reference description sourceType sourceId lines").sort({ entryDate: 1, _id: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 139:** `let balance = openingBalance, periodDebit = 0, periodCredit = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 140:** `const rows = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 141:** `for (const entry of entries) for (const line of entry.lines || []) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 142:** `if (String(line.account) !== String(account._id)) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 143:** `const debit = Number(line.debit || 0), credit = Number(line.credit || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 145:** `const reference = String(entry.reference || entry.entryNumber || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 148:** `const total = rows.length, pages = total ? Math.ceil(total / pageSize) : 0, currentPage = pages ? Math.min(page, pages) : 1, start = (currentPage - 1) * pageSize;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 149:** `return { account: code, rows: rows.slice(start, start + pageSize), openingBalance: money(openingBalance), periodDebit: money(periodDebit), periodCredit: money(periodCredit), closingBalance: money(balance), accountFound: ` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCustomerLedgerReport` — lines 152–155

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 153:** `try { const tenantId = requireTenantId(); const { page, pageSize } = pagination(req.query); return res.json({ success: true, data: await getControlLedger({ tenantId, code: "1100", from: req.query.from, to: req.query.to, ` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 154:** `catch (error) { next(error); }` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.

### `getSupplierLedgerReport` — lines 156–159

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 157:** `try { const tenantId = requireTenantId(); const { page, pageSize } = pagination(req.query); return res.json({ success: true, data: await getControlLedger({ tenantId, code: "2000", from: req.query.from, to: req.query.to, ` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 158:** `catch (error) { next(error); }` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.

### `serviceForInvoice` — lines 161–166

Parameters: `invoice`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 162:** `if (invoice.hospitalityType === "hotel" || invoice.hospitalityType === "airport_transfer") return invoice.hospitalityType;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 163:** `if (invoice.hospitalityBookingModel === "AirportTransferBooking") return "airport_transfer";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 164:** `if (invoice.hospitalityBookingModel === "HotelBooking") return "hotel";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 165:** `return invoice.hospitalityBooking ? "hotel" : "tour";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `paymentServiceMatches` — lines 167–177

Parameters: `payment`, `invoice`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 168:** `if (!invoice) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 169:** `if (payment.invoiceNumber && invoice.invoiceNumber && String(payment.invoiceNumber).trim() === String(invoice.invoiceNumber).trim()) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 170:** `if (invoice.booking && payment.booking && String(invoice.booking) === String(payment.booking)) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 171:** `if (invoice.hospitalityBooking && payment.hospitalityBooking && String(invoice.hospitalityBooking) === String(payment.hospitalityBooking)) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 172:** `if (invoice.paymentReference) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 173:** `const reference = String(invoice.paymentReference).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 174:** `if (reference && [payment.transactionReference, payment.mpesaReceiptNumber, payment.transactionId].filter(Boolean).some((value) => String(value).trim() === reference)) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 176:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `paymentPeriodActivity` — lines 178–178

Parameters: `payment`, `from`, `to`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `paymentLinkFilter` — lines 179–190

Parameters: `invoices`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 180:** `const invoiceNumbers = [...new Set(invoices.map((invoice) => String(invoice.invoiceNumber || "").trim()).filter(Boolean))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 181:** `const bookings = [...new Set(invoices.map((invoice) => invoice.booking).filter(Boolean).map(String))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 182:** `const hospitalityBookings = [...new Set(invoices.map((invoice) => invoice.hospitalityBooking).filter(Boolean).map(String))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 183:** `const references = [...new Set(invoices.map((invoice) => String(invoice.paymentReference || "").trim()).filter(Boolean))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 184:** `const filters = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 185:** `if (invoiceNumbers.length) filters.push({ invoiceNumber: { $in: invoiceNumbers } });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 186:** `if (bookings.length) filters.push({ booking: { $in: bookings } });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 187:** `if (hospitalityBookings.length) filters.push({ hospitalityBooking: { $in: hospitalityBookings } });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 188:** `if (references.length) filters.push({ $or: [{ transactionReference: { $in: references } }, { mpesaReceiptNumber: { $in: references } }, { transactionId: { $in: references } }] });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 189:** `return filters;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getProfitabilityReport` — lines 192–244

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Invoice.find, Payment.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 15 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 193:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 195:** `const { from, to } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 196:** `const invoiceFilter = mergeTenantFilter(req, { isDeleted: { $ne: true }, status: { $nin: ["draft", "cancelled"] }, ...periodFilter(from, to) });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 197:** `const periodPaymentFilter = mergeTenantFilter(req, { status: { $in: PAYMENT_STATUSES } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 198:** `if (from || to) periodPaymentFilter.$or = [bounds(from, to, "paidAt"), bounds(from, to, "refundedAt")];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 199:** `const invoices = await Invoice.find(invoiceFilter).select("_id booking hospitalityBooking hospitalityBookingModel hospitalityType invoiceNumber paymentReference amountPaid balance paymentMethod totalAmount tax").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 200:** `const allLinkFilters = paymentLinkFilter(invoices);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 201:** `const [periodPayments, linkedPayments] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 202:** `Payment.find(periodPaymentFilter).select("_id booking hospitalityBooking hospitalityType invoiceNumber amount refundedAmount status paidAt refundedAt transactionReference transactionId mpesaReceiptNumber").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 203:** `allLinkFilters.length ? Payment.find(mergeTenantFilter(req, { status: { $in: PAYMENT_STATUSES }, $or: allLinkFilters })).select("_id booking hospitalityBooking hospitalityType invoiceNumber amount refundedAmount status p` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 205:** `const invoiceByNumber = new Map(invoices.filter((invoice) => invoice.invoiceNumber).map((invoice) => [String(invoice.invoiceNumber).trim(), invoice]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 206:** `const invoiceByBooking = new Map(invoices.filter((invoice) => invoice.booking).map((invoice) => [String(invoice.booking), invoice]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 207:** `const invoiceByHospitalityBooking = new Map(invoices.filter((invoice) => invoice.hospitalityBooking).map((invoice) => [String(invoice.hospitalityBooking), invoice]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 208:** `const invoiceByPaymentReference = new Map(invoices.filter((invoice) => invoice.paymentReference).map((invoice) => [String(invoice.paymentReference).trim(), invoice]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 209:** `const linkedInvoiceForPayment = (payment) => (payment.invoiceNumber && invoiceByNumber.get(String(payment.invoiceNumber).trim())) || (payment.booking && invoiceByBooking.get(String(payment.booking))) || (payment.hospital` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 210:** `const linkedInvoiceIds = new Set();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 211:** `for (const payment of linkedPayments) { const invoice = linkedInvoiceForPayment(payment); if (invoice && paymentServiceMatches(payment, invoice)) linkedInvoiceIds.add(String(invoice._id)); }` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 212:** `const groups = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `linkedInvoiceForPayment` — lines 209–209

Parameters: `payment`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `createRow` — lines 213–213

Parameters: `serviceType`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const money = (n) => Math.round(Number(n || 0) * 100) / 100;`.
- Line 8: `const TAX_ACCOUNT_CODES = ["2100", "2110", "2120", "2130"];`.
- Line 9: `const STATUTORY_CONTROL_ACCOUNT_CODES = ["2140", "2150"];`.
- Line 10: `const CONTROL_ACCOUNT_CODES = [...TAX_ACCOUNT_CODES, ...STATUTORY_CONTROL_ACCOUNT_CODES];`.
- Line 11: `const PAYMENT_STATUSES = ["completed", "refunded"];`.
- Line 12: `const DEFAULT_PAGE_SIZE = 15;`.
- Line 14: `const startOfDay = (value) => value ? new Date(\`${value}T00:00:00.000Z\`) : null;`.
- Line 15: `const startOfNextDay = (value) => {`.
- Line 16: `const date = startOfDay(value);`.
- Line 21: `const bounds = (from, to, field = "entryDate") => {`.
- Line 22: `const filter = {};`.
- Line 23: `const start = startOfDay(from);`.
- Line 24: `const end = startOfNextDay(to);`.
- Line 29: `const before = (from, field = "entryDate") => {`.
- Line 30: `const start = startOfDay(from);`.
- Line 33: `const isWithin = (value, from, to) => {`.
- Line 35: `const timestamp = new Date(value).getTime();`.
- Line 37: `const start = startOfDay(from)?.getTime();`.
- Line 38: `const end = startOfNextDay(to)?.getTime();`.
- Line 43: `const pagination = (query) => {`.
- Line 44: `const page = Math.max(1, Number.parseInt(query?.page, 10) || 1);`.
- Line 47: `const periodFilter = (from, to) => bounds(from, to, "issueDate");`.
- Line 50: `const accounts = await ChartOfAccount.find({ tenantId, code: { $in: codes }, active: true }).lean();`.
- Line 51: `const ids = new Map(accounts.map((account) => [String(account._id), account]));`.
- Line 52: `const entries = await JournalEntry.find({ tenantId, status: "posted", ...bounds(from, to) })`.
- Line 55: `const balances = new Map();`.
- Line 58: `const account = ids.get(String(line.account));`.
- Line 60: `const row = balances.get(account.code) || {`.
- Line 81: `export const getTaxControlReport = async (req, res, next) => {`.
- Line 83: `const tenantId = requireTenantId();`.
- Line 84: `const { from, to } = req.query;`.
- Line 85: `const journal = await journalBalances(tenantId, from, to);`.
- Line 86: `const rows = journal.rows;`.
- Line 87: `const by = new Map(rows.map((row) => [row.code, row]));`.
- Line 88: `const valueFor = (code) => by.has(code) ? by.get(code).balance : null;`.
- Line 89: `const outputVat = valueFor("2110");`.
- Line 90: `const inputVat = valueFor("2120");`.
- Line 91: `const wht = valueFor("2130");`.
- Line 92: `const generalTaxPayable = valueFor("2100");`.
- Line 93: `const invoiceFilter = mergeTenantFilter(req, {`.
- Line 98: `const invoices = await Invoice.find(invoiceFilter)`.
- Line 101: `const invoiceVatBasis = money(invoices.reduce((sum, invoice) => sum + Math.max(0, Number(invoice.tax || 0)), 0));`.
- Line 102: `const postedTaxActivity = money(rows`.
- Line 105: `const invoiceOutputVatVariance = outputVat == null ? null : money(invoiceVatBasis - outputVat);`.
- Line 106: `const configuredTaxAccounts = journal.accounts.filter((account) => TAX_ACCOUNT_CODES.includes(account.code));`.
- Line 107: `const configuredStatutoryAccounts = journal.accounts.filter((account) => STATUTORY_CONTROL_ACCOUNT_CODES.includes(account.code));`.
- Line 133: `const account = await ChartOfAccount.findOne({ tenantId, code, active: true }).lean();`.
- Line 135: `const openingEntries = from ? await JournalEntry.find({ tenantId, status: "posted", ...before(from) }).select("lines").lean() : [];`.
- Line 136: `let openingBalance = 0;`.
- Line 138: `const entries = await JournalEntry.find({ tenantId, status: "posted", ...bounds(from, to) }).select("entryDate entryNumber reference description sourceType sourceId lines").sort({ `.
- Line 139: `let balance = openingBalance, periodDebit = 0, periodCredit = 0;`.
- Line 140: `const rows = [];`.
- Line 143: `const debit = Number(line.debit || 0), credit = Number(line.credit || 0);`.
- Line 145: `const reference = String(entry.reference || entry.entryNumber || "").trim();`.
- Line 148: `const total = rows.length, pages = total ? Math.ceil(total / pageSize) : 0, currentPage = pages ? Math.min(page, pages) : 1, start = (currentPage - 1) * pageSize;`.
- Line 152: `export const getCustomerLedgerReport = async (req, res, next) => {`.
- Line 156: `export const getSupplierLedgerReport = async (req, res, next) => {`.
- Line 161: `const serviceForInvoice = (invoice) => {`.
- Line 167: `const paymentServiceMatches = (payment, invoice) => {`.
- Line 173: `const reference = String(invoice.paymentReference).trim();`.
- Line 178: `const paymentPeriodActivity = (payment, from, to) => ({ collected: isWithin(payment.paidAt, from, to) ? Math.max(0, Number(payment.amount || 0)) : 0, refunded: isWithin(payment.ref`.
- Line 179: `const paymentLinkFilter = (invoices) => {`.
- Line 180: `const invoiceNumbers = [...new Set(invoices.map((invoice) => String(invoice.invoiceNumber || "").trim()).filter(Boolean))];`.
- Line 181: `const bookings = [...new Set(invoices.map((invoice) => invoice.booking).filter(Boolean).map(String))];`.
- Line 182: `const hospitalityBookings = [...new Set(invoices.map((invoice) => invoice.hospitalityBooking).filter(Boolean).map(String))];`.
- Line 183: `const references = [...new Set(invoices.map((invoice) => String(invoice.paymentReference || "").trim()).filter(Boolean))];`.
- Line 184: `const filters = [];`.
- Line 192: `export const getProfitabilityReport = async (req, res, next) => {`.
- Line 195: `const { from, to } = req.query;`.
- Line 196: `const invoiceFilter = mergeTenantFilter(req, { isDeleted: { $ne: true }, status: { $nin: ["draft", "cancelled"] }, ...periodFilter(from, to) });`.
- Line 197: `const periodPaymentFilter = mergeTenantFilter(req, { status: { $in: PAYMENT_STATUSES } });`.
- Line 199: `const invoices = await Invoice.find(invoiceFilter).select("_id booking hospitalityBooking hospitalityBookingModel hospitalityType invoiceNumber paymentReference amountPaid balance `.
- Line 200: `const allLinkFilters = paymentLinkFilter(invoices);`.
- Line 201: `const [periodPayments, linkedPayments] = await Promise.all([`.
- Line 205: `const invoiceByNumber = new Map(invoices.filter((invoice) => invoice.invoiceNumber).map((invoice) => [String(invoice.invoiceNumber).trim(), invoice]));`.
- Line 206: `const invoiceByBooking = new Map(invoices.filter((invoice) => invoice.booking).map((invoice) => [String(invoice.booking), invoice]));`.
- Line 207: `const invoiceByHospitalityBooking = new Map(invoices.filter((invoice) => invoice.hospitalityBooking).map((invoice) => [String(invoice.hospitalityBooking), invoice]));`.
- Line 208: `const invoiceByPaymentReference = new Map(invoices.filter((invoice) => invoice.paymentReference).map((invoice) => [String(invoice.paymentReference).trim(), invoice]));`.
- Line 209: `const linkedInvoiceForPayment = (payment) => (payment.invoiceNumber && invoiceByNumber.get(String(payment.invoiceNumber).trim())) || (payment.booking && invoiceByBooking.get(String`.
- Line 210: `const linkedInvoiceIds = new Set();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
