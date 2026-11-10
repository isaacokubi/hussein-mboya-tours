# Quotation model

**Source:** [server/models/Quotation.js](../../../../server/models/Quotation.js)

## Purpose

This Mongoose model persists the quotation domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `quotationNumber` | Business field “quotation number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `agent` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: yes; ref: Agent |
| `customer` | Associated customer record or account, as indicated by the schema reference. | type: ObjectId; required: yes; ref: Customer |
| `tour` | Associated tour catalogue record. | type: ObjectId; required: no; default: null; ref: Tour |
| `tourPackage` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: TourPackage |
| `items` | Business field “items”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no; default: [function: anonymous] |
| `subtotal` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `tax` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `discount` | Business field “discount”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `grandTotal` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "draft"; allowed values: ["draft","sent","approved","rejected","expired","converted"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `validUntil` | Business field “valid until”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: yes |
| `sentAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `approvedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `booking` | Associated tour booking. | type: ObjectId; required: no; default: null; ref: Booking |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; default: null; ref: Organization; index; immutable |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ quotationNumber: 1 } — unique: true`
- `{ agent: 1 }`
- `{ customer: 1 }`
- `{ items.tenantId: 1 }`
- `{ status: 1 }`
- `{ isDeleted: 1 }`
- `{ tenantId: 1 }`
- `{ customer: 1, status: 1 }`
- `{ agent: 1, createdAt: -1 }`
- `{ validUntil: 1 }`
- `{ createdAt: -1 }`
- `{ tenantId: 1, quotationNumber: 1 } — unique: true, sparse: false`

## Relationships and tenant boundary

- `agent`:  ref: Agent. Callers must scope and authorize referenced records.
- `customer`:  ref: Customer. Callers must scope and authorize referenced records.
- `tour`:  ref: Tour. Callers must scope and authorize referenced records.
- `tourPackage`:  ref: TourPackage. Callers must scope and authorize referenced records.
- `booking`:  ref: Booking. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `markSent`, `markApproved`, `markConverted`, `virtual isExpired`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/customerController.js`](../../../../server/controllers/customerController.js)
- [`server/controllers/quotationController.js`](../../../../server/controllers/quotationController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/financialDashboardSeed.js`](../../../../server/seeds/financialDashboardSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
