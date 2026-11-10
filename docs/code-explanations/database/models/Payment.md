# Payment model

**Source:** [server/models/Payment.js](../../../../server/models/Payment.js)

## Purpose

This Mongoose model persists the payment domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `customer` | Associated customer record or account, as indicated by the schema reference. | type: ObjectId; required: yes; ref: User |
| `user` | Associated user account. | type: ObjectId; required: no; ref: User |
| `booking` | Associated tour booking. | type: ObjectId; required: no; default: null; ref: Booking |
| `hospitalityBooking` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; dynamic ref: hospitalityBookingModel |
| `hospitalityBookingModel` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: null; allowed values: ["HotelBooking","AirportTransferBooking"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `hospitalityType` | Business field “hospitality type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: null; allowed values: ["hotel","airport_transfer"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `provider` | Business field “provider”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "MPESA"; allowed values: ["MPESA","STRIPE","PAYPAL","PESAPAL","BANK","CASH"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `method` | Business field “method”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "mpesa"; allowed values: ["mpesa","card","paypal","pesapal","bank","cash"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `paymentMethod` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "MPESA"; allowed values: ["MPESA","CARD","PAYPAL","PESAPAL","BANK_TRANSFER","CASH","M-Pesa","Cash","Card","Bank","PayPal","Pesapal"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `amount` | Monetary amount for this record; currency and accounting meaning depend on the parent workflow. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; user defined: Invalid payment amount. |
| `feeAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `paymentFee` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `transactionFee` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `gatewayFee` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `phone` | Phone contact value; provider-specific normalization occurs in service code. | type: String; required: no; default: "" |
| `phoneNumber` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "pending"; allowed values: ["pending","processing","completed","failed","cancelled","refunded"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `activeAttempt` | Business field “active attempt”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `transactionId` | Provider or accounting transaction identifier used for reconciliation. | type: String; required: no; default: "" |
| `transactionReference` | Reference used to correlate a payment attempt or external transaction. | type: String; required: no; default: "" |
| `providerOrderId` | Business field “provider order id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `providerCaptureId` | Business field “provider capture id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `providerApprovalUrl` | Business field “provider approval url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `providerEnvironment` | Business field “provider environment”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; allowed values: ["sandbox","production",""]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `invoiceNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "" |
| `merchantRequestID` | Business field “merchant request id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `merchantRequestId` | Business field “merchant request id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `checkoutRequestID` | Business field “checkout request id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `checkoutRequestId` | Business field “checkout request id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `mpesaReceiptNumber` | Business field “mpesa receipt number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `transactionDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: String; required: no |
| `callbackResponse` | Business field “callback response”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `providerQueryResponse` | Business field “provider query response”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `providerResultCode` | Business field “provider result code”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `lastQueriedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `callbackReceivedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `callbackEventId` | Business field “callback event id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `failureReason` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `failedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `refundRequestedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `refundStatus` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "none"; allowed values: ["none","requested","processing","completed","failed"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `refundReference` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "" |
| `refundResponse` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Mixed; required: no; default: [function: anonymous] |
| `refundedAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `refundRequestedAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `refundedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `paidAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `manualConfirmation.confirmedBy` | Business field “confirmed by”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `manualConfirmation.confirmedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `manualConfirmation.amount` | Monetary amount for this record; currency and accounting meaning depend on the parent workflow. | type: Number; required: no; default: null |
| `manualConfirmation.currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "" |
| `manualConfirmation.reference` | Human/provider/business reference used to correlate records; uniqueness depends on declared indexes. | type: String; required: no; default: ""; length: 0 to 200; validators: maxlength |
| `manualConfirmation.notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 1000; validators: maxlength |
| `webhookRetryCount` | Business field “webhook retry count”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `lastWebhookRetryAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `nextWebhookRetryAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ customer: 1 }`
- `{ hospitalityBooking: 1 }`
- `{ hospitalityType: 1 }`
- `{ activeAttempt: 1 }`
- `{ providerOrderId: 1 }`
- `{ providerCaptureId: 1 }`
- `{ customer: 1, createdAt: -1 }`
- `{ booking: 1 }`
- `{ status: 1, provider: 1 }`
- `{ transactionId: 1 }`
- `{ transactionReference: 1 }`
- `{ tenantId: 1, provider: 1, transactionReference: 1 } — unique: true, partialFilterExpression: {"status":"completed","transactionReference":{"$type":"string","$gt":""}}`
- `{ tenantId: 1, provider: 1, providerOrderId: 1 } — unique: true, partialFilterExpression: {"providerOrderId":{"$type":"string","$gt":""}}`
- `{ tenantId: 1, booking: 1, provider: 1, activeAttempt: 1 } — unique: true, partialFilterExpression: {"activeAttempt":true}, name: "unique_active_payment_attempt_tenant_booking_provider"`
- `{ tenantId: 1, checkoutRequestID: 1 } — unique: true, partialFilterExpression: {"checkoutRequestID":{"$type":"string","$gt":""}}`
- `{ tenantId: 1, checkoutRequestId: 1 } — unique: true, partialFilterExpression: {"checkoutRequestId":{"$type":"string","$gt":""}}`
- `{ tenantId: 1, mpesaReceiptNumber: 1 } — unique: true, partialFilterExpression: {"mpesaReceiptNumber":{"$type":"string","$gt":""}}`
- `{ tenantId: 1, booking: 1, createdAt: -1 }`
- `{ tenantId: 1, status: 1, createdAt: -1 }`
- `{ tenantId: 1, callbackEventId: 1 } — unique: true, partialFilterExpression: {"callbackEventId":{"$type":"string","$gt":""}}`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `customer`:  ref: User. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
- `booking`:  ref: Booking. Callers must scope and authorize referenced records.
- `hospitalityBooking`:  dynamic ref: hospitalityBookingModel. Callers must scope and authorize referenced records.
- `manualConfirmation.confirmedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`, `post save`, `post save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `markCompleted`, `markFailed`, `virtual isSuccessful`, `virtual isRefunded`, `virtual netAmount`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/bootstrap/operationalAccountingHooks.js`](../../../../server/bootstrap/operationalAccountingHooks.js)
- [`server/controllers/accountingControlReportsController.js`](../../../../server/controllers/accountingControlReportsController.js)
- [`server/controllers/accountingOperationalReconciliationController.js`](../../../../server/controllers/accountingOperationalReconciliationController.js)
- [`server/controllers/adminAIAlertsController.js`](../../../../server/controllers/adminAIAlertsController.js)
- [`server/controllers/adminAIAnalyticsController.js`](../../../../server/controllers/adminAIAnalyticsController.js)
- [`server/controllers/adminAIBookingRiskController.js`](../../../../server/controllers/adminAIBookingRiskController.js)
- [`server/controllers/adminAIBriefingController.js`](../../../../server/controllers/adminAIBriefingController.js)
- [`server/controllers/adminAIController.js`](../../../../server/controllers/adminAIController.js)
- [`server/controllers/adminAIFinanceForecastController.js`](../../../../server/controllers/adminAIFinanceForecastController.js)
- [`server/controllers/adminAIFraudController.js`](../../../../server/controllers/adminAIFraudController.js)
- [`server/controllers/adminAIIntelligenceController.js`](../../../../server/controllers/adminAIIntelligenceController.js)
- [`server/controllers/adminAIOperationsController.js`](../../../../server/controllers/adminAIOperationsController.js)
- [`server/controllers/adminAIRevenueController.js`](../../../../server/controllers/adminAIRevenueController.js)
- [`server/controllers/adminAITaskController.js`](../../../../server/controllers/adminAITaskController.js)
- [`server/controllers/adminBookingController.js`](../../../../server/controllers/adminBookingController.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
