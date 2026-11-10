# Tenant branding API contracts and inventory reconciliation

## Mount evidence

server/routes/index.js mounts tenantBrandingRoutes exactly once at /tenant, before the global resolveTenant middleware; tenantBrandingRoutes applies resolveTenant itself. Its router declares only GET / and PUT /. Therefore the source-backed paths are /api/tenant for GET and PUT. The API endpoint guide also lists /api/tenant/branding for both methods (entries 505 and 507), but no second mount of tenantBrandingRoutes or /branding route declaration exists in the current server/routes/index.js or tenantBrandingRoutes.js. Those two inventory paths are stale/unmounted aliases in the current source snapshot and should not be represented as live routes without a separate mount being added.

## GET /api/tenant — inventory 504

Handler getBranding. Public read after tenant resolution; no protect middleware is declared. If req.tenantId is missing, returns 404 {success:false,message:"Tenant not resolved"}. It reads Organization by req.tenantId and returns 404 if absent. Success is 200 {success:true,branding:{id,name,legalName,slug,logo,logoUrl,favicon,brandColors,contactEmail,contactPhone,website,domain,address,country,currency,timezone,status}}. Empty optional strings and defaults are supplied for logo, contact, address, country, currency and timezone. Errors return 500 with publicErrorMessage.

## PUT /api/tenant — inventory 506

Handler updateBranding. Route middleware is resolveTenant, then protect, then requireRoles("admin","manager"). It requires req.tenantId; missing context returns 400. The body is allowlisted to name, legalName, logoUrl, favicon, brandColors, websiteUrl, domain, supportEmail, supportPhone, address, country, timezone, currency and settings. Unknown fields are discarded. It updates Organization by _id=req.tenantId with runValidators:true and returns 404 if no tenant. Success is 200 {success:true,organization:{_id,name,legalName,logoUrl,favicon,brandColors,websiteUrl,domain,supportEmail,supportPhone,address,country,currency,timezone}}. Duplicate key errors return 409 "That custom domain is already assigned to another company."; other errors return 500 with publicErrorMessage.

The controller does not perform additional URL/color/email normalization beyond schema casting/validation and does not restrict the allowed branding fields by role beyond admin/manager. In particular, managers can submit legal/company identity, custom domain, contact details, brand colors and settings.

## Inventory-only paths (not mounted in current source)

GET /api/tenant/branding (entry 505) and PUT /api/tenant/branding (entry 507) are listed in the endpoint guide but cannot be derived from the current source mount. The current mount is /tenant and the child router paths are only / and /. No route is declared at /branding and no second mount was found. Treat these entries as stale inventory artifacts pending correction of the route inventory or explicit addition of a /tenant/branding mount.

## Model and test evidence

Organization is a global model containing tenant branding/contact/domain/country/currency/timezone fields. Its domain has a sparse unique index. No focused tenantBrandingController tests were found in searched paths. No branding settings were changed during this review.
