# Detailed code explanation index

This index prioritizes runtime-critical files and provides a repeatable trace for the system. Notes refer to the checked-in source and should be revisited when code changes.

## Backend execution

- [Backend startup: `server/server.js`](backend/server-startup.md)
- [Express application: `server/app.js`](backend/express-app.md)
- [Authentication and tenant enforcement: `authMiddleware.js`](backend/auth-middleware.md)
- [Tenant resolution algorithm](backend/tenant-middleware.md)
- [Credential login and account authentication](backend/auth-controller.md)
- [Customer booking controller and compensation boundary](backend/customer-booking-controller.md)
- [Booking transaction and Booking model](backend/booking-model.md)
- [M-Pesa route and service](integrations/mpesa.md)
- [M-Pesa initiation/status controller](backend/mpesa-controller.md)
- [Callback integrity verification](backend/mpesa-callback-integrity.md)
- [Callback tenant restoration](backend/resolve-mpesa-callback-tenant.md)
- [Subscription versus booking callback dispatch](backend/subscription-mpesa-callback.md)
- [Booking payment lifecycle service](backend/payment-lifecycle-service.md)
- [Admin booking, reconciliation, payment, and refund operations](backend/admin-booking-payment-operations.md)
- [Core runtime walkthroughs: authentication, customer booking/capacity, payment trust, and frontend state](../CORE_CODE_WALKTHROUGHS.md)
- [Source-reviewed critical API contracts](../API_VERIFIED_CONTRACTS.md)
- [All 96 database model explanations](database/models/INDEX.md)
- [Express route-module explanations](backend/routes/INDEX.md)
- [API router mount graph](backend/routes/router-index.md)
- [Source-specific structural walkthroughs for remaining files](source/INDEX.md)

## Frontend execution

- [React bootstrap and route composition](frontend/react-bootstrap.md)
- [Browser authentication and session state](frontend/auth-context.md)
- [Shared Axios client](frontend/axios-client.md)
- [Booking API and payment-status UI](frontend/booking-payment-ui.md)
- [Checkout form, mutation, and polling state](frontend/checkout-state.md)
- [All client API module explanations](frontend/api-modules/INDEX.md)

## Related source inventories

- Backend route files: [`server/routes/`](../../server/routes); API declarations indexed in [route inventory](../API_ROUTE_INVENTORY.md).
- Controllers: [`server/controllers/`](../../server/controllers).
- Services: [`server/services/`](../../server/services).
- Models: [`server/models/`](../../server/models).
- Frontend source: [`client/src/`](../../client/src).

These notes are detailed explanations for the core flow, not per-file explanations for every source. [Coverage report](../DOCUMENTATION_COVERAGE.md) records the remaining gap.

The [source file index](../SOURCE_FILE_INDEX.md) links every first-party JS/JSX source file to either its dedicated note or the applicable module guide.
