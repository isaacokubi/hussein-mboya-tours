# Vehicle model

**Source:** [server/models/Vehicle.js](../../../../server/models/Vehicle.js)

## Purpose

This Mongoose model persists the vehicle domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `registrationNumber` | Business field “registration number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes |
| `registration` | Business field “registration”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `model` | Business field “model”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes |
| `manufacturer` | Business field “manufacturer”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `year` | Business field “year”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; range: 1990 to 2027; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1990).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (2027). |
| `type` | Business field “type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["SUV","VAN","BUS","LAND_CRUISER","MINIBUS","SEDAN","PICKUP"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `capacity` | Business field “capacity”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `driver` | Business field “driver”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: Staff |
| `assignedTour` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Tour |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "available"; allowed values: ["available","assigned","maintenance","out_of_service"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `isActive` | Boolean state/capability flag; its mutation rules are defined by callers. | type: Boolean; required: no; default: true |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `fuelType` | Business field “fuel type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Diesel"; allowed values: ["Petrol","Diesel","Hybrid","Electric"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `transmission` | Business field “transmission”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Manual"; allowed values: ["Manual","Automatic"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `mileage` | Business field “mileage”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `insuranceNumber` | Business field “insurance number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `insuranceExpiry` | Business field “insurance expiry”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: no; default: null |
| `lastServiceDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `nextServiceDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `maintenanceHistory` | Business field “maintenance history”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `image` | Business field “image”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Embedded; required: no |
| `gallery` | Business field “gallery”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; default: null; ref: Organization; index; immutable |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ isDeleted: 1 }`
- `{ image.tenantId: 1 }`
- `{ gallery.tenantId: 1 }`
- `{ tenantId: 1 }`
- `{ status: 1 }`
- `{ type: 1 }`
- `{ driver: 1 }`
- `{ assignedTour: 1 }`
- `{ isActive: 1 }`
- `{ nextServiceDate: 1 }`

## Relationships and tenant boundary

- `driver`:  ref: Staff. Callers must scope and authorize referenced records.
- `assignedTour`:  ref: Tour. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `assignDriver`, `releaseVehicle`, `scheduleMaintenance`, `virtual isAvailable`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminAIAlertsController.js`](../../../../server/controllers/adminAIAlertsController.js)
- [`server/controllers/adminAIController.js`](../../../../server/controllers/adminAIController.js)
- [`server/controllers/adminAIIntelligenceController.js`](../../../../server/controllers/adminAIIntelligenceController.js)
- [`server/controllers/adminAIOperationsController.js`](../../../../server/controllers/adminAIOperationsController.js)
- [`server/controllers/adminDashboardMetricsController.js`](../../../../server/controllers/adminDashboardMetricsController.js)
- [`server/controllers/adminDashboardTenantController.js`](../../../../server/controllers/adminDashboardTenantController.js)
- [`server/controllers/adminTourController.js`](../../../../server/controllers/adminTourController.js)
- [`server/controllers/airportTransferController.js`](../../../../server/controllers/airportTransferController.js)
- [`server/controllers/analyticsController.js`](../../../../server/controllers/analyticsController.js)
- [`server/controllers/hospitalityAdminController.js`](../../../../server/controllers/hospitalityAdminController.js)
- [`server/controllers/hospitalityOperationsController.js`](../../../../server/controllers/hospitalityOperationsController.js)
- [`server/controllers/operationsController.js`](../../../../server/controllers/operationsController.js)
- [`server/controllers/tenantBookingAdminController.js`](../../../../server/controllers/tenantBookingAdminController.js)
- [`server/controllers/tenantDirectoryController.js`](../../../../server/controllers/tenantDirectoryController.js)
- [`server/controllers/tourController.js`](../../../../server/controllers/tourController.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
