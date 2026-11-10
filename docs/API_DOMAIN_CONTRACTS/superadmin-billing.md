# Super Admin platform billing configuration APIs

All routes are mounted by server/routes/superAdminRoutes.js and inherit protect then superAdminOnly. Platform settings are read/written inside runWithTenant({role:"super_admin",bypass:true}) against SystemSetting with tenantId:null and key:"platform".

## GET /api/superadmin/billing/config — inventory 445 and 446

Handler getPlatformBillingConfig. No request fields are read. Reads platform SystemSetting, then computes each plan price from the stored field when present, otherwise the corresponding TENANT_PLAN_*_PRICE_KES environment variable, defaulting to zero. Returns KES currency, a payment-status summary for legacy platform M-Pesa environment variables (provider, environment, configured, callbackConfigured, shortcodeConfigured), resolved plan feature arrays, and feature catalog entries.

Success is 200 {success:true,prices:{starter,professional,business,enterprise},currency:"KES",mpesa,features,featureCatalog}. The endpoint reports only whether legacy platform M-Pesa config fields are present; it does not expose credentials. Errors go to next(error).

## PUT /api/superadmin/billing/config — inventory 447 and 448

Handler updatePlatformBillingConfig. The four body fields starter, professional, business and enterprise are all required as whole-number KES prices because Number(undefined) fails validation. Each must be an integer from 0 through 100,000,000 inclusive. A zero price is allowed. Invalid values throw a 400 error with a plan-specific message.

Optional body.features must be an object containing arrays for all four plans. Every feature ID must exist in PLAN_FEATURE_CATALOG; unknown IDs cause validation error. The service normalizes IDs to lowercase, removes duplicates, and always adds billing if absent. If features is omitted, existing/default plan feature configuration is preserved. The handler loads or creates the platform SystemSetting, writes all four price fields plus subscriptionPlanFeatures, saves, and returns 200 {success:true,message,prices,features,currency:"KES",mpesa}. Errors go to next(error).

The write is performed in explicit platform bypass context; no tenant settings are modified. The controller does not read or update payment credentials through this endpoint.

## GET /api/superadmin/billing/features — inventory 449 and 450

Handler getPlatformPlanFeatureCatalog. No request fields are read. Returns the resolved feature arrays for each plan and the complete static feature catalogue: 200 {success:true,plans,catalog}. The feature service reads platform SystemSetting in bypass context. Configured feature arrays that are missing or empty fall back to DEFAULT_PLAN_FEATURES; normalization removes unknown IDs and duplicates. Errors go to next(error).

## Feature catalogue and defaults

The catalogue contains feature identifiers, labels and descriptions for dashboard, users/staff, tours/bookings, operations, hospitality, finance/accounting, integrations, AI, notifications, RBAC, billing, settings, security, multi-branch, SSO and enterprise entitlements. The default starter/professional/business lists are explicitly enumerated in planFeatureService.js; enterprise defaults to every catalogue feature. validatePlanFeatures requires an array for every plan and rejects unknown identifiers, then ensures billing is included.

## Model evidence and limitations

SystemSetting stores the four tenant plan prices and subscriptionPlanFeatures map, alongside tenant-level workspace settings. The platform endpoints deliberately use tenantId:null/key:"platform" under bypass context. No focused platformBillingController tests were found in the searched paths. No platform price or feature settings were changed during this review.
