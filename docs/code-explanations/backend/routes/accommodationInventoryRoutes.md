# Route module: accommodationInventoryRoutes.js

**Source:** [server/routes/accommodationInventoryRoutes.js](../../../../server/routes/accommodationInventoryRoutes.js)

No observed mount was found in the main API or app setup; the declarations are not assumed reachable.

## Router-wide middleware

- `router.use(resolveTenant,protect,checkPermission("booking.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / (unmounted declaration)

Declared at source line 7. Route handler pipeline names: `listAccommodationInventory`.

```js
router.get("/",listAccommodationInventory)
```

- Imported handler/middleware `listAccommodationInventory`: [accommodationInventoryController.js](../../../../server/controllers/accommodationInventoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listAccommodationInventory`

Handler starts at [controller line 4](../../../../server/controllers/accommodationInventoryController.js#L4). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `AccommodationInventory.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/'
```

### POST / (unmounted declaration)

Declared at source line 8. Route handler pipeline names: `createAccommodationInventory`.

```js
router.post("/",createAccommodationInventory)
```

- Imported handler/middleware `createAccommodationInventory`: [accommodationInventoryController.js](../../../../server/controllers/accommodationInventoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createAccommodationInventory`

Handler starts at [controller line 5](../../../../server/controllers/accommodationInventoryController.js#L5). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `totalRooms`, `availableRooms`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`.
- Database operations detected: `AccommodationInventory.create`.
- Input/validation source lines to inspect:
  - [Line 5](../../../../server/controllers/accommodationInventoryController.js#L5): `async(req,res,next)=>{try{const total=Math.max(0,Number(req.body.totalRooms||0));const available=Math.min(total,Math.max(0,Number(req.body.availableRooms??total)));const `

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/'
```

### PATCH /:id (unmounted declaration)

Declared at source line 9. Route handler pipeline names: `updateAccommodationInventory`.

```js
router.patch("/:id",updateAccommodationInventory)
```

- Imported handler/middleware `updateAccommodationInventory`: [accommodationInventoryController.js](../../../../server/controllers/accommodationInventoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateAccommodationInventory`

Handler starts at [controller line 6](../../../../server/controllers/accommodationInventoryController.js#L6). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Accommodation inventory record not found.”.
- Database operations detected: `AccommodationInventory.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 6](../../../../server/controllers/accommodationInventoryController.js#L6): `async(req,res,next)=>{try{const data=await AccommodationInventory.findOneAndUpdate({...tenantFilter(req),_id:req.params.id},{...req.body,updatedBy:uid(req)},{new:true,run`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/<id>'
```

