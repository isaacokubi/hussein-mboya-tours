# Staff and operational personnel API contracts

## Shared route boundary

`server/routes/index.js` mounts `staffRoutes` at `/staff`, producing the `/api/staff` prefix. `server/routes/staffRoutes.js` runs `resolveTenant`, then `protect`, before endpoint-specific role middleware. `managerOnly` permits canonical manager, admin, and super-admin roles; `adminOnly` permits admin and super-admin. Role aliases are normalized by `authMiddleware`/`roleUtils`. All staff lookups use the tenant context (`requireTenantId` or `mergeTenantFilter`) and the `Staff` model's tenant plugin. There is no separate staff service layer.

The model in `server/models/Staff.js` requires name, email, phone, and an enumerated position; normalizes email/trimmed strings; stores staff role, availability, employment, license, assigned-tour and emergency-contact data; and has tenant/email partial unique index plus secondary position/status/availability/deletion indexes. It references `User`, `Tour`, `Organization`, and `User` for creator metadata. These are Mongoose references, not relational foreign-key constraints. Virtuals expose `isDriver`/`isGuide`; `assignTour` and `releaseFromTour` update assignment/availability. The only focused tests found cover generic role normalization and other staff-adjacent behavior; no route/controller contract test directly exercises these eight endpoints.

## `GET /api/staff/guides` — inventory 386

Handler: `getGuides` in `server/controllers/staffController.js`; route: `router.get("/guides", managerOnly, getGuides)`.

- **Access:** resolved tenant + JWT + manager/admin/super-admin role. No request body, query, or path input.
- **Read:** `Staff.find(mergeTenantFilter(req, {position: {$in:["guide","tour_guide","tourguide"]}, isActive:true, isDeleted:{$ne:true}, status:"active"}))`, newest first. No pagination or writes.
- **Success:** 200 `{success:true,count:<number>,data:<Staff documents[]>}`. Mongoose serialization includes virtuals; guide results do not populate assigned tours.
- **Failure:** caught database/runtime failures are passed to centralized Express error handling. Role/auth failures are produced by middleware.
- **Callers/tests:** `client/src/api/tourApi.js:getGuides` requests `/staff/guides` and accepts several response shapes despite the server's `{success,count,data}` envelope. No focused route test found.

## `GET /api/staff/drivers` — inventory 387

Handler `getDrivers`, same middleware and no request fields as the guide lookup.

- **Read/filter:** tenant-scoped active, non-deleted records with position in `driver` or legacy `tour_driver`, sorted newest first. It populates `assignedTours` with `title`, `startDate`, and `endDate`; no pagination or writes.
- **Success:** 200 `{success:true,count:<number>,data:<Staff documents[]>}`.
- **Errors/callers:** database errors go to centralized handling; `client/src/api/tourApi.js:getDrivers` is the caller and normalizes the returned array. No focused route test found.

## `POST /api/staff` — inventory 388

Handler `createStaff`; `adminOnly` is applied after shared tenant/JWT middleware.

- **Body:** JSON object. The controller requires nonblank `name`, `email`, `phone`, and `position`. It trims/lowercases email and trims phone. Other model fields may be passed; Mongoose strict schema and validators govern what persists. `position` must satisfy the Staff enum. Role/position aliases are normalized by `roleToStaffIdentity` for admin, manager/tour manager, guide/tour guide, driver, and support; an unrecognized identity remains subject to schema validation.
- **Duplicate protection:** pre-checks tenant-scoped existing, non-deleted Staff by email, phone, and supplied user reference; duplicate keys also map to 409. The unique database guarantee explicitly covers tenant/email, not phone/user in this schema; pre-checks alone can race.
- **Writes/response:** creates one Staff document with authoritative resolved `tenantId` (body tenantId is overridden); returns 201 `{success:true,message:"Staff created successfully",data:<Staff>}`.
- **Errors:** missing required values return 400 `{success:false,message}`; detected duplicates or Mongo duplicate-key errors return 409; other errors are delegated. No user account is created and no external service is called.
- **Tests/callers:** no focused route test found. Staff creation in the client uses admin user APIs (`client/src/api/adminUserApi.js:createStaffAccount`), which targets `/admin/users/staff`, a different contract.

## `GET /api/staff` — inventory 389

Handler `getStaff`; manager/admin/super-admin access.

- **Query:** optional `position`, `availability`, `status`, `search`, `page` (default 1), `limit` (default 20), and `includeInactive`. `position=guide` maps to guide aliases; `position=driver` maps to driver aliases. `status`, if present, is used directly; otherwise records are limited to `isActive:true`, except canonical admins may request `includeInactive=true`. `availability` is exact-match. `search` is interpolated into a case-insensitive regular expression across name/email/phone/position/status and is not escaped. There is no explicit query validation; `limit` is clamped to 1–100, while `page` is numerically converted for skip and response.
- **Additional behavior:** first calls `ensureManagerStaffProfiles`, which reads active manager Users for this tenant and creates missing corresponding Staff profiles. Then runs tenant-scoped list and count queries in parallel, populating assigned tours and sorting newest first. `synchronizeStaffIdentities` reads linked Users and can write canonical position/role corrections back to Staff. Thus this GET can create and update data.
- **Success:** 200 `{success:true,pagination:{total,page,limit,pages},data:<Staff[]>}`; `pages` is at least 1. Invalid numeric `page` can yield invalid skip/response values and is not explicitly rejected.
- **Errors/tests/callers:** failures go to centralized handling; no focused route test found. `client/src/api/staffApi.js` and admin booking UI consume this listing.

## `GET /api/staff/:id` — inventory 390

Handler `getStaffById`; manager/admin/super-admin access. Reads the tenant-scoped `Staff` document by `id`, populates assigned tour title/date/status fields, and calls `synchronizeStaffIdentities`, which may update the Staff record based on the linked same-tenant User role. Success is 200 `{success:true,data:<Staff>}`; no match returns 404 `{success:false,message:"Staff member not found"}`. Invalid identifiers or other database failures are delegated to centralized error handling. No request body/query or focused route test exists.

## `PUT /api/staff/:id/status` — inventory 391 and `PUT /api/staff/:id` — inventory 392

Both declarations use `adminOnly` and the same `updateStaff` handler. The `/status` suffix does **not** restrict updates to status fields.

- **Path/body:** `id` identifies a tenant-scoped Staff record. The controller assigns the request body to the document; supported fields are constrained by Mongoose strict mode/schema, but there is no controller allowlist. Common fields include name, email, phone, role, position, status, active flag and availability. Email/phone are normalized when truthy and checked for another non-deleted same-tenant record. Role/position aliases can canonicalize both fields.
- **Persistence:** saves Staff first. If linked to a User and the resulting staff identity maps to a role, it then finds the corresponding tenant Role and separately updates the User's `role`, `legacyRole`, and, when found, `roleId`. These operations are not transactional; Staff may be changed even if the User synchronization later fails. `Role` lookup is tenant-filtered.
- **Success/errors:** 200 `{success:true,message:"Staff updated successfully",data:<Staff>}`; missing Staff is 404; email/phone conflicts or duplicate-key failures are 409; remaining failures are delegated. No explicit required-field validation is applied to update bodies beyond schema save validation.
- **Tests/callers:** no focused route test found. `client/src/api/adminUserApi.js` maps separate user-management update helpers to these paths, but the client status helper sends `isActive`, `status`, and `availability` together.

## `DELETE /api/staff/:id` — inventory 393

Admin/super-admin only. The controller tenant-scopes a Staff lookup, then permanently deletes that Staff document. It does not deactivate/delete the linked User or clean up tour assignments. Success is 200 `{success:true,message:"Staff member permanently deleted",data:{id}}`; missing record is 404; an unexpected `deletedCount !== 1` is 409; other failures are delegated. This is a destructive hard delete; no confirmation token, soft-delete behavior, transaction, or focused route test exists. Client caller: `client/src/api/adminUserApi.js:deleteStaff`.

## Unmounted controller functions

`restoreStaff` and `updateStaffAvailability` are exported by the controller but are not registered in `staffRoutes.js`; they are not part of the mounted API inventory and cannot be called through this router. No claim is made about any alternate mount.

## Coverage and limitations

These eight mounted contracts are source-traced through route, middleware, controller, model, tenant helpers, and discovered frontend callers. No endpoint requests were executed. No focused staff endpoint/controller tests were found. The GET `/api/staff` side effects, regex search input, nontransactional Staff/User role synchronization, pre-check-only phone/user duplicate behavior, and hard deletion leaving linked Users/assignments are implementation limitations, not claims of integrity guarantees.
