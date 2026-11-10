# Customer model

**Source:** [server/models/Customer.js](../../../../server/models/Customer.js)

## Purpose

This Mongoose model persists the customer domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `agent` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Agent |
| `user` | Associated user account. | type: ObjectId; required: no; default: null; ref: User; sparse |
| `firstName` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `lastName` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `email` | Email address/contact identifier; normalization depends on schema options. | type: String; required: no; default: ""; validators: regexp: Invalid email |
| `phone` | Phone contact value; provider-specific normalization occurs in service code. | type: String; required: yes |
| `gender` | Business field “gender”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: null; allowed values: ["male","female","other"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `dateOfBirth` | Business field “date of birth”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: no; default: null |
| `nationality` | Business field “nationality”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `passportNumber` | Business field “passport number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `passportExpiryDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `nationalId` | Business field “national id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `address` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `city` | Business field “city”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `county` | Business field “county”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `country` | Business field “country”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Kenya" |
| `postalCode` | Business field “postal code”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `company` | Business field “company”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `jobTitle` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `emergencyContact` | Contact or location information; restrict access and avoid exposing it in logs. | type: Embedded; required: no |
| `profileImage` | Business field “profile image”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `customerType` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "individual"; allowed values: ["individual","family","corporate","vip"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `tags` | Business field “tags”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `preferredContactMethod` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "phone"; allowed values: ["phone","email","whatsapp"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `marketingConsent` | Business field “marketing consent”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `lastContactedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `loyaltyPoints` | Business field “loyalty points”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `totalBookings` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `completedBookings` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `cancelledBookings` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `totalSpent` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `averageBookingValue` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `lastBookingDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "active"; allowed values: ["active","inactive","blocked"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `deletedAt` | Soft-delete timestamp when present; query conventions determine visibility. | type: Date; required: no; default: null |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; default: null; ref: Organization; index; immutable |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ agent: 1 }`
- `{ user: 1 } — unique: true, sparse: true`
- `{ emergencyContact.tenantId: 1 }`
- `{ tenantId: 1 }`
- `{ firstName: text, lastName: text, email: text, phone: text }`
- `{ agent: 1, status: 1 }`
- `{ customerType: 1 }`
- `{ email: 1 }`
- `{ phone: 1 }`
- `{ createdAt: -1 }`
- `{ totalSpent: -1 }`
- `{ loyaltyPoints: -1 }`
- `{ isDeleted: 1 }`
- `{ tenantId: 1, user: 1 } — unique: true, sparse: true`

## Relationships and tenant boundary

- `agent`:  ref: Agent. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `updatedBy`:  ref: User. Callers must scope and authorize referenced records.
- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `addLoyaltyPoints`, `softDelete`, `virtual fullName`, `virtual bookingCount`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminUserController.js`](../../../../server/controllers/adminUserController.js)
- [`server/controllers/adminUserProfileController.js`](../../../../server/controllers/adminUserProfileController.js)
- [`server/controllers/agentBookingController.js`](../../../../server/controllers/agentBookingController.js)
- [`server/controllers/agentCustomerController.js`](../../../../server/controllers/agentCustomerController.js)
- [`server/controllers/airportTransferController.js`](../../../../server/controllers/airportTransferController.js)
- [`server/controllers/bookingController.js`](../../../../server/controllers/bookingController.js)
- [`server/controllers/crmController.js`](../../../../server/controllers/crmController.js)
- [`server/controllers/customerController.js`](../../../../server/controllers/customerController.js)
- [`server/controllers/customerDashboardController.js`](../../../../server/controllers/customerDashboardController.js)
- [`server/controllers/enhancedAirportTransferBookingController.js`](../../../../server/controllers/enhancedAirportTransferBookingController.js)
- [`server/controllers/enhancedHotelBookingController.js`](../../../../server/controllers/enhancedHotelBookingController.js)
- [`server/controllers/hospitalityAdminController.js`](../../../../server/controllers/hospitalityAdminController.js)
- [`server/controllers/hospitalityInventoryConcurrencyController.js`](../../../../server/controllers/hospitalityInventoryConcurrencyController.js)
- [`server/controllers/hotelController.js`](../../../../server/controllers/hotelController.js)
- [`server/controllers/integrationController.js`](../../../../server/controllers/integrationController.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
