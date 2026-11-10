# Security status and event read APIs

## Entries 379–380

**Status: SOURCE-TRACED.** Routes in `server/routes/securityRoutes.js` require tenant resolution, JWT and `system.security` permission. Controllers in `server/controllers/securityController.js` delegate to `server/services/securityService.js`; no write or external calls.

- `GET /api/security/status`: no body/query. Returns 200 `{success:true,data}` with a heuristic score/threat level, JWT/RBAC control labels, user/admin/role/permission counts, 24-hour failed and critical event counts, and Mongo connection state. Controller catches service errors and returns 500 `{success:false,message:publicErrorMessage(error)}`.
- `GET /api/security/events`: returns 200 `{success:true,data}` with latest 100 SecurityLog records; controller catches errors as 500.

**Tenant isolation concern:** `securityService.js` queries `User`, `Role`, `Permission`, and `SecurityLog` without tenant predicates or tenant plugin context in the shown service calls. Despite route tenant resolution and permission requirement, the metrics/events are source-coded as platform-wide and may expose cross-tenant security metadata to an authorized tenant principal. This must be treated as a confirmed query-scope gap in the implementation; production exposure depends on who receives `system.security` permission. No remediation was made in this documentation task.
