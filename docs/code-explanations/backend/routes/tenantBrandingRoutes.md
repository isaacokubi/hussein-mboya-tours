# Route module: tenantBrandingRoutes.js

**Source:** [server/routes/tenantBrandingRoutes.js](../../../../server/routes/tenantBrandingRoutes.js)

Observed mount prefixes include `/api/tenant`, `/api/tenant/branding`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/tenant`, `/api/tenant/branding`

Declared at source line 10. Route handler pipeline names: `getBranding`.

```js
router.get("/", getBranding)
```

- Imported handler/middleware `getBranding`: [tenantBrandingController.js](../../../../server/controllers/tenantBrandingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getBranding`

Handler starts at [controller line 4](../../../../server/controllers/tenantBrandingController.js#L4). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tenant not resolved”; “Tenant not found”.
- Database operations detected: `Organization.findById`.
- Input/validation source lines to inspect:
  - [Line 6](../../../../server/controllers/tenantBrandingController.js#L6): `if (!req.tenantId) return res.status(404).json({ success: false, message: "Tenant not resolved" });`
  - [Line 9](../../../../server/controllers/tenantBrandingController.js#L9): `if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tenant'
```

### PUT / → `/api/tenant`, `/api/tenant/branding`

Declared at source line 11. Route handler pipeline names: `protect`, `requireRoles`, `updateBranding`.

```js
router.put("/", protect, requireRoles("admin", "manager"), updateBranding)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `requireRoles`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `updateBranding`: [tenantBrandingController.js](../../../../server/controllers/tenantBrandingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateBranding`

Handler starts at [controller line 38](../../../../server/controllers/tenantBrandingController.js#L38). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tenant not resolved”; “Tenant not found”; “That custom domain is already assigned to another company.”.
- Database operations detected: `Organization.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 40](../../../../server/controllers/tenantBrandingController.js#L40): `if (!req.tenantId) return res.status(400).json({ success: false, message: "Tenant not resolved" });`
  - [Line 47](../../../../server/controllers/tenantBrandingController.js#L47): `for (const key of allowed) if (req.body?.[key] !== undefined) updates[key] = req.body[key];`
  - [Line 55](../../../../server/controllers/tenantBrandingController.js#L55): `if (!updated) return res.status(404).json({ success: false, message: "Tenant not found" });`
  - [Line 73](../../../../server/controllers/tenantBrandingController.js#L73): `if (error?.code === 11000) return res.status(409).json({ success: false, message: "That custom domain is already assigned to another company." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/tenant'
```

