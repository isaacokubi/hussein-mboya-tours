# Lead model

**Source:** [server/models/Lead.js](../../../../server/models/Lead.js)

## Purpose

This Mongoose model persists the lead domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `integrationKey` | Business field “integration key”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null; ref: WebsiteIntegrationKey |
| `firstName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `lastName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `name` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `email` | Email address/contact identifier; normalization depends on schema options. | type: String; required: no; default: "" |
| `phone` | Phone contact value; provider-specific normalization occurs in service code. | type: String; required: yes |
| `company` | Business field “company”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `nationality` | Business field “nationality”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `country` | Business field “country”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `city` | Business field “city”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `county` | Business field “county”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `tour` | Associated tour catalogue record. | type: ObjectId; required: no; default: null; ref: Tour |
| `travelDate` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `guests` | Business field “guests”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 1; range: 1 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (1).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `message` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `source` | Business field “source”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "website" |
| `landingPage` | Business field “landing page”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `referrer` | Business field “referrer”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `utm` | Business field “utm”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `customFields` | Business field “custom fields”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: anonymous] |
| `marketingConsent` | Business field “marketing consent”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `consentAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "new"; allowed values: ["new","contacted","qualified","converted","lost","archived"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `convertedBooking` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: ObjectId; required: no; default: null; ref: Booking |
| `lastContactedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, phone: 1, createdAt: -1 }`
- `{ tenantId: 1, email: 1, createdAt: -1 }`
- `{ tenantId: 1, status: 1, createdAt: -1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `integrationKey`:  ref: WebsiteIntegrationKey. Callers must scope and authorize referenced records.
- `tour`:  ref: Tour. Callers must scope and authorize referenced records.
- `convertedBooking`:  ref: Booking. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/websiteLeadController.js`](../../../../server/controllers/websiteLeadController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
