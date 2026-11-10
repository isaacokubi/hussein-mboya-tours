# Route module: apiMonitorRoutes.js

**Source:** [server/routes/apiMonitorRoutes.js](../../../../server/routes/apiMonitorRoutes.js)

Observed mount prefixes include `/api/superadmin/api-monitor`.

## Router-wide middleware

No router.use declaration was found at module scope.

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/superadmin/api-monitor`

Declared at source line 9. Route handler pipeline names: `protect`, `superAdminOnly`, `getApiMonitor`.

```js
router.get("/", protect, superAdminOnly, getApiMonitor)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `superAdminOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getApiMonitor`: [apiMonitorController.js](../../../../server/controllers/apiMonitorController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getApiMonitor`

Handler starts at [controller line 11](../../../../server/controllers/apiMonitorController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Unable to load API monitor status.”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/api-monitor'
```

