# OperationalAsset model

**Source:** [server/models/OperationalAsset.js](../../../../server/models/OperationalAsset.js)

## Purpose

This Mongoose model persists the operational asset domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `type` | Business field “type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["vehicle","driver","guide","room","transfer","park_fee","voucher","traveller_document","incident"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `code` | Business field “code”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["active","available","inactive","pending","completed","cancelled","expired"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `bookingId` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; ref: Booking |
| `tourId` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; ref: Tour |
| `assignedTo` | Business field “assigned to”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; ref: User |
| `startAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `endAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `metadata` | Business field “metadata”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ type: 1 }`
- `{ code: 1 }`
- `{ status: 1 }`
- `{ bookingId: 1 }`
- `{ tourId: 1 }`
- `{ assignedTo: 1 }`
- `{ tenantId: 1, type: 1, status: 1, startAt: 1 }`
- `{ tenantId: 1, code: 1 } — unique: true, sparse: true`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `bookingId`:  ref: Booking. Callers must scope and authorize referenced records.
- `tourId`:  ref: Tour. Callers must scope and authorize referenced records.
- `assignedTo`:  ref: User. Callers must scope and authorize referenced records.
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
- [`server/controllers/operationalAssetController.js`](../../../../server/controllers/operationalAssetController.js)
- [`server/controllers/operationsCopilotController.js`](../../../../server/controllers/operationsCopilotController.js)
- [`server/controllers/travelLifecycleController.js`](../../../../server/controllers/travelLifecycleController.js)
- [`server/controllers/travelOperationsController.js`](../../../../server/controllers/travelOperationsController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/services/travelOperationsService.js`](../../../../server/services/travelOperationsService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
