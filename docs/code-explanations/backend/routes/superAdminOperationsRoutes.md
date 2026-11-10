# Route module: superAdminOperationsRoutes.js

**Source:** [server/routes/superAdminOperationsRoutes.js](../../../../server/routes/superAdminOperationsRoutes.js)

Observed mount prefixes include `/api/superadmin/audit`, `/api/superadmin/database`, `/api/superadmin/system`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(
  checkPermission("roles.manage")
);`
- `router.use(auditMiddleware);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /audit → `/api/superadmin/audit`

Declared at source line 38. Route handler pipeline names: `getAuditLogs`.

```js
router.get("/audit",getAuditLogs)
```

- Imported handler/middleware `getAuditLogs`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAuditLogs`

Handler starts at [controller line 20](../../../../server/controllers/superAdminOperationsController.js#L20). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `search`, `action`, `resource`, `status`, `severity`.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Database operations detected: `AuditLog.find`, `AuditLog.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 20](../../../../server/controllers/superAdminOperationsController.js#L20): `async (req, res) => { try { const { page = 1, search = "", action = "", resource = "", status = "", severity = "" } = req.query; const currentPage = Math.max(Number(page)`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/audit'
```

### GET /database → `/api/superadmin/database`

Declared at source line 42. Route handler pipeline names: `getDatabaseStatus`.

```js
router.get("/database",getDatabaseStatus)
```

- Imported handler/middleware `getDatabaseStatus`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getDatabaseStatus`

Handler starts at [controller line 23](../../../../server/controllers/superAdminOperationsController.js#L23). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Unable to read database status”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/database'
```

### GET /system → `/api/superadmin/system`

Declared at source line 44. Route handler pipeline names: `getSystemHealth`.

```js
router.get("/system",getSystemHealth)
```

- Imported handler/middleware `getSystemHealth`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getSystemHealth`

Handler starts at [controller line 25](../../../../server/controllers/superAdminOperationsController.js#L25). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Unable to read system health”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/system'
```

