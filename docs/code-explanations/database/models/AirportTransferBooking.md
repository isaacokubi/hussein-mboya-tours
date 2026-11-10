# AirportTransferBooking model

**Source:** [server/models/AirportTransferBooking.js](../../../../server/models/AirportTransferBooking.js)

## Purpose

This Mongoose model persists the airport transfer booking domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `reference` | Human/provider/business reference used to correlate records; uniqueness depends on declared indexes. | type: String; required: yes |
| `transfer` | Business field “transfer”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: yes; ref: AirportTransfer |
| `customer` | Associated customer record or account, as indicated by the schema reference. | type: ObjectId; required: no; default: null; ref: Customer |
| `user` | Associated user account. | type: ObjectId; required: no; default: null; ref: User |
| `linkedBooking` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Booking |
| `pickupDateTime` | Business field “pickup date time”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: yes |
| `pickupLocation` | Business field “pickup location”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; length: 0 to 300; validators: maxlength |
| `dropoffLocation` | Business field “dropoff location”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; length: 0 to 300; validators: maxlength |
| `flightNumber` | Business field “flight number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 30; validators: maxlength |
| `airline` | Business field “airline”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 120; validators: maxlength |
| `terminal` | Business field “terminal”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 80; validators: maxlength |
| `flightArrivalDateTime` | Business field “flight arrival date time”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: no; default: null |
| `flightDepartureDateTime` | Business field “flight departure date time”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: no; default: null |
| `meetAndGreet` | Business field “meet and greet”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `signboardName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 180; validators: maxlength |
| `whatsappContact` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: ""; length: 0 to 40; validators: maxlength |
| `childSeats` | Business field “child seats”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `boosterSeats` | Business field “booster seats”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `wheelchairAccessible` | Business field “wheelchair accessible”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `accommodationName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 240; validators: maxlength |
| `passengerName` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 180; validators: maxlength |
| `passengerPhone` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: yes; length: 0 to 40; validators: maxlength |
| `passengerEmail` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `passengers` | Business field “passengers”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `luggage` | Business field “luggage”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `specialRequests` | Business field “special requests”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 2000; validators: maxlength |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "pending"; allowed values: ["pending","confirmed","assigned","driver_en_route","picked_up","completed","cancelled","no_show"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `paymentStatus` | Payment lifecycle state; final settlement should follow verified payment evidence. | type: String; required: no; default: "pending"; allowed values: ["pending","partial","paid","failed","refunded"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `subtotal` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `taxes` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `fees` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `totalAmount` | Gross amount associated with the record. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `assignedVehicle` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Vehicle |
| `assignedDriver` | Business field “assigned driver”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `source` | Business field “source”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "website"; allowed values: ["website","agent","admin","booking","api"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 3000; validators: maxlength |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ transfer: 1 }`
- `{ customer: 1 }`
- `{ user: 1 }`
- `{ linkedBooking: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, reference: 1 } — unique: true`
- `{ tenantId: 1, pickupDateTime: 1, status: 1 }`
- `{ tenantId: 1, customer: 1, createdAt: -1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `transfer`:  ref: AirportTransfer. Callers must scope and authorize referenced records.
- `customer`:  ref: Customer. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
- `linkedBooking`:  ref: Booking. Callers must scope and authorize referenced records.
- `assignedVehicle`:  ref: Vehicle. Callers must scope and authorize referenced records.
- `assignedDriver`:  ref: User. Callers must scope and authorize referenced records.
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
- [`server/controllers/hospitalityCommercialController.js`](../../../../server/controllers/hospitalityCommercialController.js)
- [`server/controllers/hospitalityOperationsController.js`](../../../../server/controllers/hospitalityOperationsController.js)
- [`server/models/HospitalityDeposit.js`](../../../../server/models/HospitalityDeposit.js)
- [`server/scripts/mongodb-application-audit.js`](../../../../server/scripts/mongodb-application-audit.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/hospitalityDeveloperSeed.js`](../../../../server/seeds/hospitalityDeveloperSeed.js)
- [`server/services/hospitalityInvoiceService.js`](../../../../server/services/hospitalityInvoiceService.js)
- [`server/services/hospitalityPaymentLifecycleService.js`](../../../../server/services/hospitalityPaymentLifecycleService.js)
- [`server/tests/hospitalityPaymentLifecycleIntegration.test.js`](../../../../server/tests/hospitalityPaymentLifecycleIntegration.test.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
