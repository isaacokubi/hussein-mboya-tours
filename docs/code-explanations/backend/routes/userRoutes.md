# Route module: userRoutes.js

**Source:** [server/routes/userRoutes.js](../../../../server/routes/userRoutes.js)

Observed mount prefixes include `/api/users/profile`, `/api/users/guides`, `/api/users/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /profile → `/api/users/profile`

Declared at source line 45. Route handler pipeline names: `getUserProfile`.

```js
router.get(
  "/profile",
  getUserProfile
)
```

- Imported handler/middleware `getUserProfile`: [userController.js](../../../../server/controllers/userController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getUserProfile`

Handler starts at [controller line 12](../../../../server/controllers/userController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “User not found”.
- Database operations detected: `User.findById`.
- Input/validation source lines to inspect:
  - [Line 20](../../../../server/controllers/userController.js#L20): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/users/profile'
```

### PUT /profile → `/api/users/profile`

Declared at source line 50. Route handler pipeline names: `updateUserProfile`.

```js
router.put(
  "/profile",
  updateUserProfile
)
```

- Imported handler/middleware `updateUserProfile`: [userController.js](../../../../server/controllers/userController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateUserProfile`

Handler starts at [controller line 43](../../../../server/controllers/userController.js#L43). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Name cannot be empty.”; “Phone number cannot be empty.”; “User not found.”; “Profile updated successfully.”.
- Database operations detected: `User.findByIdAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 49](../../../../server/controllers/userController.js#L49): `if (req.body?.[field] !== undefined) {`
  - [Line 50](../../../../server/controllers/userController.js#L50): `update[field] = req.body[field];`
  - [Line 55](../../../../server/controllers/userController.js#L55): `return res.status(400).json({`
  - [Line 62](../../../../server/controllers/userController.js#L62): `return res.status(400).json({`
  - [Line 77](../../../../server/controllers/userController.js#L77): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/users/profile'
```

### GET /guides → `/api/users/guides`

Declared at source line 64. Route handler pipeline names: `roleMiddleware`, `getGuides`.

```js
router.get(
  "/guides",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  getGuides
)
```

- Imported handler/middleware `roleMiddleware`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `getGuides`: [userController.js](../../../../server/controllers/userController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getGuides`

Handler starts at [controller line 100](../../../../server/controllers/userController.js#L100). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `Staff.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/users/guides'
```

### DELETE /:id → `/api/users/:id`

Declared at source line 71. Route handler pipeline names: `roleMiddleware`, `deleteUser`.

```js
router.delete(
  "/:id",
  roleMiddleware("admin"),
  deleteUser
)
```

- Imported handler/middleware `roleMiddleware`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `deleteUser`: [userController.js](../../../../server/controllers/userController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteUser`

Handler starts at [controller line 133](../../../../server/controllers/userController.js#L133). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “User not found”; “User deleted successfully”.
- Database operations detected: `User.findOne`.
- Input/validation source lines to inspect:
  - [Line 139](../../../../server/controllers/userController.js#L139): `_id:req.params.id`
  - [Line 146](../../../../server/controllers/userController.js#L146): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/users/<id>'
```

