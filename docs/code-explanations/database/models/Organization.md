# Organization model

**Source:** [server/models/Organization.js](../../../../server/models/Organization.js)

## Purpose

This Mongoose model persists the organization domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 160; validators: maxlength |
| `slug` | Business field “slug”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; index; unique |
| `legalName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `logoUrl` | Business field “logo url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `favicon` | Business field “favicon”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `brandColors.primary` | Business field “primary”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `brandColors.secondary` | Business field “secondary”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `brandColors.accent` | Business field “accent”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `websiteUrl` | Business field “website url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `domain` | Business field “domain”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: not specified |
| `supportEmail` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `supportPhone` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `address` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `country` | Business field “country”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Kenya" |
| `timezone` | Business field “timezone”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Africa/Nairobi" |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "trial"; allowed values: ["active","suspended","trial","cancelled"]; index; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `subscription.plan` | Business field “plan”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "starter"; allowed values: ["starter","professional","business","enterprise"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `subscription.seats` | Business field “seats”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 5; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `subscription.trialEndsAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `subscription.renewsAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `features.payments` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Boolean; required: no; default: true |
| `features.mpesa` | Business field “mpesa”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `features.stripe` | Business field “stripe”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `features.ai` | Business field “ai”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `features.customDomain` | Business field “custom domain”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `settings` | Business field “settings”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ slug: 1 } — unique: true`
- `{ status: 1 }`
- `{ domain: 1 } — unique: true, sparse: true`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/app.js`](../../../../server/app.js)
- [`server/controllers/adminAgentController.js`](../../../../server/controllers/adminAgentController.js)
- [`server/controllers/integrationController.js`](../../../../server/controllers/integrationController.js)
- [`server/controllers/mfaController.js`](../../../../server/controllers/mfaController.js)
- [`server/controllers/paypalController.js`](../../../../server/controllers/paypalController.js)
- [`server/controllers/settingsController.js`](../../../../server/controllers/settingsController.js)
- [`server/controllers/superAdminMpesaGatewayController.js`](../../../../server/controllers/superAdminMpesaGatewayController.js)
- [`server/controllers/superAdminTenantController.js`](../../../../server/controllers/superAdminTenantController.js)
- [`server/controllers/tenantBrandingController.js`](../../../../server/controllers/tenantBrandingController.js)
- [`server/controllers/tenantController.js`](../../../../server/controllers/tenantController.js)
- [`server/controllers/tenantSubscriptionController.js`](../../../../server/controllers/tenantSubscriptionController.js)
- [`server/middleware/integrationAuth.js`](../../../../server/middleware/integrationAuth.js)
- [`server/middleware/paymentTenantMiddleware.js`](../../../../server/middleware/paymentTenantMiddleware.js)
- [`server/middleware/planFeatureMiddleware.js`](../../../../server/middleware/planFeatureMiddleware.js)
- [`server/middleware/tenantMiddleware.js`](../../../../server/middleware/tenantMiddleware.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
