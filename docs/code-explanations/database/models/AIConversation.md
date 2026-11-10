# AIConversation model

**Source:** [server/models/AIConversation.js](../../../../server/models/AIConversation.js)

## Purpose

This Mongoose model persists the aiconversation domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `user` | Associated user account. | type: ObjectId; required: no; ref: User |
| `sessionId` | Business field “session id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes |
| `intent` | Business field “intent”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "travel" |
| `selectedTour` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Tour |
| `bookingStatus` | Lifecycle or processing state; allowed transitions belong to the feature service/controller. | type: String; required: no; default: "none"; allowed values: ["none","collecting_details","ready","completed"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `messages` | Human-readable descriptive data for the associated business record. | type: Array; required: no |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; default: null; ref: Organization; index; immutable |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ user: 1 }`
- `{ sessionId: 1 }`
- `{ messages.tenantId: 1 }`
- `{ tenantId: 1 }`

## Relationships and tenant boundary

- `user`:  ref: User. Callers must scope and authorize referenced records.
- `selectedTour`:  ref: Tour. Callers must scope and authorize referenced records.
- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/services/aiConversationService.js`](../../../../server/services/aiConversationService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
