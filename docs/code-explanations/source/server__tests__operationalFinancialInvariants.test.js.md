# Source explanation: server/tests/operationalFinancialInvariants.test.js

**Source:** [server/tests/operationalFinancialInvariants.test.js](../../../server/tests/operationalFinancialInvariants.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `InvoiceSequence` from `../models/InvoiceSequence.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/InvoiceSequence.js](../../../server/models/InvoiceSequence.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `TaxProfile` from `../models/TaxProfile.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TaxProfile.js](../../../server/models/TaxProfile.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `postExpenseToLedger`, `postInvoiceToLedger`, `postPaymentRefundToLedger`, `postPaymentToLedger`, `postSupplierPayableToLedger`, `postSupplierPaymentToLedger`, `reverseJournalOnce` from `../services/operationalAccountingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/operationalAccountingService.js](../../../server/services/operationalAccountingService.js)

## Runtime declarations and data flow

### `query` — lines 20–24

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `session` — lines 22–22

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `sort` — lines 23–23

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `runPreSave` — lines 26–28

Parameters: `document`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 20: `const query = (value) => ({`.
- Line 26: `const runPreSave = (document) => new Promise((resolve, reject) => {`.
- Line 31: `const previousFindProfile = TaxProfile.findOne;`.
- Line 32: `const previousFindSequence = InvoiceSequence.findOneAndUpdate;`.
- Line 33: `const tenantId = new mongoose.Types.ObjectId();`.
- Line 34: `let sequenceQuery;`.
- Line 35: `let sequenceUpdate;`.
- Line 36: `let sequenceOptions;`.
- Line 37: `let sequenceCalls = 0;`.
- Line 52: `const invoice = new Invoice({ tenantId, totalAmount: 1200, subtotal: 1200 });`.
- Line 64: `const missingTenant = new Invoice({ totalAmount: 10, subtotal: 10 });`.
- Line 74: `const saved = {`.
- Line 81: `const entries = [];`.
- Line 82: `const accountWrites = [];`.
- Line 83: `const tenantA = new mongoose.Types.ObjectId();`.
- Line 84: `const tenantB = new mongoose.Types.ObjectId();`.
- Line 85: `const invoice = { tenantId: tenantA, _id: "invoice-a", invoiceNumber: "GT-00000042", totalAmount: 1160, tax: 160, status: "pending" };`.
- Line 101: `const savedEntry = { ...entry, _id: new mongoose.Types.ObjectId() };`.
- Line 107: `const invoiceJournal = await postInvoiceToLedger(invoice);`.
- Line 114: `const payment = { tenantId: tenantA, _id: "payment-a", status: "completed", provider: "MPESA", amount: 500, feeAmount: 10, booking: "booking-a" };`.
- Line 115: `const paymentJournal = await postPaymentToLedger(payment);`.
- Line 120: `const refundJournal = await postPaymentRefundToLedger(payment, 200, "REV-A");`.
- Line 125: `const expenseJournal = await postExpenseToLedger({`.
- Line 133: `const payableJournal = await postSupplierPayableToLedger({ tenantId: tenantA, _id: "payable-a", amount: 300, status: "open" });`.
- Line 137: `const supplierPayment = await postSupplierPaymentToLedger({ tenantId: tenantA, _id: "payable-a", amount: 300 }, 100, "SUP-A", "BANK_TRANSFER");`.
- Line 142: `const reversal = await reverseJournalOnce({`.
- Line 147: `const sameSourceOtherTenant = await postInvoiceToLedger({ ...invoice, tenantId: tenantB });`.
- Line 152: `const debits = entry.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);`.
- Line 153: `const credits = entry.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
