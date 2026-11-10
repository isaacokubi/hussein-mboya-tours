# Promotion model

**Source:** [server/models/Promotion.js](../../../../server/models/Promotion.js)

## Purpose

This Mongoose model persists the promotion domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `title` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 150; validators: maxlength |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 1000; validators: maxlength |
| `code` | Business field “code”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; sparse |
| `discountType` | Business field “discount type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["percentage","fixed"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `discountValue` | Business field “discount value”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `maxDiscount` | Business field “max discount”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: null; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `minimumBookingAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `startDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: yes |
| `endDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: yes |
| `tours` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Array; required: no |
| `audience` | Business field “audience”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "all"; allowed values: ["all","new","returning","vip","corporate"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `usageLimit` | Business field “usage limit”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `usageCount` | Business field “usage count”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `active` | Business field “active”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ code: 1 } — unique: true, sparse: true`
- `{ active: 1 }`
- `{ isDeleted: 1 }`
- `{ active: 1, startDate: 1, endDate: 1 }`
- `{ audience: 1 }`
- `{ tours: 1 }`
- `{ tenantId: 1, code: 1 } — unique: true, sparse: true`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `incrementUsage`, `calculateDiscount`, `virtual isExpired`, `virtual isStarted`, `virtual isAvailable`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
