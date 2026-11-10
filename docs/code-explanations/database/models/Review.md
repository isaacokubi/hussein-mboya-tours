# Review model

**Source:** [server/models/Review.js](../../../../server/models/Review.js)

## Purpose

This Mongoose model persists the review domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `user` | Associated user account. | type: ObjectId; required: yes; ref: User |
| `customer` | Associated customer record or account, as indicated by the schema reference. | type: ObjectId; required: no; default: null; ref: User |
| `tour` | Associated tour catalogue record. | type: ObjectId; required: yes; ref: Tour |
| `booking` | Associated tour booking. | type: ObjectId; required: yes; ref: Booking |
| `rating` | Business field “rating”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: yes; range: 1 to 5; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (5). |
| `title` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: ""; length: 0 to 150; validators: maxlength |
| `comment` | Business field “comment”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; length: 0 to 3000; validators: maxlength |
| `images` | Business field “images”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `recommend` | Business field “recommend”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `verified` | Business field “verified”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `approved` | Business field “approved”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `rejected` | Business field “rejected”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `rejectionReason` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `adminReply.message` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `adminReply.repliedBy` | Business field “replied by”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: User |
| `adminReply.repliedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `helpfulVotes` | Business field “helpful votes”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `notHelpfulVotes` | Business field “not helpful votes”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `isDeleted` | Soft-delete visibility flag; callers should exclude deleted records when appropriate. | type: Boolean; required: no; default: false |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ user: 1 }`
- `{ tour: 1 }`
- `{ booking: 1 } — unique: true`
- `{ approved: 1 }`
- `{ isDeleted: 1 }`
- `{ tour: 1, approved: 1 }`
- `{ user: 1, createdAt: -1 }`
- `{ rating: 1 }`
- `{ verified: 1 }`
- `{ createdAt: -1 }`
- `{ tenantId: 1, booking: 1 } — unique: true, sparse: false`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
- `customer`:  ref: User. Callers must scope and authorize referenced records.
- `tour`:  ref: Tour. Callers must scope and authorize referenced records.
- `booking`:  ref: Booking. Callers must scope and authorize referenced records.
- `adminReply.repliedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `markApproved`, `markRejected`, `reply`, `voteHelpful`, `voteNotHelpful`, `virtual helpfulnessScore`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminAIAlertsController.js`](../../../../server/controllers/adminAIAlertsController.js)
- [`server/controllers/adminAIBriefingController.js`](../../../../server/controllers/adminAIBriefingController.js)
- [`server/controllers/adminAIController.js`](../../../../server/controllers/adminAIController.js)
- [`server/controllers/adminAIIntelligenceController.js`](../../../../server/controllers/adminAIIntelligenceController.js)
- [`server/controllers/adminAIOperationsController.js`](../../../../server/controllers/adminAIOperationsController.js)
- [`server/controllers/adminAISentimentController.js`](../../../../server/controllers/adminAISentimentController.js)
- [`server/controllers/adminAITaskController.js`](../../../../server/controllers/adminAITaskController.js)
- [`server/controllers/adminDashboardMetricsController.js`](../../../../server/controllers/adminDashboardMetricsController.js)
- [`server/controllers/adminReviewController.js`](../../../../server/controllers/adminReviewController.js)
- [`server/controllers/customerController.js`](../../../../server/controllers/customerController.js)
- [`server/controllers/reviewController.js`](../../../../server/controllers/reviewController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/financialDashboardSeed.js`](../../../../server/seeds/financialDashboardSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
