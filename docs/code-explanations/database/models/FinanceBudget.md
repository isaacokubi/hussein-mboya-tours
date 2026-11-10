# FinanceBudget model

**Source:** [server/models/FinanceBudget.js](../../../../server/models/FinanceBudget.js)

## Purpose

This Mongoose model persists the finance budget domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `fiscalYear` | Business field “fiscal year”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes |
| `period` | Business field “period”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "annual"; allowed values: ["annual","monthly"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `accountCode` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: yes |
| `month` | Business field “month”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: null; range: 1 to 12; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (12). |
| `amount` | Monetary amount for this record; currency and accounting meaning depend on the parent workflow. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `costCenter` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "draft"; allowed values: ["draft","approved","closed"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `approvedBy` | Business field “approved by”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `approvedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ fiscalYear: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, fiscalYear: 1, accountCode: 1, month: 1, costCenter: 1 } — unique: true`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `approvedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/managementAccountingController.js`](../../../../server/controllers/managementAccountingController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
