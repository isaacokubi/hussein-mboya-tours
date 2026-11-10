# ChartOfAccount model

**Source:** [server/models/ChartOfAccount.js](../../../../server/models/ChartOfAccount.js)

## Purpose

This Mongoose model persists the chart of account domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `code` | Business field “code”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 120; validators: maxlength |
| `type` | Business field “type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["asset","liability","equity","revenue","expense"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `subtype` | Business field “subtype”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `active` | Business field “active”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `system` | Business field “system”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ type: 1 }`
- `{ active: 1 }`
- `{ tenantId: 1, code: 1 } — unique: true`
- `{ tenantId: 1, type: 1, active: 1 }`

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
- [`server/controllers/accountingControlReportsController.js`](../../../../server/controllers/accountingControlReportsController.js)
- [`server/controllers/accountingController.js`](../../../../server/controllers/accountingController.js)
- [`server/controllers/accountingExportController.js`](../../../../server/controllers/accountingExportController.js)
- [`server/controllers/accountingReconciliationController.js`](../../../../server/controllers/accountingReconciliationController.js)
- [`server/controllers/accountingReportsController.js`](../../../../server/controllers/accountingReportsController.js)
- [`server/controllers/managementAccountingController.js`](../../../../server/controllers/managementAccountingController.js)
- [`server/scripts/auditTenantDashboardData.js`](../../../../server/scripts/auditTenantDashboardData.js)
- [`server/scripts/reconcileTenantIndexes.js`](../../../../server/scripts/reconcileTenantIndexes.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/services/financeLifecycleService.js`](../../../../server/services/financeLifecycleService.js)
- [`server/services/financeReportingService.js`](../../../../server/services/financeReportingService.js)
- [`server/services/operationalAccountingService.js`](../../../../server/services/operationalAccountingService.js)
- [`server/tests/operationalFinancialInvariants.test.js`](../../../../server/tests/operationalFinancialInvariants.test.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
