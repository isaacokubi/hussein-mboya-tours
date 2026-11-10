# Subscription model

**Source:** [server/models/Subscription.js](../../../../server/models/Subscription.js)

## Purpose

This Mongoose model persists the subscription domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index; unique |
| `plan` | Business field “plan”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "starter"; allowed values: ["starter","professional","business","enterprise"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "trialing"; allowed values: ["trialing","active","past_due","cancelled","expired"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `provider` | Business field “provider”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "internal"; allowed values: ["internal","stripe","mpesa","manual"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `providerSubscriptionId` | Business field “provider subscription id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `seats` | Business field “seats”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 5; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `trialStartsAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: yes |
| `trialEndsAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: yes |
| `currentPeriodStartsAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `currentPeriodEndsAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `cancelledAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `metadata` | Business field “metadata”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 } — unique: true`
- `{ status: 1 }`
- `{ tenantId: 1, status: 1 }`
- `{ trialEndsAt: 1, status: 1 }`

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
- [`server/controllers/tenantSubscriptionController.js`](../../../../server/controllers/tenantSubscriptionController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/services/customerCommunicationScheduler.js`](../../../../server/services/customerCommunicationScheduler.js)
- [`server/services/customerCommunicationService.js`](../../../../server/services/customerCommunicationService.js)
- [`server/services/tenantSubscriptionService.js`](../../../../server/services/tenantSubscriptionService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
