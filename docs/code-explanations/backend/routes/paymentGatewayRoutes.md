# Route module: paymentGatewayRoutes.js

**Source:** [server/routes/paymentGatewayRoutes.js](../../../../server/routes/paymentGatewayRoutes.js)

Observed mount prefixes include `/api/admin/payment-gateways`, `/api/admin/payment-gateways/:provider`, `/api/admin/payment-gateways/MPESA/validate`, `/api/admin/payment-gateways/STRIPE/validate`, `/api/admin/payment-gateways/PAYPAL/validate`.

## Router-wide middleware

- `router.use(resolveTenant, protect, authorize("settings.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/payment-gateways`

Declared at source line 10. Route handler pipeline names: `listGatewayConfigs`.

```js
router.get("/", listGatewayConfigs)
```

- Imported handler/middleware `listGatewayConfigs`: [paymentGatewayController.js](../../../../server/controllers/paymentGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listGatewayConfigs`

Handler starts at [controller line 17](../../../../server/controllers/paymentGatewayController.js#L17). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `PaymentGatewayConfig.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payment-gateways'
```

### GET /:provider → `/api/admin/payment-gateways/:provider`

Declared at source line 11. Route handler pipeline names: `getGatewayConfig`.

```js
router.get("/:provider", getGatewayConfig)
```

- Imported handler/middleware `getGatewayConfig`: [paymentGatewayController.js](../../../../server/controllers/paymentGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getGatewayConfig`

Handler starts at [controller line 143](../../../../server/controllers/paymentGatewayController.js#L143). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `provider`; query parameters read: `environment`.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Unsupported payment provider.”; “Environment must be sandbox or production.”.
- Database operations detected: `PaymentGatewayConfig.findOne`.
- Input/validation source lines to inspect:
  - [Line 146](../../../../server/controllers/paymentGatewayController.js#L146): `const provider = String(req.params.provider || "").toUpperCase();`
  - [Line 147](../../../../server/controllers/paymentGatewayController.js#L147): `if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });`
  - [Line 150](../../../../server/controllers/paymentGatewayController.js#L150): `const requestedEnvironment = String(req.query?.environment || "").toLowerCase();`
  - [Line 152](../../../../server/controllers/paymentGatewayController.js#L152): `return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });`
  - [Line 154](../../../../server/controllers/paymentGatewayController.js#L154): `if (provider === "PAYPAL" && requestedEnvironment && !["sandbox", "production"].includes(requestedEnvironment)) return res.status(400).json({ success: false, message: "En`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payment-gateways/<provider>'
```

### PUT /:provider → `/api/admin/payment-gateways/:provider`

Declared at source line 12. Route handler pipeline names: `upsertGatewayConfig`.

```js
router.put("/:provider", upsertGatewayConfig)
```

- Imported handler/middleware `upsertGatewayConfig`: [paymentGatewayController.js](../../../../server/controllers/paymentGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `upsertGatewayConfig`

Handler starts at [controller line 37](../../../../server/controllers/paymentGatewayController.js#L37). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `provider`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Unsupported payment provider.”; “Environment must be sandbox or production.”; “To enable M-Pesa, provide Consumer Key, Consumer Secret, Passkey, Shortcode and a public HTTPS Callback URL.”; “PayPal credentials must be text values.”; “PayPal webhook ID must be a text value.”; “PayPal merchant ID must be a text value.”; “To enable PayPal, configure the selected environment”; “Save PayPal credentials with the gateway disabled, validate OAuth connectivity, then enable the gateway.”.
- Database operations detected: `PaymentGatewayConfig.findOne`, `PaymentGatewayConfig.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 40](../../../../server/controllers/paymentGatewayController.js#L40): `const provider = String(req.params.provider || "").toUpperCase();`
  - [Line 41](../../../../server/controllers/paymentGatewayController.js#L41): `if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });`
  - [Line 43](../../../../server/controllers/paymentGatewayController.js#L43): `const body = req.body || {};`
  - [Line 45](../../../../server/controllers/paymentGatewayController.js#L45): `return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });`
  - [Line 71](../../../../server/controllers/paymentGatewayController.js#L71): `return res.status(400).json({`
  - [Line 80](../../../../server/controllers/paymentGatewayController.js#L80): `if (validationError) return res.status(400).json({ success: false, message: validationError });`
  - [Line 105](../../../../server/controllers/paymentGatewayController.js#L105): `if (body.clientId !== undefined && typeof body.clientId !== "string" || body.clientSecret !== undefined && typeof body.clientSecret !== "string") return res.status(400).j`
  - [Line 106](../../../../server/controllers/paymentGatewayController.js#L106): `if (body.webhookId !== undefined && typeof body.webhookId !== "string") return res.status(400).json({ success: false, message: "PayPal webhook ID must be a text value." }`
  - [Line 107](../../../../server/controllers/paymentGatewayController.js#L107): `if (body.merchantId !== undefined && typeof body.merchantId !== "string") return res.status(400).json({ success: false, message: "PayPal merchant ID must be a text value.`
  - [Line 108](../../../../server/controllers/paymentGatewayController.js#L108): `if (update.enabled && (!clientId || !clientSecret || !webhookId)) return res.status(400).json({ success: false, message: "To enable PayPal, configure the selected environ`
  - [Line 110](../../../../server/controllers/paymentGatewayController.js#L110): `if (update.enabled && credentialsChanged) return res.status(409).json({ success: false, message: "Save PayPal credentials with the gateway disabled, validate OAuth connec`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/payment-gateways/<provider>'
```

### POST /MPESA/validate → `/api/admin/payment-gateways/MPESA/validate`

Declared at source line 13. Route handler pipeline names: `rateLimit`, `validateMpesaGateway`.

```js
router.post("/MPESA/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), validateMpesaGateway)
```

- Imported handler/middleware `rateLimit`: external dependency `express-rate-limit`
- Imported handler/middleware `validateMpesaGateway`: [paymentGatewayController.js](../../../../server/controllers/paymentGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `validateMpesaGateway`

Handler starts at [controller line 192](../../../../server/controllers/paymentGatewayController.js#L192). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `environment`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Daraja rejected these credentials for the selected environment.”; “Daraja validation timed out. Connectivity remains unverified.”.
- Database operations detected: `PaymentGatewayConfig.findOne`.
- Input/validation source lines to inspect:
  - [Line 195](../../../../server/controllers/paymentGatewayController.js#L195): `const environment = String(req.body?.environment || "").toLowerCase();`
  - [Line 209](../../../../server/controllers/paymentGatewayController.js#L209): `if (error?.response?.status === 401 || error?.response?.status === 403) return res.json({ success: true, data: { status: "invalid_credentials", environment: req.body?.env`
  - [Line 210](../../../../server/controllers/paymentGatewayController.js#L210): `if (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) return res.json({ success: true, data: { status: "unverified", environment: req.body?.environment, timestamp: new`
  - [Line 211](../../../../server/controllers/paymentGatewayController.js#L211): `if (error?.response) return res.json({ success: true, data: { status: "provider_error", environment: req.body?.environment, timestamp: new Date().toISOString(), remoteVer`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/payment-gateways/MPESA/validate'
```

### POST /STRIPE/validate → `/api/admin/payment-gateways/STRIPE/validate`

Declared at source line 14. Route handler pipeline names: `rateLimit`, `validateStripeGateway`.

```js
router.post("/STRIPE/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), validateStripeGateway)
```

- Imported handler/middleware `rateLimit`: external dependency `express-rate-limit`
- Imported handler/middleware `validateStripeGateway`: [paymentGatewayController.js](../../../../server/controllers/paymentGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `validateStripeGateway`

Handler starts at [controller line 216](../../../../server/controllers/paymentGatewayController.js#L216). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/payment-gateways/STRIPE/validate'
```

### POST /PAYPAL/validate → `/api/admin/payment-gateways/PAYPAL/validate`

Declared at source line 15. Route handler pipeline names: `rateLimit`, `validatePaypalGateway`.

```js
router.post("/PAYPAL/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), validatePaypalGateway)
```

- Imported handler/middleware `rateLimit`: external dependency `express-rate-limit`
- Imported handler/middleware `validatePaypalGateway`: [paymentGatewayController.js](../../../../server/controllers/paymentGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `validatePaypalGateway`

Handler starts at [controller line 234](../../../../server/controllers/paymentGatewayController.js#L234). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `environment`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `PaymentGatewayConfig.findOne`.
- Input/validation source lines to inspect:
  - [Line 235](../../../../server/controllers/paymentGatewayController.js#L235): `const environment = String(req.body?.environment || "").toLowerCase();`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/payment-gateways/PAYPAL/validate'
```

### DELETE /:provider → `/api/admin/payment-gateways/:provider`

Declared at source line 16. Route handler pipeline names: `disableGatewayConfig`.

```js
router.delete("/:provider", disableGatewayConfig)
```

- Imported handler/middleware `disableGatewayConfig`: [paymentGatewayController.js](../../../../server/controllers/paymentGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `disableGatewayConfig`

Handler starts at [controller line 177](../../../../server/controllers/paymentGatewayController.js#L177). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `provider`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Unsupported payment provider.”; “Payment gateway configuration not found.”.
- Database operations detected: `PaymentGatewayConfig.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 180](../../../../server/controllers/paymentGatewayController.js#L180): `const provider = String(req.params.provider || "").toUpperCase();`
  - [Line 181](../../../../server/controllers/paymentGatewayController.js#L181): `if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });`
  - [Line 187](../../../../server/controllers/paymentGatewayController.js#L187): `if (!config) return res.status(404).json({ success: false, message: "Payment gateway configuration not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/payment-gateways/<provider>'
```

