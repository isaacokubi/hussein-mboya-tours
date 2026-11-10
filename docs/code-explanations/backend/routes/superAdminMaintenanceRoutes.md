# Route module: superAdminMaintenanceRoutes.js

**Source:** [server/routes/superAdminMaintenanceRoutes.js](../../../../server/routes/superAdminMaintenanceRoutes.js)

Observed mount prefixes include `/api/superadmin/maintenance/backups`, `/api/superadmin/maintenance/backup`, `/api/superadmin/maintenance/maintenance/backup`, `/api/superadmin/maintenance/cache`, `/api/superadmin/maintenance/maintenance/cache`, `/api/superadmin/maintenance/backups/:id`, `/api/superadmin/maintenance/database/backup/:id/download`, `/api/superadmin/maintenance/database/backup`, `/api/superadmin/maintenance/database/cache-clear`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect, superAdminOnly);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /backups → `/api/superadmin/maintenance/backups`

Declared at source line 28. Route handler pipeline names: `listDatabaseBackups`.

```js
router.get(
  "/backups",
  listDatabaseBackups
)
```

- Imported handler/middleware `listDatabaseBackups`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listDatabaseBackups`

Handler starts at [controller line 113](../../../../server/controllers/superAdminOperationsController.js#L113). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Database operations detected: `DatabaseBackup.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/maintenance/backups'
```

### POST /backup → `/api/superadmin/maintenance/backup`

Declared at source line 33. Route handler pipeline names: `createDatabaseBackup`.

```js
router.post(
  "/backup",
  createDatabaseBackup
)
```

- Imported handler/middleware `createDatabaseBackup`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createDatabaseBackup`

Handler starts at [controller line 65](../../../../server/controllers/superAdminOperationsController.js#L65). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `500`.
- JSON envelope keys observed: `success`, `message`, `file`, `scope`.
- Literal messages include: “Database connection unavailable”; “Database backup created successfully”.
- Database operations detected: `DatabaseBackup.create`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/maintenance/backup'
```

### POST /maintenance/backup → `/api/superadmin/maintenance/maintenance/backup`

Declared at source line 38. Route handler pipeline names: `createDatabaseBackup`.

```js
router.post(
  "/maintenance/backup",
  createDatabaseBackup
)
```

- Imported handler/middleware `createDatabaseBackup`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createDatabaseBackup`

Handler starts at [controller line 65](../../../../server/controllers/superAdminOperationsController.js#L65). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `500`.
- JSON envelope keys observed: `success`, `message`, `file`, `scope`.
- Literal messages include: “Database connection unavailable”; “Database backup created successfully”.
- Database operations detected: `DatabaseBackup.create`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/maintenance/maintenance/backup'
```

### POST /cache → `/api/superadmin/maintenance/cache`

Declared at source line 43. Route handler pipeline names: `clearSystemCache`.

```js
router.post(
  "/cache",
  clearSystemCache
)
```

- Imported handler/middleware `clearSystemCache`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `clearSystemCache`

Handler starts at [controller line 63](../../../../server/controllers/superAdminOperationsController.js#L63). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`, `timestamp`.
- Literal messages include: “System cache cleared successfully”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/maintenance/cache'
```

### POST /maintenance/cache → `/api/superadmin/maintenance/maintenance/cache`

Declared at source line 48. Route handler pipeline names: `clearSystemCache`.

```js
router.post(
  "/maintenance/cache",
  clearSystemCache
)
```

- Imported handler/middleware `clearSystemCache`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `clearSystemCache`

Handler starts at [controller line 63](../../../../server/controllers/superAdminOperationsController.js#L63). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`, `timestamp`.
- Literal messages include: “System cache cleared successfully”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/maintenance/maintenance/cache'
```

### DELETE /backups/:id → `/api/superadmin/maintenance/backups/:id`

Declared at source line 53. Route handler pipeline names: `deleteDatabaseBackup`.

```js
router.delete(
  "/backups/:id",
  deleteDatabaseBackup
)
```

- Imported handler/middleware `deleteDatabaseBackup`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteDatabaseBackup`

Handler starts at [controller line 136](../../../../server/controllers/superAdminOperationsController.js#L136). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Backup not found”; “Backup deleted successfully”.
- Database operations detected: `DatabaseBackup.findOne`.
- Input/validation source lines to inspect:
  - [Line 138](../../../../server/controllers/superAdminOperationsController.js#L138): `const backup = await DatabaseBackup.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 139](../../../../server/controllers/superAdminOperationsController.js#L139): `if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });`
  - [Line 142](../../../../server/controllers/superAdminOperationsController.js#L142): `await DatabaseBackup.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/superadmin/maintenance/backups/<id>'
```

### GET /database/backup/:id/download → `/api/superadmin/maintenance/database/backup/:id/download`

Declared at source line 58. Route handler pipeline names: `downloadDatabaseBackup`.

```js
router.get(
  "/database/backup/:id/download",
  downloadDatabaseBackup
)
```

- Imported handler/middleware `downloadDatabaseBackup`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `downloadDatabaseBackup`

Handler starts at [controller line 123](../../../../server/controllers/superAdminOperationsController.js#L123). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Backup not found”; “Backup file missing”.
- Database operations detected: `DatabaseBackup.findOne`.
- Input/validation source lines to inspect:
  - [Line 125](../../../../server/controllers/superAdminOperationsController.js#L125): `const backup = await DatabaseBackup.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 126](../../../../server/controllers/superAdminOperationsController.js#L126): `if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });`
  - [Line 128](../../../../server/controllers/superAdminOperationsController.js#L128): `if (!fs.existsSync(filepath)) return res.status(404).json({ success: false, message: "Backup file missing" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/maintenance/database/backup/<id>/download'
```

### POST /database/backup → `/api/superadmin/maintenance/database/backup`

Declared at source line 63. Route handler pipeline names: `createDatabaseBackup`.

```js
router.post(
  "/database/backup",
  createDatabaseBackup
)
```

- Imported handler/middleware `createDatabaseBackup`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createDatabaseBackup`

Handler starts at [controller line 65](../../../../server/controllers/superAdminOperationsController.js#L65). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `500`.
- JSON envelope keys observed: `success`, `message`, `file`, `scope`.
- Literal messages include: “Database connection unavailable”; “Database backup created successfully”.
- Database operations detected: `DatabaseBackup.create`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/maintenance/database/backup'
```

### POST /database/cache-clear → `/api/superadmin/maintenance/database/cache-clear`

Declared at source line 68. Route handler pipeline names: `clearSystemCache`.

```js
router.post(
  "/database/cache-clear",
  clearSystemCache
)
```

- Imported handler/middleware `clearSystemCache`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `clearSystemCache`

Handler starts at [controller line 63](../../../../server/controllers/superAdminOperationsController.js#L63). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`, `timestamp`.
- Literal messages include: “System cache cleared successfully”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/maintenance/database/cache-clear'
```

