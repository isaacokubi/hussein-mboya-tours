# Platform tenant directory APIs

## Route boundary

server/routes/index.js mounts tenantRoutes at /tenants. tenantRoutes applies resolveTenant, protect and superAdminOnly to every endpoint. This is a platform-super-admin-only router. The Organization model is global and platform tenant operations explicitly use tenant bypass where needed.

## GET /api/tenants — inventory 508

Handler listTenants. No query/body/path fields are read. It attempts to return newest-first Organization records with {success:true,data:tenants,tenants}. However, the implementation calls tenantFilter(req) inside platform bypass context. tenantFilter(req) throws "Missing tenant context" whenever req.tenantId is absent. For a platform Super Admin, resolveTenant intentionally takes the platform-role bypass path without assigning req.tenantId, and protect explicitly sets req.tenantId=null. Therefore this handler fails instead of listing platform tenants for the intended caller unless a tenantId is somehow populated outside the documented platform flow. The error is passed to next(error).

**Confirmed source-level defect:** use an unscoped Organization.find({}) inside the already SuperAdmin-only platform bypass context, or otherwise supply an explicit platform-safe filter. The current tenantFilter(req) is inconsistent with the route's platform-only intent.

## POST /api/tenants — inventory 509

Handler createTenant. Body fields read: name, slug, country (default Kenya), timezone (default Africa/Nairobi), currency (default KES), and optional admin object. name must be non-empty. slug is slugified from supplied slug or name (lowercase, non-alphanumeric runs to hyphens, trim hyphens, max 80 chars); an empty result returns 400. Optional admin is treated as absent when all its values are falsy; if any value is supplied, name/email/phone/password are all required. Email must match a simple non-whitespace address pattern and is lowercased; phone must be exactly 10 digits; password must be at least 12 characters and include uppercase and a digit (lowercase is not required).

A duplicate slug returns 409. Duplicate administrator email returns 409. It calls ensureSystemRoles, creates an Organization in bypass context with trial status, starter plan, five seats and a 14-day trial. If admin details are supplied, it creates an active verified admin User in the new tenant context. Success is 201 {success:true,tenant,admin}, with a reduced admin object or null.

Creation is not wrapped in a Mongo transaction. On failure after user creation, it attempts to delete the admin, then organization, swallowing cleanup errors before passing the original error to next(error). This is compensating cleanup, not atomic rollback. The duplicate email pre-check and tenant creation can race with concurrent requests; unique indexes remain the final enforcement.

## GET /api/tenants/:id — inventory 510

Handler getTenant. Requires a valid ObjectId; invalid IDs return 400 {success:false,message:"Invalid tenant ID."}. It uses runWithTenant({bypass:true}) and mergeTenantFilter(req,{_id:id}) to read Organization. Because bypass is active, mergeTenantFilter returns the supplied filter without a tenantId restriction. Missing records return 404; success is 200 {success:true,tenant}. Errors go to next(error).

## PATCH /api/tenants/:id — inventory 511

Handler updateTenant. It allowlists name, legalName, logoUrl, websiteUrl, domain, supportEmail, supportPhone, country, timezone, currency, status, subscription, features and settings; unknown body keys are ignored. It performs Organization.findOneAndUpdate with the path id and allowlisted fields, runValidators:true, in bypass context. Success is 200 {success:true,tenant}; missing record returns 404. There is no explicit ObjectId validation, so malformed IDs are delegated to Mongoose/error middleware. The controller does not apply additional semantic validation to subscription/features/settings beyond Organization schema validators.

**High-impact administrative surface:** the endpoint allows a platform Super Admin to directly replace subscription, status, feature flags and mixed settings in addition to branding/contact fields. The route guard is the only authorization boundary.

## Test evidence and limitations

No focused tenantController tests were found in the paths searched. The listTenants failure is a static control-flow conclusion from resolveTenant, protect, tenantRoutes, tenantFilter and tenantController source; it was not confirmed by executing a request. No tenant was created, listed, read or updated during this review.
