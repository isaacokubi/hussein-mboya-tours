# Invoice model

**Source:** [server/models/Invoice.js](../../../../server/models/Invoice.js)

## Purpose

This Mongoose model persists the invoice domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `booking` | Associated tour booking. | type: ObjectId; required: no; default: null; ref: Booking |
| `hospitalityBooking` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; dynamic ref: hospitalityBookingModel |
| `hospitalityBookingModel` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: null; allowed values: ["HotelBooking","AirportTransferBooking"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `hospitalityType` | Business field “hospitality type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: null; allowed values: ["hotel","airport_transfer"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `customer` | Associated customer record or account, as indicated by the schema reference. | type: ObjectId; required: no; default: null; ref: Customer |
| `user` | Associated user account. | type: ObjectId; required: no; default: null; ref: User |
| `tour` | Associated tour catalogue record. | type: ObjectId; required: no; default: null; ref: Tour |
| `agent` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Agent |
| `invoiceNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no |
| `issueDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: [function: now] |
| `dueDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no |
| `subtotal` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `discount` | Business field “discount”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `tax` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `taxRate` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `taxType` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "STANDARD"; allowed values: ["STANDARD","ZERO_RATED","EXEMPT","NON_VAT","OTHER"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `taxMode` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "exclusive"; allowed values: ["exclusive","inclusive"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `taxableAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `totalAmount` | Gross amount associated with the record. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `items` | Business field “items”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no; default: [function: anonymous] |
| `amountPaid` | Amount recorded as paid to date. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `balance` | Outstanding amount after payments/adjustments. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `paymentMethod` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "MPESA"; allowed values: ["MPESA","CARD","BANK_TRANSFER","PAYPAL","PESAPAL","CASH"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `paymentReference` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "pending"; allowed values: ["draft","pending","partial","paid","cancelled","refunded","overdue"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `customerSnapshot.name` | Human-readable descriptive data for the associated business record. | type: String; required: no |
| `customerSnapshot.email` | Email address/contact identifier; normalization depends on schema options. | type: String; required: no |
| `customerSnapshot.phone` | Phone contact value; provider-specific normalization occurs in service code. | type: String; required: no |
| `customerSnapshot.address` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no |
| `customerSnapshot.buyerPin` | Business field “buyer pin”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no |
| `buyerPin` | Business field “buyer pin”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `taxRegistrationNumber` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: String; required: no; default: "" |
| `etimsStatus` | Lifecycle or processing state; allowed transitions belong to the feature service/controller. | type: String; required: no; default: "not_configured"; allowed values: ["not_configured","pending","submitted","synced","failed"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `etimsInvoiceNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "" |
| `etimsReceiptNumber` | Business field “etims receipt number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsUniqueRegisterIdentifier` | Business field “etims unique register identifier”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsQrCode` | Business field “etims qr code”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsSubmittedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `etimsResponse` | Business field “etims response”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `etimsSubmissionAttempts` | Business field “etims submission attempts”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `etimsLastError` | Business field “etims last error”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `etimsNextRetryAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `etimsLastAttemptAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `pdfUrl` | Business field “pdf url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ hospitalityBooking: 1 }`
- `{ hospitalityType: 1 }`
- `{ tenantId: 1, booking: 1 } — unique: true, partialFilterExpression: {"booking":{"$type":"objectId"}}`
- `{ tenantId: 1, hospitalityBooking: 1, hospitalityType: 1 } — unique: true, partialFilterExpression: {"hospitalityBooking":{"$type":"objectId"}}`
- `{ tenantId: 1, invoiceNumber: 1 } — unique: true`
- `{ customer: 1 }`
- `{ tour: 1 }`
- `{ status: 1 }`
- `{ createdAt: -1 }`
- `{ dueDate: 1 }`
- `{ isDeleted: 1 }`
- `{ tenantId: 1, etimsStatus: 1, createdAt: -1 }`
- `{ tenantId: 1, etimsStatus: 1, etimsNextRetryAt: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `booking`:  ref: Booking. Callers must scope and authorize referenced records.
- `hospitalityBooking`:  dynamic ref: hospitalityBookingModel. Callers must scope and authorize referenced records.
- `customer`:  ref: Customer. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
- `tour`:  ref: Tour. Callers must scope and authorize referenced records.
- `agent`:  ref: Agent. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`, `post save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `calculateBalance`, `markPaid`, `markEtimsAttempt`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/bootstrap/invoiceIndexMigration.js`](../../../../server/bootstrap/invoiceIndexMigration.js)
- [`server/bootstrap/operationalAccountingHooks.js`](../../../../server/bootstrap/operationalAccountingHooks.js)
- [`server/controllers/accountingControlReportsController.js`](../../../../server/controllers/accountingControlReportsController.js)
- [`server/controllers/accountingOperationalReconciliationController.js`](../../../../server/controllers/accountingOperationalReconciliationController.js)
- [`server/controllers/accountingReportsController.js`](../../../../server/controllers/accountingReportsController.js)
- [`server/controllers/complianceController.js`](../../../../server/controllers/complianceController.js)
- [`server/controllers/creditDebitNoteController.js`](../../../../server/controllers/creditDebitNoteController.js)
- [`server/controllers/customerController.js`](../../../../server/controllers/customerController.js)
- [`server/controllers/financeComplianceController.js`](../../../../server/controllers/financeComplianceController.js)
- [`server/controllers/integrationController.js`](../../../../server/controllers/integrationController.js)
- [`server/controllers/invoiceController.js`](../../../../server/controllers/invoiceController.js)
- [`server/controllers/paymentLinkController.js`](../../../../server/controllers/paymentLinkController.js)
- [`server/controllers/reconciliationController.js`](../../../../server/controllers/reconciliationController.js)
- [`server/models/Payment.js`](../../../../server/models/Payment.js)
- [`server/scripts/auditTenantDashboardData.js`](../../../../server/scripts/auditTenantDashboardData.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
