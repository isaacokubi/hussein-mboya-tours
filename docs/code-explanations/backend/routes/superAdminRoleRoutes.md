# Route module: superAdminRoleRoutes.js

**Source:** [server/routes/superAdminRoleRoutes.js](../../../../server/routes/superAdminRoleRoutes.js)

Observed mount prefixes include `/api/superadmin/roles`, `/api/superadmin/roles/permissions/all`, `/api/superadmin/roles/:id`, `/api/superadmin/roles/:id/permissions`.

## Router-wide middleware

- `router.use(protect);`
- `router.use(authorize("roles.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/superadmin/roles`

Declared at source line 15. Route handler pipeline names: `getPlatformRoles`.

```js
router.get("/", getPlatformRoles)
```

- Imported handler/middleware `getPlatformRoles`: [superAdminRoleController.js](../../../../server/controllers/superAdminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPlatformRoles`

Handler starts at [controller line 67](../../../../server/controllers/superAdminRoleController.js#L67). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`, `roles`, `data`.
- Database operations detected: `Role.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/roles'
```

### GET /permissions/all → `/api/superadmin/roles/permissions/all`

Declared at source line 16. Route handler pipeline names: `getPlatformPermissions`.

```js
router.get("/permissions/all", getPlatformPermissions)
```

- Imported handler/middleware `getPlatformPermissions`: [superAdminRoleController.js](../../../../server/controllers/superAdminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPlatformPermissions`

Handler starts at [controller line 76](../../../../server/controllers/superAdminRoleController.js#L76). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `Permission.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/roles/permissions/all'
```

### GET /:id → `/api/superadmin/roles/:id`

Declared at source line 17. Route handler pipeline names: `getPlatformRole`.

```js
router.get("/:id", getPlatformRole)
```

- Imported handler/middleware `getPlatformRole`: [superAdminRoleController.js](../../../../server/controllers/superAdminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPlatformRole`

Handler starts at [controller line 83](../../../../server/controllers/superAdminRoleController.js#L83). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `role`, `data`.
- Literal messages include: “Invalid role ID”; “Role not found”.
- Database operations detected: `Role.findById`.
- Input/validation source lines to inspect:
  - [Line 85](../../../../server/controllers/superAdminRoleController.js#L85): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });`
  - [Line 86](../../../../server/controllers/superAdminRoleController.js#L86): `const role = await Role.findById(req.params.id).populate("permissions", "name label description module category isActive").lean();`
  - [Line 87](../../../../server/controllers/superAdminRoleController.js#L87): `if (!role) return res.status(404).json({ success: false, message: "Role not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/roles/<id>'
```

### PUT /:id/permissions → `/api/superadmin/roles/:id/permissions`

Declared at source line 18. Route handler pipeline names: `updatePlatformRolePermissions`.

```js
router.put("/:id/permissions", updatePlatformRolePermissions)
```

- Imported handler/middleware `updatePlatformRolePermissions`: [superAdminRoleController.js](../../../../server/controllers/superAdminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updatePlatformRolePermissions`

Handler starts at [controller line 96](../../../../server/controllers/superAdminRoleController.js#L96). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `permissions`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`, `role`, `data`.
- Literal messages include: “Invalid role ID”; “Role not found”; “The Super Admin role permissions are protected.”; “One or more selected permissions are invalid.”; “Role permissions updated successfully.”.
- Database operations detected: `Role.findById`, `Permission.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 98](../../../../server/controllers/superAdminRoleController.js#L98): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });`
  - [Line 99](../../../../server/controllers/superAdminRoleController.js#L99): `const role = await Role.findById(req.params.id);`
  - [Line 100](../../../../server/controllers/superAdminRoleController.js#L100): `if (!role) return res.status(404).json({ success: false, message: "Role not found" });`
  - [Line 102](../../../../server/controllers/superAdminRoleController.js#L102): `if (["super_admin", "superadmin"].includes(normalized)) return res.status(403).json({ success: false, message: "The Super Admin role permissions are protected." });`
  - [Line 103](../../../../server/controllers/superAdminRoleController.js#L103): `const ids = normalizeIds(req.body?.permissions);`
  - [Line 105](../../../../server/controllers/superAdminRoleController.js#L105): `if (valid !== ids.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/superadmin/roles/<id>/permissions'
```

