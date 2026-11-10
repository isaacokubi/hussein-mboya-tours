# Source explanation: server/scripts/reconcileTenantIndexes.js

**Source:** [server/scripts/reconcileTenantIndexes.js](../../../server/scripts/reconcileTenantIndexes.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `env` from `../config/env.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/env.js](../../../server/config/env.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Expense` from `../models/Expense.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Expense.js](../../../server/models/Expense.js)
- `CreditDebitNote` from `../models/CreditDebitNote.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CreditDebitNote.js](../../../server/models/CreditDebitNote.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `Supplier` from `../models/Supplier.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Supplier.js](../../../server/models/Supplier.js)
- `PurchaseOrder` from `../models/PurchaseOrder.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PurchaseOrder.js](../../../server/models/PurchaseOrder.js)
- `TourCost` from `../models/TourCost.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCost.js](../../../server/models/TourCost.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `CorporateAccount` from `../models/CorporateAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CorporateAccount.js](../../../server/models/CorporateAccount.js)
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `TaxRule` from `../models/TaxRule.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TaxRule.js](../../../server/models/TaxRule.js)
- `ComplianceRecord` from `../models/ComplianceRecord.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ComplianceRecord.js](../../../server/models/ComplianceRecord.js)
- `PrivacyRequest` from `../models/PrivacyRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PrivacyRequest.js](../../../server/models/PrivacyRequest.js)
- `BackgroundJob` from `../models/BackgroundJob.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/BackgroundJob.js](../../../server/models/BackgroundJob.js)
- `PaymentLink` from `../models/PaymentLink.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentLink.js](../../../server/models/PaymentLink.js)
- `ApiKey` from `../models/ApiKey.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ApiKey.js](../../../server/models/ApiKey.js)
- `Webhook` from `../models/Webhook.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Webhook.js](../../../server/models/Webhook.js)

## Runtime declarations and data flow

### `dropIfPresent` — lines 23–23

Parameters: `collectionName`, `names`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `main` — lines 24–24

Parameters: none.
7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

## Module-level declarations

- Line 22: `const indexesToReplace={invoices:["booking_1","invoiceNumber_1","tenantId_1_booking_1","tenantId_1_invoiceNumber_1"],payments:["provider_1_transactionReference_1","checkoutRequestI`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
