# Route module: tenantSubscriptionRoutes.js

**Source:** [server/routes/tenantSubscriptionRoutes.js](../../../../server/routes/tenantSubscriptionRoutes.js)

Observed mount prefixes include `/api/subscription`, `/api/subscription/mpesa`, `/api/subscription/payment/:checkoutRequestId`.

## Router-wide middleware

- `router.use(protect, resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/subscription`

Declared at source line 8. Route handler pipeline names: `getTenantSubscription`.

```js
router.get("/", getTenantSubscription)
```

- Imported handler/middleware `getTenantSubscription`: [tenantSubscriptionController.js](../../../../server/controllers/tenantSubscriptionController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTenantSubscription`

Handler starts at [controller line 11](../../../../server/controllers/tenantSubscriptionController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `tenant`, `subscription`, `amountDue`, `featureCatalog`.
- Literal messages include: “No tenant is selected.”; “Company not found.”.
- Database operations detected: `Organization.findById`, `Subscription.findOne`, `SubscriptionPayment.find`.
- Input/validation source lines to inspect:
  - [Line 14](../../../../server/controllers/tenantSubscriptionController.js#L14): `if (!tenantId) return res.status(400).json({ success: false, message: "No tenant is selected." });`
  - [Line 16](../../../../server/controllers/tenantSubscriptionController.js#L16): `if (!organization) return res.status(404).json({ success: false, message: "Company not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/subscription'
```

### POST /mpesa → `/api/subscription/mpesa`

Declared at source line 9. Route handler pipeline names: `startTenantSubscriptionPayment`.

```js
router.post("/mpesa", startTenantSubscriptionPayment)
```

- Imported handler/middleware `startTenantSubscriptionPayment`: [tenantSubscriptionController.js](../../../../server/controllers/tenantSubscriptionController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `startTenantSubscriptionPayment`

Handler starts at [controller line 26](../../../../server/controllers/tenantSubscriptionController.js#L26). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `plan`, `phone`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `400`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Only the company administrator can pay for the company subscription.”; “The selected plan price is not configured by the platform owner.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 29](../../../../server/controllers/tenantSubscriptionController.js#L29): `if (!tenantId || !isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the company administrator can pay for the company subscription." });`
  - [Line 30](../../../../server/controllers/tenantSubscriptionController.js#L30): `const plan = String(req.body?.plan || "").toLowerCase();`
  - [Line 31](../../../../server/controllers/tenantSubscriptionController.js#L31): `const phone = String(req.body?.phone || req.user?.phone || "").trim();`
  - [Line 33](../../../../server/controllers/tenantSubscriptionController.js#L33): `if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ success: false, message: "The selected plan price is not configured by the platform owner." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/subscription/mpesa'
```

### GET /payment/:checkoutRequestId → `/api/subscription/payment/:checkoutRequestId`

Declared at source line 10. Route handler pipeline names: `getTenantSubscriptionPaymentStatus`.

```js
router.get("/payment/:checkoutRequestId", getTenantSubscriptionPaymentStatus)
```

- Imported handler/middleware `getTenantSubscriptionPaymentStatus`: [tenantSubscriptionController.js](../../../../server/controllers/tenantSubscriptionController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTenantSubscriptionPaymentStatus`

Handler starts at [controller line 39](../../../../server/controllers/tenantSubscriptionController.js#L39). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `checkoutRequestId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Subscription payment not found.”.
- Database operations detected: `SubscriptionPayment.findOne`.
- Input/validation source lines to inspect:
  - [Line 41](../../../../server/controllers/tenantSubscriptionController.js#L41): `const payment = await SubscriptionPayment.findOne({ checkoutRequestID: req.params.checkoutRequestId, tenantId: req.tenantId || req.user?.tenantId }).lean();`
  - [Line 42](../../../../server/controllers/tenantSubscriptionController.js#L42): `if (!payment) return res.status(404).json({ success: false, message: "Subscription payment not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/subscription/payment/<checkoutRequestId>'
```

