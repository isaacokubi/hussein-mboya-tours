# Route module: adminRoleRoutes.js

**Source:** [server/routes/adminRoleRoutes.js](../../../../server/routes/adminRoleRoutes.js)

Observed mount prefixes include `/api/admin/roles`, `/api/admin/roles/permissions/all`, `/api/admin/roles/:id`, `/api/admin/roles/:id/permissions`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(checkPermission("roles.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/roles`

Declared at source line 46. Route handler pipeline names: `getRoles`.

```js
router.get(
"/",
getRoles
)
```

- Imported handler/middleware `getRoles`: [adminRoleController.js](../../../../server/controllers/adminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getRoles`

Handler starts at [controller line 213](../../../../server/controllers/adminRoleController.js#L213). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`, `roles`.
- Database operations detected: `Role.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/roles'
```

### GET /permissions/all → `/api/admin/roles/permissions/all`

Declared at source line 51. Route handler pipeline names: `getPermissions`.

```js
router.get(
"/permissions/all",
getPermissions
)
```

- Imported handler/middleware `getPermissions`: [adminRoleController.js](../../../../server/controllers/adminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPermissions`

Handler starts at [controller line 223](../../../../server/controllers/adminRoleController.js#L223). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Permission.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/roles/permissions/all'
```

### GET /:id → `/api/admin/roles/:id`

Declared at source line 58. Route handler pipeline names: `getRole`.

```js
router.get(
"/:id",
getRole
)
```

- Imported handler/middleware `getRole`: [adminRoleController.js](../../../../server/controllers/adminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getRole`

Handler starts at [controller line 233](../../../../server/controllers/adminRoleController.js#L233). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid role ID”; “Role not found”.
- Database operations detected: `Role.findOne`.
- Input/validation source lines to inspect:
  - [Line 235](../../../../server/controllers/adminRoleController.js#L235): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });`
  - [Line 236](../../../../server/controllers/adminRoleController.js#L236): `const roleDoc = await Role.findOne(tenantFilter(req, { _id: req.params.id })).lean();`
  - [Line 237](../../../../server/controllers/adminRoleController.js#L237): `if (!roleDoc) return res.status(404).json({ success: false, message: "Role not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/roles/<id>'
```

### POST / → `/api/admin/roles`

Declared at source line 65. Route handler pipeline names: `createRole`.

```js
router.post(
"/",
createRole
)
```

- Imported handler/middleware `createRole`: [adminRoleController.js](../../../../server/controllers/adminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createRole`

Handler starts at [controller line 245](../../../../server/controllers/adminRoleController.js#L245). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `displayName`, `description`, `permissions`, `level`, `status`, `isDefault`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Role name and display name are required.”; “A valid role name is required.”; “Use the canonical role name for this role.”; “One or more selected permissions are invalid.”; “A role with this name already exists.”.
- Database operations detected: `Permission.countDocuments`, `Role.findOne`, `Role.create`.
- Input/validation source lines to inspect:
  - [Line 248](../../../../server/controllers/adminRoleController.js#L248): `const { name, displayName, description = "", permissions = [], level = 1, status = "active", isDefault = false } = req.body;`
  - [Line 249](../../../../server/controllers/adminRoleController.js#L249): `if (!name || !displayName) return res.status(400).json({ success: false, message: "Role name and display name are required." });`
  - [Line 252](../../../../server/controllers/adminRoleController.js#L252): `if (!normalizedName) return res.status(400).json({ success: false, message: "A valid role name is required." });`
  - [Line 253](../../../../server/controllers/adminRoleController.js#L253): `if (normalizedName !== String(name).trim().toLowerCase().replace(/\s+/g, "_")) return res.status(400).json({ success: false, message: "Use the canonical role name for thi`
  - [Line 257](../../../../server/controllers/adminRoleController.js#L257): `if (validPermissions !== permissionIds.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });`
  - [Line 261](../../../../server/controllers/adminRoleController.js#L261): `return res.status(409).json({ success: false, message: "A role with this name already exists." });`
  - [Line 278](../../../../server/controllers/adminRoleController.js#L278): `if (error?.code === 11000) return res.status(409).json({ success: false, message: "A role with this name already exists." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/roles'
```

### PUT /:id → `/api/admin/roles/:id`

Declared at source line 72. Route handler pipeline names: `updateRole`.

```js
router.put(
"/:id",
updateRole
)
```

- Imported handler/middleware `updateRole`: [adminRoleController.js](../../../../server/controllers/adminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateRole`

Handler starts at [controller line 283](../../../../server/controllers/adminRoleController.js#L283). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `displayName`, `description`, `level`, `status`, `isDefault`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid role ID”; “Role not found”; “The Super Admin role is protected and cannot be modified.”.
- Database operations detected: `Role.findOne`.
- Input/validation source lines to inspect:
  - [Line 285](../../../../server/controllers/adminRoleController.js#L285): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });`
  - [Line 286](../../../../server/controllers/adminRoleController.js#L286): `const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));`
  - [Line 287](../../../../server/controllers/adminRoleController.js#L287): `if (!role) return res.status(404).json({ success: false, message: "Role not found" });`
  - [Line 288](../../../../server/controllers/adminRoleController.js#L288): `if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role is protected and cannot be modified." });`
  - [Line 290](../../../../server/controllers/adminRoleController.js#L290): `if (Object.prototype.hasOwnProperty.call(req.body, "displayName")) role.displayName = String(req.body.displayName || "").trim();`
  - [Line 291](../../../../server/controllers/adminRoleController.js#L291): `if (Object.prototype.hasOwnProperty.call(req.body, "description")) role.description = String(req.body.description || "").trim();`
  - [Line 292](../../../../server/controllers/adminRoleController.js#L292): `if (Object.prototype.hasOwnProperty.call(req.body, "level")) role.level = Math.max(1, Number(req.body.level) || 1);`
  - [Line 293](../../../../server/controllers/adminRoleController.js#L293): `if (Object.prototype.hasOwnProperty.call(req.body, "status")) role.status = req.body.status === "inactive" ? "inactive" : "active";`
  - [Line 294](../../../../server/controllers/adminRoleController.js#L294): `if (Object.prototype.hasOwnProperty.call(req.body, "isDefault")) role.isDefault = Boolean(req.body.isDefault);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/roles/<id>'
```

### PATCH /:id → `/api/admin/roles/:id`

Declared at source line 77. Route handler pipeline names: `updateRole`.

```js
router.patch(
"/:id",
updateRole
)
```

- Imported handler/middleware `updateRole`: [adminRoleController.js](../../../../server/controllers/adminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateRole`

Handler starts at [controller line 283](../../../../server/controllers/adminRoleController.js#L283). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `displayName`, `description`, `level`, `status`, `isDefault`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid role ID”; “Role not found”; “The Super Admin role is protected and cannot be modified.”.
- Database operations detected: `Role.findOne`.
- Input/validation source lines to inspect:
  - [Line 285](../../../../server/controllers/adminRoleController.js#L285): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });`
  - [Line 286](../../../../server/controllers/adminRoleController.js#L286): `const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));`
  - [Line 287](../../../../server/controllers/adminRoleController.js#L287): `if (!role) return res.status(404).json({ success: false, message: "Role not found" });`
  - [Line 288](../../../../server/controllers/adminRoleController.js#L288): `if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role is protected and cannot be modified." });`
  - [Line 290](../../../../server/controllers/adminRoleController.js#L290): `if (Object.prototype.hasOwnProperty.call(req.body, "displayName")) role.displayName = String(req.body.displayName || "").trim();`
  - [Line 291](../../../../server/controllers/adminRoleController.js#L291): `if (Object.prototype.hasOwnProperty.call(req.body, "description")) role.description = String(req.body.description || "").trim();`
  - [Line 292](../../../../server/controllers/adminRoleController.js#L292): `if (Object.prototype.hasOwnProperty.call(req.body, "level")) role.level = Math.max(1, Number(req.body.level) || 1);`
  - [Line 293](../../../../server/controllers/adminRoleController.js#L293): `if (Object.prototype.hasOwnProperty.call(req.body, "status")) role.status = req.body.status === "inactive" ? "inactive" : "active";`
  - [Line 294](../../../../server/controllers/adminRoleController.js#L294): `if (Object.prototype.hasOwnProperty.call(req.body, "isDefault")) role.isDefault = Boolean(req.body.isDefault);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/roles/<id>'
```

### DELETE /:id → `/api/admin/roles/:id`

Declared at source line 84. Route handler pipeline names: `deleteRole`.

```js
router.delete(
"/:id",
deleteRole
)
```

- Imported handler/middleware `deleteRole`: [adminRoleController.js](../../../../server/controllers/adminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteRole`

Handler starts at [controller line 303](../../../../server/controllers/adminRoleController.js#L303). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid role ID”; “Role not found”; “The Super Admin role cannot be deleted.”; “System roles cannot be deleted. You may modify their permissions instead.”; “Role deleted”.
- Database operations detected: `Role.findOne`.
- Input/validation source lines to inspect:
  - [Line 305](../../../../server/controllers/adminRoleController.js#L305): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });`
  - [Line 306](../../../../server/controllers/adminRoleController.js#L306): `const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));`
  - [Line 307](../../../../server/controllers/adminRoleController.js#L307): `if (!role) return res.status(404).json({ success: false, message: "Role not found" });`
  - [Line 308](../../../../server/controllers/adminRoleController.js#L308): `if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role cannot be deleted." });`
  - [Line 309](../../../../server/controllers/adminRoleController.js#L309): `if (role.isSystem) return res.status(403).json({ success: false, message: "System roles cannot be deleted. You may modify their permissions instead." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/roles/<id>'
```

### PUT /:id/permissions → `/api/admin/roles/:id/permissions`

Declared at source line 91. Route handler pipeline names: `updatePermissions`.

```js
router.put(
"/:id/permissions",
updatePermissions
)
```

- Imported handler/middleware `updatePermissions`: [adminRoleController.js](../../../../server/controllers/adminRoleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updatePermissions`

Handler starts at [controller line 317](../../../../server/controllers/adminRoleController.js#L317). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `permissions`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid role ID”; “Role not found”; “The Super Admin role permissions cannot be modified.”; “One or more selected permissions are invalid.”.
- Database operations detected: `Role.findOne`, `Permission.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 319](../../../../server/controllers/adminRoleController.js#L319): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });`
  - [Line 320](../../../../server/controllers/adminRoleController.js#L320): `const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));`
  - [Line 321](../../../../server/controllers/adminRoleController.js#L321): `if (!role) return res.status(404).json({ success: false, message: "Role not found" });`
  - [Line 322](../../../../server/controllers/adminRoleController.js#L322): `if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role permissions cannot be modified." });`
  - [Line 324](../../../../server/controllers/adminRoleController.js#L324): `const permissionIds = sanitizePermissionIds(req.body.permissions);`
  - [Line 327](../../../../server/controllers/adminRoleController.js#L327): `if (validPermissions !== permissionIds.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/roles/<id>/permissions'
```

