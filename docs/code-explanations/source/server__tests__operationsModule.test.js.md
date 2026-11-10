# Source explanation: server/tests/operationsModule.test.js

**Source:** [server/tests/operationsModule.test.js](../../../server/tests/operationsModule.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `PurchaseOrder` from `../models/PurchaseOrder.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PurchaseOrder.js](../../../server/models/PurchaseOrder.js)
- `TourCost` from `../models/TourCost.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCost.js](../../../server/models/TourCost.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `Supplier` from `../models/Supplier.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Supplier.js](../../../server/models/Supplier.js)
- `CorporateAccount` from `../models/CorporateAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CorporateAccount.js](../../../server/models/CorporateAccount.js)

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 11: `const po = new PurchaseOrder({ tenantId: new mongoose.Types.ObjectId(), supplier: new mongoose.Types.ObjectId(), lines: [{ description: "Hotel rooms", quantity: 2, unitCost: 10000,`.
- Line 19: `const cost = new TourCost({ tenantId: new mongoose.Types.ObjectId(), tour: new mongoose.Types.ObjectId(), category: "transport", description: "Vehicle hire", quantity: 3, unitCost:`.
- Line 25: `const payable = new SupplierPayable({ tenantId: new mongoose.Types.ObjectId(), supplier: new mongoose.Types.ObjectId(), amount: 50000, amountPaid: 12500 });`.
- Line 29: `const invalid = new SupplierPayable({ tenantId: new mongoose.Types.ObjectId(), supplier: new mongoose.Types.ObjectId(), amount: 100, amountPaid: 101 });`.
- Line 34: `const supplier = new Supplier({ tenantId: new mongoose.Types.ObjectId(), legalName: "Kenya Safari Supplies" });`.
- Line 37: `const corporate = new CorporateAccount({ tenantId: new mongoose.Types.ObjectId(), companyName: "Example Holdings" });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
