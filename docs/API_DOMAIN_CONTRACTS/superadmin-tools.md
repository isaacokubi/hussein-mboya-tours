# Super Admin tools API contracts

## Mount and authorization

server/routes/index.js mounts superAdminToolsRoutes at /superadmin-tools, not under /superadmin. It applies resolveTenant, then protect, then authorize("system.security") to the router. It does not inherit the earlier /superadmin router's superAdminOnly gate. permissionMiddleware's ADMIN_COMPATIBILITY_PERMISSIONS includes system.security for normalized role admin, so a tenant admin can pass this permission check when authenticated and tenant resolution succeeds.

The route file imports getApiMonitor and getSystem but does not declare routes for them. Those imports are unused in this router.

## GET /api/superadmin-tools/database — inventory 493

Handler getDatabase. It does not query application records or accept request parameters. It returns 200 {success:true,message:"Database tools operational",status,database:{host,name}} where status is healthy only when mongoose.connection.readyState===1; otherwise disconnected. Errors return 500 with publicErrorMessage. Host and database name are exposed to callers passing system.security.

## GET /api/superadmin-tools/settings — inventory 494

Handler getSettings. It currently returns a static placeholder 200 {success:true,message:"Platform settings operational",settings:{}}. It does not read SystemSetting or expose actual platform/tenant configuration. Errors return 500 with publicErrorMessage.

## Security and completeness observations

These are tenant-resolved routes protected by system.security, not platform-only routes. Since admin compatibility permissions include system.security, a tenant admin may access them. The database endpoint exposes connection host/name metadata; the settings endpoint is currently a placeholder. The imported getApiMonitor/getSystem handlers are not mounted by this router.

## Test evidence and limitations

No focused superAdminToolsRoutes/controller tests were found in searched paths. No live request was executed.
