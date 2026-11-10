# Booking model

**Source:** [server/models/Booking.js](../../../../server/models/Booking.js)

## Purpose

This Mongoose model persists the booking domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `bookingNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no |
| `customTourRequest` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: CustomTourRequest |
| `customer` | Associated customer record or account, as indicated by the schema reference. | type: ObjectId; required: no; ref: Customer |
| `user` | Associated user account. | type: ObjectId; required: no; default: null; ref: User |
| `customerSnapshot` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Embedded; required: no |
| `contact.name` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `contact.email` | Email address/contact identifier; normalization depends on schema options. | type: String; required: no; default: "" |
| `contact.phone` | Phone contact value; provider-specific normalization occurs in service code. | type: String; required: no; default: "" |
| `agent` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Agent |
| `bookingSource` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "website"; allowed values: ["website","mobile_app","agent","admin","walk_in","partner","api"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `externalSource` | Business field “external source”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: not specified |
| `externalBookingId` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: not specified |
| `integrationKeyId` | Business field “integration key id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: WebsiteIntegrationKey |
| `externalMetadata` | Business field “external metadata”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `bookingType` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "individual"; allowed values: ["individual","group","corporate"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `groupReference` | Business field “group reference”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `corporateAccount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: ObjectId; required: no; default: null; ref: CorporateAccount |
| `corporateCompanyName` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "" |
| `corporatePin` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "" |
| `purchaseOrderNumber` | Business field “purchase order number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `paymentTerms` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "immediate"; allowed values: ["immediate","deposit","credit","staged"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `billingContact` | Contact or location information; restrict access and avoid exposing it in logs. | type: Embedded; required: no |
| `roomingListReference` | Business field “rooming list reference”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `tour` | Associated tour catalogue record. | type: ObjectId; required: no; default: null; ref: Tour |
| `travelDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: yes |
| `originalTravelDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `rescheduleHistory` | Business field “reschedule history”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `rescheduleCount` | Business field “reschedule count”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `travelers` | Business field “travelers”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no; default: [function: anonymous] |
| `numberOfGuests` | Business field “number of guests”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 1; range: 1 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1). |
| `pickupLocation` | Business field “pickup location”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `pickupTime` | Business field “pickup time”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: no |
| `hotelName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `roomNumber` | Business field “room number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `emergencyContact` | Contact or location information; restrict access and avoid exposing it in logs. | type: Embedded; required: no |
| `specialRequests` | Business field “special requests”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `assignedGuide` | Business field “assigned guide”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: Staff |
| `assignedDriver` | Business field “assigned driver”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: Staff |
| `assignedVehicle` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Vehicle |
| `assigned` | Business field “assigned”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `subtotal` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `discountAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `taxAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `serviceFee` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `couponUsed` | Business field “coupon used”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `totalAmount` | Gross amount associated with the record. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `commissionRate` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `commissionAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `commissionStatus` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "pending"; allowed values: ["pending","approved","paid","cancelled"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `commissionPaidAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `depositAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `amountPaid` | Amount recorded as paid to date. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `balanceAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `paymentMethod` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "MPESA"; allowed values: ["MPESA","CARD","PAYPAL","BANK_TRANSFER","CASH"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `paymentStatus` | Payment lifecycle state; final settlement should follow verified payment evidence. | type: String; required: no; default: "pending"; allowed values: ["pending","partial","paid","failed","cancelled","refunded"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `transactionId` | Provider or accounting transaction identifier used for reconciliation. | type: String; required: no |
| `paymentReference` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no |
| `mpesaReceipt` | Business field “mpesa receipt”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `payments` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Array; required: no |
| `refundAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `refundStatus` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "none"; allowed values: ["none","requested","approved","processing","completed","rejected"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `refundReason` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "pending"; allowed values: ["pending","confirmed","assigned","ongoing","completed","cancelled","refunded"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `cancellationReason` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `cancelledAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `confirmedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `completedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `documents` | Business field “documents”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ bookingNumber: 1 } — unique: true`
- `{ customer: 1 }`
- `{ user: 1 }`
- `{ bookingType: 1 }`
- `{ corporateAccount: 1 }`
- `{ tour: 1 }`
- `{ travelers.tenantId: 1 }`
- `{ paymentStatus: 1 }`
- `{ status: 1 }`
- `{ isDeleted: 1 }`
- `{ customer: 1, createdAt: -1 }`
- `{ agent: 1 }`
- `{ travelDate: 1 }`
- `{ paymentReference: 1 }`
- `{ transactionId: 1 }`
- `{ assignedGuide: 1 }`
- `{ assignedDriver: 1 }`
- `{ assignedVehicle: 1 }`
- `{ createdAt: -1 }`
- `{ tenantId: 1, externalSource: 1, externalBookingId: 1 } — unique: true, name: "tenantId_1_externalSource_1_externalBookingId_1", partialFilterExpression: {"externalBookingId":{"$type":"string","$gt":""}}`
- `{ refundStatus: 1 }`
- `{ commissionStatus: 1 }`
- `{ customer: 1, travelDate: 1 }`
- `{ tour: 1, travelDate: 1 }`
- `{ tenantId: 1, bookingType: 1, travelDate: 1 }`
- `{ tenantId: 1, corporatePin: 1 }`
- `{ tenantId: 1, corporateAccount: 1, travelDate: 1 }`
- `{ tenantId: 1, bookingNumber: 1 } — unique: true, sparse: false`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `customTourRequest`:  ref: CustomTourRequest. Callers must scope and authorize referenced records.
- `customer`:  ref: Customer. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
- `agent`:  ref: Agent. Callers must scope and authorize referenced records.
- `integrationKeyId`:  ref: WebsiteIntegrationKey. Callers must scope and authorize referenced records.
- `corporateAccount`:  ref: CorporateAccount. Callers must scope and authorize referenced records.
- `tour`:  ref: Tour. Callers must scope and authorize referenced records.
- `assignedGuide`:  ref: Staff. Callers must scope and authorize referenced records.
- `assignedDriver`:  ref: Staff. Callers must scope and authorize referenced records.
- `assignedVehicle`:  ref: Vehicle. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `updatedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`, `pre validate`, `post save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `calculateCommission`, `calculateBalance`, `markPaid`, `markCompleted`, `cancelBooking`, `static findUpcoming`, `static findCompleted`, `static findPendingPayments`, `virtual remainingBalance`, `virtual isPaid`, `virtual isAssigned`, `virtual isCompleted`, `virtual isCancelled`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminAIAlertsController.js`](../../../../server/controllers/adminAIAlertsController.js)
- [`server/controllers/adminAIAnalyticsController.js`](../../../../server/controllers/adminAIAnalyticsController.js)
- [`server/controllers/adminAIBookingRiskController.js`](../../../../server/controllers/adminAIBookingRiskController.js)
- [`server/controllers/adminAIBriefingController.js`](../../../../server/controllers/adminAIBriefingController.js)
- [`server/controllers/adminAIController.js`](../../../../server/controllers/adminAIController.js)
- [`server/controllers/adminAIFinanceForecastController.js`](../../../../server/controllers/adminAIFinanceForecastController.js)
- [`server/controllers/adminAIFraudController.js`](../../../../server/controllers/adminAIFraudController.js)
- [`server/controllers/adminAIIntelligenceController.js`](../../../../server/controllers/adminAIIntelligenceController.js)
- [`server/controllers/adminAIMarketingController.js`](../../../../server/controllers/adminAIMarketingController.js)
- [`server/controllers/adminAIOperationsController.js`](../../../../server/controllers/adminAIOperationsController.js)
- [`server/controllers/adminAIRevenueController.js`](../../../../server/controllers/adminAIRevenueController.js)
- [`server/controllers/adminAISalesController.js`](../../../../server/controllers/adminAISalesController.js)
- [`server/controllers/adminAITaskController.js`](../../../../server/controllers/adminAITaskController.js)
- [`server/controllers/adminAITourPricingController.js`](../../../../server/controllers/adminAITourPricingController.js)
- [`server/controllers/adminAITourRecommendationController.js`](../../../../server/controllers/adminAITourRecommendationController.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
