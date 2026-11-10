# Route module: invoiceRoutes.js

**Source:** [server/routes/invoiceRoutes.js](../../../../server/routes/invoiceRoutes.js)

Observed mount prefixes include `/api/invoices/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /:id → `/api/invoices/:id`

Declared at source line 38. Route handler pipeline names: `invoiceOwnerOrPrivileged`, `downloadInvoice`.

```js
router.get("/:id", invoiceOwnerOrPrivileged, downloadInvoice)
```

- Imported handler/middleware `downloadInvoice`: [invoiceController.js](../../../../server/controllers/invoiceController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `downloadInvoice`

Handler starts at [controller line 179](../../../../server/controllers/invoiceController.js#L179). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Booking not found”; “Invoice PDF not found”.
- Database operations detected: `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 183](../../../../server/controllers/invoiceController.js#L183): `_id:req.params.id`
  - [Line 188](../../../../server/controllers/invoiceController.js#L188): `return res.status(404).json({`
  - [Line 201](../../../../server/controllers/invoiceController.js#L201): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/invoices/<id>'
```

