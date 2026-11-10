# Route module: securityRoutes.js

**Source:** [server/routes/securityRoutes.js](../../../../server/routes/securityRoutes.js)

Observed mount prefixes include `/api/security/status`, `/api/security/events`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /status → `/api/security/status`

Declared at source line 16. Route handler pipeline names: `protect`, `checkPermission`, `getSecurityStatus`.

```js
router.get(
  "/status",
  protect,
  checkPermission("system.security"),
  getSecurityStatus
)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getSecurityStatus`: [securityController.js](../../../../server/controllers/securityController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getSecurityStatus`

Handler starts at [controller line 5](../../../../server/controllers/securityController.js#L5). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/security/status'
```

### GET /events → `/api/security/events`

Declared at source line 23. Route handler pipeline names: `protect`, `checkPermission`, `getSecurityEvents`.

```js
router.get(
  "/events",
  protect,
  checkPermission("system.security"),
  getSecurityEvents
)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getSecurityEvents`: [securityController.js](../../../../server/controllers/securityController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getSecurityEvents`

Handler starts at [controller line 26](../../../../server/controllers/securityController.js#L26). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/security/events'
```

