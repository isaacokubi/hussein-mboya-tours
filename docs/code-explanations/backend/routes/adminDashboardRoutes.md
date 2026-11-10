# Route module: adminDashboardRoutes.js

**Source:** [server/routes/adminDashboardRoutes.js](../../../../server/routes/adminDashboardRoutes.js)

Observed mount prefixes include `/api/admin/dashboard/metrics`, `/api/admin/dashboard`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /metrics → `/api/admin/dashboard/metrics`

Declared at source line 13. Route handler pipeline names: `protect`, `adminOnly`, `authorize`, `getDashboardMetrics`.

```js
router.get("/metrics", protect, adminOnly, authorize("admin.dashboard"), getDashboardMetrics)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `adminOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getDashboardMetrics`: [adminDashboardMetricsController.js](../../../../server/controllers/adminDashboardMetricsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getDashboardMetrics`

Handler starts at [controller line 22](../../../../server/controllers/adminDashboardMetricsController.js#L22). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `message`.
- Database operations detected: `User.countDocuments`, `Staff.countDocuments`, `Agent.countDocuments`, `Vehicle.countDocuments`, `Tour.countDocuments`, `Destination.countDocuments`, `Booking.countDocuments`, `Payment.countDocuments`, `Booking.aggregate`, `Booking.find`, `Review.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/dashboard/metrics'
```

### GET / → `/api/admin/dashboard`

Declared at source line 14. Route handler pipeline names: `protect`, `adminOnly`, `authorize`, `getDashboardMetrics`.

```js
router.get("/", protect, adminOnly, authorize("admin.dashboard"), getDashboardMetrics)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `adminOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getDashboardMetrics`: [adminDashboardMetricsController.js](../../../../server/controllers/adminDashboardMetricsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getDashboardMetrics`

Handler starts at [controller line 22](../../../../server/controllers/adminDashboardMetricsController.js#L22). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `message`.
- Database operations detected: `User.countDocuments`, `Staff.countDocuments`, `Agent.countDocuments`, `Vehicle.countDocuments`, `Tour.countDocuments`, `Destination.countDocuments`, `Booking.countDocuments`, `Payment.countDocuments`, `Booking.aggregate`, `Booking.find`, `Review.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/dashboard'
```

