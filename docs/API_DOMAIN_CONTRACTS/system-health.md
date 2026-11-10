# Tenant system health API contracts

## Route boundary

server/routes/index.js mounts systemHealthRoutes at /system. The router applies resolveTenant, protect, adminMiddleware and authorize("system.security") to both routes. resolveTenant establishes the requested tenant context; protect verifies JWT/cookie credentials and enforces that a non-platform user belongs to the resolved tenant; adminMiddleware reloads the user and permits only admin or super_admin roles; authorize requires system.security. The permission middleware's admin compatibility list includes system.security. These are tenant-aware admin health endpoints, not the platform-only /superadmin/system snapshot.

## GET /api/system/health — inventory 496 and 497
## GET /api/system/admin/system-health — inventory 498 and 499

Both routes call the same getSystemHealth handler and return the same integration-aware health response. No request body, query or path fields are read.

The controller reads process memory and Mongoose readyState, then concurrently checks Cloudinary and the tenant's M-Pesa gateway. Cloudinary is not_configured if the three CLOUDINARY_* environment credentials are missing; otherwise it calls cloudinary.api.ping and reports connected or unavailable. M-Pesa resolves tenant-specific gateway settings via getTenantMpesaConfig, builds environment-specific Daraja URLs, sends an OAuth Basic-auth GET with a 10-second timeout and requires an access_token. It returns connected with the configured environment, not_configured when the error message indicates missing/incomplete tenant credentials, or unavailable for other failures. Provider error details are not exposed to the response.

Success is 200 {success:true,server:"online",database,cloudinary,mpesa,services:{cloudinary,mpesa},uptime,nodeVersion,memory,system}. The nested system object repeats the health fields. database is connected only when Mongoose readyState is 1. Cloudinary/M-Pesa checks run in parallel. Failure in the outer handler returns 500 {success:false,message} using publicErrorMessage.

## Operational behavior and limitations

These health routes make real external integration requests on each invocation: Cloudinary ping and Daraja OAuth. They are not passive status reads. There is no route-local rate limiter or cache in systemHealthRoutes.js. The M-Pesa test verifies OAuth reachability/credentials only; it does not initiate STK Push or verify callback settlement. Cloudinary ping verifies account API reachability, not media upload/download permissions. The controller does not fail the HTTP response when an integration is unavailable; it reports component status in a success:true health payload.

## Test evidence and limitations

No focused systemHealthRoutes/controller integration tests were found in the searched paths. No Cloudinary ping or Daraja OAuth request was made during this documentation pass.
