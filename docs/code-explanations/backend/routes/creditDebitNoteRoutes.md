# Route module: creditDebitNoteRoutes.js

**Source:** [server/routes/creditDebitNoteRoutes.js](../../../../server/routes/creditDebitNoteRoutes.js)

Observed mount prefixes include `/api/admin/credit-debit-notes`, `/api/admin/credit-debit-notes/:id/issue`, `/api/admin/credit-debit-notes/:id/cancel`.

## Router-wide middleware

- `router.use(resolveTenant, protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/credit-debit-notes`

Declared at source line 9. Route handler pipeline names: `authorize`, `listCreditDebitNotes`.

```js
router.get("/", authorize("finance.view"), listCreditDebitNotes)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listCreditDebitNotes`: [creditDebitNoteController.js](../../../../server/controllers/creditDebitNoteController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listCreditDebitNotes`

Handler starts at [controller line 8](../../../../server/controllers/creditDebitNoteController.js#L8). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `CreditDebitNote.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/credit-debit-notes'
```

### POST / → `/api/admin/credit-debit-notes`

Declared at source line 10. Route handler pipeline names: `authorize`, `createCreditDebitNote`.

```js
router.post("/", authorize("finance.manage"), createCreditDebitNote)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createCreditDebitNote`: [creditDebitNoteController.js](../../../../server/controllers/creditDebitNoteController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCreditDebitNote`

Handler starts at [controller line 9](../../../../server/controllers/creditDebitNoteController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `type`, `originalInvoice`, `reason`, `amount`, `taxAmount`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Type must be credit or debit.”; “Original invoice is invalid.”; “Reason is required.”; “Original invoice not found.”; “Note amount must be greater than zero.”; “Credit note cannot exceed the original invoice total.”.
- Database operations detected: `Invoice.findOne`, `CreditDebitNote.create`.
- Input/validation source lines to inspect:
  - [Line 9](../../../../server/controllers/creditDebitNoteController.js#L9): `async (req, res, next) => { requireTenantId(); try { const { type, originalInvoice, reason, amount, taxAmount = 0 } = req.body || {}; if (!["credit","debit"].includes(Str`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/credit-debit-notes'
```

### POST /:id/issue → `/api/admin/credit-debit-notes/:id/issue`

Declared at source line 11. Route handler pipeline names: `authorize`, `issueCreditDebitNote`.

```js
router.post("/:id/issue", authorize("finance.manage"), issueCreditDebitNote)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `issueCreditDebitNote`: [creditDebitNoteController.js](../../../../server/controllers/creditDebitNoteController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `issueCreditDebitNote`

Handler starts at [controller line 10](../../../../server/controllers/creditDebitNoteController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Credit/debit note not found.”.
- Database operations detected: `CreditDebitNote.findOne`.
- Input/validation source lines to inspect:
  - [Line 10](../../../../server/controllers/creditDebitNoteController.js#L10): `async (req,res,next)=>{requireTenantId();try{const note=await CreditDebitNote.findOne(mergeTenantFilter(req,{_id:req.params.id}));if(!note)return res.status(404).json({su`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/credit-debit-notes/<id>/issue'
```

### POST /:id/cancel → `/api/admin/credit-debit-notes/:id/cancel`

Declared at source line 12. Route handler pipeline names: `authorize`, `cancelCreditDebitNote`.

```js
router.post("/:id/cancel", authorize("finance.manage"), cancelCreditDebitNote)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `cancelCreditDebitNote`: [creditDebitNoteController.js](../../../../server/controllers/creditDebitNoteController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `cancelCreditDebitNote`

Handler starts at [controller line 11](../../../../server/controllers/creditDebitNoteController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Credit/debit note not found.”; “Only draft notes can be cancelled.”.
- Database operations detected: `CreditDebitNote.findOne`.
- Input/validation source lines to inspect:
  - [Line 11](../../../../server/controllers/creditDebitNoteController.js#L11): `async (req,res,next)=>{requireTenantId();try{const note=await CreditDebitNote.findOne(mergeTenantFilter(req,{_id:req.params.id}));if(!note)return res.status(404).json({su`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/credit-debit-notes/<id>/cancel'
```

