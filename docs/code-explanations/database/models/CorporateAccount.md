# CorporateAccount model

**Source:** [server/models/CorporateAccount.js](../../../../server/models/CorporateAccount.js)

## Purpose

This Mongoose model persists the corporate account domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `accountNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no |
| `companyName` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 180; validators: maxlength |
| `kraPin` | Business field “kra pin”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `vatRegistered` | Business field “vat registered”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `billingContacts` | Contact or location information; restrict access and avoid exposing it in logs. | type: Array; required: no |
| `paymentTerms` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "immediate"; allowed values: ["immediate","7_days","14_days","30_days","60_days","90_days","staged"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `creditLimit` | Business field “credit limit”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `currentBalance` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `preferredPaymentMethod` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "BANK_TRANSFER"; allowed values: ["MPESA","CARD","BANK_TRANSFER","CASH"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `requiresPurchaseOrder` | Business field “requires purchase order”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["active","suspended","closed"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, accountNumber: 1 } — unique: true`
- `{ tenantId: 1, companyName: 1 }`
- `{ tenantId: 1, kraPin: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre validate`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/customerBookingController.js`](../../../../server/controllers/customerBookingController.js)
- [`server/controllers/operationsController.js`](../../../../server/controllers/operationsController.js)
- [`server/controllers/operationsModuleController.js`](../../../../server/controllers/operationsModuleController.js)
- [`server/middleware/bookingCommercialGuard.js`](../../../../server/middleware/bookingCommercialGuard.js)
- [`server/scripts/reconcileTenantIndexes.js`](../../../../server/scripts/reconcileTenantIndexes.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/dashboardOperationalSeed.js`](../../../../server/seeds/dashboardOperationalSeed.js)
- [`server/services/operationsService.js`](../../../../server/services/operationsService.js)
- [`server/tests/operationsModule.test.js`](../../../../server/tests/operationsModule.test.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
