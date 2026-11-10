# Route module: crmRoutes.js

**Source:** [server/routes/crmRoutes.js](../../../../server/routes/crmRoutes.js)

Observed mount prefixes include `/api/crm/stats`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(adminMiddleware);`
- `router.use(authorize("manage_customers"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /stats → `/api/crm/stats`

Declared at source line 48. Route handler pipeline names: `getCRMStats`.

```js
router.get(
  "/stats",
  getCRMStats
)
```

- Imported handler/middleware `getCRMStats`: [crmController.js](../../../../server/controllers/crmController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getCRMStats`

Handler starts at [controller line 7](../../../../server/controllers/crmController.js#L7). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Database operations detected: `Customer.countDocuments`, `Booking.countDocuments`, `User.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/crm/stats'
```

