# Admin role and permission contracts

## Shared access and initialization

Mounted at `/api/admin/roles`; middleware order is `resolveTenant` → `protect` → `checkPermission("roles.manage")`. `protect` requires a valid JWT (Bearer or cookie; unsafe cookie requests also require matching CSRF header/cookie), active user, and tenant identity match; platform `super_admin` is global. The permission gate allows platform super-admin directly, admins for permissions in its compatibility allowlist (which includes `roles.manage`), otherwise exact enabled role/override permission. Missing user is 401; denied permission is 403; gate failure is 500. Role records use tenant-filtered queries. No branch scope.

Several handlers call `ensureDefaultPermissions()`, which has side effects: it ensures a tenant+name unique index, consolidates legacy role aliases (including moving User.roleId references and deleting alias roles), upserts the permission names used by built-in roles, and upserts/merges default roles. This initialization is not a read-only operation and is not wrapped in a transaction. `getPermissions` directly queries active Permission records; tenant model behavior supplies scoping.

## GET /api/admin/roles

No endpoint-specific request fields. Ensures defaults, reads tenant roles sorted by level descending, hydrates each role's permission IDs to permission documents. HTTP 200 `{success:true,count,roles}`. Errors go to centralized handling. Frontend: `client/src/api/admin/adminRoleApi.js` and `client/src/admin/rolesApi.js`.

## GET /api/admin/roles/permissions/all

No request fields. Ensures defaults, reads Permission where `isActive != false`, sorted module/name. HTTP 200 `{success:true,count,permissions}`. Frontend `getAdminPermissions` in `client/src/api/admin/adminRoleApi.js`.

## GET /api/admin/roles/:id

Validates Mongo ObjectId (400 `{success:false,message:"Invalid role ID"}`), tenant-finds role (404 if absent), hydrates permission documents, returns 200 `{success:true,role}`. No explicit side effects.

## POST /api/admin/roles

Body: `name`, `displayName` required; optional `description` default `""`, `permissions` default `[]`, `level` default 1, `status` default active, `isDefault` default false. `name` is normalized with `normalizeRole` and must already equal its canonical lowercase/underscore representation; otherwise 400. Permission entries are filtered to valid ObjectIds and deduplicated; when any remain, all must reference active Permission documents or 400. Checks tenant duplicate name (409). Creates tenant role with trimmed display/description, level `max(1, Number(level)||1)`, status inactive only for exact `"inactive"` else active, `Boolean(isDefault)`, `isSystem:false`, and `createdBy` from user. HTTP 201 `{success:true,role}`. Duplicate-key race is handled as 409. Invalid body types/schema errors go to centralized handling.

## PUT and PATCH /api/admin/roles/:id

Both methods call the same `updateRole`; body fields are optional: `displayName`, `description`, `level`, `status`, `isDefault`. Valid ID required (400); tenant-missing role is 404; canonical super_admin role is protected (403). Strings are coerced/trimmed, level becomes at least 1, status becomes inactive only for exact `inactive` else active, and isDefault uses Boolean coercion. Saves and returns 200 `{success:true,role}`. Other role names can be updated; route does not update name or permissions. Caller methods in the client use PUT and PATCH respectively.

## DELETE /api/admin/roles/:id

Validates ID (400), tenant-finds role (404). super_admin and any `isSystem` role return 403. Otherwise hard-deletes the role and returns 200 `{success:true,message:"Role deleted"}`. There is no controller cleanup of users referencing the deleted role; referential integrity is not enforced by Mongo references.

## PUT /api/admin/roles/:id/permissions

Body reads `permissions`; missing/non-array input becomes empty, invalid IDs are filtered, duplicates removed. Validates ID (400), finds tenant role (404), protects super_admin (403), and if IDs remain confirms every ID belongs to an active Permission (400 on mismatch). Assigns the resulting list (so omitted/invalid-only input clears permissions), saves, returns 200 `{success:true,role}`. No transaction. Frontend caller `updateAdminRolePermissions` sends `{permissions}`.

## Frontend and behavioral limitations

Admin role API wrappers are in `client/src/api/admin/adminRoleApi.js`; some methods are also duplicated in `client/src/admin/rolesApi.js`. Routes do not provide atomicity across role alias consolidation, user reference migration, permission upserts, or role writes. The Permission model uses ObjectId references from Role, not database-enforced referential integrity.
