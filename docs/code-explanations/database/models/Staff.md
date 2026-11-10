# Staff model

**Source:** [server/models/Staff.js](../../../../server/models/Staff.js)

## Purpose

This Mongoose model persists the staff domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `user` | Associated user account. | type: ObjectId; required: no; default: null; ref: User |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `email` | Email address/contact identifier; normalization depends on schema options. | type: String; required: yes |
| `phone` | Phone contact value; provider-specific normalization occurs in service code. | type: String; required: yes |
| `nationalId` | Business field “national id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `gender` | Business field “gender”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: null; allowed values: ["male","female","other"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `dateOfBirth` | Business field “date of birth”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: no; default: null |
| `address` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `position` | Business field “position”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["admin","tour_manager","guide","driver","support"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `role` | Business field “role”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: null; allowed values: ["admin","manager","guide","driver","support"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `department` | Business field “department”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `profileImage.url` | Business field “url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `profileImage.publicId` | Business field “public id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `licenseNumber` | Business field “license number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `licenseExpiry` | Business field “license expiry”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: no; default: null |
| `languages` | Business field “languages”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `certifications` | Business field “certifications”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `experience` | Business field “experience”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `employeeNumber` | Business field “employee number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: not specified |
| `employmentType` | Business field “employment type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "full_time"; allowed values: ["full_time","part_time","contract","temporary"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `joinedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: [function: now] |
| `salary` | Business field “salary”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `availability` | Business field “availability”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "available"; allowed values: ["available","busy","leave","offline"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `assignedTours` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Array; required: no |
| `completedTours` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `averageRating` | Business field “average rating”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to 5; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (5). |
| `emergencyContact` | Contact or location information; restrict access and avoid exposing it in logs. | type: Embedded; required: no |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["active","inactive","suspended"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `isActive` | Boolean state/capability flag; its mutation rules are defined by callers. | type: Boolean; required: no; default: true |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; default: null; ref: Organization; index; immutable |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ user: 1 }`
- `{ emergencyContact.tenantId: 1 }`
- `{ tenantId: 1 }`
- `{ position: 1 }`
- `{ status: 1 }`
- `{ availability: 1 }`
- `{ isDeleted: 1 }`
- `{ tenantId: 1, email: 1 } — unique: true, name: "tenant_email_unique", partialFilterExpression: {"tenantId":{"$type":"objectId"}}`

## Relationships and tenant boundary

- `user`:  ref: User. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre validate`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `assignTour`, `releaseFromTour`, `virtual isDriver`, `virtual isGuide`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminDashboardMetricsController.js`](../../../../server/controllers/adminDashboardMetricsController.js)
- [`server/controllers/adminDashboardTenantController.js`](../../../../server/controllers/adminDashboardTenantController.js)
- [`server/controllers/adminTourController.js`](../../../../server/controllers/adminTourController.js)
- [`server/controllers/adminUserController.js`](../../../../server/controllers/adminUserController.js)
- [`server/controllers/adminUserProfileController.js`](../../../../server/controllers/adminUserProfileController.js)
- [`server/controllers/authController.js`](../../../../server/controllers/authController.js)
- [`server/controllers/customTourRequestController.js`](../../../../server/controllers/customTourRequestController.js)
- [`server/controllers/driverController.js`](../../../../server/controllers/driverController.js)
- [`server/controllers/driverTourController.js`](../../../../server/controllers/driverTourController.js)
- [`server/controllers/guideController.js`](../../../../server/controllers/guideController.js)
- [`server/controllers/notificationController.js`](../../../../server/controllers/notificationController.js)
- [`server/controllers/operationsController.js`](../../../../server/controllers/operationsController.js)
- [`server/controllers/staffController.js`](../../../../server/controllers/staffController.js)
- [`server/controllers/superAdminUserController.js`](../../../../server/controllers/superAdminUserController.js)
- [`server/controllers/tenantBookingAdminController.js`](../../../../server/controllers/tenantBookingAdminController.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
