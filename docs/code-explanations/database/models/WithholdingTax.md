# WithholdingTax model

**Source:** [server/models/WithholdingTax.js](../../../../server/models/WithholdingTax.js)

## Purpose

This Mongoose model persists the withholding tax domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `payee` | Business field “payee”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: Supplier |
| `payeeName` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `payeePin` | Business field “payee pin”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sourceType` | Business field “source type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "supplier_payment"; allowed values: ["supplier_payment","expense","commission","other"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `sourceId` | Business field “source id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null |
| `reference` | Human/provider/business reference used to correlate records; uniqueness depends on declared indexes. | type: String; required: yes |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `taxType` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "WHT" |
| `taxPeriod` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: yes; validators: regexp: Path `{PATH}` is invalid ({VALUE}). |
| `baseAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `rate` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `taxAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "accrued"; allowed values: ["accrued","remitted","cancelled"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `certificateNumber` | Business field “certificate number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `paymentReference` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "" |
| `remittedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ payee: 1 }`
- `{ sourceType: 1 }`
- `{ sourceId: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, reference: 1 } — unique: true`
- `{ tenantId: 1, taxPeriod: 1, status: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `payee`:  ref: Supplier. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `updatedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/withholdingTaxController.js`](../../../../server/controllers/withholdingTaxController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/tests/completeTestDemoSeedSafety.test.js`](../../../../server/tests/completeTestDemoSeedSafety.test.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
