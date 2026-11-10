# Route module: financeComplianceRoutes.js

**Source:** [server/routes/financeComplianceRoutes.js](../../../../server/routes/financeComplianceRoutes.js)

No observed mount was found in the main API or app setup; the declarations are not assumed reachable.

## Router-wide middleware

No router.use declaration was found at module scope.

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /tax-profile (unmounted declaration)

Declared at source line 8. Route handler pipeline names: `authorize`, `getTaxProfile`.

```js
router.get("/tax-profile", authorize("finance.view"), getTaxProfile)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getTaxProfile`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getTaxProfile`

Handler starts at [controller line 10](../../../../server/controllers/financeComplianceController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `TaxProfile.findOne`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/tax-profile'
```

### PUT /tax-profile (unmounted declaration)

Declared at source line 9. Route handler pipeline names: `authorize`, `upsertTaxProfile`.

```js
router.put("/tax-profile", authorize("finance.manage"), upsertTaxProfile)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `upsertTaxProfile`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `upsertTaxProfile`

Handler starts at [controller line 11](../../../../server/controllers/financeComplianceController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Invalid Kenyan KRA PIN format.”; “Invalid VAT rate.”; “Invalid eTIMS environment.”; “A KRA PIN is required before eTIMS can be enabled.”; “Select the tenant”; “eTIMS adapter URL must use HTTPS in production.”.
- Database operations detected: `TaxProfile.findOne`, `TaxProfile.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 11](../../../../server/controllers/financeComplianceController.js#L11): `async (req, res, next) => { try { const tenantId = requireTenantId(); const allowed = ["kraPin", "vatRegistered", "vatNumber", "defaultVatRate", "taxRegime", "etimsEnable`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/tax-profile'
```

### GET /etims/credentials (unmounted declaration)

Declared at source line 10. Route handler pipeline names: `authorize`, `getEtimsCredentialStatus`.

```js
router.get("/etims/credentials", authorize("finance.view"), getEtimsCredentialStatus)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getEtimsCredentialStatus`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getEtimsCredentialStatus`

Handler starts at [controller line 12](../../../../server/controllers/financeComplianceController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `environment`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `EtimsCredential.findOne`.
- Input/validation source lines to inspect:
  - [Line 12](../../../../server/controllers/financeComplianceController.js#L12): `async (req, res, next) => { try { const tenantId = requireTenantId(); const environment = String(req.query.environment || "sandbox"); const credential = await EtimsCreden`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/etims/credentials'
```

### PUT /etims/credentials (unmounted declaration)

Declared at source line 11. Route handler pipeline names: `authorize`, `saveEtimsCredentials`.

```js
router.put("/etims/credentials", authorize("finance.manage"), saveEtimsCredentials)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `saveEtimsCredentials`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `saveEtimsCredentials`

Handler starts at [controller line 13](../../../../server/controllers/financeComplianceController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `environment`, `credentialRef`, `certificateRef`, `adapterToken`, `clientId`, `clientSecret`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid eTIMS environment.”.
- Database operations detected: `EtimsCredential.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 13](../../../../server/controllers/financeComplianceController.js#L13): `async (req, res, next) => { try { const tenantId = requireTenantId(); const environment = String(req.body?.environment || "sandbox"); if (!["sandbox", "production"].inclu`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/etims/credentials'
```

### GET /compliance-summary (unmounted declaration)

Declared at source line 12. Route handler pipeline names: `authorize`, `getFinanceComplianceSummary`.

```js
router.get("/compliance-summary", authorize("finance.view"), getFinanceComplianceSummary)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getFinanceComplianceSummary`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getFinanceComplianceSummary`

Handler starts at [controller line 20](../../../../server/controllers/financeComplianceController.js#L20). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `TaxProfile.findOne`, `Expense.aggregate`, `EtimsSubmission.aggregate`, `EtimsCredential.findOne`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/compliance-summary'
```

### GET /expenses (unmounted declaration)

Declared at source line 13. Route handler pipeline names: `authorize`, `listExpenses`.

```js
router.get("/expenses", authorize("finance.view"), listExpenses)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listExpenses`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listExpenses`

Handler starts at [controller line 14](../../../../server/controllers/financeComplianceController.js#L14). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `category`, `startDate`, `endDate`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Expense.find`, `Expense.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 14](../../../../server/controllers/financeComplianceController.js#L14): `async (req, res, next) => { try { const page = Math.max(Number(req.query.page) || 1, 1); const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100); const fi`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/expenses'
```

### POST /expenses (unmounted declaration)

Declared at source line 14. Route handler pipeline names: `authorize`, `createExpense`.

```js
router.post("/expenses", authorize("finance.manage"), createExpense)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createExpense`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `createExpense`

Handler starts at [controller line 15](../../../../server/controllers/financeComplianceController.js#L15). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`, `category`, `description`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Category, description and a positive amount are required.”.
- Database operations detected: `Expense.create`.
- Input/validation source lines to inspect:
  - [Line 15](../../../../server/controllers/financeComplianceController.js#L15): `async (req, res, next) => { try { const tenantId = requireTenantId(); const amount = Number(req.body?.amount); if (!req.body?.category || !req.body?.description || !Numbe`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/expenses'
```

### POST /expenses/:id/status (unmounted declaration)

Declared at source line 15. Route handler pipeline names: `authorize`, `transitionExpense`.

```js
router.post("/expenses/:id/status", authorize("finance.manage"), transitionExpense)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `transitionExpense`: [expenseLifecycleController.js](../../../../server/controllers/expenseLifecycleController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `transitionExpense`

Handler starts at [controller line 8](../../../../server/controllers/expenseLifecycleController.js#L8). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`, `paymentReference`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `422`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Expense not found.”; “This procurement expense is backed by an Accounts Payable balance. Settle the linked supplier payable instead of paying the expense directly.”; “A payment reference is required before an expense can be marked paid.”.
- Database operations detected: `Expense.findOne`, `SupplierPayable.findOne`.
- Input/validation source lines to inspect:
  - [Line 11](../../../../server/controllers/expenseLifecycleController.js#L11): `const expense = await Expense.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 12](../../../../server/controllers/expenseLifecycleController.js#L12): `if (!expense) return res.status(404).json({ success: false, message: "Expense not found." });`
  - [Line 14](../../../../server/controllers/expenseLifecycleController.js#L14): `const nextStatus = String(req.body?.status || "").trim().toLowerCase();`
  - [Line 17](../../../../server/controllers/expenseLifecycleController.js#L17): `if (!allowed[current]?.includes(nextStatus)) return res.status(409).json({ success: false, message: \`Expense cannot move from ${current} to ${nextStatus}.\` });`
  - [Line 20](../../../../server/controllers/expenseLifecycleController.js#L20): `if (nextStatus === "paid" && linkedPayable && linkedPayable.balance > 0) return res.status(409).json({ success: false, message: "This procurement expense is backed by an `
  - [Line 21](../../../../server/controllers/expenseLifecycleController.js#L21): `if (nextStatus === "paid" && !String(req.body?.paymentReference || expense.paymentReference || "").trim()) return res.status(422).json({ success: false, message: "A payme`
  - [Line 24](../../../../server/controllers/expenseLifecycleController.js#L24): `if (req.body?.paymentReference !== undefined) expense.paymentReference = String(req.body.paymentReference || "").trim();`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/expenses/<id>/status'
```

### GET /withholding-tax (unmounted declaration)

Declared at source line 16. Route handler pipeline names: `authorize`, `listWithholdingTax`.

```js
router.get("/withholding-tax", authorize("finance.view"), listWithholdingTax)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listWithholdingTax`: [withholdingTaxController.js](../../../../server/controllers/withholdingTaxController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

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
curl -i -X GET 'http://localhost:5000/withholding-tax'
```

### POST /withholding-tax (unmounted declaration)

Declared at source line 17. Route handler pipeline names: `authorize`, `createWithholdingTax`.

```js
router.post("/withholding-tax", authorize("finance.manage"), createWithholdingTax)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createWithholdingTax`: [withholdingTaxController.js](../../../../server/controllers/withholdingTaxController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

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
curl -i -X POST 'http://localhost:5000/withholding-tax'
```

### POST /withholding-tax/:id/remit (unmounted declaration)

Declared at source line 18. Route handler pipeline names: `authorize`, `remitWithholdingTax`.

```js
router.post("/withholding-tax/:id/remit", authorize("finance.manage"), remitWithholdingTax)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `remitWithholdingTax`: [withholdingTaxController.js](../../../../server/controllers/withholdingTaxController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

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
curl -i -X POST 'http://localhost:5000/withholding-tax/<id>/remit'
```

### POST /withholding-tax/:id/cancel (unmounted declaration)

Declared at source line 19. Route handler pipeline names: `authorize`, `cancelWithholdingTax`.

```js
router.post("/withholding-tax/:id/cancel", authorize("finance.manage"), cancelWithholdingTax)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `cancelWithholdingTax`: [withholdingTaxController.js](../../../../server/controllers/withholdingTaxController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

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
curl -i -X POST 'http://localhost:5000/withholding-tax/<id>/cancel'
```

### GET /notes (unmounted declaration)

Declared at source line 20. Route handler pipeline names: `authorize`, `listNotes`.

```js
router.get("/notes", authorize("finance.view"), listNotes)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listNotes`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listNotes`

Handler starts at [controller line 16](../../../../server/controllers/financeComplianceController.js#L16). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `CreditDebitNote.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/notes'
```

### POST /notes (unmounted declaration)

Declared at source line 21. Route handler pipeline names: `authorize`, `createNote`.

```js
router.post("/notes", authorize("finance.manage"), createNote)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createNote`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `createNote`

Handler starts at [controller line 17](../../../../server/controllers/financeComplianceController.js#L17). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `type`, `originalInvoice`, `totalAmount`, `taxAmount`, `amount`, `reason`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`, `jobId`.
- Literal messages include: “Note type must be credit or debit.”; “Original invoice not found.”; “The original invoice must have a successful eTIMS submission before a tax note can be issued.”; “A credit note cannot be created more than six months after the original tax invoice.”; “Note amount must be positive and cannot exceed the original invoice total.”; “Invalid note tax amount.”.
- Database operations detected: `Invoice.findOne`, `TaxProfile.findOne`, `CreditDebitNote.create`.
- Input/validation source lines to inspect:
  - [Line 17](../../../../server/controllers/financeComplianceController.js#L17): `async (req, res, next) => { try { const tenantId = requireTenantId(); const type = String(req.body?.type || "").toLowerCase(); if (!["credit", "debit"].includes(type)) re`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/notes'
```

### POST /notes/:id/queue (unmounted declaration)

Declared at source line 22. Route handler pipeline names: `authorize`, `queueNoteEtims`.

```js
router.post("/notes/:id/queue", authorize("finance.manage"), queueNoteEtims)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `queueNoteEtims`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `queueNoteEtims`

Handler starts at [controller line 18](../../../../server/controllers/financeComplianceController.js#L18). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `202`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Credit/debit note not found.”.
- Database operations detected: `CreditDebitNote.findOne`.
- Input/validation source lines to inspect:
  - [Line 18](../../../../server/controllers/financeComplianceController.js#L18): `async (req, res, next) => { try { const tenantId = requireTenantId(); const note = await CreditDebitNote.findOne(mergeTenantFilter(req, { _id: req.params.id })).lean(); i`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/notes/<id>/queue'
```

### GET /etims/submissions (unmounted declaration)

Declared at source line 23. Route handler pipeline names: `authorize`, `listEtimsSubmissions`.

```js
router.get("/etims/submissions", authorize("finance.view"), listEtimsSubmissions)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listEtimsSubmissions`: [financeComplianceController.js](../../../../server/controllers/financeComplianceController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listEtimsSubmissions`

Handler starts at [controller line 19](../../../../server/controllers/financeComplianceController.js#L19). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `documentType`, `status`, `documentId`, `limit`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `EtimsSubmission.find`.
- Input/validation source lines to inspect:
  - [Line 19](../../../../server/controllers/financeComplianceController.js#L19): `async (req, res, next) => { try { const filter = {}; if (req.query.documentType) filter.documentType = req.query.documentType; if (req.query.status) filter.status = req.q`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/etims/submissions'
```

