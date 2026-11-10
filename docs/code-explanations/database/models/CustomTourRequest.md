# CustomTourRequest model

**Source:** [server/models/CustomTourRequest.js](../../../../server/models/CustomTourRequest.js)

## Purpose

This Mongoose model persists the custom tour request domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `customer` | Associated customer record or account, as indicated by the schema reference. | type: ObjectId; required: no; ref: User |
| `user` | Associated user account. | type: ObjectId; required: no; default: null; ref: User |
| `guestContact.name` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 120; validators: maxlength |
| `guestContact.email` | Email address/contact identifier; normalization depends on schema options. | type: String; required: no; default: ""; length: 0 to 180; validators: maxlength |
| `guestContact.phone` | Phone contact value; provider-specific normalization occurs in service code. | type: String; required: no; default: ""; length: 0 to 30; validators: maxlength |
| `destination` | Business field “destination”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes |
| `durationDays` | Business field “duration days”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `people` | Business field “people”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `startDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `budget` | Business field “budget”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `requirements` | Business field “requirements”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "pending"; allowed values: ["pending","approved","quoted","rejected","converted"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `quotedAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `adminNotes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `assignedGuide` | Business field “assigned guide”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: Staff |
| `assignedDriver` | Business field “assigned driver”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: Staff |
| `assignedAgent` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Agent |
| `pickupLocation` | Business field “pickup location”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `pickupDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `pickupTime` | Business field “pickup time”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `adults` | Business field “adults”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 1; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `children` | Business field “children”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `accommodationPreference` | Business field “accommodation preference”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `mealPreference` | Business field “meal preference”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `transportPreference` | Business field “transport preference”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `emergencyContact` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `specialRequests` | Business field “special requests”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `bookingId` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Booking |
| `paymentId` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ customer: 1 }`
- `{ user: 1 }`
- `{ status: 1 }`
- `{ customer: 1, createdAt: -1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `customer`:  ref: User. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
- `assignedGuide`:  ref: Staff. Callers must scope and authorize referenced records.
- `assignedDriver`:  ref: Staff. Callers must scope and authorize referenced records.
- `assignedAgent`:  ref: Agent. Callers must scope and authorize referenced records.
- `bookingId`:  ref: Booking. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/bookingController.js`](../../../../server/controllers/bookingController.js)
- [`server/controllers/bookingTravelDateController.js`](../../../../server/controllers/bookingTravelDateController.js)
- [`server/controllers/customTourRequestController.js`](../../../../server/controllers/customTourRequestController.js)
- [`server/controllers/operationsController.js`](../../../../server/controllers/operationsController.js)
- [`server/middleware/validateBookingTravelDate.js`](../../../../server/middleware/validateBookingTravelDate.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/customTourRequestsSeed.js`](../../../../server/seeds/customTourRequestsSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
