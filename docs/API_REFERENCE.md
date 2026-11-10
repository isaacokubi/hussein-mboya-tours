# API reference

See the [source-traced contract index](API_DOMAIN_CONTRACTS/INDEX.md) for authentication, booking creation, M-Pesa initiation/status/callbacks, admin booking operations, admin payment operations and refunds. Those contracts trace mounted routes through middleware, controllers and relevant services/models.

The [domain endpoint guide](API_ENDPOINT_GUIDE/INDEX.md) has one entry for each of the **629 mounted method/path inventory rows (588 unique route-module/method/path declarations plus 41 repeated mount entries)**. The current audit records **387 source-traced entries**, **242 partial entries**, and zero unclassified entries. An endpoint guide entry is not by itself a complete contract.

## Contract and conventions

The API is implemented in Express routers, not generated from an OpenAPI specification. The literal route declarations and their mount prefixes are listed in the [source-derived route inventory](API_ROUTE_INVENTORY.md) (629 mounted method/path rows: 588 unique route-module/method/path declarations plus 41 repeated mount entries); the inventory separately marks 81 declarations in modules with no observed mount as not live endpoints. `server/routes/index.js` mounts the consolidated router at `/api`; `server/app.js` separately mounts readiness, settings, database, system, tenant branding, subscription and internal staging routers. Use the route file linked for the actual middleware, request shape, controller, and response. Paths with a `:parameter` use Express route parameters.

There is no single response envelope guarantee across all controllers. Many return `{success, message, data}`, while others return domain-shaped JSON. Errors may be returned locally or flow to the final middleware; common status mapping includes 400 validation/cast, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict/duplicate and 5xx failures. Responses commonly include `requestId` when produced by the app-level handlers.

## Representative route summaries (not all full contracts)

| Method/path | Access/middleware | Purpose and input | Source |
|---|---|---|---|
| `POST /api/auth/register` | Auth route limiter/validation as configured in router | Registration input is read by `authController.register`; inspect current validator/controller for required fields and tenant rules. | [`authRoutes.js`](../server/routes/authRoutes.js), [`authController.js`](../server/controllers/authController.js) |
| `POST /api/auth/login` | Login rate limiting/tenant resolution | Email/password credentials; successful response/cookie behavior is implemented by auth controller and `utils/authCookie.js`. | Same as above |
| `GET /api/auth/me` | `protect` | Returns current authenticated account information. | [`authRoutes.js`](../server/routes/authRoutes.js) |
| `POST /api/bookings` | `protect`, `customerOnly`, travel-date validation | Creates customer booking; body is interpreted by customer booking controller. | [`bookingRoutes.js`](../server/routes/bookingRoutes.js), [`customerBookingController.js`](../server/controllers/customerBookingController.js) |
| `GET /api/bookings/my-bookings` | `protect`, `customerOnly` | Lists caller's bookings. | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `GET /api/bookings/:id` | `protect`; tenant scope/access in handler | Retrieve booking by identifier. | [`bookingRoutes.js`](../server/routes/bookingRoutes.js), [`bookingRetrievalController.js`](../server/controllers/bookingRetrievalController.js) |
| `POST /api/mpesa/stkpush` | tenant resolve, `protect`, 10 per 15-minute rate limit, booking preparation | Starts a tenant M-Pesa STK payment for `bookingId` and phone field (`phoneNumber` or `phone`); amount is checked against payable amount. | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js), [`mpesaController.js`](../server/controllers/mpesaController.js) |
| `POST /api/mpesa/callback` | callback payload validation, tenant resolution and integrity verification | Provider callback; body schema is provider-specific and validated by callback middleware/controller. | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js), [`mpesaCallbackIntegrity.js`](../server/middleware/mpesaCallbackIntegrity.js) |
| `GET /api/mpesa/status/:checkoutRequestId` | `protect` | Check persisted status for checkout request. | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `POST /api/payments/stripe/checkout` | Stripe router middleware | Starts Stripe checkout; inspect route/controller for exact body and response. | [`stripeRoutes.js`](../server/routes/stripeRoutes.js) |
| `POST /api/payments/paypal/orders` | PayPal router middleware | Creates provider order. | [`paypalRoutes.js`](../server/routes/paypalRoutes.js) |
| `POST /api/payments/paypal/orders/capture` | PayPal router middleware | Captures and verifies provider order. | Same as above |
| `GET /api/live` | Public | Liveness; process responds even if database startup is incomplete. | [`app.js`](../server/app.js) |
| `GET /api/health`, `GET /api/ready` | Public | Readiness with database/startup state; returns 503 if not ready. | Same as above |

Request examples should be taken from feature callers and validators. Except for the hand-traced endpoints in [API_VERIFIED_CONTRACTS.md](API_VERIFIED_CONTRACTS.md), the rows below are route summaries and source pointers, not complete contracts. A route declaration alone does not define a safe public request example; inspect route middleware, controller, called service and model before using an endpoint. The route inventory is a navigation list, not an API schema.

## Authentication and tenant scope

Protected routes commonly use `protect`, then role/permission middleware. Tenant resolution is applied globally in `app.js` and again in selected routers. Authentication can use a Bearer token or cookie; unsafe cookie-authenticated requests require CSRF matching. Tenant identity may come from host/headers and is reconciled with the authenticated user's tenant. Read [security](SECURITY.md) before using a privileged endpoint.

## Curl patterns

```bash
# Liveness endpoint
curl -i http://localhost:5000/api/live

# Authenticated requests use the session cookie or a token issued by login.
# Never paste real tokens into documentation or shell history.
curl -i http://localhost:5000/api/auth/me -H 'Authorization: Bearer <ACCESS_TOKEN>'
```

## Completeness boundary

`API_ROUTE_INVENTORY.md` records route declarations, not a complete per-endpoint body/schema/status/database contract. Given the number of declarations and middleware branches, a generated OpenAPI file would require explicit schema annotations or runtime extraction. Do not claim the current document is OpenAPI-complete.

The [route-module explanations](code-explanations/backend/routes/INDEX.md) provide exact route expressions, observed mount paths, route-wide/route-local middleware names, controller links, and statically extracted handler cues (request property names, literal status codes, JSON envelope keys, validation lines, and direct model operations) where a handler can be resolved. These are useful per-endpoint traces, not complete schemas: dynamic inputs/responses, requiredness/types, delegated service effects, and some aliases remain unverified. The document is not a complete OpenAPI contract.

Client-side endpoint callers are explained in the [API module index](code-explanations/frontend/api-modules/INDEX.md), including the URL, method and payload expression used by each wrapper.
