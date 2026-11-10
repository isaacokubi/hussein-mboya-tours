# Permission model

**Source:** [server/models/Permission.js](../../../../server/models/Permission.js)

## Purpose

This Mongoose model persists the permission domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 100; unique; validators: maxlength |
| `label` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 100; validators: maxlength |
| `module` | Business field “module”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; index |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 500; validators: maxlength |
| `path` | Business field “path”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `icon` | Business field “icon”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `category` | Business field “category”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "other"; allowed values: ["dashboard","booking","tour","vehicle","staff","customer","agent","payment","report","user","role","system","other"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `isActive` | Boolean state/capability flag; its mutation rules are defined by callers. | type: Boolean; required: no; default: true |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ name: 1 } — unique: true`
- `{ module: 1 }`
- `{ module: 1, name: 1 }`
- `{ category: 1 }`
- `{ isActive: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `static getByModule`, `virtual displayName`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminRoleController.js`](../../../../server/controllers/adminRoleController.js)
- [`server/controllers/superAdminRoleController.js`](../../../../server/controllers/superAdminRoleController.js)
- [`server/scripts/resetGlobalToursData.js`](../../../../server/scripts/resetGlobalToursData.js)
- [`server/seeds/adminSeed.js`](../../../../server/seeds/adminSeed.js)
- [`server/seeds/bookingAgentSeed.js`](../../../../server/seeds/bookingAgentSeed.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/customerSeed.js`](../../../../server/seeds/customerSeed.js)
- [`server/seeds/guideSeed.js`](../../../../server/seeds/guideSeed.js)
- [`server/seeds/permissionSeed.js`](../../../../server/seeds/permissionSeed.js)
- [`server/seeds/tourGuideSeed.js`](../../../../server/seeds/tourGuideSeed.js)
- [`server/seeds/tourManagerSeed.js`](../../../../server/seeds/tourManagerSeed.js)
- [`server/services/onboardingService.js`](../../../../server/services/onboardingService.js)
- [`server/services/securityService.js`](../../../../server/services/securityService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
