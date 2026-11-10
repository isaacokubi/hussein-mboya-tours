# JournalEntry model

**Source:** [server/models/JournalEntry.js](../../../../server/models/JournalEntry.js)

## Purpose

This Mongoose model persists the journal entry domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `entryNumber` | Business field “entry number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `entryDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: [function: now] |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 300; validators: maxlength |
| `reference` | Human/provider/business reference used to correlate records; uniqueness depends on declared indexes. | type: String; required: no; default: "" |
| `sourceType` | Business field “source type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "manual" |
| `sourceId` | Business field “source id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "draft"; allowed values: ["draft","posted","void"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `lines` | Business field “lines”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no; default: [function: anonymous] |
| `postedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `postedBy` | Business field “posted by”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ entryDate: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, entryNumber: 1 } — unique: true`
- `{ tenantId: 1, status: 1, entryDate: -1 }`
- `{ tenantId: 1, sourceType: 1, sourceId: 1 } — unique: true, partialFilterExpression: {"sourceId":{"$type":"objectId"}}`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `postedBy`:  ref: User. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre validate`, `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/accountingControlReportsController.js`](../../../../server/controllers/accountingControlReportsController.js)
- [`server/controllers/accountingController.js`](../../../../server/controllers/accountingController.js)
- [`server/controllers/accountingExportController.js`](../../../../server/controllers/accountingExportController.js)
- [`server/controllers/accountingOperationalReconciliationController.js`](../../../../server/controllers/accountingOperationalReconciliationController.js)
- [`server/controllers/accountingReconciliationController.js`](../../../../server/controllers/accountingReconciliationController.js)
- [`server/controllers/accountingReportsController.js`](../../../../server/controllers/accountingReportsController.js)
- [`server/controllers/accountingSubledgerController.js`](../../../../server/controllers/accountingSubledgerController.js)
- [`server/controllers/managementAccountingController.js`](../../../../server/controllers/managementAccountingController.js)
- [`server/scripts/auditTenantDashboardData.js`](../../../../server/scripts/auditTenantDashboardData.js)
- [`server/scripts/reconcileTenantIndexes.js`](../../../../server/scripts/reconcileTenantIndexes.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/financialDashboardSeed.js`](../../../../server/seeds/financialDashboardSeed.js)
- [`server/services/financeLifecycleService.js`](../../../../server/services/financeLifecycleService.js)
- [`server/services/financeReportingService.js`](../../../../server/services/financeReportingService.js)
- [`server/services/operationalAccountingService.js`](../../../../server/services/operationalAccountingService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
