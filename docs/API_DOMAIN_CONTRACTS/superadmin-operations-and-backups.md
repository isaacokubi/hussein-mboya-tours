# Super Admin audit, security, settings, monitoring and backup APIs

## Effective router and authorization order

server/routes/index.js mounts superAdminRoutes at /superadmin before the later superAdminOperationsRoutes, apiMonitorRoutes and superAdminMaintenanceRoutes mounts. superAdminRoutes applies protect then superAdminOnly at router level. Its declared routes therefore handle matching requests first; where the later routers declare the same path, their route handlers are shadowed. The endpoints documented here are reached through the platform Super Admin gate.

## GET /api/superadmin/audit — inventory 461 and 462

The effective earlier superAdminRoutes declaration calls getAuditLogs from superAdminOperationsController.js. The handler accepts page, search, action, resource, status and severity query values; page defaults to 1 and is clamped to at least 1, page size is fixed at 10. It builds optional exact filters for action/resource/status/severity and a case-insensitive regex across description/resource/action for search. It concurrently fetches newest-first populated logs and global total/success/failed/critical counts. Success is 200 {success:true,statistics:{total,success,failed,critical},pagination:{page,limit,pages},logs}; failures return 500 with publicErrorMessage.

The handler does not explicitly add tenantId to filters. Effective route authorization is platform Super Admin due the earlier router gate, so the result is platform-wide. Search regex input is not escaped and page has no maximum bound.

## GET /api/superadmin/security — inventory 463 and 464

An inline route in superAdminRoutes invokes securityService.getSecurityStatus and returns 200 {success:true,data}. Errors are logged and returned as 500 {success:false,message:error.message}. The service calculates a 24-hour window, counts users, admin identities (by role, legacyRole and roleId), distinct normalized role names, active permissions, failed security attempts and critical security events. It derives threatLevel as high when critical events exist or failed attempts exceed 200, medium when failed attempts exceed 50, otherwise low. securityScore starts at 100, subtracts 40 for high or 20 for medium, then subtracts up to 20 based on critical event count, clamped 0–100. It reports JWT authentication as active, authorization as active when roles and active permissions exist, database connection state and a fixed list of controls.

These are derived counters/status heuristics, not active penetration tests or end-to-end verification of each listed control. The service returns no event log details from this endpoint.

## GET /api/superadmin/database — inventory 465 and 466

Effective handler getDatabaseStatus. No request fields are read. Returns 200 {success:true,database:{status,connected,host,name,environment,checkedAt}} from Mongoose connection readyState/host/name and NODE_ENV. Errors return 500 {success:false,message:"Unable to read database status"}.

## GET /api/superadmin/system — inventory 467 and 468

Effective handler getSystemHealth. No request fields are read. Reports database state, process uptime, Node version, environment, RSS/heap/external memory, heap percentage, OS/architecture/release and timestamp. Overall status depends only on database connectivity; runtime check is hard-coded healthy, memory warns at heap use >=90%. Success is 200 {success:true,system:{status,checks,uptimeSeconds,nodeVersion,environment,memory,platform,database,timestamp}}; errors return 500 {success:false,message:"Unable to read system health"}. It is a runtime snapshot, not a full readiness/dependency probe.

## GET /api/superadmin/api-monitor — inventory 469 and 470

The earlier superAdminRoutes declaration invokes getApiMonitor from apiMonitorController.js. It reads system settings for the service display name, process memory and Mongoose connection state. It returns 200 {success:true,data:{status,service,healthScore,database,response,server,endpoints,timestamp}}. Health score is 100 when the database is connected and 25 otherwise. Four endpoint entries (security, dashboard, tours and bookings) are labelled registered/degraded based only on database connectivity and have responseTime "n/a". No endpoint is actually probed and no latency is measured. Errors return 500 {success:false,message:"Unable to load API monitor status."}.

## GET /api/superadmin/settings — inventory 471 and 472

Handler getSettings from settingsController.js. Because the earlier Super Admin router establishes platform-owner bypass context, the handler reads or creates SystemSetting {tenantId:null,key:"platform"}. A missing record is seeded with DEFAULTS. Success is 200 {success:true,data,settings,scope:"platform"}; errors go to next(error). This endpoint returns platform settings, not tenant defaults.

## PUT /api/superadmin/settings — inventory 473 and 474

Handler updateSettings. It writes SystemSetting {tenantId:null,key:"platform"} in bypass context, creating a defaults record if needed. Only keys in the controller's ALLOWED list are copied from the request body; unknown keys are ignored. Allowed fields cover company/contact details, currency/timezone/language, tax/deposit/commission rates, maintenance/registration/verification flags, payment method toggles and instructions, email sender, social links, SEO metadata, notification flags, theme colors/typography, border/button styling, hero overlay and homepage sections.

Normalization trims company name/support email/phone/timezone, uppercases currency, converts selected numeric fields with Number when finite, converts string booleans to true only when the string equals "true", parses seoKeywords JSON or comma-separated text, and parses homepageSections JSON (invalid JSON becomes undefined). Validation checks six-digit hex colors, hero opacity 0–100, tax/deposit/commission rates 0–100, non-empty company name, support email format, required bank details when bank transfer is enabled, and cash instructions/location when cash is enabled. Success is 200 {success:true,message,data,settings,tenantProfile:null,scope:"platform"}. Validation failures return 400; caught errors return status error.status or 500 with publicErrorMessage.

Platform writes do not synchronize an Organization document because synchronization is only performed when tenant bypass is false. The handler does not explicitly validate the shape/content of homepageSections or SEO keyword arrays beyond parsing.

## POST /api/superadmin/maintenance/backup and POST /api/superadmin/database/backup — inventory 475–478

Both aliases invoke createPlatformDatabaseBackup. If Mongoose has no database handle, returns 503. Otherwise it lists every database collection and reads every document from every collection with no tenant filter, builds one JSON object containing metadata and full collection contents, and writes server/backups/database-backup-<timestamp>.json synchronously. It inserts platform metadata directly through DatabaseBackup.collection with tenantId:null, filename, size, collection names, database/environment, creator and timestamps, writes a success audit log and returns 200 {success:true,message,file,backup}. Failures return 500 with publicErrorMessage.

**Data protection/operations caveat:** this handler serializes the entire platform database to a plaintext JSON file under the application working directory. No encryption, retention cap, streaming/chunking, checksum, restore flow or backup-size guard is visible here. A backup can contain credentials and personal data stored in collections. The file write and metadata/audit writes are separate operations, so partial artifacts may remain after a later failure. No backup was created during this review.

## POST /api/superadmin/maintenance/cache and POST /api/superadmin/database/cache-clear — inventory 479–482

Both aliases invoke clearSystemCache. It recursively removes every child from existing process-wide cache, tmp and uploads/tmp directories under process.cwd(), then returns 200 {success:true,message,cleared,timestamp}. It does not scope deletion by tenant. Failures attempt a high-severity audit record and return 500. Treat this as destructive process-wide cleanup.

## GET /api/superadmin/database/backups and GET /api/superadmin/maintenance/backups — inventory 483–486

Both aliases invoke listPlatformDatabaseBackups. It uses the native DatabaseBackup collection with filter tenantId:null, sorts newest first and limits to 50. Success is 200 {success:true,backups,count,scope:"platform"}; errors return 500 {success:false,message:"Unable to read platform backup records"}. The /maintenance/backups path is declared earlier than the later maintenance router's same path, so this platform handler shadows the tenant maintenance listing route.

## DELETE /api/superadmin/maintenance/backups/:id and DELETE /api/superadmin/database/backups/:id — inventory 487–490

Both aliases invoke deletePlatformDatabaseBackup. Invalid ObjectId returns 400. It looks up only a platform backup (tenantId:null), returns 404 if metadata is absent, constructs the file path using path.basename(stored filename) under BACKUP_DIR, removes the file if present, deletes metadata, writes an audit log and returns 200 {success:true,message:"Backup deleted successfully"}. Errors return 500. File deletion, metadata deletion and audit creation are not transactional. The /maintenance/backups/:id path is handled by this earlier platform route before the later maintenance router's same path.

## Test evidence and limitations

No focused tests for these route/controller combinations were found in the paths searched. This document is a source trace, not evidence that the security controls are actively probed, settings were changed, caches cleared, or backups created/downloaded/deleted.


## GET /api/superadmin/database/backup/:id/download — inventory 491 and 492

Handler downloadPlatformDatabaseBackup. Requires a valid Mongo ObjectId path parameter; invalid IDs return 400. It reads DatabaseBackup through the native collection with both _id and tenantId:null, so only platform backup metadata can be downloaded. Missing metadata returns 404 "Backup not found". The file path is built under BACKUP_DIR using path.basename(backup.file), preventing stored path segments from being used as directories. Missing files return 404 "Backup file missing"; otherwise Express res.download streams the file with its basename as the download filename. Unexpected errors return 500 "Unable to download the selected backup". The endpoint does not create an audit event in this handler. It inherits protect + superAdminOnly from superAdminRoutes.
