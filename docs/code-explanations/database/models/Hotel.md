# Hotel model

**Source:** [server/models/Hotel.js](../../../../server/models/Hotel.js)

## Purpose

This Mongoose model persists the hotel domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 180; validators: maxlength |
| `slug` | Business field “slug”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; length: 0 to 180; validators: maxlength |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 5000; validators: maxlength |
| `location` | Business field “location”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 240; validators: maxlength |
| `address` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: ""; length: 0 to 300; validators: maxlength |
| `city` | Business field “city”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 120; validators: maxlength |
| `county` | Business field “county”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 120; validators: maxlength |
| `country` | Business field “country”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Kenya" |
| `latitude` | Business field “latitude”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: null; range: -90 to 90; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (-90).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (90). |
| `longitude` | Business field “longitude”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: null; range: -180 to 180; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (-180).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (180). |
| `starRating` | Business field “star rating”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 3; range: 1 to 5; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (5). |
| `amenities` | Business field “amenities”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `images` | Business field “images”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `contactPhone` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `contactEmail` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `checkInTime` | Business field “check in time”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "14:00" |
| `checkOutTime` | Business field “check out time”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "11:00" |
| `cancellationPolicy` | Business field “cancellation policy”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 3000; validators: maxlength |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["draft","active","inactive"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `featured` | Business field “featured”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ tenantId: 1, slug: 1 } — unique: true`
- `{ tenantId: 1, status: 1, featured: -1 }`
- `{ tenantId: 1, city: 1, county: 1 }`
- `{ tenantId: 1, name: text, description: text, location: text }`

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
- [`server/controllers/adminHotelCreationController.js`](../../../../server/controllers/adminHotelCreationController.js)
- [`server/controllers/enhancedHotelBookingController.js`](../../../../server/controllers/enhancedHotelBookingController.js)
- [`server/controllers/hospitalityAdminController.js`](../../../../server/controllers/hospitalityAdminController.js)
- [`server/controllers/hospitalityCommercialController.js`](../../../../server/controllers/hospitalityCommercialController.js)
- [`server/controllers/hospitalityInventoryConcurrencyController.js`](../../../../server/controllers/hospitalityInventoryConcurrencyController.js)
- [`server/controllers/hospitalityInventorySyncController.js`](../../../../server/controllers/hospitalityInventorySyncController.js)
- [`server/controllers/hospitalityOperationsController.js`](../../../../server/controllers/hospitalityOperationsController.js)
- [`server/controllers/hotelAvailabilityController.js`](../../../../server/controllers/hotelAvailabilityController.js)
- [`server/controllers/hotelController.js`](../../../../server/controllers/hotelController.js)
- [`server/models/HotelRoomType.js`](../../../../server/models/HotelRoomType.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/hospitalityDeveloperSeed.js`](../../../../server/seeds/hospitalityDeveloperSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
