# Super Admin operational status and audit APIs

These contracts cover inventory entries 407–409 from superAdminOperationsRoutes.js. The route boundary and handlers are source-traced; no live operational status or audit request was executed.

## Shared route boundary

server/routes/index.js mounts superAdminOperationsRoutes at /superadmin, yielding /api/superadmin. The child router applies resolveTenant, protect, checkPermission("roles.manage"), then auditMiddleware before route declarations. These endpoints are permission-gated by roles.manage; the router does not apply superAdminOnly. The audit middleware attaches a response-finish listener and, for authenticated requests, writes an AuditLog entry after the response using request method/path and response status.

## GET /api/superadmin/audit — inventory 407

Handler getAuditLogs. Reads optional query fields page (default 1), search, action, resource, status and severity. Page is coerced with Number, defaults to 1 for falsy/invalid values and is clamped to a minimum of 1; there is no maximum page bound. Limit is fixed at 10. Search is interpolated into case-insensitive regular expressions over description, resource and action without escaping regex metacharacters.

The handler builds a filter only from action/resource/status/severity/search; it does not add tenantId, even though the router has resolveTenant and the AuditLog model has tenantId plus a tenant plugin. It runs AuditLog.find(filter), total count, success count, failed count and critical count concurrently. The three statistics counts are global filters too, not scoped to the list filter. User references are populated with name/email/role; results are newest-first with skip/limit.

Success is 200 {success:true,statistics:{total,success,failed,critical},pagination:{page,limit,pages},logs}. pages is at least one. Failure is 500 {success:false,message}. **Scope risk:** unless roles.manage is restricted to a trusted platform-wide role elsewhere, this handler's lack of tenant filter can expose audit records and global counts across tenants. The route itself does not establish that the caller is platform-wide. Search regex input is also unescaped and page values are not upper-bounded.

## GET /api/superadmin/database — inventory 408

Handler getDatabaseStatus. No body, path or query inputs. Reads Mongoose connection readyState, host and database name plus NODE_ENV and current timestamp. Returns 200 {success:true,database:{status,connected,host,name,environment,checkedAt}}; status is Connected only when readyState is 1, otherwise Disconnected. Unexpected errors return 500 {success:false,message:"Unable to read database status"} after server-side logging. This exposes operational connection metadata to any caller passing the roles.manage gate.

## GET /api/superadmin/system — inventory 409

Handler getSystemHealth. No body, path or query inputs. Reads process memory usage, uptime, Node version, environment, platform OS/architecture/release and Mongoose connection state. It computes heap percentage and reports memory warning at 90% or above; overall status is healthy when the database is connected and degraded otherwise. Runtime is hard-coded healthy; it is not a comprehensive readiness probe.

Success is 200 {success:true,system:{status,checks,uptimeSeconds,nodeVersion,environment,memory,platform,database,timestamp}}. Errors return 500 {success:false,message:"Unable to read system health"} after server-side logging. This exposes runtime and infrastructure details to callers passing roles.manage.

## Test evidence and limitations

No focused tests were found for getAuditLogs, getDatabaseStatus, getSystemHealth, or the superAdminOperationsRoutes permission/audit middleware composition. The discovered superAdminBackupListing test targets a different router/controller. No endpoint request was executed during this source review.
