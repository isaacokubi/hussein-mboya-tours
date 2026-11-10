# Route module: tourReportRoutes.js

**Source:** [server/routes/tourReportRoutes.js](../../../../server/routes/tourReportRoutes.js)

Observed mount prefixes include `/api/tour-reports`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/tour-reports`

Declared at source line 14. Route handler pipeline names: `roleMiddleware`, `getTourReports`.

```js
router.get("/", roleMiddleware("admin", "manager", "super_admin"), getTourReports)
```

- Imported handler/middleware `roleMiddleware`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `getTourReports`: [tourReportController.js](../../../../server/controllers/tourReportController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourReports`

Handler starts at [controller line 9](../../../../server/controllers/tourReportController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.countDocuments`, `Booking.aggregate`, `Payment.aggregate`, `User.countDocuments`, `Tour.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tour-reports'
```

