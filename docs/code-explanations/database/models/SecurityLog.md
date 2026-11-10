# SecurityLog model

**Source:** [server/models/SecurityLog.js](../../../../server/models/SecurityLog.js)

## Purpose

This Mongoose model persists the security log domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; default: null; ref: Organization; index |
| `user` | Associated user account. | type: ObjectId; required: no; default: null; ref: User |
| `email` | Email address/contact identifier; normalization depends on schema options. | type: String; required: no; default: "" |
| `action` | Business field “action”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["login_success","login_failed","logout","register","password_changed","password_reset","password_reset_requested","account_locked","account_unlocked","account_created","account_updated","account_deleted","role_changed","permission_changed","token_revoked","admin_action","suspicious_request","unauthorized_access","file_upload","api_access","mfa_challenge_created","mfa_login_success","mfa_login_failed"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `ipAddress` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `userAgent` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "" |
| `method` | Business field “method”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `endpoint` | Business field “endpoint”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "success"; allowed values: ["success","failed","warning"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `severity` | Business field “severity”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "low"; allowed values: ["low","medium","high","critical"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `details` | Business field “details”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `country` | Business field “country”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `city` | Business field “city”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ user: 1 }`
- `{ action: 1 }`
- `{ ipAddress: 1 }`
- `{ status: 1 }`
- `{ severity: 1 }`
- `{ user: 1, createdAt: -1 }`
- `{ email: 1, createdAt: -1 }`
- `{ action: 1, createdAt: -1 }`
- `{ ipAddress: 1, createdAt: -1 }`
- `{ severity: 1, createdAt: -1 }`
- `{ status: 1, createdAt: -1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `static logEvent`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/authController.js`](../../../../server/controllers/authController.js)
- [`server/controllers/superAdminToolsController.js`](../../../../server/controllers/superAdminToolsController.js)
- [`server/middleware/securityMonitor.js`](../../../../server/middleware/securityMonitor.js)
- [`server/services/securityService.js`](../../../../server/services/securityService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
