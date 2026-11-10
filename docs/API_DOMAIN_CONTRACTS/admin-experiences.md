# Admin experience/category contracts

The /api/admin/experiences name is backed by TourCategory; the endpoint manages homepage experience categories.

## Shared access and tenant behavior

Mounted from server/routes/index.js under /admin/experiences. Router middleware is resolveTenant → protect → contentManagerMiddleware. The content role gate reloads the authenticated User and permits normalized admin, super_admin, manager, tour_manager, and tourmanager; inactive/disabled/blocked/suspended users are denied. There is no separate permission check. TourCategory uses tenantPlugin and a unique {tenantId,slug} index. Mutations are constrained to tenant context.

## GET /api/admin/experiences

- **Request:** No path/query/body fields.
- **Behavior:** Requires tenant ID, finds all tenant categories sorted newest first. If none exist, inserts four default categories (Safari, Beach, Mountain, Culture) as active records, then re-reads them. A duplicate-key race from concurrent initialization is caught and handled by re-reading; other insert errors propagate.
- **Success:** HTTP 200 {success:true,categories:[...]}. This GET has a seeding write side effect when the tenant has no category records.
- **Frontend:** getAdminExperiences() returns categories, falling back to experiences or an empty list.

## POST /api/admin/experiences

- **Request body:** Reads name, slug, icon, description, image, active. name and description must provide truthy .trim() values. Slug defaults to name, then stringifies/trims/lowercases and replaces non-alphanumeric runs with hyphens, stripping edge hyphens. Icon defaults to Map; image defaults empty string; active defaults true and only literal boolean false makes it false.
- **Write/response:** Creates tenant TourCategory; HTTP 201 {success:true,category}.
- **Errors:** Missing/blank name or description 400. Duplicate tenant slug 409. Other cast/model validation/database errors go to centralized handling.
- **Frontend:** createExperience(payload) posts payload unchanged and returns category/experience alias.

## PUT /api/admin/experiences/:id

- **Request:** Path ID used directly; no explicit ObjectId check. Optional body fields: name, slug, icon, description, image, active. Present text fields are stringified and trimmed; slug is normalized; active uses JavaScript Boolean(value) (so string "false" becomes true).
- **Write/response:** Tenant-filtered findOneAndUpdate, {new:true,runValidators:true}. HTTP 200 {success:true,category}.
- **Errors:** Missing/cross-tenant ID 404. Duplicate slug 409. Other cast/validation/database failures pass to centralized handling. No concurrency version check or transaction.
- **Frontend:** updateExperience(id,payload) sends payload unchanged.

## DELETE /api/admin/experiences/:id

- **Request:** Path ID used in tenant-filtered findOneAndDelete; no explicit ID validation or body.
- **Success/errors:** HTTP 200 {success:true,message:"Travel experience deleted"}; absent/cross-tenant record 404. Other errors pass to centralized handling.
- **Effects/frontend:** Hard deletes the category document; this handler does not update tours or other references. deleteExperience(id) returns the API envelope.
