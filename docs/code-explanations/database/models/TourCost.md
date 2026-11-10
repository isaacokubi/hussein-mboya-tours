# TourCost model

**Source:** [server/models/TourCost.js](../../../../server/models/TourCost.js)

## Purpose

This Mongoose model persists the tour cost domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `tour` | Associated tour catalogue record. | type: ObjectId; required: yes; ref: Tour |
| `booking` | Associated tour booking. | type: ObjectId; required: no; default: null; ref: Booking |
| `category` | Business field “category”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["accommodation","transport","guide","driver","activity","supplier","park","meals","miscellaneous"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `supplier` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Supplier |
| `purchaseOrder` | Business field “purchase order”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: PurchaseOrder |
| `quantity` | Business field “quantity”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 1; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `unitCost` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `taxAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `totalCost` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `costDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: [function: now] |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "estimated"; allowed values: ["estimated","committed","actual","cancelled"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ tour: 1 }`
- `{ booking: 1 }`
- `{ category: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, tour: 1, category: 1, status: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `tour`:  ref: Tour. Callers must scope and authorize referenced records.
- `booking`:  ref: Booking. Callers must scope and authorize referenced records.
- `supplier`:  ref: Supplier. Callers must scope and authorize referenced records.
- `purchaseOrder`:  ref: PurchaseOrder. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre validate`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/operationsController.js`](../../../../server/controllers/operationsController.js)
- [`server/controllers/operationsCopilotController.js`](../../../../server/controllers/operationsCopilotController.js)
- [`server/controllers/operationsModuleController.js`](../../../../server/controllers/operationsModuleController.js)
- [`server/scripts/auditTenantDashboardData.js`](../../../../server/scripts/auditTenantDashboardData.js)
- [`server/scripts/reconcileTenantIndexes.js`](../../../../server/scripts/reconcileTenantIndexes.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/financialDashboardSeed.js`](../../../../server/seeds/financialDashboardSeed.js)
- [`server/services/operationsService.js`](../../../../server/services/operationsService.js)
- [`server/tests/operationsModule.test.js`](../../../../server/tests/operationsModule.test.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
