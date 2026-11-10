# Route module: customerRoutes.js

**Source:** [server/routes/customerRoutes.js](../../../../server/routes/customerRoutes.js)

Observed mount prefixes include `/api/admin/customers`, `/api/customers`, `/api/admin/customers/:id`, `/api/customers/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(adminMiddleware);`
- `router.use(authorize("manage_customers"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/customers`, `/api/customers`

Declared at source line 49. Route handler pipeline names: `getCustomers`.

```js
router.get(
  "/",
  getCustomers
)
```

- Imported handler/middleware `getCustomers`: [customerController.js](../../../../server/controllers/customerController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getCustomers`

Handler starts at [controller line 34](../../../../server/controllers/customerController.js#L34). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `search`, `page`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Role.find`, `User.find`, `User.countDocuments`, `Customer.find`, `Booking.find`.
- Input/validation source lines to inspect:
  - [Line 37](../../../../server/controllers/customerController.js#L37): `const { search = "", page = 1 } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/customers'
```

### GET /:id → `/api/admin/customers/:id`, `/api/customers/:id`

Declared at source line 58. Route handler pipeline names: `getCustomerProfile`.

```js
router.get(
  "/:id",
  getCustomerProfile
)
```

- Imported handler/middleware `getCustomerProfile`: [customerController.js](../../../../server/controllers/customerController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getCustomerProfile`

Handler starts at [controller line 58](../../../../server/controllers/customerController.js#L58). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid customer ID.”; “Customer not found.”.
- Database operations detected: `User.findOne`, `Customer.findOne`, `Booking.find`, `Invoice.find`, `Quotation.find`, `Review.find`, `Notification.find`.
- Input/validation source lines to inspect:
  - [Line 58](../../../../server/controllers/customerController.js#L58): `async (req, res, next) => { try { if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid customer ID." }); requireTenantId(); cons`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/customers/<id>'
```

