# Route module: analyticsRoutes.js

**Source:** [server/routes/analyticsRoutes.js](../../../../server/routes/analyticsRoutes.js)

Observed mount prefixes include `/api/analytics`, `/api/analytics/dashboard`, `/api/analytics/revenue`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(adminMiddleware);`
- `router.use(authorize("analytics.view"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/analytics`

Declared at source line 44. Route handler pipeline names: `getAnalytics`.

```js
router.get(
  "/",
  getAnalytics
)
```

- Imported handler/middleware `getAnalytics`: [analyticsController.js](../../../../server/controllers/analyticsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAnalytics`

Handler starts at [controller line 10](../../../../server/controllers/analyticsController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `User.countDocuments`, `Booking.aggregate`, `Vehicle.aggregate`, `Commission.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/analytics'
```

### GET /dashboard → `/api/analytics/dashboard`

Declared at source line 53. Route handler pipeline names: `dashboardAnalytics`.

```js
router.get(
  "/dashboard",
  dashboardAnalytics
)
```

- Imported handler/middleware `dashboardAnalytics`: [analyticsController.js](../../../../server/controllers/analyticsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `dashboardAnalytics`

Handler starts at [controller line 44](../../../../server/controllers/analyticsController.js#L44). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/analytics/dashboard'
```

### GET /revenue → `/api/analytics/revenue`

Declared at source line 58. Route handler pipeline names: `revenueAnalytics`.

```js
router.get(
  "/revenue",
  revenueAnalytics
)
```

- Imported handler/middleware `revenueAnalytics`: [analyticsController.js](../../../../server/controllers/analyticsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `revenueAnalytics`

Handler starts at [controller line 54](../../../../server/controllers/analyticsController.js#L54). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/analytics/revenue'
```

