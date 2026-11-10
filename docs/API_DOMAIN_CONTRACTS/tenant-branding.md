# Tenant branding API contracts and mount reconciliation

## Mount evidence and effective paths

`server/routes/tenantBrandingRoutes.js` declares only root `GET /` and `PUT /`, with router-wide `resolveTenant`. It is mounted in two places:

- `server/routes/index.js` mounts the router at `/tenant`, yielding `GET/PUT /api/tenant` (inventory 504 and 506).
- `server/app.js` directly mounts the same router at `/api/tenant/branding` before `app.use("/api", apiRoutes)`, yielding `GET/PUT /api/tenant/branding` (inventory 505 and 507).

The direct app mount is reached before the consolidated API router for the `/api/tenant/branding` paths. Entries 505 and 507 are therefore live mounted aliases, not stale/unmounted inventory artifacts. The application applies `resolveTenant` globally before either mount; the child router applies it again. The `/api/tenant` paths also pass through the `apiRoutes` router's own `resolveTenant` middleware before the child router.

## GET /api/tenant and GET /api/tenant/branding — inventory 504 and 505

Both paths invoke `getBranding`. They are public reads after tenant resolution; no `protect` middleware is declared. If `req.tenantId` is missing, the controller returns 404 `{success:false,message:"Tenant not resolved"}`. It reads `Organization.findById(req.tenantId).lean()`; a missing organization returns 404 `{success:false,message:"Tenant not found"}`.

Success is 200 `{success:true,branding:{id,name,legalName,slug,logo,logoUrl,favicon,brandColors,contactEmail,contactPhone,website,domain,address,country,currency,timezone,status}}`. Empty optional strings and defaults are supplied for logo, contact, address, country, currency and timezone. Errors return 500 with `publicErrorMessage`.

## PUT /api/tenant and PUT /api/tenant/branding — inventory 506 and 507

Both paths invoke `updateBranding`. The route chain is tenant resolution, `protect`, then `requireRoles("admin","manager")`. `requireRoles` normalizes role names through `getUserRole`; the allowed values therefore resolve to `admin` and `tour_manager`. A tenant manager is permitted; a platform `super_admin` is not in this allowlist.

The controller requires `req.tenantId`; missing context returns 400. The body is allowlisted to `name`, `legalName`, `logoUrl`, `favicon`, `brandColors`, `websiteUrl`, `domain`, `supportEmail`, `supportPhone`, `address`, `country`, `timezone`, `currency` and `settings`. Unknown fields are discarded. It updates `Organization` by `_id=req.tenantId` with `$set`, `new:true` and `runValidators:true`; no transaction or separate service is involved. A missing organization returns 404.

Success is 200 `{success:true,organization:{_id,name,legalName,logoUrl,favicon,brandColors,websiteUrl,domain,supportEmail,supportPhone,address,country,currency,timezone}}`. Duplicate-key errors return 409 `{success:false,message:"That custom domain is already assigned to another company."}`; other errors return 500 with `publicErrorMessage`.

## Validation, scope and security observations

- `Organization` is configured as a global Mongoose model, so tenant scoping comes from the explicit `_id:req.tenantId` filter and the request context established by `resolveTenant`.
- The schema trims and constrains selected fields (for example name length, normalized email/currency, and the unique sparse domain index), but the controller does not add URL, email-format or color-format validation of its own.
- The `settings` field is `Mixed`; the controller accepts and replaces the entire value without a nested allowlist. Admins and tour managers can therefore write arbitrary settings keys, including flags such as `settings.isPlatform` or `settings.platform` that other platform code consults. This is a configuration-integrity risk, not a platform-role grant.
- The same broad role gate lets a tour manager change company identity, legal name, custom domain, contact details and branding; there is no separate permission per field.
- The platform Super Admin role is not in `requireRoles("admin","manager")`, so this endpoint is not a platform-owner branding editor.

## Model and test evidence

The Organization schema contains tenant branding/contact/domain/country/currency/timezone fields; `domain` has a sparse unique index. No focused `tenantBrandingController` tests were found in the searched paths. No branding settings were changed during this source review.
