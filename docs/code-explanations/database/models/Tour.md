# Tour model

**Source:** [server/models/Tour.js](../../../../server/models/Tour.js)

## Purpose

This Mongoose model persists the tour domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `title` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 150; validators: maxlength |
| `slug` | Business field “slug”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `description` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `shortDescription` | Human-readable descriptive data for the associated business record. | type: String; required: no; length: 0 to 250; validators: maxlength |
| `tags` | Business field “tags”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `category` | Business field “category”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Safari"; length: 0 to 80; validators: maxlength |
| `destination` | Business field “destination”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: yes; ref: Destination |
| `country` | Business field “country”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes |
| `location` | Business field “location”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes |
| `meetingPoint` | Business field “meeting point”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `coordinates.type` | Business field “type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; allowed values: ["Point"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `coordinates.coordinates` | Business field “coordinates”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no; default: not specified |
| `duration` | Business field “duration”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `durationDays` | Business field “duration days”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 1; range: 1 to 365; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (365). |
| `durationDetails.days` | Business field “days”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 1; range: 1 to 365; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (365). |
| `durationDetails.nights` | Business field “nights”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to 365; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (365). |
| `date` | Business field “date”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: yes |
| `startDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `endDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `capacity` | Business field “capacity”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 20; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `price` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `agentPrice` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0 |
| `discount` | Business field “discount”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `discountPrice` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: null |
| `pricingRules` | Business field “pricing rules”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `depositType` | Business field “deposit type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "fixed"; allowed values: ["fixed","percentage"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `taxEnabled` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Boolean; required: no; default: false |
| `taxCategory` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "STANDARD"; allowed values: ["STANDARD","ZERO_RATED","EXEMPT","NON_VAT"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `taxMode` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "exclusive"; allowed values: ["exclusive","inclusive"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `taxRate` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: null; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `featuredImage` | Business field “featured image”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Embedded; required: no |
| `gallery` | Business field “gallery”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `video.url` | Business field “url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `video.publicId` | Business field “public id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `highlights` | Business field “highlights”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `inclusions` | Business field “inclusions”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `exclusions` | Business field “exclusions”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `languages` | Business field “languages”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `minimumAge` | Business field “minimum age”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0 |
| `maximumAge` | Business field “maximum age”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 99 |
| `difficulty` | Business field “difficulty”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "easy"; allowed values: ["easy","moderate","hard"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `itinerary` | Business field “itinerary”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `availability` | Business field “availability”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `availabilitySettings.totalSlots` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 20 |
| `availabilitySettings.bookedSlots` | Business field “booked slots”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0 |
| `availabilitySettings.waitlistEnabled` | Business field “waitlist enabled”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `depositRequired` | Business field “deposit required”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0 |
| `cancellationPolicy` | Business field “cancellation policy”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `bookingDeadline` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Number; required: no; default: 1 |
| `instantBooking` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Boolean; required: no; default: true |
| `assignedGuide` | Business field “assigned guide”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: Staff |
| `assignedDriver` | Business field “assigned driver”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: Staff |
| `assignedVehicle` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Vehicle |
| `assignmentStatus` | Lifecycle or processing state; allowed transitions belong to the feature service/controller. | type: String; required: no; default: "pending"; allowed values: ["pending","assigned","completed","cancelled"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "draft"; allowed values: ["draft","scheduled","upcoming","ongoing","fully-booked","completed","cancelled"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `published` | Business field “published”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `featured` | Business field “featured”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `available` | Business field “available”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `deletedAt` | Soft-delete timestamp when present; query conventions determine visibility. | type: Date; required: no; default: null |
| `deletedBy` | Business field “deleted by”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `averageRating` | Business field “average rating”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to 5; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (5). |
| `totalReviews` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0 |
| `totalBookings` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0 |
| `wishlistCount` | Business field “wishlist count”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0 |
| `popularity` | Business field “popularity”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0 |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `seo` | Business field “seo”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Embedded; required: no |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ slug: 1 } — unique: true`
- `{ itinerary.tenantId: 1 }`
- `{ destination: 1, status: 1 }`
- `{ featured: 1, available: 1 }`
- `{ published: 1 }`
- `{ createdBy: 1 }`
- `{ category: 1 }`
- `{ country: 1 }`
- `{ price: 1 }`
- `{ averageRating: -1 }`
- `{ totalBookings: -1 }`
- `{ popularity: -1 }`
- `{ assignedGuide: 1 }`
- `{ assignedDriver: 1 }`
- `{ assignedVehicle: 1 }`
- `{ assignmentStatus: 1 }`
- `{ isDeleted: 1 }`
- `{ available: 1 }`
- `{ status: 1, date: 1 }`
- `{ title: text, description: text, location: text, country: text, category: text, tags: text }`
- `{ tenantId: 1, slug: 1 } — unique: true, sparse: false`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `destination`:  ref: Destination. Callers must scope and authorize referenced records.
- `assignedGuide`:  ref: Staff. Callers must scope and authorize referenced records.
- `assignedDriver`:  ref: Staff. Callers must scope and authorize referenced records.
- `assignedVehicle`:  ref: Vehicle. Callers must scope and authorize referenced records.
- `deletedBy`:  ref: User. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre validate`, `pre validate`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `bookSlot`, `releaseSlot`, `static getFeatured`, `static getActiveTours`, `virtual images`, `virtual image`, `virtual finalPrice`, `virtual remainingSlots`, `virtual isFullyBooked`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminAIAnalyticsController.js`](../../../../server/controllers/adminAIAnalyticsController.js)
- [`server/controllers/adminAIBriefingController.js`](../../../../server/controllers/adminAIBriefingController.js)
- [`server/controllers/adminAIController.js`](../../../../server/controllers/adminAIController.js)
- [`server/controllers/adminAIIntelligenceController.js`](../../../../server/controllers/adminAIIntelligenceController.js)
- [`server/controllers/adminAIMarketingController.js`](../../../../server/controllers/adminAIMarketingController.js)
- [`server/controllers/adminAIOperationsController.js`](../../../../server/controllers/adminAIOperationsController.js)
- [`server/controllers/adminAIRevenueController.js`](../../../../server/controllers/adminAIRevenueController.js)
- [`server/controllers/adminAISalesController.js`](../../../../server/controllers/adminAISalesController.js)
- [`server/controllers/adminAITourPricingController.js`](../../../../server/controllers/adminAITourPricingController.js)
- [`server/controllers/adminAITourRecommendationController.js`](../../../../server/controllers/adminAITourRecommendationController.js)
- [`server/controllers/adminController.js`](../../../../server/controllers/adminController.js)
- [`server/controllers/adminDashboardMetricsController.js`](../../../../server/controllers/adminDashboardMetricsController.js)
- [`server/controllers/adminDashboardTenantController.js`](../../../../server/controllers/adminDashboardTenantController.js)
- [`server/controllers/adminReviewController.js`](../../../../server/controllers/adminReviewController.js)
- [`server/controllers/adminTourController.js`](../../../../server/controllers/adminTourController.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
