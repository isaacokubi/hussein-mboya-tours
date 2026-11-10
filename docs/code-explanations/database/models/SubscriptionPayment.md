# SubscriptionPayment model

**Source:** [server/models/SubscriptionPayment.js](../../../../server/models/SubscriptionPayment.js)

## Purpose

This Mongoose model persists the subscription payment domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `userId` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: User |
| `plan` | Business field “plan”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["starter","professional","business","enterprise"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `amount` | Monetary amount for this record; currency and accounting meaning depend on the parent workflow. | type: Number; required: yes; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `provider` | Business field “provider”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "mpesa"; allowed values: ["mpesa","bank","manual","stripe","paypal"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "pending"; allowed values: ["pending","completed","failed","cancelled"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `phoneNumber` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `checkoutRequestID` | Business field “checkout request id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `merchantRequestID` | Business field “merchant request id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `mpesaReceiptNumber` | Business field “mpesa receipt number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `transactionReference` | Reference used to correlate a payment attempt or external transaction. | type: String; required: no; default: "" |
| `paidAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `periodDays` | Business field “period days”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 30; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `failureReason` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `metadata` | Business field “metadata”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ status: 1 }`
- `{ checkoutRequestID: 1 }`
- `{ mpesaReceiptNumber: 1 }`
- `{ transactionReference: 1 }`
- `{ provider: 1, transactionReference: 1 } — unique: true, name: "provider_1_transactionReference_1", partialFilterExpression: {"transactionReference":{"$type":"string","$gt":""}}`
- `{ tenantId: 1, status: 1, createdAt: -1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `userId`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/subscriptionMpesaCallbackController.js`](../../../../server/controllers/subscriptionMpesaCallbackController.js)
- [`server/controllers/tenantSubscriptionController.js`](../../../../server/controllers/tenantSubscriptionController.js)
- [`server/middleware/mpesaCallbackIntegrity.js`](../../../../server/middleware/mpesaCallbackIntegrity.js)
- [`server/middleware/resolveMpesaCallbackTenant.js`](../../../../server/middleware/resolveMpesaCallbackTenant.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/services/tenantSubscriptionService.js`](../../../../server/services/tenantSubscriptionService.js)
- [`server/tests/partialUniqueIndexes.test.js`](../../../../server/tests/partialUniqueIndexes.test.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
