# Route module: superAdminToolsRoutes.js

**Source:** [server/routes/superAdminToolsRoutes.js](../../../../server/routes/superAdminToolsRoutes.js)

Observed mount prefixes include `/api/superadmin-tools/database`, `/api/superadmin-tools/settings`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(authorize("system.security"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /database → `/api/superadmin-tools/database`

Declared at source line 19. Route handler pipeline names: `getDatabase`.

```js
router.get("/database", getDatabase)
```

- Imported handler/middleware `getDatabase`: [superAdminToolsController.js](../../../../server/controllers/superAdminToolsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getDatabase`

Handler starts at [controller line 80](../../../../server/controllers/superAdminToolsController.js#L80). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Database tools operational”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin-tools/database'
```

### GET /settings → `/api/superadmin-tools/settings`

Declared at source line 20. Route handler pipeline names: `getSettings`.

```js
router.get("/settings", getSettings)
```

- Imported handler/middleware `getSettings`: [superAdminToolsController.js](../../../../server/controllers/superAdminToolsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getSettings`

Handler starts at [controller line 221](../../../../server/controllers/superAdminToolsController.js#L221). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Platform settings operational”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin-tools/settings'
```

