# Route module: websiteLeadRoutes.js

**Source:** [server/routes/websiteLeadRoutes.js](../../../../server/routes/websiteLeadRoutes.js)

No observed mount was found in the main API or app setup; the declarations are not assumed reachable.

## Router-wide middleware

No router.use declaration was found at module scope.

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /v1/leads (unmounted declaration)

Declared at source line 9. Route handler pipeline names: `requirePublicIntegrationKey`, `requireIntegrationPermission`, `createWebsiteLead`.

```js
router.post("/v1/leads", requirePublicIntegrationKey, requireIntegrationPermission("lead:create"), createWebsiteLead)
```

- Imported handler/middleware `requirePublicIntegrationKey`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `requireIntegrationPermission`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `createWebsiteLead`: [websiteLeadController.js](../../../../server/controllers/websiteLeadController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createWebsiteLead`

Handler starts at [controller line 28](../../../../server/controllers/websiteLeadController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Customer phone number is required.”; “Enter a valid email address.”; “Lead captured successfully.”.
- Database operations detected: `Tour.findOne`, `Lead.create`.
- Input/validation source lines to inspect:
  - [Line 31](../../../../server/controllers/websiteLeadController.js#L31): `const body = req.body || {};`
  - [Line 40](../../../../server/controllers/websiteLeadController.js#L40): `if (!phone) return res.status(400).json({ success: false, message: "Customer phone number is required." });`
  - [Line 41](../../../../server/controllers/websiteLeadController.js#L41): `if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email address." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/v1/leads'
```

### GET /leads (unmounted declaration)

Declared at source line 10. Route handler pipeline names: `protect`, `authorize`, `listWebsiteLeads`.

```js
router.get("/leads", protect, authorize("settings.manage"), listWebsiteLeads)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listWebsiteLeads`: [websiteLeadController.js](../../../../server/controllers/websiteLeadController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listWebsiteLeads`

Handler starts at [controller line 84](../../../../server/controllers/websiteLeadController.js#L84). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `limit`, `status`, `search`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Lead.find`.
- Input/validation source lines to inspect:
  - [Line 87](../../../../server/controllers/websiteLeadController.js#L87): `const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);`
  - [Line 89](../../../../server/controllers/websiteLeadController.js#L89): `if (req.query.status) filter.status = clean(req.query.status, 30);`
  - [Line 90](../../../../server/controllers/websiteLeadController.js#L90): `if (req.query.search) {`
  - [Line 91](../../../../server/controllers/websiteLeadController.js#L91): `const search = clean(req.query.search, 120);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/leads'
```

### PATCH /leads/:id (unmounted declaration)

Declared at source line 11. Route handler pipeline names: `protect`, `authorize`, `updateWebsiteLead`.

```js
router.patch("/leads/:id", protect, authorize("settings.manage"), updateWebsiteLead)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `updateWebsiteLead`: [websiteLeadController.js](../../../../server/controllers/websiteLeadController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateWebsiteLead`

Handler starts at [controller line 99](../../../../server/controllers/websiteLeadController.js#L99). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Lead not found.”.
- Database operations detected: `Lead.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 103](../../../../server/controllers/websiteLeadController.js#L103): `for (const key of ["status", "message", "lastContactedAt", "convertedBooking"]) if (req.body?.[key] !== undefined) updates[key] = req.body[key];`
  - [Line 104](../../../../server/controllers/websiteLeadController.js#L104): `const lead = await Lead.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenantId }, { $set: updates }, { new: true, runValidators: true }).lean();`
  - [Line 105](../../../../server/controllers/websiteLeadController.js#L105): `if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/leads/<id>'
```

