# API endpoints: users

This guide contains 4 mounted method/path inventory entries in the **users** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-614 — GET /api/users/profile

**Contract status:** SOURCE-TRACED<br>
**Router:** [userRoutes.js](../../server/routes/userRoutes.js) · [route module explanation](../code-explanations/backend/routes/userRoutes.md)<br>
**Mounted inventory entry:** 614 of 629<br>
**Route declaration pipeline:** `getUserProfile`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get(
  "/profile",
  getUserProfile
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [Tenant user profile and directory API contracts](../API_DOMAIN_CONTRACTS/user-profile.md) for the complete tenant enforcement, field allowlist, role gates, response envelopes and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-615 — PUT /api/users/profile

**Contract status:** SOURCE-TRACED<br>
**Router:** [userRoutes.js](../../server/routes/userRoutes.js) · [route module explanation](../code-explanations/backend/routes/userRoutes.md)<br>
**Mounted inventory entry:** 615 of 629<br>
**Route declaration pipeline:** `updateUserProfile`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put(
  "/profile",
  updateUserProfile
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [Tenant user profile and directory API contracts](../API_DOMAIN_CONTRACTS/user-profile.md) for the complete tenant enforcement, field allowlist, role gates, response envelopes and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-616 — GET /api/users/guides

**Contract status:** SOURCE-TRACED<br>
**Router:** [userRoutes.js](../../server/routes/userRoutes.js) · [route module explanation](../code-explanations/backend/routes/userRoutes.md)<br>
**Mounted inventory entry:** 616 of 629<br>
**Route declaration pipeline:** `roleMiddleware`, `getGuides`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** roleMiddleware`

**Source declaration:**

```js
router.get(
  "/guides",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  getGuides
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.

**Source-traced behavior:** See [Tenant user profile and directory API contracts](../API_DOMAIN_CONTRACTS/user-profile.md) for the complete tenant enforcement, field allowlist, role gates, response envelopes and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-617 — DELETE /api/users/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [userRoutes.js](../../server/routes/userRoutes.js) · [route module explanation](../code-explanations/backend/routes/userRoutes.md)<br>
**Mounted inventory entry:** 617 of 629<br>
**Route declaration pipeline:** `roleMiddleware`, `deleteUser`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** roleMiddleware`

**Source declaration:**

```js
router.delete(
  "/:id",
  roleMiddleware("admin"),
  deleteUser
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `500`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [Tenant user profile and directory API contracts](../API_DOMAIN_CONTRACTS/user-profile.md) for the complete tenant enforcement, field allowlist, role gates, response envelopes and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

