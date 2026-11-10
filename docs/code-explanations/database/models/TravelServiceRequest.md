# TravelServiceRequest model

**Source:** [server/models/TravelServiceRequest.js](../../../../server/models/TravelServiceRequest.js)

## Purpose

This Mongoose model persists the travel service request domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `booking` | Associated tour booking. | type: ObjectId; required: no; ref: Booking |
| `customer` | Associated customer record or account, as indicated by the schema reference. | type: ObjectId; required: no; ref: User |
| `type` | Business field “type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["airport_transfer","accommodation","rooming_list","travel_document","insurance","manifest","incident","schedule","cancellation","special_service"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "open"; allowed values: ["open","in_progress","awaiting_customer","resolved","cancelled"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `priority` | Business field “priority”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "normal"; allowed values: ["low","normal","high","urgent"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `title` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 180; validators: maxlength |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: no; length: 0 to 5000; validators: maxlength |
| `requestedDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `dueDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `assignedTo` | Business field “assigned to”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; ref: User |
| `location` | Business field “location”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; length: 0 to 300; validators: maxlength |
| `contactPhone` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; length: 0 to 30; validators: maxlength |
| `metadata` | Business field “metadata”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `resolution` | Business field “resolution”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; length: 0 to 5000; validators: maxlength |
| `resolvedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ booking: 1 }`
- `{ customer: 1 }`
- `{ type: 1 }`
- `{ status: 1 }`
- `{ priority: 1 }`
- `{ tenantId: 1, type: 1, status: 1, requestedDate: 1 }`
- `{ tenantId: 1, booking: 1, createdAt: -1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `booking`:  ref: Booking. Callers must scope and authorize referenced records.
- `customer`:  ref: User. Callers must scope and authorize referenced records.
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
- [`server/controllers/travelServiceRequestController.js`](../../../../server/controllers/travelServiceRequestController.js)
- [`server/scripts/mongodb-application-audit.js`](../../../../server/scripts/mongodb-application-audit.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/dashboardOperationalSeed.js`](../../../../server/seeds/dashboardOperationalSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
