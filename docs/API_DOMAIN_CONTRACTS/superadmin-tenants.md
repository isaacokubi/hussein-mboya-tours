# Super Admin tenant plans and tenant directory APIs

All routes in this contract are declared by server/routes/superAdminRoutes.js, whose router-wide middleware is protect then superAdminOnly. The handlers run in the platform-owner request context. The Organization model is global; tenant records are platform-level resources.

## GET /api/superadmin/tenant-plans — inventory 419 and 420

Both inventory entries resolve to the same declared route and getTenantPlans handler. The handler returns a static, frozen catalogue without reading request parameters or querying MongoDB:

- starter: label Starter, 5 seats
- professional: label Professional, 20 seats
- business: label Business, 50 seats
- enterprise: label Enterprise, 100 seats, customSeats true

Success is 200 {success:true,plans:[{value,label,seats,customSeats?}]}. No handler-local error branch is declared. The duplicate inventory rows do not represent distinct controller behavior.

## GET /api/superadmin/tenants — inventory 421 and 422

Both inventory entries resolve to listTenants. Optional query parameters are page, limit and search. page is coerced with Number and clamped to at least 1, default 1. limit defaults to 25 and is clamped from 1 to 100. search is stringified and trimmed; when non-empty it is inserted into case-insensitive regular expressions over Organization.name, legalName, slug and supportEmail.

The handler runs Organization.find(filter) and countDocuments(filter) concurrently, sorts newest first, and applies skip/limit. Each tenant receives counts for users, tours, tourpackages, bookings, payments, customers, agents, staffs, vehicles and destinations. Counts use direct Mongo collection countDocuments({tenantId:ObjectId}); failures for an individual collection are swallowed and represented as zero. It also attaches the earliest created user whose role is admin/administrator as owner (name/email/phone/status only).

Success is 200 {success:true,tenants,data,page,limit,total,pages}; tenants and data are the same array, and pages is at least one. Errors are passed to next(error).

**Input caveat:** search text is used directly as a regular expression rather than escaped literal text. Regex metacharacters therefore affect matching and potentially query cost. There is no explicit maximum search length.

## POST /api/superadmin/tenants — inventory 423 and 424

Both inventory entries resolve to createTenantWithAdmin. The handler starts a Mongo session and creates the organization, primary admin user and default SystemSetting inside session.withTransaction. The session is ended in finally. The route requires Super Admin authentication and role authorization.

Body fields read: companyName (required), legalName, slug, companyEmail (valid email required), companyPhone (exactly 10 digits), domain (optional valid hostname/URL), country (default Kenya), timezone (default Africa/Nairobi), currency (default KES), plan (default starter), seats, websiteUrl, logoUrl, adminName (required), adminEmail (valid email required), adminPhone (exactly 10 digits), adminPassword (at least 12 characters including uppercase, lowercase and a digit).

Plan must be one of the four static plan keys. Seats default to the plan minimum when missing, non-numeric or non-positive; a positive number is floored. Seats below the plan minimum return 400 with code SEAT_LIMIT_BELOW_PLAN_MINIMUM; values above 10,000 return 400. Company/admin emails are trimmed and lowercased; company name/phone, country/timezone, website/logo and currency are normalized. Currency is uppercased. A supplied domain is normalized to hostname and rejected if invalid or already assigned (409). Slug is generated from requested slug or company name and made unique by appending a numeric suffix.

The organization is created with trial status, selected plan/seats, trialEndsAt 14 days in the future, customDomain feature flag and createdBy. The handler loads the system admin Role in explicit super-admin bypass context, creates an active verified admin User linked to the new tenant, and creates its default SystemSetting in the same transaction. It re-reads the new admin without password and populates roleId.

Success is 201 {success:true,message,tenant,admin,data:{tenant,admin}}. Duplicate-key errors return 409 {success:false,code:"DUPLICATE_KEY",message,field}; other errors go to next(error). The controller does not expose adminPassword in its success response because the returned admin is selected without password.

**Transactional boundary:** organization, admin and SystemSetting writes are in one transaction. The safe-admin re-read happens after commit; if that read fails, the client may receive an error even though creation has committed. A session is opened before the try block, so failure to start the session is outside the handler's catch/finally.

## GET /api/superadmin/tenants/:id — inventory 425 and 426

Both inventory entries resolve to getTenant. The id path parameter must be a valid Mongo ObjectId; invalid values return 400 {success:false,message:"Invalid tenant ID"}. Missing organizations return 404 {success:false,message:"Company not found"}. The handler reads the Organization document, finds the earliest admin/administrator user for that tenant in explicit super-admin bypass context (name/email/phone/status only), and adds tenant collection counts using the same ten collection names as listTenants.

Success is 200 {success:true,tenant:{...organization,owner,counts}}. Unlike listTenants, it does not add a data alias. Errors are passed to next(error).

## Model and scope evidence

Organization has name, slug, legal/contact details, country/timezone/currency, status, subscription, feature flags, settings and createdBy; it is configured as a global model. Tenant counts are direct MongoDB collection operations with an explicit tenantId ObjectId filter. The endpoint family is guarded by protect and superAdminOnly; no tenant-local admin can call these handlers through this router.

## Test evidence and limitations

No focused superAdminTenantController tests for these handlers were found in the repository paths searched. The contract is traced from the router, controller, Organization model and role/security middleware. No tenant was created, modified or deleted, and no live API request was made.
