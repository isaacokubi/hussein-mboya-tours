# Webhook model

**Source:** [server/models/Webhook.js](../../../../server/models/Webhook.js)

## Purpose

This Mongoose model persists the webhook domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 120; validators: maxlength |
| `url` | Business field “url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; length: 0 to 500; validators: maxlength |
| `secret` | Business field “secret”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; excluded from default queries |
| `events` | Business field “events”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no; default: [function: defaultFn] |
| `active` | Business field “active”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `lastDeliveryAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `lastStatus` | Lifecycle or processing state; allowed transitions belong to the feature service/controller. | type: Number; required: no; default: null |
| `failureCount` | Business field “failure count”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0 |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ active: 1 }`
- `{ tenantId: 1, url: 1 }`

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
- [`server/controllers/developerIntegrationController.js`](../../../../server/controllers/developerIntegrationController.js)
- [`server/scripts/reconcileTenantIndexes.js`](../../../../server/scripts/reconcileTenantIndexes.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/hospitalityDeveloperSeed.js`](../../../../server/seeds/hospitalityDeveloperSeed.js)
- [`server/services/webhookDeliveryService.js`](../../../../server/services/webhookDeliveryService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
