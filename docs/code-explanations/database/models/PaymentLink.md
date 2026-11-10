# PaymentLink model

**Source:** [server/models/PaymentLink.js](../../../../server/models/PaymentLink.js)

## Purpose

This Mongoose model persists the payment link domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `token` | Credential or opaque token; inspect hashing/encryption and expiry behavior. Never expose it. | type: String; required: yes |
| `booking` | Associated tour booking. | type: ObjectId; required: yes; ref: Booking |
| `invoice` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Invoice |
| `amount` | Monetary amount for this record; currency and accounting meaning depend on the parent workflow. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["active","paid","expired","cancelled"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `expiresAt` | Expiry time used by the owning workflow; enforcement may be via TTL or application checks. | type: Date; required: no; default: null |
| `usedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ token: 1 } — unique: true`
- `{ booking: 1 }`
- `{ status: 1 }`
- `{ expiresAt: 1 }`
- `{ tenantId: 1, token: 1 } — unique: true, sparse: false`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `booking`:  ref: Booking. Callers must scope and authorize referenced records.
- `invoice`:  ref: Invoice. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `static generateToken`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/paymentLinkController.js`](../../../../server/controllers/paymentLinkController.js)
- [`server/scripts/reconcileTenantIndexes.js`](../../../../server/scripts/reconcileTenantIndexes.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
