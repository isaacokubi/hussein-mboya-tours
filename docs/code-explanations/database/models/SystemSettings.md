# SystemSettings model

**Source:** [server/models/SystemSettings.js](../../../../server/models/SystemSettings.js)

## Purpose

This Mongoose model persists the system settings domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index |
| `companyName` | Human-readable descriptive data for the associated business record. | type: String; required: yes; default: "Company" |
| `companyLogo` | Business field “company logo”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `websiteUrl` | Business field “website url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `supportEmail` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `supportPhone` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `address` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `city` | Business field “city”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Nairobi" |
| `country` | Business field “country”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Kenya" |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `currencySymbol` | Business field “currency symbol”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "KSh" |
| `timezone` | Business field “timezone”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "Africa/Nairobi" |
| `language` | Business field “language”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "en" |
| `taxRate` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to ∞; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0). |
| `bookingDepositPercentage` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Number; required: no; default: 30; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `defaultCommissionRate` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 10; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `maintenanceMode` | Business field “maintenance mode”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `allowRegistrations` | Business field “allow registrations”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `allowAgentRegistrations` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: Boolean; required: no; default: true |
| `requireEmailVerification` | Contact or location information; restrict access and avoid exposing it in logs. | type: Boolean; required: no; default: true |
| `requirePhoneVerification` | Contact or location information; restrict access and avoid exposing it in logs. | type: Boolean; required: no; default: false |
| `enableMpesa` | Business field “enable mpesa”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `enableStripe` | Business field “enable stripe”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `enablePaypal` | Business field “enable paypal”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `enableBankTransfer` | Business field “enable bank transfer”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: true |
| `bankName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `bankAccountName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `bankAccountNumber` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "" |
| `bankBranch` | Business field “bank branch”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `bankSwiftCode` | Business field “bank swift code”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `emailFromName` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "Company" |
| `emailFromAddress` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `facebook` | Business field “facebook”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `instagram` | Business field “instagram”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `twitter` | Business field “twitter”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `youtube` | Business field “youtube”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `seoTitle` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `seoDescription` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `seoKeywords` | Business field “seo keywords”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Array; required: no |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ maintenanceMode: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

No direct import/query caller was found by the static scan. The model may be dynamically referenced, populated, or unused; confirm with repository search before claiming active use.

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
