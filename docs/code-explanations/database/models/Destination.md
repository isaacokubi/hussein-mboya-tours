# Destination model

**Source:** [server/models/Destination.js](../../../../server/models/Destination.js)

## Purpose

This Mongoose model persists the destination domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 150; validators: maxlength |
| `slug` | Business field “slug”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `country` | Business field “country”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; default: "Kenya" |
| `region` | Business field “region”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `city` | Business field “city”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `shortDescription` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 300; validators: maxlength |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `featuredImage` | Business field “featured image”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `seo.title` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `seo.description` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `seo.keywords` | Business field “keywords”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `images` | Business field “images”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `video` | Business field “video”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `attractions` | Business field “attractions”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `activities` | Business field “activities”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `languages` | Business field “languages”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "" |
| `timezone` | Business field “timezone”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `bestSeason` | Business field “best season”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "All Year"; allowed values: ["Spring","Summer","Autumn","Winter","All Year"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `weather` | Business field “weather”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `averageTemperature` | Business field “average temperature”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: null |
| `coordinates.latitude` | Business field “latitude”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; range: -90 to 90; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (-90).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (90). |
| `coordinates.longitude` | Business field “longitude”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; range: -180 to 180; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (-180).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (180). |
| `averageRating` | Business field “average rating”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to 5; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (5). |
| `totalReviews` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0 |
| `totalTours` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0 |
| `totalBookings` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0 |
| `featured` | Business field “featured”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `popular` | Business field “popular”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["active","inactive"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `active` | Business field “active”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ country: 1 }`
- `{ tenantId: 1, slug: 1 } — unique: true, partialFilterExpression: {"slug":{"$type":"string"}}`
- `{ region: 1 }`
- `{ city: 1 }`
- `{ featured: 1 }`
- `{ popular: 1 }`
- `{ status: 1 }`
- `{ active: 1 }`
- `{ averageRating: -1 }`
- `{ totalBookings: -1 }`
- `{ isDeleted: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `updateRating`, `virtual image`, `virtual imageUrl`, `virtual location`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminController.js`](../../../../server/controllers/adminController.js)
- [`server/controllers/adminDashboardMetricsController.js`](../../../../server/controllers/adminDashboardMetricsController.js)
- [`server/controllers/adminDashboardTenantController.js`](../../../../server/controllers/adminDashboardTenantController.js)
- [`server/controllers/adminDestinationController.js`](../../../../server/controllers/adminDestinationController.js)
- [`server/controllers/customTourRequestController.js`](../../../../server/controllers/customTourRequestController.js)
- [`server/controllers/destinationController.js`](../../../../server/controllers/destinationController.js)
- [`server/controllers/tourController.js`](../../../../server/controllers/tourController.js)
- [`server/controllers/tourCrudController.js`](../../../../server/controllers/tourCrudController.js)
- [`server/routes/internal/stagingSuperAdminBootstrapRoutes.js`](../../../../server/routes/internal/stagingSuperAdminBootstrapRoutes.js)
- [`server/scripts/auditTenantDashboardData.js`](../../../../server/scripts/auditTenantDashboardData.js)
- [`server/scripts/repairGlobalToursMedia.js`](../../../../server/scripts/repairGlobalToursMedia.js)
- [`server/scripts/resetGlobalToursData.js`](../../../../server/scripts/resetGlobalToursData.js)
- [`server/scripts/seedStagingQaData.js`](../../../../server/scripts/seedStagingQaData.js)
- [`server/scripts/stagingQaStartupSeed.js`](../../../../server/scripts/stagingQaStartupSeed.js)
- [`server/scripts/tenantIsolationRegressionCheck.js`](../../../../server/scripts/tenantIsolationRegressionCheck.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
