# Route module: operationsRoutes.js

**Source:** [server/routes/operationsRoutes.js](../../../../server/routes/operationsRoutes.js)

Observed mount prefixes include `/api/admin/operations`.

## Router-wide middleware

- `router.use(resolveTenant, protect, checkPermission("booking.manage"));`
- `router.use("/module", operationsModuleRoutes);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/operations`

Declared at source line 8. Route handler pipeline names: `getOperationsOverview`.

```js
router.get("/", getOperationsOverview)
```

- Imported handler/middleware `getOperationsOverview`: [operationsController.js](../../../../server/controllers/operationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getOperationsOverview`

Handler starts at [controller line 48](../../../../server/controllers/operationsController.js#L48). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.find`, `Vehicle.find`, `Staff.find`, `Supplier.countDocuments`, `PurchaseOrder.find`, `TourCost.find`, `SupplierPayable.find`, `CorporateAccount.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/operations'
```

