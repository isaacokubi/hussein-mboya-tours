# EtimsSubmission model

**Source:** [server/models/EtimsSubmission.js](../../../../server/models/EtimsSubmission.js)

## Purpose

This Mongoose model persists the etims submission domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `documentType` | Business field “document type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["invoice","credit","debit"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `documentId` | Business field “document id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: yes |
| `documentNumber` | Business field “document number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `attempt` | Business field “attempt”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: yes; allowed values: ["pending","synced","failed"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `idempotencyKey` | Business field “idempotency key”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes |
| `httpStatus` | Lifecycle or processing state; allowed transitions belong to the feature service/controller. | type: Number; required: no; default: null; range: 100 to 599; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (100).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (599). |
| `requestHash` | Business field “request hash”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `response` | Business field “response”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `error` | Business field “error”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsInvoiceNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "" |
| `etimsReceiptNumber` | Business field “etims receipt number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsReference` | Business field “etims reference”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `uniqueRegisterIdentifier` | Business field “unique register identifier”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `qrCode` | Business field “qr code”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `submittedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ documentType: 1 }`
- `{ documentId: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, documentType: 1, documentId: 1, attempt: 1 } — unique: true`
- `{ tenantId: 1, idempotencyKey: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/complianceController.js`](../../../../server/controllers/complianceController.js)
- [`server/controllers/financeComplianceController.js`](../../../../server/controllers/financeComplianceController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/services/etimsNoteService.js`](../../../../server/services/etimsNoteService.js)
- [`server/services/etimsService.js`](../../../../server/services/etimsService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
