# StaffProfile model

**Source:** [server/models/StaffProfile.js](../../../../server/models/StaffProfile.js)

## Purpose

This Mongoose model persists the staff profile domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `user` | Associated user account. | type: ObjectId; required: yes; ref: User |
| `staff` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: yes; ref: Staff |
| `bio` | Business field “bio”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 2000; validators: maxlength |
| `address` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `city` | Business field “city”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `country` | Business field “country”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Kenya" |
| `emergencyContact` | Contact or location information; restrict access and avoid exposing it in logs. | type: Embedded; required: no |
| `education` | Business field “education”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `certifications` | Business field “certifications”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `skills` | Business field “skills”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `languages` | Business field “languages”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `documents` | Business field “documents”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `socialLinks.linkedin` | Business field “linkedin”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `socialLinks.facebook` | Business field “facebook”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `socialLinks.instagram` | Business field “instagram”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `socialLinks.website` | Business field “website”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `profileCompleted` | Business field “profile completed”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; default: null; ref: Organization; index; immutable |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ user: 1 } — unique: true`
- `{ staff: 1 } — unique: true`
- `{ emergencyContact.tenantId: 1 }`
- `{ tenantId: 1 }`
- `{ profileCompleted: 1 }`
- `{ tenantId: 1, user: 1 } — unique: true, sparse: false`
- `{ tenantId: 1, staff: 1 } — unique: true, sparse: false`

## Relationships and tenant boundary

- `user`:  ref: User. Callers must scope and authorize referenced records.
- `staff`:  ref: Staff. Callers must scope and authorize referenced records.
- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
