# PaymentGatewayConfig model

**Source:** [server/models/PaymentGatewayConfig.js](../../../../server/models/PaymentGatewayConfig.js)

## Purpose

This Mongoose model persists the payment gateway config domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: yes; ref: Organization; index |
| `provider` | Business field “provider”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: yes; allowed values: ["MPESA","STRIPE","PAYPAL","PESAPAL","BANK"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `environment` | Business field “environment”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "sandbox"; allowed values: ["sandbox","production"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `enabled` | Business field “enabled”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `accountName` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `shortcode` | Business field “shortcode”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `publicKey` | Business field “public key”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `merchantId` | Business field “merchant id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `callbackUrl` | Business field “callback url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `consumerKeyEncrypted` | Business field “consumer key encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `consumerSecretEncrypted` | Business field “consumer secret encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `passkeyEncrypted` | Business field “passkey encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `secretKeyEncrypted` | Business field “secret key encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `webhookSecretEncrypted` | Business field “webhook secret encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `initiatorNameEncrypted` | Human-readable descriptive data for the associated business record. | type: String; required: no; default: "" |
| `securityCredentialEncrypted` | Business field “security credential encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sandboxConsumerKeyEncrypted` | Business field “sandbox consumer key encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sandboxConsumerSecretEncrypted` | Business field “sandbox consumer secret encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sandboxPasskeyEncrypted` | Business field “sandbox passkey encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `productionConsumerKeyEncrypted` | Business field “production consumer key encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `productionConsumerSecretEncrypted` | Business field “production consumer secret encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `productionPasskeyEncrypted` | Business field “production passkey encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sandboxShortcode` | Business field “sandbox shortcode”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `productionShortcode` | Business field “production shortcode”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sandboxCallbackUrl` | Business field “sandbox callback url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `productionCallbackUrl` | Business field “production callback url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sandboxPaypalClientIdEncrypted` | Business field “sandbox paypal client id encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sandboxPaypalClientSecretEncrypted` | Business field “sandbox paypal client secret encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sandboxPaypalWebhookId` | Business field “sandbox paypal webhook id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sandboxPaypalMerchantId` | Business field “sandbox paypal merchant id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `sandboxPaypalValidatedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `productionPaypalClientIdEncrypted` | Business field “production paypal client id encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `productionPaypalClientSecretEncrypted` | Business field “production paypal client secret encrypted”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `productionPaypalWebhookId` | Business field “production paypal webhook id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `productionPaypalMerchantId` | Business field “production paypal merchant id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "" |
| `productionPaypalValidatedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `sandboxLifecycleVerifiedAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `updatedBy` | User recorded as last updating the record. | type: ObjectId; required: no; default: null; ref: User |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ tenantId: 1, provider: 1 } — unique: true`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `updatedBy`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
No pre/post hook declaration was detected by the source scan.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/paymentGatewayController.js`](../../../../server/controllers/paymentGatewayController.js)
- [`server/controllers/paypalController.js`](../../../../server/controllers/paypalController.js)
- [`server/controllers/settingsController.js`](../../../../server/controllers/settingsController.js)
- [`server/controllers/superAdminMpesaGatewayController.js`](../../../../server/controllers/superAdminMpesaGatewayController.js)
- [`server/scripts/mongodb-application-audit.js`](../../../../server/scripts/mongodb-application-audit.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/seeds/dashboardOperationalSeed.js`](../../../../server/seeds/dashboardOperationalSeed.js)
- [`server/services/paymentGatewayService.js`](../../../../server/services/paymentGatewayService.js)
- [`server/services/paypalService.js`](../../../../server/services/paypalService.js)
- [`server/services/settingsService.js`](../../../../server/services/settingsService.js)
- [`server/tests/paypalPaymentIntegration.test.js`](../../../../server/tests/paypalPaymentIntegration.test.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
