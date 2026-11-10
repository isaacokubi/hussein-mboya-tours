# Role model

**Source:** [server/models/Role.js](../../../../server/models/Role.js)

## Purpose

This Mongoose model persists the role domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `displayName` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `permissions` | Business field “permissions”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `isSystem` | Boolean state/capability flag; its mutation rules are defined by callers. | type: Boolean; required: no; default: false |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["active","inactive"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `level` | Business field “level”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 1; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `isDefault` | Boolean state/capability flag; its mutation rules are defined by callers. | type: Boolean; required: no; default: false |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ tenantId: 1, name: 1 } — unique: true`
- `{ status: 1 }`
- `{ level: -1 }`
- `{ isSystem: 1 }`
- `{ isDefault: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `hasPermission`, `addPermission`, `removePermission`, `virtual permissionCount`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminRoleController.js`](../../../../server/controllers/adminRoleController.js)
- [`server/controllers/adminUserController.js`](../../../../server/controllers/adminUserController.js)
- [`server/controllers/adminUserProfileController.js`](../../../../server/controllers/adminUserProfileController.js)
- [`server/controllers/authController.js`](../../../../server/controllers/authController.js)
- [`server/controllers/customerController.js`](../../../../server/controllers/customerController.js)
- [`server/controllers/notificationController.js`](../../../../server/controllers/notificationController.js)
- [`server/controllers/staffController.js`](../../../../server/controllers/staffController.js)
- [`server/controllers/superAdminRoleController.js`](../../../../server/controllers/superAdminRoleController.js)
- [`server/controllers/superAdminTenantController.js`](../../../../server/controllers/superAdminTenantController.js)
- [`server/controllers/superAdminUserController.js`](../../../../server/controllers/superAdminUserController.js)
- [`server/middleware/permissionMiddleware.js`](../../../../server/middleware/permissionMiddleware.js)
- [`server/scripts/reconcileDemoLoginAccounts.js`](../../../../server/scripts/reconcileDemoLoginAccounts.js)
- [`server/scripts/resetGlobalToursData.js`](../../../../server/scripts/resetGlobalToursData.js)
- [`server/seeds/adminSeed.js`](../../../../server/seeds/adminSeed.js)
- [`server/seeds/bookingAgentSeed.js`](../../../../server/seeds/bookingAgentSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
