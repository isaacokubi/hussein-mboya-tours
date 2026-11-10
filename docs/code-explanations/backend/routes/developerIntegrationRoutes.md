# Route module: developerIntegrationRoutes.js

**Source:** [server/routes/developerIntegrationRoutes.js](../../../../server/routes/developerIntegrationRoutes.js)

Observed mount prefixes include `/api/admin/developer/api-keys`, `/api/admin/developer/api-keys/:id/revoke`, `/api/admin/developer/webhooks`, `/api/admin/developer/webhooks/:id`, `/api/admin/developer/webhooks/:id/test`.

## Router-wide middleware

- `router.use(resolveTenant, protect, checkPermission("system.security"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /api-keys → `/api/admin/developer/api-keys`

Declared at source line 9. Route handler pipeline names: `listApiKeys`.

```js
router.get("/api-keys", listApiKeys)
```

- Imported handler/middleware `listApiKeys`: [developerIntegrationController.js](../../../../server/controllers/developerIntegrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listApiKeys`

Handler starts at [controller line 12](../../../../server/controllers/developerIntegrationController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `ApiKey.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/developer/api-keys'
```

### POST /api-keys → `/api/admin/developer/api-keys`

Declared at source line 10. Route handler pipeline names: `createApiKey`.

```js
router.post("/api-keys", createApiKey)
```

- Imported handler/middleware `createApiKey`: [developerIntegrationController.js](../../../../server/controllers/developerIntegrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createApiKey`

Handler starts at [controller line 16](../../../../server/controllers/developerIntegrationController.js#L16). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `scopes`, `expiresAt`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `ApiKey.create`.
- Input/validation source lines to inspect:
  - [Line 19](../../../../server/controllers/developerIntegrationController.js#L19): `const doc = await ApiKey.create({ tenantId: tenantId(req), name: String(req.body?.name || "API key").trim(), prefix: raw.slice(0, 11), secretHash: ApiKey.hashSecret(raw),`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/developer/api-keys'
```

### POST /api-keys/:id/revoke → `/api/admin/developer/api-keys/:id/revoke`

Declared at source line 11. Route handler pipeline names: `revokeApiKey`.

```js
router.post("/api-keys/:id/revoke", revokeApiKey)
```

- Imported handler/middleware `revokeApiKey`: [developerIntegrationController.js](../../../../server/controllers/developerIntegrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `revokeApiKey`

Handler starts at [controller line 24](../../../../server/controllers/developerIntegrationController.js#L24). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “API key not found.”.
- Database operations detected: `ApiKey.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 25](../../../../server/controllers/developerIntegrationController.js#L25): `try { const doc = await ApiKey.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, { revokedAt: new Date() }, { new: true }); if (!doc) return res.status(404).`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/developer/api-keys/<id>/revoke'
```

### GET /webhooks → `/api/admin/developer/webhooks`

Declared at source line 12. Route handler pipeline names: `listWebhooks`.

```js
router.get("/webhooks", listWebhooks)
```

- Imported handler/middleware `listWebhooks`: [developerIntegrationController.js](../../../../server/controllers/developerIntegrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listWebhooks`

Handler starts at [controller line 28](../../../../server/controllers/developerIntegrationController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Webhook.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/developer/webhooks'
```

### POST /webhooks → `/api/admin/developer/webhooks`

Declared at source line 13. Route handler pipeline names: `createWebhook`.

```js
router.post("/webhooks", createWebhook)
```

- Imported handler/middleware `createWebhook`: [developerIntegrationController.js](../../../../server/controllers/developerIntegrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createWebhook`

Handler starts at [controller line 32](../../../../server/controllers/developerIntegrationController.js#L32). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `url`, `events`, `name`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Webhook contains unsupported event types.”.
- Database operations detected: `Webhook.create`.
- Input/validation source lines to inspect:
  - [Line 34](../../../../server/controllers/developerIntegrationController.js#L34): `const url = await validateWebhookUrl(req.body?.url);`
  - [Line 35](../../../../server/controllers/developerIntegrationController.js#L35): `const requestedEvents = Array.isArray(req.body?.events) ? req.body.events.map(String).filter((event) => allowedEvents.has(event)) : [];`
  - [Line 36](../../../../server/controllers/developerIntegrationController.js#L36): `if (Array.isArray(req.body?.events) && requestedEvents.length !== req.body.events.length) return res.status(400).json({ success: false, message: "Webhook contains unsuppo`
  - [Line 38](../../../../server/controllers/developerIntegrationController.js#L38): `const doc = await Webhook.create({ tenantId: tenantId(req), name: String(req.body?.name || "Webhook").trim(), url, secret: await protectWebhookSecret(secret), events: req`
  - [Line 40](../../../../server/controllers/developerIntegrationController.js#L40): `} catch (e) { if (/Webhook URL|private|local|resolves|credentials/i.test(String(e.message))) return res.status(400).json({ success: false, message: e.message }); next(e);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/developer/webhooks'
```

### PATCH /webhooks/:id → `/api/admin/developer/webhooks/:id`

Declared at source line 14. Route handler pipeline names: `updateWebhook`.

```js
router.patch("/webhooks/:id", updateWebhook)
```

- Imported handler/middleware `updateWebhook`: [developerIntegrationController.js](../../../../server/controllers/developerIntegrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateWebhook`

Handler starts at [controller line 43](../../../../server/controllers/developerIntegrationController.js#L43). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `url`, `events`, `active`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Webhook contains unsupported event types.”; “Webhook not found.”.
- Database operations detected: `Webhook.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 46](../../../../server/controllers/developerIntegrationController.js#L46): `if (req.body?.name !== undefined) patch.name = String(req.body.name).trim();`
  - [Line 47](../../../../server/controllers/developerIntegrationController.js#L47): `if (req.body?.url !== undefined) patch.url = await validateWebhookUrl(req.body.url);`
  - [Line 48](../../../../server/controllers/developerIntegrationController.js#L48): `if (req.body?.events !== undefined) {`
  - [Line 49](../../../../server/controllers/developerIntegrationController.js#L49): `if (!Array.isArray(req.body.events) || req.body.events.some((event) => !allowedEvents.has(String(event)))) return res.status(400).json({ success: false, message: "Webhook`
  - [Line 50](../../../../server/controllers/developerIntegrationController.js#L50): `patch.events = req.body.events.map(String);`
  - [Line 52](../../../../server/controllers/developerIntegrationController.js#L52): `if (req.body?.active !== undefined) patch.active = Boolean(req.body.active);`
  - [Line 53](../../../../server/controllers/developerIntegrationController.js#L53): `const doc = await Webhook.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, patch, { new: true, runValidators: true }).select("-secret");`
  - [Line 54](../../../../server/controllers/developerIntegrationController.js#L54): `if (!doc) return res.status(404).json({ success: false, message: "Webhook not found." });`
  - [Line 56](../../../../server/controllers/developerIntegrationController.js#L56): `} catch (e) { if (/Webhook URL|private|local|resolves|credentials/i.test(String(e.message))) return res.status(400).json({ success: false, message: e.message }); next(e);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/developer/webhooks/<id>'
```

### POST /webhooks/:id/test → `/api/admin/developer/webhooks/:id/test`

Declared at source line 15. Route handler pipeline names: `testWebhook`.

```js
router.post("/webhooks/:id/test", testWebhook)
```

- Imported handler/middleware `testWebhook`: [developerIntegrationController.js](../../../../server/controllers/developerIntegrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `testWebhook`

Handler starts at [controller line 59](../../../../server/controllers/developerIntegrationController.js#L59). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `202`.
- JSON envelope keys observed: `success`, `message`, `jobId`.
- Literal messages include: “Webhook not found.”; “Activate the webhook before sending a test delivery.”; “Select at least one webhook event before testing delivery.”; “This is a test delivery from Global Tours.”; “Webhook test queued for delivery.”.
- Database operations detected: `Webhook.findOne`.
- Input/validation source lines to inspect:
  - [Line 61](../../../../server/controllers/developerIntegrationController.js#L61): `const hook = await Webhook.findOne({ ...tenantFilter(req), _id: req.params.id }).select("_id events active").lean();`
  - [Line 62](../../../../server/controllers/developerIntegrationController.js#L62): `if (!hook) return res.status(404).json({ success: false, message: "Webhook not found." });`
  - [Line 63](../../../../server/controllers/developerIntegrationController.js#L63): `if (!hook.active) return res.status(409).json({ success: false, message: "Activate the webhook before sending a test delivery." });`
  - [Line 65](../../../../server/controllers/developerIntegrationController.js#L65): `if (!event) return res.status(409).json({ success: false, message: "Select at least one webhook event before testing delivery." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/developer/webhooks/<id>/test'
```

### DELETE /webhooks/:id → `/api/admin/developer/webhooks/:id`

Declared at source line 16. Route handler pipeline names: `deleteWebhook`.

```js
router.delete("/webhooks/:id", deleteWebhook)
```

- Imported handler/middleware `deleteWebhook`: [developerIntegrationController.js](../../../../server/controllers/developerIntegrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteWebhook`

Handler starts at [controller line 86](../../../../server/controllers/developerIntegrationController.js#L86). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Webhook not found.”; “Webhook deleted.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 87](../../../../server/controllers/developerIntegrationController.js#L87): `try { const doc = await Webhook.findOneAndDelete({ ...tenantFilter(req), _id: req.params.id }); if (!doc) return res.status(404).json({ success: false, message: "Webhook `

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/developer/webhooks/<id>'
```

