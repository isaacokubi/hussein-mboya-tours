# HotelBooking model

**Source:** [server/models/HotelBooking.js](../../../../server/models/HotelBooking.js)

## Purpose

This Mongoose model persists the hotel booking domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `reference` | Human/provider/business reference used to correlate records; uniqueness depends on declared indexes. | type: String; required: yes |
| `hotel` | Associated hotel record. | type: ObjectId; required: yes; ref: Hotel |
| `roomType` | Associated hotel room type. | type: ObjectId; required: yes; ref: HotelRoomType |
| `ratePlan` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: ObjectId; required: no; default: null; ref: HospitalityRatePlan |
| `customer` | Associated customer record or account, as indicated by the schema reference. | type: ObjectId; required: no; default: null; ref: Customer |
| `user` | Associated user account. | type: ObjectId; required: no; default: null; ref: User |
| `linkedBooking` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Booking |
| `checkIn` | Business field “check in”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: yes |
| `checkOut` | Business field “check out”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: yes |
| `estimatedArrivalTime` | Business field “estimated arrival time”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `rooms` | Business field “rooms”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `adults` | Business field “adults”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `children` | Business field “children”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `guests` | Business field “guests”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no; default: [function: anonymous] |
| `mealPlan` | Business field “meal plan”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "room_only"; allowed values: ["room_only","breakfast","half_board","full_board","all_inclusive"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `bedPreference` | Business field “bed preference”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `dietaryRequirements` | Business field “dietary requirements”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 1500; validators: maxlength |
| `accessibilityNeeds` | Business field “accessibility needs”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 1500; validators: maxlength |
| `airportTransferRequired` | Business field “airport transfer required”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `specialRequests` | Business field “special requests”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 3000; validators: maxlength |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "pending"; allowed values: ["pending","confirmed","checked_in","checked_out","cancelled","no_show"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `paymentStatus` | Payment lifecycle state; final settlement should follow verified payment evidence. | type: String; required: no; default: "pending"; allowed values: ["pending","partial","paid","failed","refunded"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `source` | Business field “source”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "website"; allowed values: ["website","agent","admin","booking","api"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `subtotal` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `taxes` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `fees` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `totalAmount` | Gross amount associated with the record. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 3000; validators: maxlength |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ hotel: 1 }`
- `{ roomType: 1 }`
- `{ ratePlan: 1 }`
- `{ customer: 1 }`
- `{ user: 1 }`
- `{ linkedBooking: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, reference: 1 } — unique: true`
- `{ tenantId: 1, checkIn: 1, checkOut: 1, status: 1 }`
- `{ tenantId: 1, customer: 1, createdAt: -1 }`
- `{ tenantId: 1, ratePlan: 1, createdAt: -1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `hotel`:  ref: Hotel. Callers must scope and authorize referenced records.
- `roomType`:  ref: HotelRoomType. Callers must scope and authorize referenced records.
- `ratePlan`:  ref: HospitalityRatePlan. Callers must scope and authorize referenced records.
- `customer`:  ref: Customer. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
- `linkedBooking`:  ref: Booking. Callers must scope and authorize referenced records.
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
- [`server/controllers/enhancedHotelBookingController.js`](../../../../server/controllers/enhancedHotelBookingController.js)
- [`server/controllers/hospitalityAdminController.js`](../../../../server/controllers/hospitalityAdminController.js)
- [`server/controllers/hospitalityBookingAmendmentController.js`](../../../../server/controllers/hospitalityBookingAmendmentController.js)
- [`server/controllers/hospitalityCommercialController.js`](../../../../server/controllers/hospitalityCommercialController.js)
- [`server/controllers/hospitalityInventoryConcurrencyController.js`](../../../../server/controllers/hospitalityInventoryConcurrencyController.js)
- [`server/controllers/hospitalityOperationsController.js`](../../../../server/controllers/hospitalityOperationsController.js)
- [`server/controllers/hotelAvailabilityController.js`](../../../../server/controllers/hotelAvailabilityController.js)
- [`server/controllers/hotelController.js`](../../../../server/controllers/hotelController.js)
- [`server/models/HospitalityDeposit.js`](../../../../server/models/HospitalityDeposit.js)
- [`server/scripts/mongodb-application-audit.js`](../../../../server/scripts/mongodb-application-audit.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/hospitalityDeveloperSeed.js`](../../../../server/seeds/hospitalityDeveloperSeed.js)
- [`server/services/hospitalityInvoiceService.js`](../../../../server/services/hospitalityInvoiceService.js)
- [`server/services/hospitalityPaymentLifecycleService.js`](../../../../server/services/hospitalityPaymentLifecycleService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
