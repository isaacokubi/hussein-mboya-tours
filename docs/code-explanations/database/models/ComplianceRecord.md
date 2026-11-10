# ComplianceRecord model

**Source:** [server/models/ComplianceRecord.js](../../../../server/models/ComplianceRecord.js)

## Purpose

This Mongoose model persists the compliance record domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `type` | Business field “type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["TRA_LICENSE","ODPC_REGISTRATION","PRIVACY_POLICY","DATA_RETENTION","DPA_REVIEW","BREACH_RESPONSE","KRA_TAX_PROFILE","ETIMS_ONBOARDING"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "not_started"; allowed values: ["not_started","in_progress","submitted","approved","expired","action_required","closed"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `referenceNumber` | Business field “reference number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `authority` | Business field “authority”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `issueDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `expiryDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `owner` | Business field “owner”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `documents` | Business field “documents”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `lastReviewedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `nextReviewAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ type: 1 }`
- `{ status: 1 }`
- `{ expiryDate: 1 }`
- `{ nextReviewAt: 1 }`
- `{ tenantId: 1, type: 1 } — unique: true`
- `{ tenantId: 1, status: 1, expiryDate: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `owner`:  ref: User. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/complianceController.js`](../../../../server/controllers/complianceController.js)
- [`server/scripts/reconcileTenantIndexes.js`](../../../../server/scripts/reconcileTenantIndexes.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/dashboardOperationalSeed.js`](../../../../server/seeds/dashboardOperationalSeed.js)
- [`server/services/complianceExpiryService.js`](../../../../server/services/complianceExpiryService.js)
- [`server/services/kenyaStep2ReadinessService.js`](../../../../server/services/kenyaStep2ReadinessService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
