# TaxProfile model

**Source:** [server/models/TaxProfile.js](../../../../server/models/TaxProfile.js)

## Purpose

This Mongoose model persists the tax profile domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index; unique |
| `kraPin` | Business field “kra pin”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `kraPinStatus` | Lifecycle or processing state; allowed transitions belong to the feature service/controller. | type: String; required: no; default: "not_verified"; allowed values: ["not_verified","verified","invalid","pending"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `kraPinVerifiedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `vatRegistered` | Business field “vat registered”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `vatNumber` | Business field “vat number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `vatValidationStatus` | Lifecycle or processing state; allowed transitions belong to the feature service/controller. | type: String; required: no; default: "not_verified"; allowed values: ["not_verified","verified","invalid","pending"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `vatValidatedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `defaultVatRate` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 16; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `taxRegime` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "VAT"; allowed values: ["VAT","ZERO_RATED","EXEMPT","NON_VAT"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `etimsEnabled` | Business field “etims enabled”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `etimsSolution` | Business field “etims solution”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; allowed values: ["ONLINE","CLIENT","VSCU","OSCU","ECITIZEN","OTHER",""]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `etimsEnvironment` | Business field “etims environment”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "sandbox"; allowed values: ["sandbox","production"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `etimsDeviceId` | Business field “etims device id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsBranchId` | Business field “etims branch id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsBranchName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "Head Office" |
| `etimsTillId` | Business field “etims till id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsInvoicePrefix` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "INV" |
| `etimsCredentialRef` | Business field “etims credential ref”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsAdapterUrl` | Business field “etims adapter url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsLastSyncedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `etimsLastError` | Business field “etims last error”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsRetryCount` | Business field “etims retry count”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `etimsNextRetryAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `complianceNotes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 } — unique: true`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `updatedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `recordEtimsFailure`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/financeComplianceController.js`](../../../../server/controllers/financeComplianceController.js)
- [`server/models/Invoice.js`](../../../../server/models/Invoice.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/services/etimsNoteService.js`](../../../../server/services/etimsNoteService.js)
- [`server/services/etimsService.js`](../../../../server/services/etimsService.js)
- [`server/services/kenyaStep2ReadinessService.js`](../../../../server/services/kenyaStep2ReadinessService.js)
- [`server/services/taxEngineService.js`](../../../../server/services/taxEngineService.js)
- [`server/tests/operationalFinancialInvariants.test.js`](../../../../server/tests/operationalFinancialInvariants.test.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
