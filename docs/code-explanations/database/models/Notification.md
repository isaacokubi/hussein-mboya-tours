# Notification model

**Source:** [server/models/Notification.js](../../../../server/models/Notification.js)

## Purpose

This Mongoose model persists the notification domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.

## Fields

The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.

| Path | Purpose | Compiled type and constraints |
|---|---|---|
| `tenantId` | Organization scope; tenant-owned reads and writes must match this value. | type: ObjectId; required: no; ref: Organization; index; immutable |
| `recipient` | Business field “recipient”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: yes; ref: User |
| `user` | Associated user account. | type: ObjectId; required: no; default: null; ref: User |
| `title` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 150; validators: maxlength |
| `message` | Human-readable descriptive data for the associated business record. | type: String; required: yes; length: 0 to 2000; validators: maxlength |
| `type` | Business field “type”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "system"; allowed values: ["booking","payment","tour_assignment","tour_update","assignment","promotion","system","alert"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `priority` | Business field “priority”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: "normal"; allowed values: ["low","normal","high","urgent"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `read` | Business field “read”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Boolean; required: no; default: false |
| `readAt` | Date/time for the event named by this path; confirm timezone and transition semantics in callers. | type: Date; required: no; default: null |
| `actionUrl` | Business field “action url”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: ""; length: 0 to 500; validators: maxlength |
| `relatedModel` | Business field “related model”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: String; required: no; default: null; allowed values: ["Booking","CustomTourRequest","Tour","Payment","Vehicle","Staff","User","Notification"]; validators: enum: `{VALUE}` is not a valid enum value for path `{PATH}`. |
| `relatedId` | Business field “related id”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: ObjectId; required: no; default: null |
| `metadata` | Business field “metadata”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Mixed; required: no; default: [function: default] |
| `isSent` | Boolean state/capability flag; its mutation rules are defined by callers. | type: Boolean; required: no; default: true |
| `isArchived` | Boolean state/capability flag; its mutation rules are defined by callers. | type: Boolean; required: no; default: false |
| `_id` | MongoDB document identity. | type: ObjectId; required: no |
| `createdAt` | Timestamp automatically recorded when the document is created. | type: Date; required: no; immutable |
| `updatedAt` | Timestamp automatically refreshed when the document is updated. | type: Date; required: no |
| `__v` | Business field “ v”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema. | type: Number; required: no |

## Indexes

- `{ tenantId: 1 }`
- `{ recipient: 1 }`
- `{ type: 1 }`
- `{ read: 1 }`
- `{ isArchived: 1 }`
- `{ tenantId: 1, recipient: 1, createdAt: -1 }`
- `{ tenantId: 1, recipient: 1, read: 1, isArchived: 1, createdAt: -1 }`
- `{ tenantId: 1, recipient: 1, type: 1, createdAt: -1 }`

## Relationships and tenant boundary

- `tenantId`:  ref: Organization. Callers must scope and authorize referenced records.
- `recipient`:  ref: User. Callers must scope and authorize referenced records.
- `user`:  ref: User. Callers must scope and authorize referenced records.
The schema includes tenant ownership metadata at `tenantId`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.

## Lifecycle and derived behavior

Schema timestamps: enabled; version key: `__v`.
Source declarations include hooks: `pre save`.
Compiled methods, statics, and virtuals: `initializeTimestamps`, `markAsRead`, `archive`, `static getUnreadCount`, `static markAllAsRead`, `virtual receiver`, `virtual id`.
The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.

## Application use

Static scanning found these direct imports or model operations:
- [`server/controllers/adminTourController.js`](../../../../server/controllers/adminTourController.js)
- [`server/controllers/bookingAdminController.js`](../../../../server/controllers/bookingAdminController.js)
- [`server/controllers/bookingController.js`](../../../../server/controllers/bookingController.js)
- [`server/controllers/customTourRequestController.js`](../../../../server/controllers/customTourRequestController.js)
- [`server/controllers/customerBookingController.js`](../../../../server/controllers/customerBookingController.js)
- [`server/controllers/customerController.js`](../../../../server/controllers/customerController.js)
- [`server/controllers/integrationController.js`](../../../../server/controllers/integrationController.js)
- [`server/controllers/mpesaController.js`](../../../../server/controllers/mpesaController.js)
- [`server/controllers/notificationController.js`](../../../../server/controllers/notificationController.js)
- [`server/seeds/completeTestDemoSeed.js`](../../../../server/seeds/completeTestDemoSeed.js)
- [`server/services/customerCommunicationService.js`](../../../../server/services/customerCommunicationService.js)
- [`server/services/hospitalityPaymentLifecycleService.js`](../../../../server/services/hospitalityPaymentLifecycleService.js)
- [`server/services/notificationService.js`](../../../../server/services/notificationService.js)
- [`server/services/tourCancellationService.js`](../../../../server/services/tourCancellationService.js)

## Validation and security

Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.
