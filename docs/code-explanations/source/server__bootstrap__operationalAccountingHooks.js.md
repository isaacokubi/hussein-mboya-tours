# Source explanation: server/bootstrap/operationalAccountingHooks.js

**Source:** [server/bootstrap/operationalAccountingHooks.js](../../../server/bootstrap/operationalAccountingHooks.js)

## Purpose

A startup/bootstrap hook loaded to register model behavior or prepare runtime state.

## Imports and dependencies

- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Expense` from `../models/Expense.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Expense.js](../../../server/models/Expense.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `postPaymentToLedger`, `postPaymentRefundToLedger`, `postExpenseToLedger`, `postExpensePaymentToLedger`, `postInvoiceToLedger`, `postSupplierPayableToLedger`, `postSupplierPaymentToLedger` from `../services/operationalAccountingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/operationalAccountingService.js](../../../server/services/operationalAccountingService.js)
- `syncInvoiceFromPayment` from `../services/invoiceLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/invoiceLifecycleService.js](../../../server/services/invoiceLifecycleService.js)

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 10: `const session = typeof doc.$session === "function" ? doc.$session() : null;`.
- Line 28: `const session = typeof doc.$session === "function" ? doc.$session() : null;`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
