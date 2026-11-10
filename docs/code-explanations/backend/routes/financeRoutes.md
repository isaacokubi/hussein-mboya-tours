# Route module: financeRoutes.js

**Source:** [server/routes/financeRoutes.js](../../../../server/routes/financeRoutes.js)

Observed mount prefixes include `/api/admin/finance`, `/api/admin/finance/stats`, `/api/admin/finance/transactions`, `/api/admin/finance/reports`, `/api/admin/finance/withholding-tax`, `/api/admin/finance/withholding-tax/:id/remit`, `/api/admin/finance/withholding-tax/:id/cancel`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(financeAccess);`
- `router.use("/compliance", financeComplianceRoutes);`
- `router.use("/kenya-readiness", kenyaReadinessRoutes);`
- `router.use("/accounting", accountingRoutes);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/finance`

Declared at source line 23. Route handler pipeline names: `getFinanceStats`.

```js
router.get("/", getFinanceStats)
```

- Imported handler/middleware `getFinanceStats`: [financeController.js](../../../../server/controllers/financeController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getFinanceStats`

Handler starts at [controller line 13](../../../../server/controllers/financeController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Payment.countDocuments`, `Payment.aggregate`, `Booking.countDocuments`, `Commission.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/finance'
```

### GET /stats → `/api/admin/finance/stats`

Declared at source line 24. Route handler pipeline names: `getFinanceStats`.

```js
router.get("/stats", getFinanceStats)
```

- Imported handler/middleware `getFinanceStats`: [financeController.js](../../../../server/controllers/financeController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getFinanceStats`

Handler starts at [controller line 13](../../../../server/controllers/financeController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Payment.countDocuments`, `Payment.aggregate`, `Booking.countDocuments`, `Commission.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/finance/stats'
```

### GET /transactions → `/api/admin/finance/transactions`

Declared at source line 25. Route handler pipeline names: `getTransactions`.

```js
router.get("/transactions", getTransactions)
```

- Imported handler/middleware `getTransactions`: [financeController.js](../../../../server/controllers/financeController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTransactions`

Handler starts at [controller line 15](../../../../server/controllers/financeController.js#L15). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `status`, `search`, `startDate`, `endDate`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `User.find`, `Booking.find`, `Payment.find`, `Payment.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 15](../../../../server/controllers/financeController.js#L15): `async (req, res, next) => { requireTenantId(); try { const { page = 1, status, search, startDate, endDate } = req.query; const currentPage = Math.max(Number(page) || 1, 1`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/finance/transactions'
```

### GET /reports → `/api/admin/finance/reports`

Declared at source line 26. Route handler pipeline names: `getReports`.

```js
router.get("/reports", getReports)
```

- Imported handler/middleware `getReports`: [financeController.js](../../../../server/controllers/financeController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getReports`

Handler starts at [controller line 17](../../../../server/controllers/financeController.js#L17). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Payment.aggregate`.
- Input/validation source lines to inspect:
  - [Line 20](../../../../server/controllers/financeController.js#L20): `const { from, to } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/finance/reports'
```

### GET /withholding-tax → `/api/admin/finance/withholding-tax`

Declared at source line 27. Route handler pipeline names: `listWithholdingTax`.

```js
router.get("/withholding-tax", listWithholdingTax)
```

- Imported handler/middleware `listWithholdingTax`: [withholdingTaxController.js](../../../../server/controllers/withholdingTaxController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listWithholdingTax`

Handler starts at [controller line 11](../../../../server/controllers/withholdingTaxController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`, `taxPeriod`, `payee`, `limit`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`, `totals`.
- Database operations detected: `WithholdingTax.find`.
- Input/validation source lines to inspect:
  - [Line 15](../../../../server/controllers/withholdingTaxController.js#L15): `if (req.query.status) filter.status = req.query.status;`
  - [Line 16](../../../../server/controllers/withholdingTaxController.js#L16): `if (req.query.taxPeriod) filter.taxPeriod = req.query.taxPeriod;`
  - [Line 17](../../../../server/controllers/withholdingTaxController.js#L17): `if (req.query.payee) filter.payee = req.query.payee;`
  - [Line 18](../../../../server/controllers/withholdingTaxController.js#L18): `const data = await WithholdingTax.find(mergeTenantFilter(req, filter)).populate("payee", "legalName supplierNumber pin").sort({ createdAt: -1 }).limit(Math.min(Number(req`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/finance/withholding-tax'
```

### POST /withholding-tax → `/api/admin/finance/withholding-tax`

Declared at source line 28. Route handler pipeline names: `authorize`, `createWithholdingTax`.

```js
router.post("/withholding-tax", authorize("finance.manage"), createWithholdingTax)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createWithholdingTax`: [withholdingTaxController.js](../../../../server/controllers/withholdingTaxController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createWithholdingTax`

Handler starts at [controller line 34](../../../../server/controllers/withholdingTaxController.js#L34). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `baseAmount`, `rate`, `taxPeriod`, `payeeName`, `payeePin`, `reference`, `sourceType`, `sourceId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `422`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Payee, reference, positive base amount, valid 0–100% rate and YYYY-MM tax period are required.”; “Source ID must be a valid record identifier when supplied.”.
- Database operations detected: `WithholdingTax.create`.
- Input/validation source lines to inspect:
  - [Line 37](../../../../server/controllers/withholdingTaxController.js#L37): `const baseAmount = money(req.body?.baseAmount);`
  - [Line 38](../../../../server/controllers/withholdingTaxController.js#L38): `const rate = Number(req.body?.rate);`
  - [Line 39](../../../../server/controllers/withholdingTaxController.js#L39): `const taxPeriod = String(req.body?.taxPeriod || "").trim();`
  - [Line 40](../../../../server/controllers/withholdingTaxController.js#L40): `const payeeName = String(req.body?.payeeName || "").trim();`
  - [Line 41](../../../../server/controllers/withholdingTaxController.js#L41): `const payeePin = String(req.body?.payeePin || "").trim();`
  - [Line 42](../../../../server/controllers/withholdingTaxController.js#L42): `const reference = String(req.body?.reference || "").trim();`
  - [Line 43](../../../../server/controllers/withholdingTaxController.js#L43): `const sourceType = normaliseSourceType(req.body?.sourceType);`
  - [Line 44](../../../../server/controllers/withholdingTaxController.js#L44): `const sourceId = req.body?.sourceId ? String(req.body.sourceId).trim() : undefined;`
  - [Line 45](../../../../server/controllers/withholdingTaxController.js#L45): `if (!payeeName || !reference || !Number.isFinite(baseAmount) || baseAmount <= 0 || !Number.isFinite(rate) || rate < 0 || rate > 100 || !validPeriod(taxPeriod)) return res`
  - [Line 46](../../../../server/controllers/withholdingTaxController.js#L46): `if (sourceId && !/^[a-f\d]{24}$/i.test(sourceId)) return res.status(422).json({ success: false, message: "Source ID must be a valid record identifier when supplied." });`
  - [Line 49](../../../../server/controllers/withholdingTaxController.js#L49): `...req.body,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/finance/withholding-tax'
```

### POST /withholding-tax/:id/remit → `/api/admin/finance/withholding-tax/:id/remit`

Declared at source line 29. Route handler pipeline names: `authorize`, `remitWithholdingTax`.

```js
router.post("/withholding-tax/:id/remit", authorize("finance.manage"), remitWithholdingTax)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `remitWithholdingTax`: [withholdingTaxController.js](../../../../server/controllers/withholdingTaxController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `remitWithholdingTax`

Handler starts at [controller line 72](../../../../server/controllers/withholdingTaxController.js#L72). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `paymentReference`, `certificateNumber`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `422`.
- JSON envelope keys observed: `success`, `message`, `data`, `alreadyRemitted`.
- Literal messages include: “Withholding tax record not found.”; “Cancelled withholding tax cannot be remitted.”; “A remittance payment reference is required.”.
- Database operations detected: `WithholdingTax.findOne`.
- Input/validation source lines to inspect:
  - [Line 75](../../../../server/controllers/withholdingTaxController.js#L75): `const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 76](../../../../server/controllers/withholdingTaxController.js#L76): `if (!record) return res.status(404).json({ success: false, message: "Withholding tax record not found." });`
  - [Line 78](../../../../server/controllers/withholdingTaxController.js#L78): `if (record.status === "cancelled") return res.status(409).json({ success: false, message: "Cancelled withholding tax cannot be remitted." });`
  - [Line 79](../../../../server/controllers/withholdingTaxController.js#L79): `const paymentReference = String(req.body?.paymentReference || "").trim();`
  - [Line 80](../../../../server/controllers/withholdingTaxController.js#L80): `if (!paymentReference) return res.status(422).json({ success: false, message: "A remittance payment reference is required." });`
  - [Line 81](../../../../server/controllers/withholdingTaxController.js#L81): `const certificateNumber = String(req.body?.certificateNumber || record.certificateNumber || "").trim();`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/finance/withholding-tax/<id>/remit'
```

### POST /withholding-tax/:id/cancel → `/api/admin/finance/withholding-tax/:id/cancel`

Declared at source line 30. Route handler pipeline names: `authorize`, `cancelWithholdingTax`.

```js
router.post("/withholding-tax/:id/cancel", authorize("finance.manage"), cancelWithholdingTax)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `cancelWithholdingTax`: [withholdingTaxController.js](../../../../server/controllers/withholdingTaxController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `cancelWithholdingTax`

Handler starts at [controller line 93](../../../../server/controllers/withholdingTaxController.js#L93). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Withholding tax record not found.”; “Remitted withholding tax cannot be cancelled.”.
- Database operations detected: `WithholdingTax.findOne`.
- Input/validation source lines to inspect:
  - [Line 96](../../../../server/controllers/withholdingTaxController.js#L96): `const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 97](../../../../server/controllers/withholdingTaxController.js#L97): `if (!record) return res.status(404).json({ success: false, message: "Withholding tax record not found." });`
  - [Line 98](../../../../server/controllers/withholdingTaxController.js#L98): `if (record.status === "remitted") return res.status(409).json({ success: false, message: "Remitted withholding tax cannot be cancelled." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/finance/withholding-tax/<id>/cancel'
```

