# API endpoints: notifications

This guide contains 5 mounted method/path inventory entries in the **notifications** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-334 — GET /api/notifications/recipients

**Contract status:** SOURCE-TRACED<br>
**Router:** [notificationRoutes.js](../../server/routes/notificationRoutes.js) · [route module explanation](../code-explanations/backend/routes/notificationRoutes.md)<br>
**Mounted inventory entry:** 334 of 629<br>
**Route declaration pipeline:** `roleMiddleware`, `getNotificationRecipients`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** roleMiddleware`

**Source declaration:**

```js
router.get("/recipients", roleMiddleware("admin", "super_admin", "superadmin", "tour_manager", "tourmanager", "manager"), getNotificationRecipients)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `roles`.
- Literal HTTP statuses in handler: `403`.
- JSON envelope keys observed: `success`, `message`, `recipients`.


**Source-traced contract:** See [notification contracts](../API_DOMAIN_CONTRACTS/notifications.md) for recipient access and persistence behavior.
## endpoint-335 — POST /api/notifications/internal

**Contract status:** SOURCE-TRACED<br>
**Router:** [notificationRoutes.js](../../server/routes/notificationRoutes.js) · [route module explanation](../code-explanations/backend/routes/notificationRoutes.md)<br>
**Mounted inventory entry:** 335 of 629<br>
**Route declaration pipeline:** `roleMiddleware`, `sendInternalNotification`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** roleMiddleware`

**Source declaration:**

```js
router.post("/internal", roleMiddleware("admin", "super_admin", "superadmin", "tour_manager", "tourmanager", "manager"), sendInternalNotification)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `recipientIds`, `roles`, `title`, `message`, `type`, `priority`, `actionUrl`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [notification contracts](../API_DOMAIN_CONTRACTS/notifications.md) for recipient access and persistence behavior.
## endpoint-336 — GET /api/notifications

**Contract status:** SOURCE-TRACED<br>
**Router:** [notificationRoutes.js](../../server/routes/notificationRoutes.js) · [route module explanation](../code-explanations/backend/routes/notificationRoutes.md)<br>
**Mounted inventory entry:** 336 of 629<br>
**Route declaration pipeline:** `getNotifications`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get(
  "/",
  getNotifications
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `unread`, `type`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `pages`, `count`.


**Source-traced contract:** See [notification contracts](../API_DOMAIN_CONTRACTS/notifications.md) for recipient access and persistence behavior.
## endpoint-337 — GET /api/notifications/mine

**Contract status:** SOURCE-TRACED<br>
**Router:** [notificationRoutes.js](../../server/routes/notificationRoutes.js) · [route module explanation](../code-explanations/backend/routes/notificationRoutes.md)<br>
**Mounted inventory entry:** 337 of 629<br>
**Route declaration pipeline:** `getMyNotifications`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get(
  "/mine",
  getMyNotifications
)
```


**Source-traced contract:** See [notification contracts](../API_DOMAIN_CONTRACTS/notifications.md) for recipient access and persistence behavior.
## endpoint-338 — PUT /api/notifications/:id/read

**Contract status:** SOURCE-TRACED<br>
**Router:** [notificationRoutes.js](../../server/routes/notificationRoutes.js) · [route module explanation](../code-explanations/backend/routes/notificationRoutes.md)<br>
**Mounted inventory entry:** 338 of 629<br>
**Route declaration pipeline:** `markRead`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put(
  "/:id/read",
  markRead
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [notification contracts](../API_DOMAIN_CONTRACTS/notifications.md) for recipient access and persistence behavior.