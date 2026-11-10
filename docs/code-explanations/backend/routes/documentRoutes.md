# Route module: documentRoutes.js

**Source:** [server/routes/documentRoutes.js](../../../../server/routes/documentRoutes.js)

Observed mount prefixes include `/api/documents/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /:id → `/api/documents/:id`

Declared at source line 47. Route handler pipeline names: `uploadDocument`.

```js
router.post(
  "/:id",
  upload.single("document"),
  uploadDocument
)
```

- Imported handler/middleware `uploadDocument`: [documentController.js](../../../../server/controllers/documentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `uploadDocument`

Handler starts at [controller line 24](../../../../server/controllers/documentController.js#L24). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Invalid booking ID.”; “Please upload a document.”; “Booking not found.”; “Document uploaded successfully.”.
- Database operations detected: `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 33](../../../../server/controllers/documentController.js#L33): `if (!isValidId(req.params.id)) {`
  - [Line 34](../../../../server/controllers/documentController.js#L34): `return res.status(400).json({`
  - [Line 47](../../../../server/controllers/documentController.js#L47): `return res.status(400).json({`
  - [Line 61](../../../../server/controllers/documentController.js#L61): `_id:req.params.id`
  - [Line 66](../../../../server/controllers/documentController.js#L66): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/documents/<id>'
```

