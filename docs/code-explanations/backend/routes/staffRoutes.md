# Route module: staffRoutes.js

**Source:** [server/routes/staffRoutes.js](../../../../server/routes/staffRoutes.js)

Observed mount prefixes include `/api/staff/guides`, `/api/staff/drivers`, `/api/staff`, `/api/staff/:id`, `/api/staff/:id/status`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /guides → `/api/staff/guides`

Declared at source line 29. Route handler pipeline names: `managerOnly`, `getGuides`.

```js
router.get("/guides", managerOnly, getGuides)
```

- Imported handler/middleware `managerOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `getGuides`: [staffController.js](../../../../server/controllers/staffController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getGuides`

Handler starts at [controller line 189](../../../../server/controllers/staffController.js#L189). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `Staff.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/staff/guides'
```

### GET /drivers → `/api/staff/drivers`

Declared at source line 30. Route handler pipeline names: `managerOnly`, `getDrivers`.

```js
router.get("/drivers", managerOnly, getDrivers)
```

- Imported handler/middleware `managerOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `getDrivers`: [staffController.js](../../../../server/controllers/staffController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getDrivers`

Handler starts at [controller line 196](../../../../server/controllers/staffController.js#L196). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `Staff.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/staff/drivers'
```

### POST / → `/api/staff`

Declared at source line 33. Route handler pipeline names: `adminOnly`, `createStaff`.

```js
router.post("/", adminOnly, createStaff)
```

- Imported handler/middleware `adminOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `createStaff`: [staffController.js](../../../../server/controllers/staffController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createStaff`

Handler starts at [controller line 77](../../../../server/controllers/staffController.js#L77). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Name, email, phone and position are required.”; “Staff created successfully”.
- Database operations detected: `Staff.findOne`, `Staff.create`.
- Input/validation source lines to inspect:
  - [Line 80](../../../../server/controllers/staffController.js#L80): `const body = req.body || {};`
  - [Line 83](../../../../server/controllers/staffController.js#L83): `if (!body.name?.trim() || !email || !phone || !body.position) return res.status(400).json({ success: false, message: "Name, email, phone and position are required." });`
  - [Line 87](../../../../server/controllers/staffController.js#L87): `return res.status(409).json({ success: false, message: \`A staff member with this ${field} already exists for this company.\` });`
  - [Line 93](../../../../server/controllers/staffController.js#L93): `if (error?.code === 11000) return res.status(409).json({ success: false, message: duplicateMessage(error) });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/staff'
```

### GET / → `/api/staff`

Declared at source line 34. Route handler pipeline names: `managerOnly`, `getStaff`.

```js
router.get("/", managerOnly, getStaff)
```

- Imported handler/middleware `managerOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `getStaff`: [staffController.js](../../../../server/controllers/staffController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getStaff`

Handler starts at [controller line 98](../../../../server/controllers/staffController.js#L98). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `includeInactive`, `position`, `availability`, `status`, `search`, `page`, `limit`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Staff.find`, `Staff.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 101](../../../../server/controllers/staffController.js#L101): `const { position, availability, status, search, page = 1, limit = 20 } = req.query;`
  - [Line 106](../../../../server/controllers/staffController.js#L106): `const includeInactive = role === "admin" && String(req.query.includeInactive || "").toLowerCase() === "true";`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/staff'
```

### GET /:id → `/api/staff/:id`

Declared at source line 35. Route handler pipeline names: `managerOnly`, `getStaffById`.

```js
router.get("/:id", managerOnly, getStaffById)
```

- Imported handler/middleware `managerOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `getStaffById`: [staffController.js](../../../../server/controllers/staffController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getStaffById`

Handler starts at [controller line 124](../../../../server/controllers/staffController.js#L124). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Staff member not found”.
- Database operations detected: `Staff.findOne`.
- Input/validation source lines to inspect:
  - [Line 126](../../../../server/controllers/staffController.js#L126): `const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("assignedTours", "title startDate endDate tourStatus");`
  - [Line 127](../../../../server/controllers/staffController.js#L127): `if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/staff/<id>'
```

### PUT /:id/status → `/api/staff/:id/status`

Declared at source line 36. Route handler pipeline names: `adminOnly`, `updateStaff`.

```js
router.put("/:id/status", adminOnly, updateStaff)
```

- Imported handler/middleware `adminOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `updateStaff`: [staffController.js](../../../../server/controllers/staffController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateStaff`

Handler starts at [controller line 133](../../../../server/controllers/staffController.js#L133). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `email`, `phone`, `role`, `position`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Staff member not found”; “A staff member with this email already exists for this company.”; “A staff member with this phone number already exists for this company.”; “Staff updated successfully”.
- Database operations detected: `Staff.findOne`, `User.findOne`, `Role.findOne`.
- Input/validation source lines to inspect:
  - [Line 135](../../../../server/controllers/staffController.js#L135): `const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 136](../../../../server/controllers/staffController.js#L136): `if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });`
  - [Line 137](../../../../server/controllers/staffController.js#L137): `if (req.body.email) {`
  - [Line 138](../../../../server/controllers/staffController.js#L138): `const email = String(req.body.email).trim().toLowerCase();`
  - [Line 140](../../../../server/controllers/staffController.js#L140): `if (duplicate) return res.status(409).json({ success: false, message: "A staff member with this email already exists for this company." });`
  - [Line 141](../../../../server/controllers/staffController.js#L141): `req.body.email = email;`
  - [Line 143](../../../../server/controllers/staffController.js#L143): `if (req.body.phone) {`
  - [Line 144](../../../../server/controllers/staffController.js#L144): `const phone = String(req.body.phone).trim();`
  - [Line 146](../../../../server/controllers/staffController.js#L146): `if (duplicate) return res.status(409).json({ success: false, message: "A staff member with this phone number already exists for this company." });`
  - [Line 147](../../../../server/controllers/staffController.js#L147): `req.body.phone = phone;`
  - [Line 149](../../../../server/controllers/staffController.js#L149): `const requestedIdentity = roleToStaffIdentity(req.body.role || req.body.position);`
  - [Line 150](../../../../server/controllers/staffController.js#L150): `Object.assign(staff, req.body, requestedIdentity || {});`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/staff/<id>/status'
```

### PUT /:id → `/api/staff/:id`

Declared at source line 37. Route handler pipeline names: `adminOnly`, `updateStaff`.

```js
router.put("/:id", adminOnly, updateStaff)
```

- Imported handler/middleware `adminOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `updateStaff`: [staffController.js](../../../../server/controllers/staffController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateStaff`

Handler starts at [controller line 133](../../../../server/controllers/staffController.js#L133). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `email`, `phone`, `role`, `position`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Staff member not found”; “A staff member with this email already exists for this company.”; “A staff member with this phone number already exists for this company.”; “Staff updated successfully”.
- Database operations detected: `Staff.findOne`, `User.findOne`, `Role.findOne`.
- Input/validation source lines to inspect:
  - [Line 135](../../../../server/controllers/staffController.js#L135): `const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 136](../../../../server/controllers/staffController.js#L136): `if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });`
  - [Line 137](../../../../server/controllers/staffController.js#L137): `if (req.body.email) {`
  - [Line 138](../../../../server/controllers/staffController.js#L138): `const email = String(req.body.email).trim().toLowerCase();`
  - [Line 140](../../../../server/controllers/staffController.js#L140): `if (duplicate) return res.status(409).json({ success: false, message: "A staff member with this email already exists for this company." });`
  - [Line 141](../../../../server/controllers/staffController.js#L141): `req.body.email = email;`
  - [Line 143](../../../../server/controllers/staffController.js#L143): `if (req.body.phone) {`
  - [Line 144](../../../../server/controllers/staffController.js#L144): `const phone = String(req.body.phone).trim();`
  - [Line 146](../../../../server/controllers/staffController.js#L146): `if (duplicate) return res.status(409).json({ success: false, message: "A staff member with this phone number already exists for this company." });`
  - [Line 147](../../../../server/controllers/staffController.js#L147): `req.body.phone = phone;`
  - [Line 149](../../../../server/controllers/staffController.js#L149): `const requestedIdentity = roleToStaffIdentity(req.body.role || req.body.position);`
  - [Line 150](../../../../server/controllers/staffController.js#L150): `Object.assign(staff, req.body, requestedIdentity || {});`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/staff/<id>'
```

### DELETE /:id → `/api/staff/:id`

Declared at source line 38. Route handler pipeline names: `adminOnly`, `deleteStaff`.

```js
router.delete("/:id", adminOnly, deleteStaff)
```

- Imported handler/middleware `adminOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `deleteStaff`: [staffController.js](../../../../server/controllers/staffController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteStaff`

Handler starts at [controller line 170](../../../../server/controllers/staffController.js#L170). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Staff member not found”; “Staff member could not be deleted. Please refresh and try again.”; “Staff member permanently deleted”.
- Database operations detected: `Staff.findOne`, `Staff.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 172](../../../../server/controllers/staffController.js#L172): `const filter = mergeTenantFilter(req, { _id: req.params.id });`
  - [Line 174](../../../../server/controllers/staffController.js#L174): `if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });`
  - [Line 176](../../../../server/controllers/staffController.js#L176): `if (result.deletedCount !== 1) return res.status(409).json({ success: false, message: "Staff member could not be deleted. Please refresh and try again." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/staff/<id>'
```

