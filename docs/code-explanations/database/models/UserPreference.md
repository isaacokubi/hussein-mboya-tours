# UserPreference model

**Source:** [server/models/UserPreference.js](../../../../server/models/UserPreference.js)

## Purpose

This Mongoose model persists the user preference domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `user` | Associated user account. | type: ObjectId; required: yes; ref: User |
| `interests` | Business field “interests”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `preferredCountries` | Business field “preferred countries”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `preferredDestinations` | Business field “preferred destinations”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `preferredCategories` | Business field “preferred categories”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `travelStyle` | Business field “travel style”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `budgetRange` | Business field “budget range”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Embedded; required: no |
| `preferredAccommodation` | Business field “preferred accommodation”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Standard"; allowed values: ["Budget","Standard","Luxury","Camping","Resort"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `preferredTransport` | Business field “preferred transport”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Any"; allowed values: ["Road","Air","Rail","Any"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `language` | Business field “language”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "English" |
| `receivePromotions` | Business field “receive promotions”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `receiveNewsletters` | Business field “receive newsletters”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `lastUpdatedBy` | Business field “last updated by”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; default: null; ref: Organization; index; immutable |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ user: 1 } — unique: true`
- `{ budgetRange.tenantId: 1 }`
- `{ tenantId: 1 }`
- `{ preferredCategories: 1 }`
- `{ preferredCountries: 1 }`
- `{ receivePromotions: 1 }`
- `{ tenantId: 1, user: 1 } — unique: true, sparse: false`

## Relationships and tenant boundary

- `user`:  ref: User. Callers must scope and authorize referenced records.
- `lastUpdatedBy`:  ref: User. Callers must scope and authorize referenced records.
- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `addInterest`, `removeInterest`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
