# AirportTransfer model

**Source:** [server/models/AirportTransfer.js](../../../../server/models/AirportTransfer.js)

## Purpose

This Mongoose model persists the airport transfer domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 180; validators: maxlength |
| `airportName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 180; validators: maxlength |
| `airportCode` | Business field “airport code”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 10; validators: maxlength |
| `direction` | Business field “direction”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "airport_to_destination"; allowed values: ["airport_to_destination","destination_to_airport","point_to_point"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `pickupLocation` | Business field “pickup location”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 300; validators: maxlength |
| `dropoffLocation` | Business field “dropoff location”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 300; validators: maxlength |
| `vehicleType` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: yes; length: 0 to 100; validators: maxlength |
| `passengerCapacity` | Business field “passenger capacity”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `luggageCapacity` | Business field “luggage capacity”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 2; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `pricingModel` | Business field “pricing model”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "per_vehicle"; allowed values: ["per_vehicle","per_passenger"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `price` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `durationMinutes` | Business field “duration minutes”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 60; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `amenities` | Business field “amenities”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `operatingHours` | Business field “operating hours”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "24/7" |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 2000; validators: maxlength |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["draft","active","inactive"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ tenantId: 1, status: 1, airportCode: 1 }`
- `{ tenantId: 1, name: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `updatedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/airportTransferController.js`](../../../../server/controllers/airportTransferController.js)
- [`server/controllers/enhancedAirportTransferBookingController.js`](../../../../server/controllers/enhancedAirportTransferBookingController.js)
- [`server/controllers/hospitalityAdminController.js`](../../../../server/controllers/hospitalityAdminController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/hospitalityDeveloperSeed.js`](../../../../server/seeds/hospitalityDeveloperSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
