# Route module: tourAssignmentRoutes.js

**Source:** [server/routes/tourAssignmentRoutes.js](../../../../server/routes/tourAssignmentRoutes.js)

Observed mount prefixes include `/api/tour-assignments/:id/assign`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(managerOnly);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### PUT /:id/assign → `/api/tour-assignments/:id/assign`

Declared at source line 13. Route handler pipeline names: `validateTourAssignmentTenant`, `assignTourResourcesSafe`.

```js
router.put("/:id/assign", validateTourAssignmentTenant, assignTourResourcesSafe)
```

- Imported handler/middleware `validateTourAssignmentTenant`: [validateTourAssignmentTenant.js](../../../../server/middleware/validateTourAssignmentTenant.js)
- Imported handler/middleware `assignTourResourcesSafe`: [tourResourceAssignmentController.js](../../../../server/controllers/tourResourceAssignmentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `assignTourResourcesSafe`

Handler starts at [controller line 75](../../../../server/controllers/tourResourceAssignmentController.js#L75). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.findOne`, `Staff.findOne`, `Vehicle.findOneAndUpdate`, `Staff.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 82](../../../../server/controllers/tourResourceAssignmentController.js#L82): `const tourId = req.params.id;`
  - [Line 93](../../../../server/controllers/tourResourceAssignmentController.js#L93): `const nextGuideId = idOrNull(req.body?.guideId === undefined ? tour.assignedGuide : req.body.guideId);`
  - [Line 94](../../../../server/controllers/tourResourceAssignmentController.js#L94): `const nextDriverId = idOrNull(req.body?.driverId === undefined ? tour.assignedDriver : req.body.driverId);`
  - [Line 95](../../../../server/controllers/tourResourceAssignmentController.js#L95): `const nextVehicleId = idOrNull(req.body?.vehicleId === undefined ? tour.assignedVehicle : req.body.vehicleId);`
  - [Line 174](../../../../server/controllers/tourResourceAssignmentController.js#L174): `sourceId: String(req.params.id),`
  - [Line 176](../../../../server/controllers/tourResourceAssignmentController.js#L176): `tourId: req.params.id,`
  - [Line 177](../../../../server/controllers/tourResourceAssignmentController.js#L177): `guideId: req.body?.guideId || null,`
  - [Line 178](../../../../server/controllers/tourResourceAssignmentController.js#L178): `driverId: req.body?.driverId || null,`
  - [Line 179](../../../../server/controllers/tourResourceAssignmentController.js#L179): `vehicleId: req.body?.vehicleId || null,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/tour-assignments/<id>/assign'
```

