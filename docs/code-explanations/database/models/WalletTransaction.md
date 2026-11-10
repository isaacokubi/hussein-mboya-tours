# WalletTransaction model

**Source:** [server/models/WalletTransaction.js](../../../../server/models/WalletTransaction.js)

## Purpose

This Mongoose model persists the wallet transaction domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `agent` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: yes; ref: Agent |
| `user` | Associated user account. | type: ObjectId; required: no; default: null; ref: User |
| `commission` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: ObjectId; required: no; default: null; ref: Commission |
| `booking` | Associated tour booking. | type: ObjectId; required: no; default: null; ref: Booking |
| `type` | Business field “type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["commission","withdrawal","refund","bonus","adjustment"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `direction` | Business field “direction”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["credit","debit"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `amount` | Monetary amount for this record; currency and accounting meaning depend on the parent workflow. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `balanceBefore` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `balanceAfter` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `reference` | Human/provider/business reference used to correlate records; uniqueness depends on declared indexes. | type: String; required: no; sparse |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `paymentMethod` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "internal"; allowed values: ["mpesa","bank_transfer","cash","internal","other"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `transactionReference` | Reference used to correlate a payment attempt or external transaction. | type: String; required: no; default: "" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "completed"; allowed values: ["pending","processing","completed","failed","cancelled"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `approvedBy` | Business field “approved by”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `approvedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ agent: 1 }`
- `{ reference: 1 } — unique: true, sparse: true`
- `{ agent: 1, createdAt: -1 }`
- `{ booking: 1 }`
- `{ commission: 1 }`
- `{ status: 1 }`
- `{ type: 1 }`
- `{ tenantId: 1, reference: 1 } — unique: true, sparse: true`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `agent`:  ref: Agent. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
- `commission`:  ref: Commission. Callers must scope and authorize referenced records.
- `booking`:  ref: Booking. Callers must scope and authorize referenced records.
- `approvedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

No direct import/query caller was found by the static scan. The model may be dynamically referenced, populated, or unused; confirm with repository search before claiming active use.

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
