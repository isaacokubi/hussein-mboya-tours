# Route module: tourManagerRoutes.js

**Source:** [server/routes/tourManagerRoutes.js](../../../../server/routes/tourManagerRoutes.js)

Observed mount prefixes include `/api/tourmanager/dashboard`, `/api/tour-manager/dashboard`, `/api/tourmanager/copilot/summary`, `/api/tour-manager/copilot/summary`, `/api/tourmanager/copilot/quote-draft`, `/api/tour-manager/copilot/quote-draft`, `/api/tourmanager/calendar/reminders`, `/api/tour-manager/calendar/reminders`, `/api/tourmanager/calendar/reminders/:id`, `/api/tour-manager/calendar/reminders/:id`, `/api/tourmanager/tours`, `/api/tour-manager/tours`, `/api/tourmanager/tours/:id`, `/api/tour-manager/tours/:id`, `/api/tourmanager/tours/:id/publication`, `/api/tour-manager/tours/:id/publication`, `/api/tourmanager/tours/:id/assign`, `/api/tour-manager/tours/:id/assign`, `/api/tourmanager/tours/:id/complete`, `/api/tour-manager/tours/:id/complete`, `/api/tourmanager/tours/:id/cancel`, `/api/tour-manager/tours/:id/cancel`, `/api/tourmanager/assign-resources/:id`, `/api/tour-manager/assign-resources/:id`, `/api/tourmanager/assign-guide`, `/api/tour-manager/assign-guide`, `/api/tourmanager/itineraries`, `/api/tour-manager/itineraries`, `/api/tourmanager/itineraries/:id`, `/api/tour-manager/itineraries/:id`, `/api/tourmanager/bookings`, `/api/tour-manager/bookings`, `/api/tourmanager/bookings/:id/complete`, `/api/tour-manager/bookings/:id/complete`, `/api/tourmanager/bookings/:id/cancel`, `/api/tour-manager/bookings/:id/cancel`, `/api/tourmanager/bookings/:id/notify`, `/api/tour-manager/bookings/:id/notify`, `/api/tourmanager/customers`, `/api/tour-manager/customers`, `/api/tourmanager/guides`, `/api/tour-manager/guides`, `/api/tourmanager/drivers`, `/api/tour-manager/drivers`, `/api/tourmanager/vehicles`, `/api/tour-manager/vehicles`, `/api/tourmanager/reports`, `/api/tour-manager/reports`, `/api/tourmanager/tours/:id/availability`, `/api/tour-manager/tours/:id/availability`.

## Router-wide middleware

- `router.use(protect);`
- `router.use(resolveTenant);`
- `router.use(managerOnly);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /dashboard → `/api/tourmanager/dashboard`, `/api/tour-manager/dashboard`

Declared at source line 25. Route handler pipeline names: `getTourManagerDashboard`.

```js
router.get("/dashboard", getTourManagerDashboard)
```

- Imported handler/middleware `getTourManagerDashboard`: [tourManagerController.js](../../../../server/controllers/tourManagerController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourManagerDashboard`

Handler starts at [controller line 15](../../../../server/controllers/tourManagerController.js#L15). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.countDocuments`, `User.countDocuments`, `Tour.find`, `Booking.find`, `Booking.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/dashboard'
```

### GET /copilot/summary → `/api/tourmanager/copilot/summary`, `/api/tour-manager/copilot/summary`

Declared at source line 27. Route handler pipeline names: `getOperationsCopilotSummary`.

```js
router.get("/copilot/summary", getOperationsCopilotSummary)
```

- Imported handler/middleware `getOperationsCopilotSummary`: [operationsCopilotController.js](../../../../server/controllers/operationsCopilotController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getOperationsCopilotSummary`

Handler starts at [controller line 15](../../../../server/controllers/operationsCopilotController.js#L15). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.find`, `Booking.aggregate`, `TourCost.aggregate`, `Booking.find`, `OperationalAsset.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/copilot/summary'
```

### POST /copilot/quote-draft → `/api/tourmanager/copilot/quote-draft`, `/api/tour-manager/copilot/quote-draft`

Declared at source line 28. Route handler pipeline names: `createOperationsQuoteDraft`.

```js
router.post("/copilot/quote-draft", createOperationsQuoteDraft)
```

- Imported handler/middleware `createOperationsQuoteDraft`: [operationsCopilotController.js](../../../../server/controllers/operationsCopilotController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createOperationsQuoteDraft`

Handler starts at [controller line 135](../../../../server/controllers/operationsCopilotController.js#L135). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `tourId`, `travelerCount`, `discountPercent`, `taxPercent`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “A valid tourId is required.”; “Tour was not found in this tenant.”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 138](../../../../server/controllers/operationsCopilotController.js#L138): `const { tourId, travelerCount, discountPercent = 0, taxPercent = 0 } = req.body || {};`
  - [Line 140](../../../../server/controllers/operationsCopilotController.js#L140): `return res.status(400).json({ success: false, message: "A valid tourId is required." });`
  - [Line 147](../../../../server/controllers/operationsCopilotController.js#L147): `return res.status(404).json({ success: false, message: "Tour was not found in this tenant." });`
  - [Line 153](../../../../server/controllers/operationsCopilotController.js#L153): `return res.status(400).json({ success: false, message: error.message });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/tourmanager/copilot/quote-draft'
```

### GET /calendar/reminders → `/api/tourmanager/calendar/reminders`, `/api/tour-manager/calendar/reminders`

Declared at source line 29. Route handler pipeline names: `listCalendarReminders`.

```js
router.get("/calendar/reminders", listCalendarReminders)
```

- Imported handler/middleware `listCalendarReminders`: [calendarReminderController.js](../../../../server/controllers/calendarReminderController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listCalendarReminders`

Handler starts at [controller line 12](../../../../server/controllers/calendarReminderController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `start`, `end`.
- Literal HTTP statuses in handler: `400`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Use valid YYYY-MM-DD start/end dates.”; “Start date must be on or before end date.”.
- Database operations detected: `CalendarReminder.find`.
- Input/validation source lines to inspect:
  - [Line 16](../../../../server/controllers/calendarReminderController.js#L16): `if (req.query.start || req.query.end) {`
  - [Line 17](../../../../server/controllers/calendarReminderController.js#L17): `if ((req.query.start && !isValidDateOnly(req.query.start)) || (req.query.end && !isValidDateOnly(req.query.end))) {`
  - [Line 18](../../../../server/controllers/calendarReminderController.js#L18): `return res.status(400).json({ success: false, message: "Use valid YYYY-MM-DD start/end dates." });`
  - [Line 20](../../../../server/controllers/calendarReminderController.js#L20): `if (req.query.start && req.query.end && req.query.start > req.query.end) {`
  - [Line 21](../../../../server/controllers/calendarReminderController.js#L21): `return res.status(400).json({ success: false, message: "Start date must be on or before end date." });`
  - [Line 23](../../../../server/controllers/calendarReminderController.js#L23): `if (req.query.start || req.query.end) {`
  - [Line 25](../../../../server/controllers/calendarReminderController.js#L25): `if (req.query.start) filter.date.$gte = req.query.start;`
  - [Line 26](../../../../server/controllers/calendarReminderController.js#L26): `if (req.query.end) filter.date.$lte = req.query.end;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/calendar/reminders'
```

### POST /calendar/reminders → `/api/tourmanager/calendar/reminders`, `/api/tour-manager/calendar/reminders`

Declared at source line 30. Route handler pipeline names: `createCalendarReminder`.

```js
router.post("/calendar/reminders", createCalendarReminder)
```

- Imported handler/middleware `createCalendarReminder`: [calendarReminderController.js](../../../../server/controllers/calendarReminderController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCalendarReminder`

Handler starts at [controller line 34](../../../../server/controllers/calendarReminderController.js#L34). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `date`, `title`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “A valid reminder date in YYYY-MM-DD format is required.”; “Reminder title must contain 1–180 characters.”; “That reminder already exists on this date.”.
- Database operations detected: `CalendarReminder.findOne`, `CalendarReminder.create`.
- Input/validation source lines to inspect:
  - [Line 37](../../../../server/controllers/calendarReminderController.js#L37): `const date = typeof req.body?.date === "string" ? req.body.date : "";`
  - [Line 38](../../../../server/controllers/calendarReminderController.js#L38): `const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";`
  - [Line 39](../../../../server/controllers/calendarReminderController.js#L39): `if (!isValidDateOnly(date)) return res.status(400).json({ success: false, message: "A valid reminder date in YYYY-MM-DD format is required." });`
  - [Line 40](../../../../server/controllers/calendarReminderController.js#L40): `if (!title || title.length > 180) return res.status(400).json({ success: false, message: "Reminder title must contain 1–180 characters." });`
  - [Line 43](../../../../server/controllers/calendarReminderController.js#L43): `if (existing) return res.status(409).json({ success: false, message: "That reminder already exists on this date.", data: existing });`
  - [Line 53](../../../../server/controllers/calendarReminderController.js#L53): `if (error?.code === 11000) return res.status(409).json({ success: false, message: "That reminder already exists on this date." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/tourmanager/calendar/reminders'
```

### DELETE /calendar/reminders/:id → `/api/tourmanager/calendar/reminders/:id`, `/api/tour-manager/calendar/reminders/:id`

Declared at source line 31. Route handler pipeline names: `deleteCalendarReminder`.

```js
router.delete("/calendar/reminders/:id", deleteCalendarReminder)
```

- Imported handler/middleware `deleteCalendarReminder`: [calendarReminderController.js](../../../../server/controllers/calendarReminderController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteCalendarReminder`

Handler starts at [controller line 58](../../../../server/controllers/calendarReminderController.js#L58). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Reminder not found.”; “Reminder removed.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 61](../../../../server/controllers/calendarReminderController.js#L61): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ success: false, message: "Reminder not found." });`
  - [Line 62](../../../../server/controllers/calendarReminderController.js#L62): `const reminder = await CalendarReminder.findOneAndDelete(mergeTenantFilter({ _id: req.params.id }));`
  - [Line 63](../../../../server/controllers/calendarReminderController.js#L63): `if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/tourmanager/calendar/reminders/<id>'
```

### GET /tours → `/api/tourmanager/tours`, `/api/tour-manager/tours`

Declared at source line 32. Route handler pipeline names: `getTours`.

```js
router.get("/tours", getTours)
```

- Imported handler/middleware `getTours`: [tourManagerController.js](../../../../server/controllers/tourManagerController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTours`

Handler starts at [controller line 111](../../../../server/controllers/tourManagerController.js#L111). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `upcoming`, `page`, `limit`, `status`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.find`, `Tour.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 114](../../../../server/controllers/tourManagerController.js#L114): `const { upcoming, page = 1, limit = 10, status } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/tours'
```

### POST /tours → `/api/tourmanager/tours`, `/api/tour-manager/tours`

Declared at source line 33. Route handler pipeline names: `validateFutureTourDate`, `validateTourCommand`, `createTour`.

```js
router.post("/tours", validateFutureTourDate, validateTourCommand(), createTour)
```

- Imported handler/middleware `validateFutureTourDate`: [validateFutureTourDate.js](../../../../server/middleware/validateFutureTourDate.js)
- Imported handler/middleware `validateTourCommand`: [validateTourCommand.js](../../../../server/middleware/validateTourCommand.js)
- Imported handler/middleware `createTour`: [tourCrudController.js](../../../../server/controllers/tourCrudController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createTour`

Handler starts at [controller line 146](../../../../server/controllers/tourCrudController.js#L146). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `assignedGuide`, `guide`, `assignedDriver`, `driver`, `assignedVehicle`, `vehicle`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Tour created successfully.”.
- Database operations detected: `Destination.findOne`, `Tour.create`, `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 152](../../../../server/controllers/tourCrudController.js#L152): `const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id);`
  - [Line 156](../../../../server/controllers/tourCrudController.js#L156): `guideId: req.body?.assignedGuide || req.body?.guide || null,`
  - [Line 157](../../../../server/controllers/tourCrudController.js#L157): `driverId: req.body?.assignedDriver || req.body?.driver || null,`
  - [Line 158](../../../../server/controllers/tourCrudController.js#L158): `vehicleId: req.body?.assignedVehicle || req.body?.vehicle || null,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/tourmanager/tours'
```

### PUT /tours/:id → `/api/tourmanager/tours/:id`, `/api/tour-manager/tours/:id`

Declared at source line 34. Route handler pipeline names: `validateTourCommand`, `updateTour`.

```js
router.put("/tours/:id", validateTourCommand(), updateTour)
```

- Imported handler/middleware `validateTourCommand`: [validateTourCommand.js](../../../../server/middleware/validateTourCommand.js)
- Imported handler/middleware `updateTour`: [tourCrudController.js](../../../../server/controllers/tourCrudController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTour`

Handler starts at [controller line 175](../../../../server/controllers/tourCrudController.js#L175). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `data`, `tour`.
- Literal messages include: “Invalid tour ID.”; “Tour not found.”; “Use the dedicated tour resource assignment endpoint to change guides, drivers or vehicles.”; “Tour updated successfully.”.
- Database operations detected: `Tour.findOne`, `Tour.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 178](../../../../server/controllers/tourCrudController.js#L178): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });`
  - [Line 179](../../../../server/controllers/tourCrudController.js#L179): `const existing = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }));`
  - [Line 180](../../../../server/controllers/tourCrudController.js#L180): `if (!existing) return res.status(404).json({ success: false, message: "Tour not found." });`
  - [Line 181](../../../../server/controllers/tourCrudController.js#L181): `if (["assignedGuide","assignedDriver","assignedVehicle","guide","driver","vehicle"].some((key) => req.body?.[key] !== undefined)) return res.status(400).json({ success: f`
  - [Line 182](../../../../server/controllers/tourCrudController.js#L182): `const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id, existing);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/tourmanager/tours/<id>'
```

### DELETE /tours/:id → `/api/tourmanager/tours/:id`, `/api/tour-manager/tours/:id`

Declared at source line 35. Route handler pipeline names: `deleteTour`.

```js
router.delete("/tours/:id", deleteTour)
```

- Imported handler/middleware `deleteTour`: [tourCrudController.js](../../../../server/controllers/tourCrudController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteTour`

Handler starts at [controller line 190](../../../../server/controllers/tourCrudController.js#L190). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`, `data`, `bookingsAffected`.
- Literal messages include: “Invalid tour ID.”; “Tour deleted after cancelling/reconciling active bookings.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 193](../../../../server/controllers/tourCrudController.js#L193): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });`
  - [Line 194](../../../../server/controllers/tourCrudController.js#L194): `const result = await cancelTourAndBookings({ tourId: req.params.id, reason: req.body?.reason || "Tour deleted/cancelled", deleted: true, userId: req.user?._id || null });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/tourmanager/tours/<id>'
```

### PATCH /tours/:id/publication → `/api/tourmanager/tours/:id/publication`, `/api/tour-manager/tours/:id/publication`

Declared at source line 36. Route handler pipeline names: `setPublication`.

```js
router.patch("/tours/:id/publication", setPublication)
```

- Imported handler/middleware `setPublication`: [tourCrudController.js](../../../../server/controllers/tourCrudController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `setPublication`

Handler starts at [controller line 199](../../../../server/controllers/tourCrudController.js#L199). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `published`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tour ID.”; “published must be a boolean.”; “Tour not found.”.
- Database operations detected: `Tour.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 202](../../../../server/controllers/tourCrudController.js#L202): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });`
  - [Line 203](../../../../server/controllers/tourCrudController.js#L203): `const published = req.body?.published;`
  - [Line 204](../../../../server/controllers/tourCrudController.js#L204): `if (typeof published !== "boolean" && !["true","false"].includes(String(published))) return res.status(400).json({ success: false, message: "published must be a boolean."`
  - [Line 205](../../../../server/controllers/tourCrudController.js#L205): `const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }), { $set: { published: String(published) === "true" } }, { new`
  - [Line 206](../../../../server/controllers/tourCrudController.js#L206): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/tourmanager/tours/<id>/publication'
```

### PUT /tours/:id/assign → `/api/tourmanager/tours/:id/assign`, `/api/tour-manager/tours/:id/assign`

Declared at source line 37. Route handler pipeline names: `validateTourAssignmentTenant`, `assignTourResourcesSafe`.

```js
router.put("/tours/:id/assign", validateTourAssignmentTenant, assignTourResourcesSafe)
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
curl -i -X PUT 'http://localhost:5000/api/tourmanager/tours/<id>/assign'
```

### PATCH /tours/:id/complete → `/api/tourmanager/tours/:id/complete`, `/api/tour-manager/tours/:id/complete`

Declared at source line 38. Route handler pipeline names: `completeTour`.

```js
router.patch("/tours/:id/complete", completeTour)
```

- Imported handler/middleware `completeTour`: [tourLifecycleController.js](../../../../server/controllers/tourLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `completeTour`

Handler starts at [controller line 10](../../../../server/controllers/tourLifecycleController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Tour is already completed.”; “Tour completed and assigned resources released.”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 16](../../../../server/controllers/tourLifecycleController.js#L16): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid tour ID."), { status: 400 });`
  - [Line 17](../../../../server/controllers/tourLifecycleController.js#L17): `const tour = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } })).session(session);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/tourmanager/tours/<id>/complete'
```

### PATCH /tours/:id/cancel → `/api/tourmanager/tours/:id/cancel`, `/api/tour-manager/tours/:id/cancel`

Declared at source line 39. Route handler pipeline names: `cancelTour`.

```js
router.patch("/tours/:id/cancel", cancelTour)
```

- Imported handler/middleware `cancelTour`: [tourLifecycleController.js](../../../../server/controllers/tourLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `cancelTour`

Handler starts at [controller line 33](../../../../server/controllers/tourLifecycleController.js#L33). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `message`, `data`, `bookingsAffected`.
- Literal messages include: “Tour cancelled, bookings reconciled and resources released.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 36](../../../../server/controllers/tourLifecycleController.js#L36): `tourId: req.params.id,`
  - [Line 37](../../../../server/controllers/tourLifecycleController.js#L37): `reason: req.body?.reason || "Cancelled by tour manager",`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/tourmanager/tours/<id>/cancel'
```

### PUT /assign-resources/:id → `/api/tourmanager/assign-resources/:id`, `/api/tour-manager/assign-resources/:id`

Declared at source line 40. Route handler pipeline names: `validateTourAssignmentTenant`, `assignTourResourcesSafe`.

```js
router.put("/assign-resources/:id", validateTourAssignmentTenant, assignTourResourcesSafe)
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
curl -i -X PUT 'http://localhost:5000/api/tourmanager/assign-resources/<id>'
```

### POST /assign-guide → `/api/tourmanager/assign-guide`, `/api/tour-manager/assign-guide`

Declared at source line 41. Route handler pipeline names: `validateTourAssignmentTenant`, `assignTourResourcesSafe`.

```js
router.post("/assign-guide", (req, res, next) => { req.params.id = req.body?.tourId; next(); }, validateTourAssignmentTenant, assignTourResourcesSafe)
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
curl -i -X POST 'http://localhost:5000/api/tourmanager/assign-guide'
```

### POST /itineraries → `/api/tourmanager/itineraries`, `/api/tour-manager/itineraries`

Declared at source line 43. Route handler pipeline names: `createItinerary`.

```js
router.post("/itineraries", createItinerary)
```

- Imported handler/middleware `createItinerary`: [itineraryController.js](../../../../server/controllers/itineraryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createItinerary`

Handler starts at [controller line 9](../../../../server/controllers/itineraryController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `tour`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `itinerary`, `data`.
- Literal messages include: “A valid tour is required.”; “Tour not found”; “This tour already has an active itinerary. Edit the existing itinerary instead.”; “Itinerary created successfully”; “This tour already has an itinerary. Edit the existing itinerary instead.”.
- Database operations detected: `Tour.findOne`, `Itinerary.findOne`, `Itinerary.create`.
- Input/validation source lines to inspect:
  - [Line 12](../../../../server/controllers/itineraryController.js#L12): `const { tour } = req.body || {};`
  - [Line 13](../../../../server/controllers/itineraryController.js#L13): `if (!tour || !mongoose.Types.ObjectId.isValid(tour)) return res.status(400).json({ success: false, message: "A valid tour is required." });`
  - [Line 15](../../../../server/controllers/itineraryController.js#L15): `if (!existingTour) return res.status(404).json({ success: false, message: "Tour not found" });`
  - [Line 18](../../../../server/controllers/itineraryController.js#L18): `if (existingItinerary) return res.status(409).json({ success: false, message: "This tour already has an active itinerary. Edit the existing itinerary instead." });`
  - [Line 21](../../../../server/controllers/itineraryController.js#L21): `...req.body,`
  - [Line 31](../../../../server/controllers/itineraryController.js#L31): `if (error?.code === 11000) return res.status(409).json({ success: false, message: "This tour already has an itinerary. Edit the existing itinerary instead." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/tourmanager/itineraries'
```

### GET /itineraries → `/api/tourmanager/itineraries`, `/api/tour-manager/itineraries`

Declared at source line 44. Route handler pipeline names: `getItineraries`.

```js
router.get("/itineraries", getItineraries)
```

- Imported handler/middleware `getItineraries`: [itineraryController.js](../../../../server/controllers/itineraryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getItineraries`

Handler starts at [controller line 36](../../../../server/controllers/itineraryController.js#L36). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `tour`, `status`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `Itinerary.find`.
- Input/validation source lines to inspect:
  - [Line 40](../../../../server/controllers/itineraryController.js#L40): `if (req.query.tour) filter.tour = req.query.tour;`
  - [Line 41](../../../../server/controllers/itineraryController.js#L41): `if (req.query.status && ["draft", "published", "archived"].includes(req.query.status)) filter.status = req.query.status;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/itineraries'
```

### GET /itineraries/:id → `/api/tourmanager/itineraries/:id`, `/api/tour-manager/itineraries/:id`

Declared at source line 45. Route handler pipeline names: `getItinerary`.

```js
router.get("/itineraries/:id", getItinerary)
```

- Imported handler/middleware `getItinerary`: [itineraryController.js](../../../../server/controllers/itineraryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getItinerary`

Handler starts at [controller line 50](../../../../server/controllers/itineraryController.js#L50). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Invalid itinerary id.”; “Itinerary not found”.
- Database operations detected: `Itinerary.findOne`.
- Input/validation source lines to inspect:
  - [Line 52](../../../../server/controllers/itineraryController.js#L52): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid itinerary id." });`
  - [Line 53](../../../../server/controllers/itineraryController.js#L53): `const itinerary = await Itinerary.findOne(activeFilter(req, { _id: req.params.id }))`
  - [Line 56](../../../../server/controllers/itineraryController.js#L56): `if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/itineraries/<id>'
```

### PUT /itineraries/:id → `/api/tourmanager/itineraries/:id`, `/api/tour-manager/itineraries/:id`

Declared at source line 46. Route handler pipeline names: `updateItinerary`.

```js
router.put("/itineraries/:id", updateItinerary)
```

- Imported handler/middleware `updateItinerary`: [itineraryController.js](../../../../server/controllers/itineraryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateItinerary`

Handler starts at [controller line 61](../../../../server/controllers/itineraryController.js#L61). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `tour`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Invalid itinerary id.”; “A valid tour is required.”; “Selected tour does not belong to this tenant.”; “The selected tour already has another active itinerary.”; “Itinerary not found”; “Itinerary updated successfully”; “This tour already has an active itinerary.”.
- Database operations detected: `Tour.findOne`, `Itinerary.findOne`, `Itinerary.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 63](../../../../server/controllers/itineraryController.js#L63): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid itinerary id." });`
  - [Line 64](../../../../server/controllers/itineraryController.js#L64): `if (req.body?.tour) {`
  - [Line 65](../../../../server/controllers/itineraryController.js#L65): `if (!mongoose.Types.ObjectId.isValid(req.body.tour)) return res.status(400).json({ success: false, message: "A valid tour is required." });`
  - [Line 66](../../../../server/controllers/itineraryController.js#L66): `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.body.tour, isDeleted: { $ne: true } })).lean();`
  - [Line 67](../../../../server/controllers/itineraryController.js#L67): `if (!tour) return res.status(400).json({ success: false, message: "Selected tour does not belong to this tenant." });`
  - [Line 68](../../../../server/controllers/itineraryController.js#L68): `const duplicate = await Itinerary.findOne(activeFilter(req, { tour, _id: { $ne: req.params.id } })).lean();`
  - [Line 69](../../../../server/controllers/itineraryController.js#L69): `if (duplicate) return res.status(409).json({ success: false, message: "The selected tour already has another active itinerary." });`
  - [Line 71](../../../../server/controllers/itineraryController.js#L71): `const update = { ...req.body, updatedBy: req.user?._id };`
  - [Line 74](../../../../server/controllers/itineraryController.js#L74): `const itinerary = await Itinerary.findOneAndUpdate(activeFilter(req, { _id: req.params.id }), update, { new: true, runValidators: true })`
  - [Line 77](../../../../server/controllers/itineraryController.js#L77): `if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });`
  - [Line 80](../../../../server/controllers/itineraryController.js#L80): `if (error?.code === 11000) return res.status(409).json({ success: false, message: "This tour already has an active itinerary." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/tourmanager/itineraries/<id>'
```

### DELETE /itineraries/:id → `/api/tourmanager/itineraries/:id`, `/api/tour-manager/itineraries/:id`

Declared at source line 47. Route handler pipeline names: `deleteItinerary`.

```js
router.delete("/itineraries/:id", deleteItinerary)
```

- Imported handler/middleware `deleteItinerary`: [itineraryController.js](../../../../server/controllers/itineraryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteItinerary`

Handler starts at [controller line 85](../../../../server/controllers/itineraryController.js#L85). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid itinerary id.”; “Itinerary not found”; “Itinerary deleted successfully”.
- Database operations detected: `Itinerary.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 87](../../../../server/controllers/itineraryController.js#L87): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid itinerary id." });`
  - [Line 89](../../../../server/controllers/itineraryController.js#L89): `activeFilter(req, { _id: req.params.id }),`
  - [Line 93](../../../../server/controllers/itineraryController.js#L93): `if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/tourmanager/itineraries/<id>'
```

### GET /bookings → `/api/tourmanager/bookings`, `/api/tour-manager/bookings`

Declared at source line 49. Route handler pipeline names: `getTourManagerBookings`.

```js
router.get("/bookings", getTourManagerBookings)
```

- Imported handler/middleware `getTourManagerBookings`: [tourManagerBookingController.js](../../../../server/controllers/tourManagerBookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourManagerBookings`

Handler starts at [controller line 8](../../../../server/controllers/tourManagerBookingController.js#L8). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `paymentStatus`, `search`, `tour`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `pages`, `count`, `bookings`, `data`.
- Database operations detected: `Booking.find`, `Booking.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 11](../../../../server/controllers/tourManagerBookingController.js#L11): `const page = Math.max(Number(req.query.page) || 1, 1);`
  - [Line 12](../../../../server/controllers/tourManagerBookingController.js#L12): `const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);`
  - [Line 13](../../../../server/controllers/tourManagerBookingController.js#L13): `const { status, paymentStatus, search, tour } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/bookings'
```

### PATCH /bookings/:id/complete → `/api/tourmanager/bookings/:id/complete`, `/api/tour-manager/bookings/:id/complete`

Declared at source line 50. Route handler pipeline names: `completeBookingAndMaybeRelease`.

```js
router.patch("/bookings/:id/complete", completeBookingAndMaybeRelease)
```

- Imported handler/middleware `completeBookingAndMaybeRelease`: [tourLifecycleController.js](../../../../server/controllers/tourLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `completeBookingAndMaybeRelease`

Handler starts at [controller line 45](../../../../server/controllers/tourLifecycleController.js#L45). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Booking marked as completed.”.
- Database operations detected: `Booking.findOne`, `Booking.countDocuments`, `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 51](../../../../server/controllers/tourLifecycleController.js#L51): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid booking ID."), { status: 400 });`
  - [Line 52](../../../../server/controllers/tourLifecycleController.js#L52): `const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/tourmanager/bookings/<id>/complete'
```

### PUT /bookings/:id/complete → `/api/tourmanager/bookings/:id/complete`, `/api/tour-manager/bookings/:id/complete`

Declared at source line 51. Route handler pipeline names: `completeBookingAndMaybeRelease`.

```js
router.put("/bookings/:id/complete", completeBookingAndMaybeRelease)
```

- Imported handler/middleware `completeBookingAndMaybeRelease`: [tourLifecycleController.js](../../../../server/controllers/tourLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `completeBookingAndMaybeRelease`

Handler starts at [controller line 45](../../../../server/controllers/tourLifecycleController.js#L45). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Booking marked as completed.”.
- Database operations detected: `Booking.findOne`, `Booking.countDocuments`, `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 51](../../../../server/controllers/tourLifecycleController.js#L51): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid booking ID."), { status: 400 });`
  - [Line 52](../../../../server/controllers/tourLifecycleController.js#L52): `const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/tourmanager/bookings/<id>/complete'
```

### PATCH /bookings/:id/cancel → `/api/tourmanager/bookings/:id/cancel`, `/api/tour-manager/bookings/:id/cancel`

Declared at source line 52. Route handler pipeline names: `cancelBookingAndUpdateCapacity`.

```js
router.patch("/bookings/:id/cancel", cancelBookingAndUpdateCapacity)
```

- Imported handler/middleware `cancelBookingAndUpdateCapacity`: [tourLifecycleController.js](../../../../server/controllers/tourLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `cancelBookingAndUpdateCapacity`

Handler starts at [controller line 95](../../../../server/controllers/tourLifecycleController.js#L95). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Booking cancelled and tour capacity updated.”.
- Database operations detected: `Booking.findOne`, `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 101](../../../../server/controllers/tourLifecycleController.js#L101): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid booking ID."), { status: 400 });`
  - [Line 102](../../../../server/controllers/tourLifecycleController.js#L102): `const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);`
  - [Line 109](../../../../server/controllers/tourLifecycleController.js#L109): `booking.cancellationReason = String(req.body?.reason || "Cancelled by tour manager");`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/tourmanager/bookings/<id>/cancel'
```

### POST /bookings/:id/notify → `/api/tourmanager/bookings/:id/notify`, `/api/tour-manager/bookings/:id/notify`

Declared at source line 54. Route handler pipeline names: `sendBookingNotification`.

```js
router.post("/bookings/:id/notify", sendBookingNotification)
```

- Imported handler/middleware `sendBookingNotification`: [notificationController.js](../../../../server/controllers/notificationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `sendBookingNotification`

Handler starts at [controller line 437](../../../../server/controllers/notificationController.js#L437). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `type`, `channel`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid booking ID.”; “Booking not found.”; “Invalid notification type.”; “Invalid notification channel.”; “This customer does not have a user account for in-app notifications.”; “Customer phone number is unavailable.”; “Customer email address is unavailable.”; “Booking notification sent successfully.”.
- Database operations detected: `Booking.findOne`, `Notification.create`.
- Input/validation source lines to inspect:
  - [Line 445](../../../../server/controllers/notificationController.js#L445): `req.params.id`
  - [Line 448](../../../../server/controllers/notificationController.js#L448): `return res.status(400).json({`
  - [Line 458](../../../../server/controllers/notificationController.js#L458): `_id: req.params.id,`
  - [Line 466](../../../../server/controllers/notificationController.js#L466): `return res.status(404).json({`
  - [Line 476](../../../../server/controllers/notificationController.js#L476): `} = req.body;`
  - [Line 500](../../../../server/controllers/notificationController.js#L500): `return res.status(400).json({`
  - [Line 512](../../../../server/controllers/notificationController.js#L512): `return res.status(400).json({`
  - [Line 636](../../../../server/controllers/notificationController.js#L636): `return res.status(400).json({`
  - [Line 698](../../../../server/controllers/notificationController.js#L698): `return res.status(400).json({`
  - [Line 721](../../../../server/controllers/notificationController.js#L721): `return res.status(400).json({`
  - [Line 744](../../../../server/controllers/notificationController.js#L744): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/tourmanager/bookings/<id>/notify'
```

### PUT /bookings/:id/cancel → `/api/tourmanager/bookings/:id/cancel`, `/api/tour-manager/bookings/:id/cancel`

Declared at source line 55. Route handler pipeline names: `cancelBookingAndUpdateCapacity`.

```js
router.put("/bookings/:id/cancel", cancelBookingAndUpdateCapacity)
```

- Imported handler/middleware `cancelBookingAndUpdateCapacity`: [tourLifecycleController.js](../../../../server/controllers/tourLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `cancelBookingAndUpdateCapacity`

Handler starts at [controller line 95](../../../../server/controllers/tourLifecycleController.js#L95). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Booking cancelled and tour capacity updated.”.
- Database operations detected: `Booking.findOne`, `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 101](../../../../server/controllers/tourLifecycleController.js#L101): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid booking ID."), { status: 400 });`
  - [Line 102](../../../../server/controllers/tourLifecycleController.js#L102): `const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);`
  - [Line 109](../../../../server/controllers/tourLifecycleController.js#L109): `booking.cancellationReason = String(req.body?.reason || "Cancelled by tour manager");`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/tourmanager/bookings/<id>/cancel'
```

### GET /customers → `/api/tourmanager/customers`, `/api/tour-manager/customers`

Declared at source line 56. Route handler pipeline names: `getTenantCustomers`.

```js
router.get("/customers", getTenantCustomers)
```

- Imported handler/middleware `getTenantCustomers`: [tenantDirectoryController.js](../../../../server/controllers/tenantDirectoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTenantCustomers`

Handler starts at [controller line 32](../../../../server/controllers/tenantDirectoryController.js#L32). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `search`, `page`, `limit`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `User.find`, `User.countDocuments`, `Customer.find`, `Booking.find`.
- Input/validation source lines to inspect:
  - [Line 35](../../../../server/controllers/tenantDirectoryController.js#L35): `const { search = "", page = 1, limit = 10 } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/customers'
```

### GET /guides → `/api/tourmanager/guides`, `/api/tour-manager/guides`

Declared at source line 57. Route handler pipeline names: `getTenantGuides`.

```js
router.get("/guides", getTenantGuides)
```

- Imported handler/middleware `getTenantGuides`: [tenantDirectoryController.js](../../../../server/controllers/tenantDirectoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTenantGuides`

Handler starts at [controller line 19](../../../../server/controllers/tenantDirectoryController.js#L19). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/guides'
```

### GET /drivers → `/api/tourmanager/drivers`, `/api/tour-manager/drivers`

Declared at source line 58. Route handler pipeline names: `getTenantDrivers`.

```js
router.get("/drivers", getTenantDrivers)
```

- Imported handler/middleware `getTenantDrivers`: [tenantDirectoryController.js](../../../../server/controllers/tenantDirectoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTenantDrivers`

Handler starts at [controller line 20](../../../../server/controllers/tenantDirectoryController.js#L20). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/drivers'
```

### GET /vehicles → `/api/tourmanager/vehicles`, `/api/tour-manager/vehicles`

Declared at source line 59. Route handler pipeline names: `getTenantVehicles`.

```js
router.get("/vehicles", getTenantVehicles)
```

- Imported handler/middleware `getTenantVehicles`: [tenantDirectoryController.js](../../../../server/controllers/tenantDirectoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTenantVehicles`

Handler starts at [controller line 22](../../../../server/controllers/tenantDirectoryController.js#L22). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `Vehicle.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/vehicles'
```

### GET /reports → `/api/tourmanager/reports`, `/api/tour-manager/reports`

Declared at source line 60. Route handler pipeline names: `getTourReports`.

```js
router.get("/reports", getTourReports)
```

- Imported handler/middleware `getTourReports`: [tourReportController.js](../../../../server/controllers/tourReportController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourReports`

Handler starts at [controller line 9](../../../../server/controllers/tourReportController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.countDocuments`, `Booking.aggregate`, `Payment.aggregate`, `User.countDocuments`, `Tour.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/reports'
```

### GET /tours/:id/availability → `/api/tourmanager/tours/:id/availability`, `/api/tour-manager/tours/:id/availability`

Declared at source line 61. Route handler pipeline names: `getTourAvailability`.

```js
router.get("/tours/:id/availability", getTourAvailability)
```

- Imported handler/middleware `getTourAvailability`: [tourAvailabilityController.js](../../../../server/controllers/tourAvailabilityController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourAvailability`

Handler starts at [controller line 13](../../../../server/controllers/tourAvailabilityController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: `travelDate`.
- Literal HTTP statuses in handler: `404`, `400`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tour not found”; “The requested travel date is not offered for this tour.”.
- Database operations detected: `Tour.findOne`, `Booking.aggregate`.
- Input/validation source lines to inspect:
  - [Line 16](../../../../server/controllers/tourAvailabilityController.js#L16): `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } })).lean();`
  - [Line 17](../../../../server/controllers/tourAvailabilityController.js#L17): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });`
  - [Line 20](../../../../server/controllers/tourAvailabilityController.js#L20): `const requestedDate = req.query?.travelDate ? normalize(req.query.travelDate) : null;`
  - [Line 24](../../../../server/controllers/tourAvailabilityController.js#L24): `if (requestedDate && entries.length && !selected) return res.status(400).json({ success:false, message:"The requested travel date is not offered for this tour." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tourmanager/tours/<id>/availability'
```

### PUT /tours/:id/availability → `/api/tourmanager/tours/:id/availability`, `/api/tour-manager/tours/:id/availability`

Declared at source line 62. Route handler pipeline names: `updateTourAvailability`.

```js
router.put("/tours/:id/availability", updateTourAvailability)
```

- Imported handler/middleware `updateTourAvailability`: [tourAvailabilityController.js](../../../../server/controllers/tourAvailabilityController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTourAvailability`

Handler starts at [controller line 67](../../../../server/controllers/tourAvailabilityController.js#L67). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `totalSlots`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Total slots must be a positive whole number.”; “Tour not found”; “Tour capacity updated successfully.”.
- Database operations detected: `Tour.findOne`, `Booking.aggregate`.
- Input/validation source lines to inspect:
  - [Line 70](../../../../server/controllers/tourAvailabilityController.js#L70): `const requestedSlots = Number(req.body?.totalSlots);`
  - [Line 71](../../../../server/controllers/tourAvailabilityController.js#L71): `if (!Number.isFinite(requestedSlots) || requestedSlots <= 0 || !Number.isInteger(requestedSlots)) return res.status(400).json({ success: false, message: "Total slots must`
  - [Line 73](../../../../server/controllers/tourAvailabilityController.js#L73): `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));`
  - [Line 74](../../../../server/controllers/tourAvailabilityController.js#L74): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });`
  - [Line 81](../../../../server/controllers/tourAvailabilityController.js#L81): `if (requestedSlots < bookedGuests) return res.status(400).json({ success: false, message: \`Cannot reduce capacity below the current booked guests (${bookedGuests}).\` })`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/tourmanager/tours/<id>/availability'
```

