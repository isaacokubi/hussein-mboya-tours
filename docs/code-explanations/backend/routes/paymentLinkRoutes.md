# Route module: paymentLinkRoutes.js

**Source:** [server/routes/paymentLinkRoutes.js](../../../../server/routes/paymentLinkRoutes.js)

Observed mount prefixes include `/api/admin/payment-links/public/:token`, `/api/payment-links/public/:token`, `/api/admin/payment-links`, `/api/payment-links`, `/api/admin/payment-links/:id/cancel`, `/api/payment-links/:id/cancel`.

## Router-wide middleware

- `router.use(resolveTenant, protect, authorize("finance.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /public/:token → `/api/admin/payment-links/public/:token`, `/api/payment-links/public/:token`

Declared at source line 8. Route handler pipeline names: `resolveTenant`, `getPaymentLink`.

```js
router.get("/public/:token", resolveTenant, getPaymentLink)
```

- Imported handler/middleware `resolveTenant`: [tenantMiddleware.js](../../../../server/middleware/tenantMiddleware.js)
- Imported handler/middleware `getPaymentLink`: [paymentLinkController.js](../../../../server/controllers/paymentLinkController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPaymentLink`

Handler starts at [controller line 9](../../../../server/controllers/paymentLinkController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `token`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Payment link not found.”.
- Database operations detected: `PaymentLink.findOne`, `PaymentLink.updateOne`.
- Input/validation source lines to inspect:
  - [Line 9](../../../../server/controllers/paymentLinkController.js#L9): `async(req,res,next)=>{try{const token=String(req.params.token||"").trim();if(!token)return res.status(404).json({success:false,message:"Payment link not found."});const l`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payment-links/public/<token>'
```

### GET / → `/api/admin/payment-links`, `/api/payment-links`

Declared at source line 10. Route handler pipeline names: `listPaymentLinks`.

```js
router.get("/", listPaymentLinks)
```

- Imported handler/middleware `listPaymentLinks`: [paymentLinkController.js](../../../../server/controllers/paymentLinkController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listPaymentLinks`

Handler starts at [controller line 7](../../../../server/controllers/paymentLinkController.js#L7). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `PaymentLink.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payment-links'
```

### POST / → `/api/admin/payment-links`, `/api/payment-links`

Declared at source line 11. Route handler pipeline names: `createPaymentLink`.

```js
router.post("/", createPaymentLink)
```

- Imported handler/middleware `createPaymentLink`: [paymentLinkController.js](../../../../server/controllers/paymentLinkController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createPaymentLink`

Handler starts at [controller line 8](../../../../server/controllers/paymentLinkController.js#L8). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `bookingId`, `amount`, `expiresAt`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Booking not found.”; “Cancelled or refunded bookings cannot receive payment links.”; “Booking has no outstanding balance.”; “Expiry must be a future date.”.
- Database operations detected: `Booking.findOne`, `Invoice.findOne`, `PaymentLink.create`.
- Input/validation source lines to inspect:
  - [Line 8](../../../../server/controllers/paymentLinkController.js#L8): `async(req,res,next)=>{requireTenantId();try{const booking=await Booking.findOne(mergeTenantFilter(req,{_id:req.body?.bookingId}));if(!booking)return res.status(404).json(`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/payment-links'
```

### POST /:id/cancel → `/api/admin/payment-links/:id/cancel`, `/api/payment-links/:id/cancel`

Declared at source line 12. Route handler pipeline names: `cancelPaymentLink`.

```js
router.post("/:id/cancel", cancelPaymentLink)
```

- Imported handler/middleware `cancelPaymentLink`: [paymentLinkController.js](../../../../server/controllers/paymentLinkController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `cancelPaymentLink`

Handler starts at [controller line 10](../../../../server/controllers/paymentLinkController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Payment link not found.”.
- Database operations detected: `PaymentLink.findOne`.
- Input/validation source lines to inspect:
  - [Line 10](../../../../server/controllers/paymentLinkController.js#L10): `async(req,res,next)=>{requireTenantId();try{const link=await PaymentLink.findOne(mergeTenantFilter(req,{_id:req.params.id}));if(!link)return res.status(404).json({success`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/payment-links/<id>/cancel'
```

