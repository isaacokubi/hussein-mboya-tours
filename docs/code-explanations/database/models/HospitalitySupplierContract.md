# HospitalitySupplierContract model

**Source:** [server/models/HospitalitySupplierContract.js](../../../../server/models/HospitalitySupplierContract.js)

## Purpose

This Mongoose model persists the hospitality supplier contract domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `supplierName` | Human-readable descriptive data for the associated business record. | type: String; required: yes |
| `supplierType` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "hotel"; allowed values: ["hotel","transfer","vehicle","guide","other"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `hotel` | Associated hotel record. | type: ObjectId; required: no; default: null; ref: Hotel |
| `contactName` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `contactPhone` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `contactEmail` | Contact or location information; restrict access and avoid exposing it in logs. | type: String; required: no; default: "" |
| `contractNumber` | Business field “contract number”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `currency` | Currency code for monetary values, usually normalized to uppercase by schema options. | type: String; required: no; default: "KES" |
| `commissionPercent` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Number; required: no; default: 0; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `depositPercent` | Business field “deposit percent”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no; default: 0; range: 0 to 100; validators: min: Path `{PATH}` ({VALUE}) is less than minimum allowed value (0).; max: Path `{PATH}` ({VALUE}) is more than maximum allowed value (100). |
| `rates` | Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service. | type: Array; required: no; default: [function: anonymous] |
| `validFrom` | Business field “valid from”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: no; default: null |
| `validTo` | Business field “valid to”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Date; required: no; default: null |
| `paymentTerms` | Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization. | type: String; required: no; default: "" |
| `cancellationTerms` | Business field “cancellation terms”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `status` | Current lifecycle state; allowed transitions are enforced by the owning service/controller. | type: String; required: no; default: "draft"; allowed values: ["draft","active","inactive","expired","terminated"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `notes` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `createdBy` | User recorded as creating the record. | type: ObjectId; required: no; default: null; ref: User |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ supplierType: 1 }`
- `{ hotel: 1 }`
- `{ status: 1 }`
- `{ tenantId: 1, supplierType: 1, status: 1, validTo: 1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `hotel`:  ref: Hotel. Callers must scope and authorize referenced records.
- `createdBy`:  ref: User. Callers must scope and authorize referenced records.
- `updatedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/hospitalityCommercialController.js`](../../../../server/controllers/hospitalityCommercialController.js)
- [`server/controllers/hospitalityOperationsController.js`](../../../../server/controllers/hospitalityOperationsController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
