# User model

**Source:** [server/models/User.js](../../../../server/models/User.js)

## Purpose

This Mongoose model persists the user domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `email` | Email address/contact identifier; normalization depends on schema options. | type: String; required: yes |
| `pendingEmail` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: ""; excluded from default queries |
| `emailChangeCodeHash` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: ""; excluded from default queries |
| `emailChangeExpiresAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null; excluded from default queries |
| `emailChangeAttempts` | Contact or location information; restrict access and avoid exposing it in logs. | type: Number; required: no; default: 0; excluded from default queries |
| `phone` | Phone contact value; provider-specific normalization occurs in service code. | type: String; required: yes; validators: user defined: Phone number must contain exactly 10 digits. |
| `password` | Authentication secret material; inspect schema selection and hashing hooks. Never expose or log it. | type: String; required: yes; length: 8 to unbounded; excluded from default queries; validators: minlength: Path `{PATH}` (`{VALUE}`, length {LENGTH}) is shorter than the minimum allowed length (8). |
| `role` | Business field “role”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "customer"; allowed values: ["customer","admin","super_admin","superadmin","administrator","agent","travel_agent","tour_manager","tourmanager","manager","tour_guide","tourguide","guide","driver"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `roleId` | Business field “role id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: Role |
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; default: null; ref: Organization |
| `permissionsOverride` | Business field “permissions override”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `legacyRole` | Business field “legacy role”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "customer" |
| `profileImage.url` | Business field “url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `profileImage.publicId` | Business field “public id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["active","inactive","disabled","suspended","blocked"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `isVerified` | Boolean state/capability flag; its mutation rules are defined by callers. | type: Boolean; required: no; default: false |
| `loyaltyPoints` | Business field “loyalty points”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0 |
| `referralCode` | Business field “referral code”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; sparse |
| `loginAttempts` | Business field “login attempts”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0 |
| `lockUntil` | Business field “lock until”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: no; default: null |
| `passwordResetCodeHash` | Business field “password reset code hash”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; excluded from default queries |
| `passwordResetExpiresAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null; excluded from default queries |
| `passwordResetAttempts` | Business field “password reset attempts”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; excluded from default queries |
| `loginPinHash` | Business field “login pin hash”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; excluded from default queries |
| `loginPinExpiresAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null; excluded from default queries |
| `loginPinAttempts` | Business field “login pin attempts”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; excluded from default queries |
| `loginPinLastSentAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null; excluded from default queries |
| `lastLoginAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ referralCode: 1 } — sparse: true`
- `{ tenantId: 1, role: 1 }`
- `{ tenantId: 1, email: 1 } — unique: true, name: "tenant_email_unique", partialFilterExpression: {"tenantId":{"$type":"objectId"}}`

## Relationships and tenant boundary

- `roleId`:  ref: Role. Callers must scope and authorize referenced records.
- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`, `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `matchPassword`, `virtual isActive`, `virtual isLocked`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminAIController.js`](../../../../server/controllers/adminAIController.js)
- [`server/controllers/adminAIIntelligenceController.js`](../../../../server/controllers/adminAIIntelligenceController.js)
- [`server/controllers/adminAIMarketingController.js`](../../../../server/controllers/adminAIMarketingController.js)
- [`server/controllers/adminAISalesController.js`](../../../../server/controllers/adminAISalesController.js)
- [`server/controllers/adminAITourRecommendationController.js`](../../../../server/controllers/adminAITourRecommendationController.js)
- [`server/controllers/adminAgentController.js`](../../../../server/controllers/adminAgentController.js)
- [`server/controllers/adminAuthController.js`](../../../../server/controllers/adminAuthController.js)
- [`server/controllers/adminController.js`](../../../../server/controllers/adminController.js)
- [`server/controllers/adminDashboardMetricsController.js`](../../../../server/controllers/adminDashboardMetricsController.js)
- [`server/controllers/adminDashboardTenantController.js`](../../../../server/controllers/adminDashboardTenantController.js)
- [`server/controllers/adminRoleController.js`](../../../../server/controllers/adminRoleController.js)
- [`server/controllers/adminTourController.js`](../../../../server/controllers/adminTourController.js)
- [`server/controllers/adminUserController.js`](../../../../server/controllers/adminUserController.js)
- [`server/controllers/adminUserProfileController.js`](../../../../server/controllers/adminUserProfileController.js)
- [`server/controllers/airportTransferController.js`](../../../../server/controllers/airportTransferController.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
