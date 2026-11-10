# Agent model

**Source:** [server/models/Agent.js](../../../../server/models/Agent.js)

## Purpose

This Mongoose model persists the agent domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `user` | Associated user account. | type: ObjectId; required: yes; ref: User; immutable |
| `companyName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 150; validators: maxlength |
| `phone` | Phone contact value; provider-specific normalization occurs in service code. | type: String; required: no; default: "" |
| `email` | Email address/contact identifier; normalization depends on schema options. | type: String; required: no; default: "" |
| `location` | Business field “location”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 200; validators: maxlength |
| `website` | Business field “website”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 1000; validators: maxlength |
| `commissionRate` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; default: 10; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `totalCommission` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `pendingCommission` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `paidCommission` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `walletBalance` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `totalSales` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `totalBookings` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `successfulBookings` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `cancelledBookings` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `isApproved` | Boolean state/capability flag; its mutation rules are defined by callers. | type: Boolean; required: no; default: false |
| `approvedBy` | Business field “approved by”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; ref: User |
| `approvedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["active","inactive","suspended"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `licenseNumber` | Business field “license number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `taxNumber` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "" |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ user: 1 } — unique: true`
- `{ status: 1 }`
- `{ status: 1, isApproved: 1 }`
- `{ companyName: text, location: text }`
- `{ tenantId: 1, user: 1 } — unique: true, sparse: false`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
- `approvedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `false`.
Source declarations include hooks: `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual isActive`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminAgentController.js`](../../../../server/controllers/adminAgentController.js)
- [`server/controllers/adminDashboardMetricsController.js`](../../../../server/controllers/adminDashboardMetricsController.js)
- [`server/controllers/adminDashboardTenantController.js`](../../../../server/controllers/adminDashboardTenantController.js)
- [`server/controllers/adminUserController.js`](../../../../server/controllers/adminUserController.js)
- [`server/controllers/adminUserProfileController.js`](../../../../server/controllers/adminUserProfileController.js)
- [`server/controllers/agentBookingController.js`](../../../../server/controllers/agentBookingController.js)
- [`server/controllers/agentController.js`](../../../../server/controllers/agentController.js)
- [`server/controllers/agentCustomerController.js`](../../../../server/controllers/agentCustomerController.js)
- [`server/controllers/agentTourController.js`](../../../../server/controllers/agentTourController.js)
- [`server/controllers/authController.js`](../../../../server/controllers/authController.js)
- [`server/controllers/bookingController.js`](../../../../server/controllers/bookingController.js)
- [`server/controllers/commissionController.js`](../../../../server/controllers/commissionController.js)
- [`server/controllers/customTourRequestController.js`](../../../../server/controllers/customTourRequestController.js)
- [`server/controllers/quotationController.js`](../../../../server/controllers/quotationController.js)
- [`server/controllers/superAdminUserController.js`](../../../../server/controllers/superAdminUserController.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
