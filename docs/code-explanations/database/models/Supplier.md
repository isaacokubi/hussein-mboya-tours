# Supplier model

**Source:** [server/models/Supplier.js](../../../../server/models/Supplier.js)

## Purpose

This Mongoose model persists the supplier domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `supplierNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no |
| `legalName` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 160; validators: maxlength |
| `tradingName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `category` | Business field “category”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "other"; allowed values: ["accommodation","transport","guide","driver","activity","park","airline","restaurant","equipment","other"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `kraPin` | Business field “kra pin”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `vatRegistered` | Business field “vat registered”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `contacts` | Contact or location information; restrict access and avoid exposing it in logs. | type: Array; required: no |
| `address` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `paymentTermsDays` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Number; required: no; default: 0; range: 0 to 365; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (365). |
| `bankDetails.bankName` | Human-readable descriptive data for the associated business record. | type: String; required: no |
| `bankDetails.accountName` | Human-readable descriptive data for the associated business record. | type: String; required: no |
| `bankDetails.accountNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no |
| `bankDetails.branch` | Business field “branch”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `mpesaPaybill` | Business field “mpesa paybill”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["active","inactive","blocked"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ category: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, supplierNumber: 1 } — unique: true`
- `{ tenantId: 1, legalName: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `updatedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre validate`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/operationsController.js`](../../../../server/controllers/operationsController.js)
- [`server/controllers/operationsModuleController.js`](../../../../server/controllers/operationsModuleController.js)
- [`server/scripts/auditTenantDashboardData.js`](../../../../server/scripts/auditTenantDashboardData.js)
- [`server/scripts/reconcileTenantIndexes.js`](../../../../server/scripts/reconcileTenantIndexes.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/ensureDashboardMasterData.js`](../../../../server/seeds/ensureDashboardMasterData.js)
- [`server/seeds/financialDashboardSeed.js`](../../../../server/seeds/financialDashboardSeed.js)
- [`server/services/operationsService.js`](../../../../server/services/operationsService.js)
- [`server/tests/operationsModule.test.js`](../../../../server/tests/operationsModule.test.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
