# Route module: operationsModuleRoutes.js

**Source:** [server/routes/operationsModuleRoutes.js](../../../../server/routes/operationsModuleRoutes.js)

No observed mount was found in the main API or app setup; the declarations are not assumed reachable.

## Router-wide middleware

- `router.use(resolveTenant, protect, checkPermission("booking.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /suppliers (unmounted declaration)

Declared at source line 14. Route handler pipeline names: `listSuppliers`.

```js
router.get("/suppliers", listSuppliers)
```

- Imported handler/middleware `listSuppliers`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listSuppliers`

Handler starts at [controller line 10](../../../../server/controllers/operationsModuleController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Supplier.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/suppliers'
```

### POST /suppliers (unmounted declaration)

Declared at source line 15. Route handler pipeline names: `createSupplier`.

```js
router.post("/suppliers", createSupplier)
```

- Imported handler/middleware `createSupplier`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createSupplier`

Handler starts at [controller line 11](../../../../server/controllers/operationsModuleController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 11](../../../../server/controllers/operationsModuleController.js#L11): `async(req,res,next)=>{try{return ok(res,await operations.createSupplier(req.body,userId(req)),201);}catch(e){return fail(next,e);}}`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/suppliers'
```

### PATCH /suppliers/:id (unmounted declaration)

Declared at source line 16. Route handler pipeline names: `updateSupplier`.

```js
router.patch("/suppliers/:id", updateSupplier)
```

- Imported handler/middleware `updateSupplier`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateSupplier`

Handler starts at [controller line 12](../../../../server/controllers/operationsModuleController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Supplier not found.”.
- Database operations detected: `Supplier.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 12](../../../../server/controllers/operationsModuleController.js#L12): `async(req,res,next)=>{try{const supplier=await Supplier.findOneAndUpdate({...tenantFilter(req),_id:req.params.id},{...req.body,updatedBy:userId(req)},{new:true,runValidat`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/suppliers/<id>'
```

### GET /purchase-orders (unmounted declaration)

Declared at source line 17. Route handler pipeline names: `listPurchaseOrders`.

```js
router.get("/purchase-orders", listPurchaseOrders)
```

- Imported handler/middleware `listPurchaseOrders`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listPurchaseOrders`

Handler starts at [controller line 13](../../../../server/controllers/operationsModuleController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `PurchaseOrder.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/purchase-orders'
```

### POST /purchase-orders (unmounted declaration)

Declared at source line 18. Route handler pipeline names: `createPurchaseOrder`.

```js
router.post("/purchase-orders", createPurchaseOrder)
```

- Imported handler/middleware `createPurchaseOrder`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createPurchaseOrder`

Handler starts at [controller line 14](../../../../server/controllers/operationsModuleController.js#L14). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 14](../../../../server/controllers/operationsModuleController.js#L14): `async(req,res,next)=>{try{return ok(res,await operations.createPurchaseOrder(req.body,userId(req)),201);}catch(e){return fail(next,e);}}`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/purchase-orders'
```

### PATCH /purchase-orders/:id/status (unmounted declaration)

Declared at source line 19. Route handler pipeline names: `transitionPurchaseOrder`.

```js
router.patch("/purchase-orders/:id/status", transitionPurchaseOrder)
```

- Imported handler/middleware `transitionPurchaseOrder`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `transitionPurchaseOrder`

Handler starts at [controller line 15](../../../../server/controllers/operationsModuleController.js#L15). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 15](../../../../server/controllers/operationsModuleController.js#L15): `async(req,res,next)=>{try{return ok(res,await operations.transitionPurchaseOrder(req.params.id,req.body.status,userId(req)));}catch(e){return fail(next,e);}}`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/purchase-orders/<id>/status'
```

### GET /tour-costs (unmounted declaration)

Declared at source line 20. Route handler pipeline names: `listTourCosts`.

```js
router.get("/tour-costs", listTourCosts)
```

- Imported handler/middleware `listTourCosts`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listTourCosts`

Handler starts at [controller line 16](../../../../server/controllers/operationsModuleController.js#L16). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `tour`, `booking`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `TourCost.find`.
- Input/validation source lines to inspect:
  - [Line 16](../../../../server/controllers/operationsModuleController.js#L16): `async(req,res,next)=>{try{const filter=tenantFilter(req);if(req.query.tour)filter.tour=req.query.tour;if(req.query.booking)filter.booking=req.query.booking;return ok(res,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/tour-costs'
```

### POST /tour-costs (unmounted declaration)

Declared at source line 21. Route handler pipeline names: `createTourCost`.

```js
router.post("/tour-costs", createTourCost)
```

- Imported handler/middleware `createTourCost`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createTourCost`

Handler starts at [controller line 17](../../../../server/controllers/operationsModuleController.js#L17). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 17](../../../../server/controllers/operationsModuleController.js#L17): `async(req,res,next)=>{try{return ok(res,await operations.createTourCost(req.body,userId(req)),201);}catch(e){return fail(next,e);}}`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/tour-costs'
```

### GET /tour-costs/profitability/:tourId (unmounted declaration)

Declared at source line 22. Route handler pipeline names: `tourProfitability`.

```js
router.get("/tour-costs/profitability/:tourId", tourProfitability)
```

- Imported handler/middleware `tourProfitability`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `tourProfitability`

Handler starts at [controller line 18](../../../../server/controllers/operationsModuleController.js#L18). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `tourId`; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 18](../../../../server/controllers/operationsModuleController.js#L18): `async(req,res,next)=>{try{return ok(res,await operations.getTourProfitability(req.params.tourId));}catch(e){return fail(next,e);}}`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/tour-costs/profitability/<tourId>'
```

### GET /supplier-payables (unmounted declaration)

Declared at source line 23. Route handler pipeline names: `listSupplierPayables`.

```js
router.get("/supplier-payables", listSupplierPayables)
```

- Imported handler/middleware `listSupplierPayables`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listSupplierPayables`

Handler starts at [controller line 19](../../../../server/controllers/operationsModuleController.js#L19). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `SupplierPayable.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/supplier-payables'
```

### POST /supplier-payables (unmounted declaration)

Declared at source line 24. Route handler pipeline names: `createSupplierPayable`.

```js
router.post("/supplier-payables", createSupplierPayable)
```

- Imported handler/middleware `createSupplierPayable`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createSupplierPayable`

Handler starts at [controller line 20](../../../../server/controllers/operationsModuleController.js#L20). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 20](../../../../server/controllers/operationsModuleController.js#L20): `async(req,res,next)=>{try{const payable=await operations.createSupplierPayable(req.body,userId(req));await postSupplierPayable(payable);return ok(res,payable,201);}catch(`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/supplier-payables'
```

### POST /supplier-payables/:id/pay (unmounted declaration)

Declared at source line 25. Route handler pipeline names: `paySupplierPayable`.

```js
router.post("/supplier-payables/:id/pay", paySupplierPayable)
```

- Imported handler/middleware `paySupplierPayable`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `paySupplierPayable`

Handler starts at [controller line 21](../../../../server/controllers/operationsModuleController.js#L21). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`, `paymentReference`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Supplier payable not found.”.
- Database operations detected: `SupplierPayable.findOne`.
- Input/validation source lines to inspect:
  - [Line 21](../../../../server/controllers/operationsModuleController.js#L21): `async(req,res,next)=>{try{const amount=Number(req.body.amount);const before=await SupplierPayable.findOne(tenantFilter(req,{_id:req.params.id}));if(!before)return res.sta`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/supplier-payables/<id>/pay'
```

### GET /corporate-accounts (unmounted declaration)

Declared at source line 26. Route handler pipeline names: `listCorporateAccounts`.

```js
router.get("/corporate-accounts", listCorporateAccounts)
```

- Imported handler/middleware `listCorporateAccounts`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listCorporateAccounts`

Handler starts at [controller line 22](../../../../server/controllers/operationsModuleController.js#L22). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `CorporateAccount.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/corporate-accounts'
```

### POST /corporate-accounts (unmounted declaration)

Declared at source line 27. Route handler pipeline names: `createCorporateAccount`.

```js
router.post("/corporate-accounts", createCorporateAccount)
```

- Imported handler/middleware `createCorporateAccount`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCorporateAccount`

Handler starts at [controller line 23](../../../../server/controllers/operationsModuleController.js#L23). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 23](../../../../server/controllers/operationsModuleController.js#L23): `async(req,res,next)=>{try{return ok(res,await operations.createCorporateAccount(req.body,userId(req)),201);}catch(e){return fail(next,e);}}`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/corporate-accounts'
```

### POST /corporate-accounts/:id/reconcile (unmounted declaration)

Declared at source line 28. Route handler pipeline names: `reconcileCorporateAccount`.

```js
router.post("/corporate-accounts/:id/reconcile", reconcileCorporateAccount)
```

- Imported handler/middleware `reconcileCorporateAccount`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `reconcileCorporateAccount`

Handler starts at [controller line 24](../../../../server/controllers/operationsModuleController.js#L24). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 24](../../../../server/controllers/operationsModuleController.js#L24): `async(req,res,next)=>{try{return ok(res,await operations.reconcileCorporateAccountBalance(req.params.id));}catch(e){return fail(next,e);}}`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/corporate-accounts/<id>/reconcile'
```

### GET /resource-conflicts (unmounted declaration)

Declared at source line 29. Route handler pipeline names: `resourceConflicts`.

```js
router.get("/resource-conflicts", resourceConflicts)
```

- Imported handler/middleware `resourceConflicts`: [operationsModuleController.js](../../../../server/controllers/operationsModuleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `resourceConflicts`

Handler starts at [controller line 25](../../../../server/controllers/operationsModuleController.js#L25). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 25](../../../../server/controllers/operationsModuleController.js#L25): `async(req,res,next)=>{try{return ok(res,await operations.getResourceConflicts(req.query));}catch(e){return fail(next,e);}}`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/resource-conflicts'
```

