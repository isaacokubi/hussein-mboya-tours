# CreditDebitNote model

**Source:** [server/models/CreditDebitNote.js](../../../../server/models/CreditDebitNote.js)

## Purpose

This Mongoose model persists the credit debit note domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `noteNumber` | Business field “note number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `type` | Business field “type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["credit","debit"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `originalInvoice` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: yes; ref: Invoice |
| `originalInvoiceNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: yes |
| `originalEtimsInvoiceNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "" |
| `etimsSolution` | Business field “etims solution”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `reason` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `amount` | Monetary amount for this record; currency and accounting meaning depend on the parent workflow. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `taxAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `totalAmount` | Gross amount associated with the record. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `taxRate` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "draft"; allowed values: ["draft","issued","cancelled"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `etimsStatus` | Lifecycle or processing state; allowed transitions belong to the feature service/controller. | type: String; required: no; default: "not_submitted"; allowed values: ["not_submitted","pending","synced","failed"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `etimsReference` | Business field “etims reference”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsReceiptNumber` | Business field “etims receipt number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsLastError` | Business field “etims last error”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsSubmissionAttempts` | Business field “etims submission attempts”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `etimsLastAttemptAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `etimsSubmittedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `etimsResponse` | Business field “etims response”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `issuedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, noteNumber: 1 } — unique: true`
- `{ tenantId: 1, originalInvoice: 1, createdAt: -1 }`
- `{ tenantId: 1, etimsStatus: 1, createdAt: -1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `originalInvoice`:  ref: Invoice. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/creditDebitNoteController.js`](../../../../server/controllers/creditDebitNoteController.js)
- [`server/controllers/financeComplianceController.js`](../../../../server/controllers/financeComplianceController.js)
- [`server/scripts/reconcileTenantIndexes.js`](../../../../server/scripts/reconcileTenantIndexes.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/financialDashboardSeed.js`](../../../../server/seeds/financialDashboardSeed.js)
- [`server/services/etimsNoteService.js`](../../../../server/services/etimsNoteService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
