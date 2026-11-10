# Route module: adminPaymentRoutes.js

**Source:** [server/routes/adminPaymentRoutes.js](../../../../server/routes/adminPaymentRoutes.js)

Observed mount prefixes include `/api/admin/payments`, `/api/admin/payments/reconciliation`, `/api/admin/payments/stats`, `/api/admin/payments/analytics`, `/api/admin/payments/export/csv`, `/api/admin/payments/export/pdf`, `/api/admin/payments/:id`, `/api/admin/payments/:id/status`, `/api/admin/payments/:id/refund`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(adminMiddleware);`
- `router.use(authorize("payment.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/payments`

Declared at source line 17. Route handler pipeline names: `getPayments`.

```js
router.get("/", getPayments)
```

- Imported handler/middleware `getPayments`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPayments`

Handler starts at [controller line 13](../../../../server/controllers/adminPaymentController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `method`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `Payment.find`, `Payment.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 16](../../../../server/controllers/adminPaymentController.js#L16): `const page = Math.max(1, Number(req.query.page) || 1);`
  - [Line 17](../../../../server/controllers/adminPaymentController.js#L17): `const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));`
  - [Line 19](../../../../server/controllers/adminPaymentController.js#L19): `if (req.query.status) query.status = req.query.status;`
  - [Line 20](../../../../server/controllers/adminPaymentController.js#L20): `if (req.query.method) query.method = req.query.method;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payments'
```

### GET /reconciliation → `/api/admin/payments/reconciliation`

Declared at source line 18. Route handler pipeline names: `getPaymentReconciliation`.

```js
router.get("/reconciliation", getPaymentReconciliation)
```

- Imported handler/middleware `getPaymentReconciliation`: [reconciliationController.js](../../../../server/controllers/reconciliationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPaymentReconciliation`

Handler starts at [controller line 12](../../../../server/controllers/reconciliationController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Payment.find`, `Booking.find`, `Invoice.find`, `Commission.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payments/reconciliation'
```

### GET /stats → `/api/admin/payments/stats`

Declared at source line 19. Route handler pipeline names: `getPaymentStats`.

```js
router.get("/stats", getPaymentStats)
```

- Imported handler/middleware `getPaymentStats`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPaymentStats`

Handler starts at [controller line 44](../../../../server/controllers/adminPaymentController.js#L44). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `Payment.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payments/stats'
```

### GET /analytics → `/api/admin/payments/analytics`

Declared at source line 20. Route handler pipeline names: `getPaymentAnalytics`.

```js
router.get("/analytics", getPaymentAnalytics)
```

- Imported handler/middleware `getPaymentAnalytics`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPaymentAnalytics`

Handler starts at [controller line 227](../../../../server/controllers/adminPaymentController.js#L227). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`.
- Database operations detected: `Payment.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payments/analytics'
```

### GET /export/csv → `/api/admin/payments/export/csv`

Declared at source line 21. Route handler pipeline names: `exportPaymentsCSV`.

```js
router.get("/export/csv", exportPaymentsCSV)
```

- Imported handler/middleware `exportPaymentsCSV`: [financeExportController.js](../../../../server/controllers/financeExportController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `exportPaymentsCSV`

Handler starts at [controller line 10](../../../../server/controllers/financeExportController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Payment.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payments/export/csv'
```

### GET /export/pdf → `/api/admin/payments/export/pdf`

Declared at source line 22. Route handler pipeline names: `exportPaymentsPDF`.

```js
router.get("/export/pdf", exportPaymentsPDF)
```

- Imported handler/middleware `exportPaymentsPDF`: [financeExportController.js](../../../../server/controllers/financeExportController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `exportPaymentsPDF`

Handler starts at [controller line 98](../../../../server/controllers/financeExportController.js#L98). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Payment.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payments/export/pdf'
```

### GET /:id → `/api/admin/payments/:id`

Declared at source line 23. Route handler pipeline names: `getPayment`.

```js
router.get("/:id", getPayment)
```

- Imported handler/middleware `getPayment`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPayment`

Handler starts at [controller line 109](../../../../server/controllers/adminPaymentController.js#L109). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Payment not found”.
- Database operations detected: `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 112](../../../../server/controllers/adminPaymentController.js#L112): `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }))`
  - [Line 116](../../../../server/controllers/adminPaymentController.js#L116): `if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/payments/<id>'
```

### PATCH /:id/status → `/api/admin/payments/:id/status`

Declared at source line 24. Route handler pipeline names: `updatePaymentStatus`.

```js
router.patch("/:id/status", updatePaymentStatus)
```

- Imported handler/middleware `updatePaymentStatus`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updatePaymentStatus`

Handler starts at [controller line 58](../../../../server/controllers/adminPaymentController.js#L58). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`, `confirmationReference`, `receiptNumber`, `confirmationNotes`, `failureReason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`.
- JSON envelope keys observed: `success`, `message`, `payment`, `booking`.
- Literal messages include: “Payment not found”; “Invalid payment status”; “Booking not found for payment”; “Provider payments must be confirmed by their provider callback/verification flow.”; “This manual payment has already been confirmed.”; “A cash receipt number is required by this tenant.”; “Use the refund workflow to refund a payment.”.
- Database operations detected: `Payment.findOne`, `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 61](../../../../server/controllers/adminPaymentController.js#L61): `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 62](../../../../server/controllers/adminPaymentController.js#L62): `if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });`
  - [Line 64](../../../../server/controllers/adminPaymentController.js#L64): `const nextStatus = String(req.body?.status || "").trim().toLowerCase();`
  - [Line 66](../../../../server/controllers/adminPaymentController.js#L66): `if (!allowedStatuses.includes(nextStatus)) return res.status(400).json({ success: false, message: "Invalid payment status" });`
  - [Line 70](../../../../server/controllers/adminPaymentController.js#L70): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found for payment" });`
  - [Line 72](../../../../server/controllers/adminPaymentController.js#L72): `return res.status(409).json({ success: false, message: "Provider payments must be confirmed by their provider callback/verification flow." });`
  - [Line 74](../../../../server/controllers/adminPaymentController.js#L74): `if (payment.status === "completed") return res.status(409).json({ success: false, message: "This manual payment has already been confirmed." });`
  - [Line 76](../../../../server/controllers/adminPaymentController.js#L76): `const confirmationReference = String(req.body?.confirmationReference || req.body?.receiptNumber || "").trim().slice(0, 200);`
  - [Line 77](../../../../server/controllers/adminPaymentController.js#L77): `if (String(payment.provider).toUpperCase() === "CASH" && settings.cashReceiptRequired === true && !confirmationReference) return res.status(400).json({ success: false, me`
  - [Line 88](../../../../server/controllers/adminPaymentController.js#L88): `result.payment.manualConfirmation = { confirmedBy: req.user?._id || null, confirmedAt: new Date(), amount: Number(payment.amount), currency: String(payment.currency || "K`
  - [Line 94](../../../../server/controllers/adminPaymentController.js#L94): `return res.status(409).json({ success: false, message: "Use the refund workflow to refund a payment." });`
  - [Line 99](../../../../server/controllers/adminPaymentController.js#L99): `payment.failureReason = String(req.body?.failureReason || "Marked failed by authorized staff").slice(0, 500);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/payments/<id>/status'
```

### PATCH /:id → `/api/admin/payments/:id`

Declared at source line 25. Route handler pipeline names: `updatePaymentStatus`.

```js
router.patch("/:id", updatePaymentStatus)
```

- Imported handler/middleware `updatePaymentStatus`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updatePaymentStatus`

Handler starts at [controller line 58](../../../../server/controllers/adminPaymentController.js#L58). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`, `confirmationReference`, `receiptNumber`, `confirmationNotes`, `failureReason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`.
- JSON envelope keys observed: `success`, `message`, `payment`, `booking`.
- Literal messages include: “Payment not found”; “Invalid payment status”; “Booking not found for payment”; “Provider payments must be confirmed by their provider callback/verification flow.”; “This manual payment has already been confirmed.”; “A cash receipt number is required by this tenant.”; “Use the refund workflow to refund a payment.”.
- Database operations detected: `Payment.findOne`, `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 61](../../../../server/controllers/adminPaymentController.js#L61): `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 62](../../../../server/controllers/adminPaymentController.js#L62): `if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });`
  - [Line 64](../../../../server/controllers/adminPaymentController.js#L64): `const nextStatus = String(req.body?.status || "").trim().toLowerCase();`
  - [Line 66](../../../../server/controllers/adminPaymentController.js#L66): `if (!allowedStatuses.includes(nextStatus)) return res.status(400).json({ success: false, message: "Invalid payment status" });`
  - [Line 70](../../../../server/controllers/adminPaymentController.js#L70): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found for payment" });`
  - [Line 72](../../../../server/controllers/adminPaymentController.js#L72): `return res.status(409).json({ success: false, message: "Provider payments must be confirmed by their provider callback/verification flow." });`
  - [Line 74](../../../../server/controllers/adminPaymentController.js#L74): `if (payment.status === "completed") return res.status(409).json({ success: false, message: "This manual payment has already been confirmed." });`
  - [Line 76](../../../../server/controllers/adminPaymentController.js#L76): `const confirmationReference = String(req.body?.confirmationReference || req.body?.receiptNumber || "").trim().slice(0, 200);`
  - [Line 77](../../../../server/controllers/adminPaymentController.js#L77): `if (String(payment.provider).toUpperCase() === "CASH" && settings.cashReceiptRequired === true && !confirmationReference) return res.status(400).json({ success: false, me`
  - [Line 88](../../../../server/controllers/adminPaymentController.js#L88): `result.payment.manualConfirmation = { confirmedBy: req.user?._id || null, confirmedAt: new Date(), amount: Number(payment.amount), currency: String(payment.currency || "K`
  - [Line 94](../../../../server/controllers/adminPaymentController.js#L94): `return res.status(409).json({ success: false, message: "Use the refund workflow to refund a payment." });`
  - [Line 99](../../../../server/controllers/adminPaymentController.js#L99): `payment.failureReason = String(req.body?.failureReason || "Marked failed by authorized staff").slice(0, 500);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/payments/<id>'
```

### PATCH /:id/refund → `/api/admin/payments/:id/refund`

Declared at source line 26. Route handler pipeline names: `guardPaymentRefund`, `refundPayment`.

```js
router.patch("/:id/refund", guardPaymentRefund, refundPayment)
```

- Imported handler/middleware `guardPaymentRefund`: [resourceTenantGuard.js](../../../../server/middleware/resourceTenantGuard.js)
- Imported handler/middleware `refundPayment`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `refundPayment`

Handler starts at [controller line 201](../../../../server/controllers/adminPaymentController.js#L201). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `501`.
- JSON envelope keys observed: `success`, `message`, `payment`.
- Literal messages include: “Payment not found”; “Only completed payments can be refunded”; “Automated refunds are not available for this payment method. Use the authorized reconciliation workflow.”; “Customer phone number missing”; “Refund request submitted”.
- Database operations detected: `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 204](../../../../server/controllers/adminPaymentController.js#L204): `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("booking").populate("customer");`
  - [Line 205](../../../../server/controllers/adminPaymentController.js#L205): `if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });`
  - [Line 206](../../../../server/controllers/adminPaymentController.js#L206): `if (payment.status !== "completed") return res.status(400).json({ success: false, message: "Only completed payments can be refunded" });`
  - [Line 212](../../../../server/controllers/adminPaymentController.js#L212): `if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });`
  - [Line 217](../../../../server/controllers/adminPaymentController.js#L217): `amount: req.body?.amount ?? (Number(payment.amount) - Number(payment.refundedAmount || 0)),`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/payments/<id>/refund'
```

### PUT /:id/refund → `/api/admin/payments/:id/refund`

Declared at source line 27. Route handler pipeline names: `guardPaymentRefund`, `refundPayment`.

```js
router.put("/:id/refund", guardPaymentRefund, refundPayment)
```

- Imported handler/middleware `guardPaymentRefund`: [resourceTenantGuard.js](../../../../server/middleware/resourceTenantGuard.js)
- Imported handler/middleware `refundPayment`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `refundPayment`

Handler starts at [controller line 201](../../../../server/controllers/adminPaymentController.js#L201). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `501`.
- JSON envelope keys observed: `success`, `message`, `payment`.
- Literal messages include: “Payment not found”; “Only completed payments can be refunded”; “Automated refunds are not available for this payment method. Use the authorized reconciliation workflow.”; “Customer phone number missing”; “Refund request submitted”.
- Database operations detected: `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 204](../../../../server/controllers/adminPaymentController.js#L204): `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("booking").populate("customer");`
  - [Line 205](../../../../server/controllers/adminPaymentController.js#L205): `if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });`
  - [Line 206](../../../../server/controllers/adminPaymentController.js#L206): `if (payment.status !== "completed") return res.status(400).json({ success: false, message: "Only completed payments can be refunded" });`
  - [Line 212](../../../../server/controllers/adminPaymentController.js#L212): `if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });`
  - [Line 217](../../../../server/controllers/adminPaymentController.js#L217): `amount: req.body?.amount ?? (Number(payment.amount) - Number(payment.refundedAmount || 0)),`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/payments/<id>/refund'
```

### POST /:id/refund → `/api/admin/payments/:id/refund`

Declared at source line 28. Route handler pipeline names: `guardPaymentRefund`, `refundPayment`.

```js
router.post("/:id/refund", guardPaymentRefund, refundPayment)
```

- Imported handler/middleware `guardPaymentRefund`: [resourceTenantGuard.js](../../../../server/middleware/resourceTenantGuard.js)
- Imported handler/middleware `refundPayment`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `refundPayment`

Handler starts at [controller line 201](../../../../server/controllers/adminPaymentController.js#L201). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `501`.
- JSON envelope keys observed: `success`, `message`, `payment`.
- Literal messages include: “Payment not found”; “Only completed payments can be refunded”; “Automated refunds are not available for this payment method. Use the authorized reconciliation workflow.”; “Customer phone number missing”; “Refund request submitted”.
- Database operations detected: `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 204](../../../../server/controllers/adminPaymentController.js#L204): `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("booking").populate("customer");`
  - [Line 205](../../../../server/controllers/adminPaymentController.js#L205): `if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });`
  - [Line 206](../../../../server/controllers/adminPaymentController.js#L206): `if (payment.status !== "completed") return res.status(400).json({ success: false, message: "Only completed payments can be refunded" });`
  - [Line 212](../../../../server/controllers/adminPaymentController.js#L212): `if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });`
  - [Line 217](../../../../server/controllers/adminPaymentController.js#L217): `amount: req.body?.amount ?? (Number(payment.amount) - Number(payment.refundedAmount || 0)),`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/payments/<id>/refund'
```

