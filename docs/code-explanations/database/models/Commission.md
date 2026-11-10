# Commission model

**Source:** [server/models/Commission.js](../../../../server/models/Commission.js)

## Purpose

This Mongoose model persists the commission domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `agent` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: yes; ref: Agent |
| `booking` | Associated tour booking. | type: ObjectId; required: yes; ref: Booking |
| `customer` | Associated customer record or account, as indicated by the schema reference. | type: ObjectId; required: no; ref: User |
| `tour` | Associated tour catalogue record. | type: ObjectId; required: no; ref: Tour |
| `bookingAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `rate` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: yes; default: 10; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `amount` | Monetary amount for this record; currency and accounting meaning depend on the parent workflow. | type: Number; required: yes; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `refundedAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `adjustmentAmount` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `adjustmentStatus` | Lifecycle or processing state; allowed transitions belong to the feature service/controller. | type: String; required: no; default: "none"; allowed values: ["none","pending","posted"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `adjustmentAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "pending"; allowed values: ["pending","approved","processing","paid","cancelled","rejected"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `paymentMethod` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; allowed values: ["BANK_TRANSFER","MPESA","CASH","CHEQUE"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `paymentReference` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "" |
| `transactionId` | Provider or accounting transaction identifier used for reconciliation. | type: String; required: no; default: "" |
| `paidAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `approvedBy` | Business field “approved by”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `approvedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `rejectedBy` | Business field “rejected by”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `rejectedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `rejectionReason` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `financeNotes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; ref: User |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `deletedAt` | Soft-delete timestamp when present; query conventions determine visibility. | type: Date; required: no; default: null |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ agent: 1 }`
- `{ booking: 1 } — unique: true`
- `{ agent: 1, status: 1 }`
- `{ paymentReference: 1 }`
- `{ paidAt: -1 }`
- `{ createdAt: -1 }`
- `{ isDeleted: 1 }`
- `{ approvedBy: 1 }`
- `{ customer: 1 }`
- `{ tour: 1 }`
- `{ tenantId: 1, booking: 1 } — unique: true, sparse: false`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `agent`:  ref: Agent. Callers must scope and authorize referenced records.
- `booking`:  ref: Booking. Callers must scope and authorize referenced records.
- `customer`:  ref: User. Callers must scope and authorize referenced records.
- `tour`:  ref: Tour. Callers must scope and authorize referenced records.
- `approvedBy`:  ref: User. Callers must scope and authorize referenced records.
- `rejectedBy`:  ref: User. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `updatedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `approve`, `markPaid`, `reject`, `static getPending`, `static getPaid`, `virtual isPaid`, `virtual isPending`, `virtual netAmount`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminAgentController.js`](../../../../server/controllers/adminAgentController.js)
- [`server/controllers/agentController.js`](../../../../server/controllers/agentController.js)
- [`server/controllers/analyticsController.js`](../../../../server/controllers/analyticsController.js)
- [`server/controllers/bookingController.js`](../../../../server/controllers/bookingController.js)
- [`server/controllers/commissionController.js`](../../../../server/controllers/commissionController.js)
- [`server/controllers/financeController.js`](../../../../server/controllers/financeController.js)
- [`server/controllers/reconciliationController.js`](../../../../server/controllers/reconciliationController.js)
- [`server/models/Payment.js`](../../../../server/models/Payment.js)
- [`server/scripts/reconcileTenantIndexes.js`](../../../../server/scripts/reconcileTenantIndexes.js)
- [`server/scripts/repairFinancialReconciliation.js`](../../../../server/scripts/repairFinancialReconciliation.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/financialDashboardSeed.js`](../../../../server/seeds/financialDashboardSeed.js)
- [`server/services/commissionService.js`](../../../../server/services/commissionService.js)
- [`server/services/paymentLifecycleService.js`](../../../../server/services/paymentLifecycleService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
