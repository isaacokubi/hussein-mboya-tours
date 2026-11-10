# Super Admin role and permission API contracts

Entries 411–414 are mounted by server/routes/superAdminRoleRoutes.js at /api/superadmin/roles. The parent API router resolves tenant context before mounting this router. This router applies protect and authorize("roles.manage") to all four routes. It does not apply superAdminOnly locally. The effective permission middleware grants roles.manage through the compatibility permission list to normalized role admin, while super_admin/superadmin receives wildcard permissions.

## Tenant and platform data boundaries

Role is a tenant-scoped Mongoose model. Its tenant plugin injects tenantId into find/findOne/update/delete/count queries and rejects writes outside the active tenant. Therefore ordinary tenant admins who pass roles.manage operate on roles in their resolved tenant; platform-owner requests run in bypass context through the authenticated platform role. Permission is explicitly a global model: its tenant plugin is applied with {global:true}, so active permission definitions are shared platform-wide. Do not interpret the "Platform" controller names as proof that every request has platform-wide role scope.

## GET /api/superadmin/roles — inventory 411

Handler getPlatformRoles. No query/body/path fields are read. Role.find({}) is populated with permission name, label, description, module, category and isActive, sorted by level descending then createdAt ascending, and returned lean. The controller canonicalizes role names (trim/lowercase, whitespace/hyphens to underscores), merges duplicate normalized role permissions, maps known built-in roles to fixed display metadata and sorts by level descending. It then hydrates only active permissions and removes unresolved/inactive permission references.

Success is 200 {success:true,count,roles,data}; roles and data are the same hydrated array. Failures are passed to Express next(error).

## GET /api/superadmin/roles/permissions/all — inventory 412

Handler getPlatformPermissions. No query/body/path fields are read. Queries global Permission records where isActive is not false, sorted by module then name, and returns 200 {success:true,count,permissions,data}. Failures are passed to next(error).

## GET /api/superadmin/roles/:id — inventory 413

Handler getPlatformRole. Requires a Mongo ObjectId path parameter. Invalid IDs return 400 {success:false,message:"Invalid role ID"}. The role lookup is tenant-scoped by Role's plugin and populates the same permission fields as the list route. Missing or out-of-tenant roles return 404 {success:false,message:"Role not found"}. It hydrates active global permissions and applies fixed metadata for recognized built-in roles. Success is 200 {success:true,role,data}, with role and data containing the same normalized object. Errors are passed to next(error).

## PUT /api/superadmin/roles/:id/permissions — inventory 414

Handler updatePlatformRolePermissions. Requires an ObjectId path parameter; invalid IDs return 400. The role lookup is tenant-scoped; missing or out-of-tenant roles return 404. Roles normalized to super_admin or superadmin are protected and return 403 {success:false,message:"The Super Admin role permissions are protected."}.

The controller reads req.body.permissions only when it is an array; other shapes normalize to an empty list. normalizeIds silently filters invalid ObjectId values and deduplicates valid IDs. It counts active global Permission documents for the remaining IDs. If the count differs from the normalized list length, it returns 400 "One or more selected permissions are invalid." Otherwise it replaces role.permissions, saves the role, re-reads it with populated permission fields, hydrates active permissions and returns 200 {success:true,message,role,data}. Errors are passed to next(error).

**Input-validation edge case:** malformed/non-array permissions and arrays containing only invalid IDs normalize to an empty list. Since zero active IDs equal zero normalized IDs, the handler accepts the request and clears the role's permissions. Mixed valid and invalid IDs silently discard invalid values before validation and may still succeed. The handler does not validate a maximum array length or reject unknown properties. This is a source-observed behavior and a candidate for stricter request validation.

## Authorization interpretation

The router requires authentication and roles.manage. ADMIN_COMPATIBILITY_PERMISSIONS explicitly includes roles.manage for role admin, so a tenant admin can manage role permissions within the active tenant boundary. The global permission catalogue is visible to such an admin. This is distinct from platform-wide role mutation: Role's tenant plugin constrains the role document query to the request tenant, while the platform-owner identity is handled by the tenancy context.

## Tests and limitations

No focused superAdminRoleRoutes/controller test was found in the repository paths searched for this review. This contract is based on the route, controller, permission middleware, tenant context/plugin and Role/Permission model source. No role permissions were changed and no live API request was executed.
