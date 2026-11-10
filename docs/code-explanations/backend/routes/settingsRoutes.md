# Route module: settingsRoutes.js

**Source:** [server/routes/settingsRoutes.js](../../../../server/routes/settingsRoutes.js)

Observed mount prefixes include `/api/admin/settings`, `/api/settings`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(authorize("settings.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/settings`, `/api/settings`

Declared at source line 14. Route handler pipeline names: `getSettings`.

```js
router.get("/", getSettings)
```

- Imported handler/middleware `getSettings`: [settingsController.js](../../../../server/controllers/settingsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getSettings`

Handler starts at [controller line 68](../../../../server/controllers/settingsController.js#L68). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `data`, `scope`.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/settings'
```

### PUT / → `/api/admin/settings`, `/api/settings`

Declared at source line 15. Route handler pipeline names: `updateSettings`.

```js
router.put("/", updateSettings)
```

- Imported handler/middleware `updateSettings`: [settingsController.js](../../../../server/controllers/settingsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateSettings`

Handler starts at [controller line 70](../../../../server/controllers/settingsController.js#L70). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Database operations detected: `SystemSetting.findOne`, `Organization.findById`, `Organization.findByIdAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 75](../../../../server/controllers/settingsController.js#L75): `const updates = normalizeUpdates(req.body); if (req.file?.path) updates.companyLogo = req.file.path; const validationError = validateUpdates(updates, settings); if (valid`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/settings'
```

