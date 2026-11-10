# Route module: accountingRoutes.js

**Source:** [server/routes/accountingRoutes.js](../../../../server/routes/accountingRoutes.js)

No observed mount was found in the main API or app setup; the declarations are not assumed reachable.

## Router-wide middleware

No router.use declaration was found at module scope.

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /accounts (unmounted declaration)

Declared at source line 13. Route handler pipeline names: `authorize`, `listAccounts`.

```js
router.get("/accounts", authorize("finance.view"), listAccounts)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listAccounts`: [accountingController.js](../../../../server/controllers/accountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listAccounts`

Handler starts at [controller line 31](../../../../server/controllers/accountingController.js#L31). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `ChartOfAccount.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/accounts'
```

### POST /accounts (unmounted declaration)

Declared at source line 14. Route handler pipeline names: `authorize`, `createAccount`.

```js
router.post("/accounts", authorize("finance.manage"), createAccount)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createAccount`: [accountingController.js](../../../../server/controllers/accountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `createAccount`

Handler starts at [controller line 32](../../../../server/controllers/accountingController.js#L32). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `ChartOfAccount.create`.
- Input/validation source lines to inspect:
  - [Line 32](../../../../server/controllers/accountingController.js#L32): `async (req, res, next) => { try { const data = await ChartOfAccount.create({ ...req.body, tenantId: req.tenantId, system: false }); return ok(res, data, 201); } catch (e)`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/accounts'
```

### GET /journal (unmounted declaration)

Declared at source line 15. Route handler pipeline names: `authorize`, `listJournalEntries`.

```js
router.get("/journal", authorize("finance.view"), listJournalEntries)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listJournalEntries`: [accountingController.js](../../../../server/controllers/accountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listJournalEntries`

Handler starts at [controller line 33](../../../../server/controllers/accountingController.js#L33). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`, `from`, `to`, `limit`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `JournalEntry.find`.
- Input/validation source lines to inspect:
  - [Line 33](../../../../server/controllers/accountingController.js#L33): `async (req, res, next) => { try { const filter = { ...tenantFilter(req), status: req.query.status || { $in: ["draft", "posted", "void"] } }; if (req.query.status) filter.`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/journal'
```

### POST /journal (unmounted declaration)

Declared at source line 16. Route handler pipeline names: `authorize`, `createJournalEntry`.

```js
router.post("/journal", authorize("finance.manage"), createJournalEntry)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createJournalEntry`: [accountingController.js](../../../../server/controllers/accountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `createJournalEntry`

Handler starts at [controller line 34](../../../../server/controllers/accountingController.js#L34). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `lines`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `JournalEntry.create`.
- Input/validation source lines to inspect:
  - [Line 34](../../../../server/controllers/accountingController.js#L34): `async (req, res, next) => { try { await assertTenantAccounts(req, req.body?.lines); const entry = await JournalEntry.create({ ...req.body, tenantId: req.tenantId, status:`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/journal'
```

### POST /journal/:id/post (unmounted declaration)

Declared at source line 17. Route handler pipeline names: `authorize`, `postJournalEntry`.

```js
router.post("/journal/:id/post", authorize("finance.manage"), postJournalEntry)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `postJournalEntry`: [accountingController.js](../../../../server/controllers/accountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `postJournalEntry`

Handler starts at [controller line 35](../../../../server/controllers/accountingController.js#L35). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `422`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Journal entry not found.”; “Void entries cannot be posted.”; “Journal entry is not balanced.”.
- Database operations detected: `JournalEntry.findOne`.
- Input/validation source lines to inspect:
  - [Line 35](../../../../server/controllers/accountingController.js#L35): `async (req, res, next) => { try { const entry = await JournalEntry.findOne({ ...tenantFilter(req), _id: req.params.id }); if (!entry) return res.status(404).json({ succes`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/journal/<id>/post'
```

### POST /journal/:id/void (unmounted declaration)

Declared at source line 18. Route handler pipeline names: `authorize`, `voidJournalEntry`.

```js
router.post("/journal/:id/void", authorize("finance.manage"), voidJournalEntry)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `voidJournalEntry`: [accountingController.js](../../../../server/controllers/accountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `voidJournalEntry`

Handler starts at [controller line 36](../../../../server/controllers/accountingController.js#L36). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Journal entry not found.”; “Posted entries must be reversed with a new journal entry; they cannot be edited or voided.”.
- Database operations detected: `JournalEntry.findOne`.
- Input/validation source lines to inspect:
  - [Line 36](../../../../server/controllers/accountingController.js#L36): `async (req, res, next) => { try { const entry = await JournalEntry.findOne({ ...tenantFilter(req), _id: req.params.id }); if (!entry) return res.status(404).json({ succes`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/journal/<id>/void'
```

### GET /summary (unmounted declaration)

Declared at source line 19. Route handler pipeline names: `authorize`, `getLedgerSummary`.

```js
router.get("/summary", authorize("finance.view"), getLedgerSummary)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getLedgerSummary`: [accountingController.js](../../../../server/controllers/accountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getLedgerSummary`

Handler starts at [controller line 38](../../../../server/controllers/accountingController.js#L38). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `ChartOfAccount.find`, `JournalEntry.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/summary'
```

### GET /statements (unmounted declaration)

Declared at source line 20. Route handler pipeline names: `authorize`, `getFinancialStatements`.

```js
router.get("/statements", authorize("finance.view"), getFinancialStatements)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getFinancialStatements`: [accountingReportsController.js](../../../../server/controllers/accountingReportsController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getFinancialStatements`

Handler starts at [controller line 41](../../../../server/controllers/accountingReportsController.js#L41). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 58](../../../../server/controllers/accountingReportsController.js#L58): `period: { from: req.query.from || null, to: req.query.to || null },`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/statements'
```

### GET /ar-aging (unmounted declaration)

Declared at source line 21. Route handler pipeline names: `authorize`, `getArAging`.

```js
router.get("/ar-aging", authorize("finance.view"), getArAging)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getArAging`: [accountingReportsController.js](../../../../server/controllers/accountingReportsController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getArAging`

Handler starts at [controller line 66](../../../../server/controllers/accountingReportsController.js#L66). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Invoice.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/ar-aging'
```

### GET /ap-aging (unmounted declaration)

Declared at source line 22. Route handler pipeline names: `authorize`, `getApAging`.

```js
router.get("/ap-aging", authorize("finance.view"), getApAging)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getApAging`: [accountingReportsController.js](../../../../server/controllers/accountingReportsController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getApAging`

Handler starts at [controller line 82](../../../../server/controllers/accountingReportsController.js#L82). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `SupplierPayable.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/ap-aging'
```

### GET /cash-flow (unmounted declaration)

Declared at source line 23. Route handler pipeline names: `authorize`, `getCashFlow`.

```js
router.get("/cash-flow", authorize("finance.view"), getCashFlow)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getCashFlow`: [accountingReportsController.js](../../../../server/controllers/accountingReportsController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getCashFlow`

Handler starts at [controller line 142](../../../../server/controllers/accountingReportsController.js#L142). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `ChartOfAccount.find`, `JournalEntry.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/cash-flow'
```

### GET /tax-control (unmounted declaration)

Declared at source line 24. Route handler pipeline names: `authorize`, `getTaxControlReport`.

```js
router.get("/tax-control", authorize("finance.view"), getTaxControlReport)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getTaxControlReport`: [accountingControlReportsController.js](../../../../server/controllers/accountingControlReportsController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getTaxControlReport`

Handler starts at [controller line 81](../../../../server/controllers/accountingControlReportsController.js#L81). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Invoice.find`.
- Input/validation source lines to inspect:
  - [Line 84](../../../../server/controllers/accountingControlReportsController.js#L84): `const { from, to } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/tax-control'
```

### GET /customer-ledger (unmounted declaration)

Declared at source line 25. Route handler pipeline names: `authorize`, `getCustomerLedgerReport`.

```js
router.get("/customer-ledger", authorize("finance.view"), getCustomerLedgerReport)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getCustomerLedgerReport`: [accountingControlReportsController.js](../../../../server/controllers/accountingControlReportsController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getCustomerLedgerReport`

Handler starts at [controller line 152](../../../../server/controllers/accountingControlReportsController.js#L152). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 153](../../../../server/controllers/accountingControlReportsController.js#L153): `try { const tenantId = requireTenantId(); const { page, pageSize } = pagination(req.query); return res.json({ success: true, data: await getControlLedger({ tenantId, code`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/customer-ledger'
```

### GET /supplier-ledger (unmounted declaration)

Declared at source line 26. Route handler pipeline names: `authorize`, `getSupplierLedgerReport`.

```js
router.get("/supplier-ledger", authorize("finance.view"), getSupplierLedgerReport)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getSupplierLedgerReport`: [accountingControlReportsController.js](../../../../server/controllers/accountingControlReportsController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getSupplierLedgerReport`

Handler starts at [controller line 156](../../../../server/controllers/accountingControlReportsController.js#L156). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 157](../../../../server/controllers/accountingControlReportsController.js#L157): `try { const tenantId = requireTenantId(); const { page, pageSize } = pagination(req.query); return res.json({ success: true, data: await getControlLedger({ tenantId, code`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/supplier-ledger'
```

### GET /profitability (unmounted declaration)

Declared at source line 27. Route handler pipeline names: `authorize`, `getProfitabilityReport`.

```js
router.get("/profitability", authorize("finance.view"), getProfitabilityReport)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getProfitabilityReport`: [accountingControlReportsController.js](../../../../server/controllers/accountingControlReportsController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getProfitabilityReport`

Handler starts at [controller line 192](../../../../server/controllers/accountingControlReportsController.js#L192). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Invoice.find`, `Payment.find`.
- Input/validation source lines to inspect:
  - [Line 195](../../../../server/controllers/accountingControlReportsController.js#L195): `const { from, to } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/profitability'
```

### GET /exports/general-ledger.csv (unmounted declaration)

Declared at source line 28. Route handler pipeline names: `authorize`, `exportGeneralLedgerCSV`.

```js
router.get("/exports/general-ledger.csv", authorize("finance.view"), exportGeneralLedgerCSV)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `exportGeneralLedgerCSV`: [accountingExportController.js](../../../../server/controllers/accountingExportController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `exportGeneralLedgerCSV`

Handler starts at [controller line 6](../../../../server/controllers/accountingExportController.js#L6). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `ChartOfAccount.find`, `JournalEntry.find`.
- Input/validation source lines to inspect:
  - [Line 7](../../../../server/controllers/accountingExportController.js#L7): `try { const tenantId = requireTenantId(); const accounts = await ChartOfAccount.find({ tenantId }).select("_id code name type").lean(); const map = new Map(accounts.map(a`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/exports/general-ledger.csv'
```

### GET /exports/tax-control.csv (unmounted declaration)

Declared at source line 29. Route handler pipeline names: `authorize`, `exportTaxControlCSV`.

```js
router.get("/exports/tax-control.csv", authorize("finance.view"), exportTaxControlCSV)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `exportTaxControlCSV`: [accountingExportController.js](../../../../server/controllers/accountingExportController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `exportTaxControlCSV`

Handler starts at [controller line 10](../../../../server/controllers/accountingExportController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `ChartOfAccount.find`, `JournalEntry.find`.
- Input/validation source lines to inspect:
  - [Line 11](../../../../server/controllers/accountingExportController.js#L11): `try { const tenantId = requireTenantId(); const accounts = await ChartOfAccount.find({ tenantId, code: { $in: ["2110", "2120", "2130"] } }).select("_id code name").lean()`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/exports/tax-control.csv'
```

### GET /subledgers (unmounted declaration)

Declared at source line 30. Route handler pipeline names: `authorize`, `listSubledger`.

```js
router.get("/subledgers", authorize("finance.view"), listSubledger)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listSubledger`: [accountingSubledgerController.js](../../../../server/controllers/accountingSubledgerController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listSubledger`

Handler starts at [controller line 89](../../../../server/controllers/accountingSubledgerController.js#L89). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `type`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `AccountingSubledger.find`.
- Input/validation source lines to inspect:
  - [Line 93](../../../../server/controllers/accountingSubledgerController.js#L93): `const requestedType = req.query.type ? String(req.query.type).toLowerCase() : "";`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/subledgers'
```

### POST /subledgers (unmounted declaration)

Declared at source line 31. Route handler pipeline names: `authorize`, `createSubledger`.

```js
router.post("/subledgers", authorize("finance.manage"), createSubledger)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createSubledger`: [accountingSubledgerController.js](../../../../server/controllers/accountingSubledgerController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `createSubledger`

Handler starts at [controller line 145](../../../../server/controllers/accountingSubledgerController.js#L145). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Unsupported accounting subledger type.”; “Reference is required.”; “Description is required.”; “Amount must be greater than zero.”; “Inventory quantity must be greater than zero.”; “Inventory unit cost must be greater than zero.”; “Direction must be in or out.”; “This subledger reference already exists for the tenant.”.
- Database operations detected: `AccountingSubledger.create`, `AccountingSubledger.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 147](../../../../server/controllers/accountingSubledgerController.js#L147): `const tenantId = requireTenantId(); const b = req.body || {}; const type = String(b.type || "").trim().toLowerCase(); const amount = money(b.amount); const currency = nor`
  - [Line 148](../../../../server/controllers/accountingSubledgerController.js#L148): `if (!allowed.has(type)) return res.status(400).json({ success: false, message: "Unsupported accounting subledger type." });`
  - [Line 149](../../../../server/controllers/accountingSubledgerController.js#L149): `if (!b.reference || !String(b.reference).trim()) return res.status(400).json({ success: false, message: "Reference is required." });`
  - [Line 150](../../../../server/controllers/accountingSubledgerController.js#L150): `if (!b.description || !String(b.description).trim()) return res.status(400).json({ success: false, message: "Description is required." });`
  - [Line 151](../../../../server/controllers/accountingSubledgerController.js#L151): `if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Amount must be greater than zero." });`
  - [Line 152](../../../../server/controllers/accountingSubledgerController.js#L152): `const currencyError = validateCurrencyAndRate(currency, rate); if (currencyError) return res.status(400).json({ success: false, message: currencyError });`
  - [Line 153](../../../../server/controllers/accountingSubledgerController.js#L153): `if (type === "inventory" && (!Number.isFinite(quantity) || quantity <= 0)) return res.status(400).json({ success: false, message: "Inventory quantity must be greater than`
  - [Line 154](../../../../server/controllers/accountingSubledgerController.js#L154): `if (type === "inventory" && unitCost <= 0) return res.status(400).json({ success: false, message: "Inventory unit cost must be greater than zero." });`
  - [Line 155](../../../../server/controllers/accountingSubledgerController.js#L155): `if (!["in", "out"].includes(direction)) return res.status(400).json({ success: false, message: "Direction must be in or out." });`
  - [Line 162](../../../../server/controllers/accountingSubledgerController.js#L162): `} catch (e) { if (e?.code === 11000) return res.status(409).json({ success: false, message: "This subledger reference already exists for the tenant." }); next(e); }`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/subledgers'
```

### POST /subledgers/:id/amortize (unmounted declaration)

Declared at source line 32. Route handler pipeline names: `authorize`, `amortizeSubledger`.

```js
router.post("/subledgers/:id/amortize", authorize("finance.manage"), amortizeSubledger)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `amortizeSubledger`: [accountingSubledgerController.js](../../../../server/controllers/accountingSubledgerController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `amortizeSubledger`

Handler starts at [controller line 165](../../../../server/controllers/accountingSubledgerController.js#L165). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`, `reference`, `transactionDate`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`, `journalEntry`.
- Literal messages include: “Subledger record not found.”; “Only prepayments can be amortized here.”; “Amortization amount must be positive and cannot exceed the prepayment balance.”.
- Database operations detected: `AccountingSubledger.findOne`.
- Input/validation source lines to inspect:
  - [Line 167](../../../../server/controllers/accountingSubledgerController.js#L167): `const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({`
  - [Line 168](../../../../server/controllers/accountingSubledgerController.js#L168): `const amount = money(req.body?.amount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Amortization amount mus`
  - [Line 169](../../../../server/controllers/accountingSubledgerController.js#L169): `const posting = await postFinanceEntry({ tenantId, sourceType: "prepayment_amortization", sourceId: hashId(\`${row._id}:${req.body?.reference || ""}:${amount}\`), descrip`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/subledgers/<id>/amortize'
```

### POST /subledgers/:id/reverse (unmounted declaration)

Declared at source line 33. Route handler pipeline names: `authorize`, `reverseAccrual`.

```js
router.post("/subledgers/:id/reverse", authorize("finance.manage"), reverseAccrual)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `reverseAccrual`: [accountingSubledgerController.js](../../../../server/controllers/accountingSubledgerController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `reverseAccrual`

Handler starts at [controller line 174](../../../../server/controllers/accountingSubledgerController.js#L174). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`, `reference`, `transactionDate`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `status`, `success`, `message`, `data`, `journalEntry`.
- Literal messages include: “Subledger record not found.”; “Only accruals can be reversed here.”; “Invalid accrual reversal amount.”.
- Database operations detected: `AccountingSubledger.findOne`.
- Input/validation source lines to inspect:
  - [Line 176](../../../../server/controllers/accountingSubledgerController.js#L176): `const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({`
  - [Line 177](../../../../server/controllers/accountingSubledgerController.js#L177): `const amount = money(req.body?.amount || row.baseAmount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Inval`
  - [Line 178](../../../../server/controllers/accountingSubledgerController.js#L178): `const posting = await postFinanceEntry({ tenantId, sourceType: "accrual_reversal", sourceId: hashId(\`${row._id}:reverse:${req.body?.reference || ""}:${amount}\`), descri`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/subledgers/<id>/reverse'
```

### GET /reconciliation/transactions (unmounted declaration)

Declared at source line 34. Route handler pipeline names: `authorize`, `listReconciliationTransactions`.

```js
router.get("/reconciliation/transactions", authorize("finance.view"), listReconciliationTransactions)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listReconciliationTransactions`: [accountingReconciliationController.js](../../../../server/controllers/accountingReconciliationController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listReconciliationTransactions`

Handler starts at [controller line 9](../../../../server/controllers/accountingReconciliationController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `sourceType`, `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `AccountingReconciliation.find`.
- Input/validation source lines to inspect:
  - [Line 10](../../../../server/controllers/accountingReconciliationController.js#L10): `try { requireTenantId(); const q = mergeTenantFilter(req, {}); if (req.query.sourceType && allowed.has(String(req.query.sourceType))) q.sourceType = String(req.query.sour`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/reconciliation/transactions'
```

### POST /reconciliation/transactions (unmounted declaration)

Declared at source line 35. Route handler pipeline names: `authorize`, `createReconciliationTransaction`.

```js
router.post("/reconciliation/transactions", authorize("finance.manage"), createReconciliationTransaction)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createReconciliationTransaction`: [accountingReconciliationController.js](../../../../server/controllers/accountingReconciliationController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `createReconciliationTransaction`

Handler starts at [controller line 13](../../../../server/controllers/accountingReconciliationController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Source type, external reference and positive amount are required.”; “This external reference is already reconciled for the tenant.”.
- Database operations detected: `AccountingReconciliation.create`.
- Input/validation source lines to inspect:
  - [Line 15](../../../../server/controllers/accountingReconciliationController.js#L15): `const tenantId = requireTenantId(); const b = req.body || {}; const sourceType = String(b.sourceType || "").toLowerCase(); const amount = money(b.amount);`
  - [Line 16](../../../../server/controllers/accountingReconciliationController.js#L16): `if (!allowed.has(sourceType) || !String(b.externalReference || "").trim() || amount <= 0) return res.status(400).json({ success: false, message: "Source type, external re`
  - [Line 19](../../../../server/controllers/accountingReconciliationController.js#L19): `} catch (e) { if (e?.code === 11000) return res.status(409).json({ success: false, message: "This external reference is already reconciled for the tenant." }); next(e); }`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/reconciliation/transactions'
```

### POST /reconciliation/transactions/:id/match (unmounted declaration)

Declared at source line 36. Route handler pipeline names: `authorize`, `matchReconciliationTransaction`.

```js
router.post("/reconciliation/transactions/:id/match", authorize("finance.manage"), matchReconciliationTransaction)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `matchReconciliationTransaction`: [accountingReconciliationController.js](../../../../server/controllers/accountingReconciliationController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `matchReconciliationTransaction`

Handler starts at [controller line 22](../../../../server/controllers/accountingReconciliationController.js#L22). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `journalEntryId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `expected`, `journalMovement`, `data`.
- Literal messages include: “Reconciliation transaction not found.”; “Transaction is already matched.”; “Posted journal entry not found.”; “Reconciliation amount does not match the cash/bank movement in the selected journal entry.”.
- Database operations detected: `AccountingReconciliation.findOne`, `JournalEntry.findOne`, `ChartOfAccount.find`.
- Input/validation source lines to inspect:
  - [Line 24](../../../../server/controllers/accountingReconciliationController.js#L24): `const tenantId = requireTenantId(); const row = await AccountingReconciliation.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).j`
  - [Line 25](../../../../server/controllers/accountingReconciliationController.js#L25): `const entry = await JournalEntry.findOne(mergeTenantFilter(req, { _id: req.body?.journalEntryId, status: "posted" })).lean(); if (!entry) return res.status(404).json({ su`
  - [Line 28](../../../../server/controllers/accountingReconciliationController.js#L28): `if (Math.abs(Math.abs(matchedAmount) - row.amount) > 0.01) return res.status(409).json({ success: false, message: "Reconciliation amount does not match the cash/bank move`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/reconciliation/transactions/<id>/match'
```

### POST /reconciliation/transactions/:id/exception (unmounted declaration)

Declared at source line 37. Route handler pipeline names: `authorize`, `markReconciliationException`.

```js
router.post("/reconciliation/transactions/:id/exception", authorize("finance.manage"), markReconciliationException)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `markReconciliationException`: [accountingReconciliationController.js](../../../../server/controllers/accountingReconciliationController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `markReconciliationException`

Handler starts at [controller line 33](../../../../server/controllers/accountingReconciliationController.js#L33). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Reconciliation transaction not found.”.
- Database operations detected: `AccountingReconciliation.findOne`.
- Input/validation source lines to inspect:
  - [Line 34](../../../../server/controllers/accountingReconciliationController.js#L34): `try { requireTenantId(); const row = await AccountingReconciliation.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ succe`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/reconciliation/transactions/<id>/exception'
```

### POST /operational-reconciliation (unmounted declaration)

Declared at source line 38. Route handler pipeline names: `authorize`, `reconcileOperationalAccounting`.

```js
router.post("/operational-reconciliation", authorize("finance.manage"), reconcileOperationalAccounting)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `reconcileOperationalAccounting`: [accountingOperationalReconciliationController.js](../../../../server/controllers/accountingOperationalReconciliationController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `reconcileOperationalAccounting`

Handler starts at [controller line 31](../../../../server/controllers/accountingOperationalReconciliationController.js#L31). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `Payment.find`, `Invoice.find`, `Expense.find`, `SupplierPayable.findOne`, `JournalEntry.findOne`, `SupplierPayable.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/operational-reconciliation'
```

### GET /assets (unmounted declaration)

Declared at source line 39. Route handler pipeline names: `authorize`, `listAssets`.

```js
router.get("/assets", authorize("finance.view"), listAssets)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listAssets`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listAssets`

Handler starts at [controller line 14](../../../../server/controllers/managementAccountingController.js#L14). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `FixedAsset.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/assets'
```

### POST /assets (unmounted declaration)

Declared at source line 40. Route handler pipeline names: `authorize`, `createAsset`.

```js
router.post("/assets", authorize("finance.manage"), createAsset)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createAsset`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `createAsset`

Handler starts at [controller line 16](../../../../server/controllers/managementAccountingController.js#L16). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Asset number, name, acquisition date, positive cost and useful life are required; residual value cannot exceed cost.”.
- Database operations detected: `FixedAsset.create`, `FixedAsset.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 18](../../../../server/controllers/managementAccountingController.js#L18): `const tenantId = requireTenantId(); const b = req.body || {}; const cost = money(b.acquisitionCost); const residual = money(b.residualValue);`
  - [Line 19](../../../../server/controllers/managementAccountingController.js#L19): `if (!b.assetNumber || !b.name || !b.acquisitionDate || cost <= 0 || Number(b.usefulLifeMonths) <= 0 || residual > cost) return res.status(400).json({ success: false, mess`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/assets'
```

### POST /assets/:id/depreciate (unmounted declaration)

Declared at source line 41. Route handler pipeline names: `authorize`, `postAssetDepreciation`.

```js
router.post("/assets/:id/depreciate", authorize("finance.manage"), postAssetDepreciation)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `postAssetDepreciation`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `postAssetDepreciation`

Handler starts at [controller line 39](../../../../server/controllers/managementAccountingController.js#L39). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `months`, `period`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`, `posted`.
- Literal messages include: “Fixed asset not found.”; “Only active assets can be depreciated.”; “Depreciation period must be YYYY-MM.”.
- Database operations detected: `FixedAsset.findOne`.
- Input/validation source lines to inspect:
  - [Line 41](../../../../server/controllers/managementAccountingController.js#L41): `const tenantId = requireTenantId(); const asset = await FixedAsset.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!asset) return res.status(404).json({ succ`
  - [Line 42](../../../../server/controllers/managementAccountingController.js#L42): `const months = Math.max(1, Number(req.body?.months || 1)); const p = String(req.body?.period || currentPeriod()); if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p)) return res.statu`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/assets/<id>/depreciate'
```

### POST /assets/:id/dispose (unmounted declaration)

Declared at source line 42. Route handler pipeline names: `authorize`, `disposeAsset`.

```js
router.post("/assets/:id/dispose", authorize("finance.manage"), disposeAsset)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `disposeAsset`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `disposeAsset`

Handler starts at [controller line 28](../../../../server/controllers/managementAccountingController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `proceeds`, `disposalDate`, `reference`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Fixed asset not found.”; “Asset has already been disposed.”.
- Database operations detected: `FixedAsset.findOne`.
- Input/validation source lines to inspect:
  - [Line 30](../../../../server/controllers/managementAccountingController.js#L30): `const tenantId = requireTenantId(); const asset = await FixedAsset.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!asset) return res.status(404).json({ succ`
  - [Line 31](../../../../server/controllers/managementAccountingController.js#L31): `const proceeds = money(req.body?.proceeds); const date = req.body?.disposalDate || new Date(); const netBook = money(asset.acquisitionCost - asset.accumulatedDepreciation`
  - [Line 34](../../../../server/controllers/managementAccountingController.js#L34): `const entry = await postFinanceEntry({ tenantId, sourceType: "fixed_asset_disposal", sourceId: asset._id, description: \`Fixed asset disposal ${asset.assetNumber}\`, refe`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/assets/<id>/dispose'
```

### GET /budgets (unmounted declaration)

Declared at source line 43. Route handler pipeline names: `authorize`, `listBudgets`.

```js
router.get("/budgets", authorize("finance.view"), listBudgets)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listBudgets`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listBudgets`

Handler starts at [controller line 51](../../../../server/controllers/managementAccountingController.js#L51). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `fiscalYear`, `accountCode`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `FinanceBudget.find`.
- Input/validation source lines to inspect:
  - [Line 51](../../../../server/controllers/managementAccountingController.js#L51): `async function listBudgets(req, res, next) { try { const filter = {}; if (req.query.fiscalYear) filter.fiscalYear = Number(req.query.fiscalYear); if (req.query.accountCod`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/budgets'
```

### POST /budgets (unmounted declaration)

Declared at source line 44. Route handler pipeline names: `authorize`, `upsertBudget`.

```js
router.post("/budgets", authorize("finance.manage"), upsertBudget)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `upsertBudget`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `upsertBudget`

Handler starts at [controller line 52](../../../../server/controllers/managementAccountingController.js#L52). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Budget name, account, fiscal year, valid month and non-negative amount are required.”.
- Database operations detected: `FinanceBudget.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 52](../../../../server/controllers/managementAccountingController.js#L52): `async function upsertBudget(req, res, next) { try { const tenantId = requireTenantId(); const b = req.body || {}; const fiscalYear = Number(b.fiscalYear); const month = b`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/budgets'
```

### POST /budgets/:id/approve (unmounted declaration)

Declared at source line 45. Route handler pipeline names: `authorize`, `approveBudget`.

```js
router.post("/budgets/:id/approve", authorize("finance.manage"), approveBudget)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `approveBudget`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `approveBudget`

Handler starts at [controller line 53](../../../../server/controllers/managementAccountingController.js#L53). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Budget not found.”; “Only draft budgets can be approved.”.
- Database operations detected: `FinanceBudget.findOne`.
- Input/validation source lines to inspect:
  - [Line 53](../../../../server/controllers/managementAccountingController.js#L53): `async function approveBudget(req, res, next) { try { const data = await FinanceBudget.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!data) return res.statu`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/budgets/<id>/approve'
```

### GET /budgets-vs-actual (unmounted declaration)

Declared at source line 46. Route handler pipeline names: `authorize`, `budgetVsActual`.

```js
router.get("/budgets-vs-actual", authorize("finance.view"), budgetVsActual)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `budgetVsActual`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `budgetVsActual`

Handler starts at [controller line 54](../../../../server/controllers/managementAccountingController.js#L54). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `fiscalYear`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `FinanceBudget.find`, `ChartOfAccount.find`, `JournalEntry.find`.
- Input/validation source lines to inspect:
  - [Line 54](../../../../server/controllers/managementAccountingController.js#L54): `async function budgetVsActual(req, res, next) { try { requireTenantId(); const fiscalYear = Number(req.query.fiscalYear || new Date().getFullYear()); const budgets = awai`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/budgets-vs-actual'
```

### GET /periods (unmounted declaration)

Declared at source line 47. Route handler pipeline names: `authorize`, `listPeriods`.

```js
router.get("/periods", authorize("finance.view"), listPeriods)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listPeriods`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listPeriods`

Handler starts at [controller line 55](../../../../server/controllers/managementAccountingController.js#L55). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `AccountingPeriod.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/periods'
```

### POST /periods/:period/close (unmounted declaration)

Declared at source line 48. Route handler pipeline names: `authorize`, `closePeriod`.

```js
router.post("/periods/:period/close", authorize("finance.manage"), closePeriod)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `closePeriod`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `closePeriod`

Handler starts at [controller line 56](../../../../server/controllers/managementAccountingController.js#L56). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `note`.
- Path parameters read: `period`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Period must be YYYY-MM.”; “Accounting period is already closed.”.
- Database operations detected: `AccountingPeriod.findOne`, `JournalEntry.countDocuments`, `AccountingPeriod.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 56](../../../../server/controllers/managementAccountingController.js#L56): `async function closePeriod(req, res, next) { try { const tenantId = requireTenantId(); const p = String(req.params.period); if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p)) return`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/periods/<period>/close'
```

### POST /periods/:period/reopen (unmounted declaration)

Declared at source line 49. Route handler pipeline names: `authorize`, `reopenPeriod`.

```js
router.post("/periods/:period/reopen", authorize("finance.manage"), reopenPeriod)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `reopenPeriod`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `reopenPeriod`

Handler starts at [controller line 57](../../../../server/controllers/managementAccountingController.js#L57). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `period`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Accounting period not found.”.
- Database operations detected: `AccountingPeriod.findOne`.
- Input/validation source lines to inspect:
  - [Line 57](../../../../server/controllers/managementAccountingController.js#L57): `async function reopenPeriod(req, res, next) { try { const data = await AccountingPeriod.findOne(mergeTenantFilter(req, { period: String(req.params.period) })); if (!data)`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/periods/<period>/reopen'
```

### POST /periods/:year/year-end-close (unmounted declaration)

Declared at source line 50. Route handler pipeline names: `authorize`, `closeFinancialYear`.

```js
router.post("/periods/:year/year-end-close", authorize("finance.manage"), closeFinancialYear)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `closeFinancialYear`: [managementAccountingController.js](../../../../server/controllers/managementAccountingController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `closeFinancialYear`

Handler starts at [controller line 59](../../../../server/controllers/managementAccountingController.js#L59). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `year`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “A valid fiscal year is required.”; “All twelve accounting periods must be closed before year-end transfer.”; “There is no current-year profit or loss to transfer.”.
- Database operations detected: `AccountingPeriod.find`, `JournalEntry.findOne`, `JournalEntry.find`, `ChartOfAccount.find`.
- Input/validation source lines to inspect:
  - [Line 61](../../../../server/controllers/managementAccountingController.js#L61): `const tenantId = requireTenantId(); const year = Number(req.params.year); if (!Number.isInteger(year) || year < 2000 || year > 2100) return res.status(400).json({ success`
  - [Line 62](../../../../server/controllers/managementAccountingController.js#L62): `const periods = await AccountingPeriod.find({ tenantId, period: { $gte: \`${year}-01\`, $lte: \`${year}-12\` } }).lean(); if (periods.some((p) => p.status !== "closed")) `
  - [Line 63](../../../../server/controllers/managementAccountingController.js#L63): `const already = await JournalEntry.findOne({ tenantId, sourceType: "year_end_close", sourceId: String(year) }).lean(); if (already) return res.status(409).json({ success:`
  - [Line 65](../../../../server/controllers/managementAccountingController.js#L65): `const net = money(revenue - expenses); if (Math.abs(net) < 0.01) return res.status(409).json({ success: false, message: "There is no current-year profit or loss to transf`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/periods/<year>/year-end-close'
```

