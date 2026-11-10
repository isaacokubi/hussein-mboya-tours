# Route module: vehicleRoutes.js

**Source:** [server/routes/vehicleRoutes.js](../../../../server/routes/vehicleRoutes.js)

Observed mount prefixes include `/api/vehicles`, `/api/vehicles/:id`, `/api/vehicles/:id/assign-driver`, `/api/vehicles/:id/remove-driver`, `/api/vehicles/:id/status`, `/api/vehicles/:id/restore`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST / → `/api/vehicles`

Declared at source line 29. Route handler pipeline names: `managerOnly`, `createVehicle`.

```js
router.post("/", managerOnly, upload.single("image"), createVehicle)
```

- Imported handler/middleware `managerOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `createVehicle`: [vehicleController.js](../../../../server/controllers/vehicleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createVehicle`

Handler starts at [controller line 14](../../../../server/controllers/vehicleController.js#L14). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `capacity`, `year`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `field`, `data`.
- Literal messages include: “Passenger capacity must be a whole number greater than 0.”; “Vehicle year is invalid.”; “Vehicle created successfully”.
- Database operations detected: `Vehicle.create`.
- Input/validation source lines to inspect:
  - [Line 17](../../../../server/controllers/vehicleController.js#L17): `const rawCapacity = req.body.capacity;`
  - [Line 19](../../../../server/controllers/vehicleController.js#L19): `const year = req.body.year === undefined || req.body.year === "" ? undefined : Number(req.body.year);`
  - [Line 22](../../../../server/controllers/vehicleController.js#L22): `return res.status(400).json({`
  - [Line 30](../../../../server/controllers/vehicleController.js#L30): `return res.status(400).json({`
  - [Line 38](../../../../server/controllers/vehicleController.js#L38): `...req.body,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/vehicles'
```

### PUT /:id → `/api/vehicles/:id`

Declared at source line 30. Route handler pipeline names: `managerOnly`, `updateVehicle`.

```js
router.put("/:id", managerOnly, upload.single("image"), updateVehicle)
```

- Imported handler/middleware `managerOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `updateVehicle`: [vehicleController.js](../../../../server/controllers/vehicleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateVehicle`

Handler starts at [controller line 132](../../../../server/controllers/vehicleController.js#L132). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `field`, `data`.
- Literal messages include: “Invalid vehicle ID”; “Passenger capacity must be a whole number greater than 0.”; “Vehicle year is invalid.”; “Vehicle not found”; “Vehicle updated successfully”.
- Database operations detected: `Vehicle.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 134](../../../../server/controllers/vehicleController.js#L134): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 135](../../../../server/controllers/vehicleController.js#L135): `return res.status(400).json({`
  - [Line 142](../../../../server/controllers/vehicleController.js#L142): `...req.body,`
  - [Line 148](../../../../server/controllers/vehicleController.js#L148): `return res.status(400).json({`
  - [Line 160](../../../../server/controllers/vehicleController.js#L160): `return res.status(400).json({`
  - [Line 179](../../../../server/controllers/vehicleController.js#L179): `_id:req.params.id`
  - [Line 190](../../../../server/controllers/vehicleController.js#L190): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/vehicles/<id>'
```

### DELETE /:id → `/api/vehicles/:id`

Declared at source line 31. Route handler pipeline names: `managerOnly`, `deleteVehicle`.

```js
router.delete("/:id", managerOnly, deleteVehicle)
```

- Imported handler/middleware `managerOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `deleteVehicle`: [vehicleController.js](../../../../server/controllers/vehicleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteVehicle`

Handler starts at [controller line 212](../../../../server/controllers/vehicleController.js#L212). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Vehicle not found”; “Vehicle deleted successfully”.
- Database operations detected: `Vehicle.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 217](../../../../server/controllers/vehicleController.js#L217): `_id:req.params.id`
  - [Line 229](../../../../server/controllers/vehicleController.js#L229): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/vehicles/<id>'
```

### GET / → `/api/vehicles`

Declared at source line 35. Route handler pipeline names: `vehicleReadOnly`, `getVehicles`.

```js
router.get("/", vehicleReadOnly, getVehicles)
```

- Imported handler/middleware `getVehicles`: [vehicleController.js](../../../../server/controllers/vehicleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getVehicles`

Handler starts at [controller line 68](../../../../server/controllers/vehicleController.js#L68). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `Vehicle.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/vehicles'
```

### GET /:id → `/api/vehicles/:id`

Declared at source line 36. Route handler pipeline names: `vehicleReadOnly`, `getVehicle`.

```js
router.get("/:id", vehicleReadOnly, getVehicle)
```

- Imported handler/middleware `getVehicle`: [vehicleController.js](../../../../server/controllers/vehicleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getVehicle`

Handler starts at [controller line 93](../../../../server/controllers/vehicleController.js#L93). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Invalid vehicle ID”; “Vehicle not found”.
- Database operations detected: `Vehicle.findOne`.
- Input/validation source lines to inspect:
  - [Line 95](../../../../server/controllers/vehicleController.js#L95): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 96](../../../../server/controllers/vehicleController.js#L96): `return res.status(400).json({`
  - [Line 104](../../../../server/controllers/vehicleController.js#L104): `_id:req.params.id`
  - [Line 111](../../../../server/controllers/vehicleController.js#L111): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/vehicles/<id>'
```

### PUT /:id/assign-driver → `/api/vehicles/:id/assign-driver`

Declared at source line 39. Route handler pipeline names: `managerOnly`, `assignVehicleDriver`.

```js
router.put("/:id/assign-driver", managerOnly, assignVehicleDriver)
```

- Imported handler/middleware `managerOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `assignVehicleDriver`: [vehicleController.js](../../../../server/controllers/vehicleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `assignVehicleDriver`

Handler starts at [controller line 288](../../../../server/controllers/vehicleController.js#L288). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `driverId`, `driver`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Invalid driver”; “Vehicle not found”; “Driver assigned successfully”.
- Database operations detected: `Staff.findOne`, `Staff.findByIdAndUpdate`, `Vehicle.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 290](../../../../server/controllers/vehicleController.js#L290): `const driver = req.body.driverId || req.body.driver || null;`
  - [Line 300](../../../../server/controllers/vehicleController.js#L300): `return res.status(400).json({`
  - [Line 314](../../../../server/controllers/vehicleController.js#L314): `_id:req.params.id`
  - [Line 326](../../../../server/controllers/vehicleController.js#L326): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/vehicles/<id>/assign-driver'
```

### PUT /:id/remove-driver → `/api/vehicles/:id/remove-driver`

Declared at source line 40. Route handler pipeline names: `managerOnly`, `removeVehicleDriver`.

```js
router.put("/:id/remove-driver", managerOnly, removeVehicleDriver)
```

- Imported handler/middleware `managerOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `removeVehicleDriver`: [vehicleController.js](../../../../server/controllers/vehicleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `removeVehicleDriver`

Handler starts at [controller line 348](../../../../server/controllers/vehicleController.js#L348). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Vehicle not found”; “Driver removed successfully”.
- Database operations detected: `Vehicle.findOne`, `Staff.findByIdAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 352](../../../../server/controllers/vehicleController.js#L352): `_id:req.params.id`
  - [Line 357](../../../../server/controllers/vehicleController.js#L357): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/vehicles/<id>/remove-driver'
```

### PUT /:id/status → `/api/vehicles/:id/status`

Declared at source line 41. Route handler pipeline names: `managerOnly`, `updateVehicleStatus`.

```js
router.put("/:id/status", managerOnly, updateVehicleStatus)
```

- Imported handler/middleware `managerOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `updateVehicleStatus`: [vehicleController.js](../../../../server/controllers/vehicleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateVehicleStatus`

Handler starts at [controller line 476](../../../../server/controllers/vehicleController.js#L476). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Vehicle not found”; “Vehicle status updated successfully”.
- Database operations detected: `Vehicle.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 485](../../../../server/controllers/vehicleController.js#L485): `const { status } = req.body;`
  - [Line 488](../../../../server/controllers/vehicleController.js#L488): `return res.status(400).json({`
  - [Line 497](../../../../server/controllers/vehicleController.js#L497): `_id:req.params.id`
  - [Line 505](../../../../server/controllers/vehicleController.js#L505): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/vehicles/<id>/status'
```

### PATCH /:id/restore → `/api/vehicles/:id/restore`

Declared at source line 44. Route handler pipeline names: `adminOnly`, `restoreVehicle`.

```js
router.patch("/:id/restore", adminOnly, restoreVehicle)
```

- Imported handler/middleware `adminOnly`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `restoreVehicle`: [vehicleController.js](../../../../server/controllers/vehicleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `restoreVehicle`

Handler starts at [controller line 250](../../../../server/controllers/vehicleController.js#L250). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Vehicle not found”; “Vehicle restored successfully”.
- Database operations detected: `Vehicle.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 255](../../../../server/controllers/vehicleController.js#L255): `_id:req.params.id`
  - [Line 266](../../../../server/controllers/vehicleController.js#L266): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/vehicles/<id>/restore'
```

