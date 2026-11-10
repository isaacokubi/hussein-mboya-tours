# Route module: notificationRoutes.js

**Source:** [server/routes/notificationRoutes.js](../../../../server/routes/notificationRoutes.js)

Observed mount prefixes include `/api/notifications/recipients`, `/api/notifications/internal`, `/api/notifications`, `/api/notifications/mine`, `/api/notifications/:id/read`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /recipients → `/api/notifications/recipients`

Declared at source line 36. Route handler pipeline names: `roleMiddleware`, `getNotificationRecipients`.

```js
router.get("/recipients", roleMiddleware("admin", "super_admin", "superadmin", "tour_manager", "tourmanager", "manager"), getNotificationRecipients)
```

- Imported handler/middleware `roleMiddleware`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `getNotificationRecipients`: [notificationController.js](../../../../server/controllers/notificationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getNotificationRecipients`

Handler starts at [controller line 97](../../../../server/controllers/notificationController.js#L97). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `roles`.
- Literal HTTP statuses in handler: `403`.
- JSON envelope keys observed: `success`, `message`, `recipients`.
- Literal messages include: “Only administrators and managers can send internal notifications.”.
- Database operations detected: `Role.find`, `User.find`, `Staff.find`, `User.findOne`.
- Input/validation source lines to inspect:
  - [Line 101](../../../../server/controllers/notificationController.js#L101): `return res.status(403).json({ success: false, message: "Only administrators and managers can send internal notifications." });`
  - [Line 104](../../../../server/controllers/notificationController.js#L104): `const requested = String(req.query.roles || "guide,driver,agent,admin,manager")`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/notifications/recipients'
```

### POST /internal → `/api/notifications/internal`

Declared at source line 37. Route handler pipeline names: `roleMiddleware`, `sendInternalNotification`.

```js
router.post("/internal", roleMiddleware("admin", "super_admin", "superadmin", "tour_manager", "tourmanager", "manager"), sendInternalNotification)
```

- Imported handler/middleware `roleMiddleware`: [roleMiddleware.js](../../../../server/middleware/roleMiddleware.js)
- Imported handler/middleware `sendInternalNotification`: [notificationController.js](../../../../server/controllers/notificationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `sendInternalNotification`

Handler starts at [controller line 190](../../../../server/controllers/notificationController.js#L190). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `recipientIds`, `roles`, `title`, `message`, `type`, `priority`, `actionUrl`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Only administrators and managers can send internal notifications.”; “Title and message are required.”; “Select at least one recipient or recipient group.”; “No active recipients matched your selection.”.
- Database operations detected: `Role.find`, `User.find`.
- Input/validation source lines to inspect:
  - [Line 193](../../../../server/controllers/notificationController.js#L193): `return res.status(403).json({ success: false, message: "Only administrators and managers can send internal notifications." });`
  - [Line 204](../../../../server/controllers/notificationController.js#L204): `} = req.body || {};`
  - [Line 207](../../../../server/controllers/notificationController.js#L207): `return res.status(400).json({ success: false, message: "Title and message are required." });`
  - [Line 240](../../../../server/controllers/notificationController.js#L240): `return res.status(400).json({ success: false, message: "Select at least one recipient or recipient group." });`
  - [Line 262](../../../../server/controllers/notificationController.js#L262): `return res.status(404).json({ success: false, message: "No active recipients matched your selection." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/notifications/internal'
```

### GET / → `/api/notifications`

Declared at source line 49. Route handler pipeline names: `getNotifications`.

```js
router.get(
  "/",
  getNotifications
)
```

- Imported handler/middleware `getNotifications`: [notificationController.js](../../../../server/controllers/notificationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getNotifications`

Handler starts at [controller line 297](../../../../server/controllers/notificationController.js#L297). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `unread`, `type`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `pages`, `count`.
- Database operations detected: `Notification.find`, `Notification.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 304](../../../../server/controllers/notificationController.js#L304): `Number(req.query.page) || 1,`
  - [Line 310](../../../../server/controllers/notificationController.js#L310): `Number(req.query.limit) || 20,`
  - [Line 322](../../../../server/controllers/notificationController.js#L322): `req.query.unread === "true"`
  - [Line 327](../../../../server/controllers/notificationController.js#L327): `if (req.query.type) {`
  - [Line 329](../../../../server/controllers/notificationController.js#L329): `req.query.type;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/notifications'
```

### GET /mine → `/api/notifications/mine`

Declared at source line 58. Route handler pipeline names: `getMyNotifications`.

```js
router.get(
  "/mine",
  getMyNotifications
)
```

- Imported handler/middleware `getMyNotifications`: [notificationController.js](../../../../server/controllers/notificationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/notifications/mine'
```

### PUT /:id/read → `/api/notifications/:id/read`

Declared at source line 67. Route handler pipeline names: `markRead`.

```js
router.put(
  "/:id/read",
  markRead
)
```

- Imported handler/middleware `markRead`: [notificationController.js](../../../../server/controllers/notificationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `markRead`

Handler starts at [controller line 385](../../../../server/controllers/notificationController.js#L385). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid notification ID.”; “Notification not found.”; “Notification marked as read.”.
- Database operations detected: `Notification.findOne`.
- Input/validation source lines to inspect:
  - [Line 392](../../../../server/controllers/notificationController.js#L392): `!isValidId(req.params.id)`
  - [Line 394](../../../../server/controllers/notificationController.js#L394): `return res.status(400).json({`
  - [Line 403](../../../../server/controllers/notificationController.js#L403): `_id: req.params.id,`
  - [Line 409](../../../../server/controllers/notificationController.js#L409): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/notifications/<id>/read'
```

