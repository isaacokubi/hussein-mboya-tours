# Super Admin maintenance API contracts

These contracts cover the nine mounted maintenance endpoints in inventory entries 398–406. The routes are implemented by handlers in server/controllers/superAdminOperationsController.js, despite the route module's name. This is source tracing, not evidence that a backup, file download, deletion, or cache clear was executed.

## Shared router boundary

server/routes/index.js mounts superAdminMaintenanceRoutes at /superadmin/maintenance, yielding /api/superadmin/maintenance. The child router applies resolveTenant, then protect and superAdminOnly to all nine routes. No request body or query schema is declared at the router. The route module imports the five handlers from superAdminOperationsController.js.

The controller uses DatabaseBackup and tenant helpers. backupFilter and backupCollectionFilter return an empty filter when the current async tenant context is bypassed, otherwise tenantFilter(req). Backup metadata records whether the operation ran in platform-bypass or tenant scope. Files are written under server/backups relative to process.cwd(). The DatabaseBackup model stores file, size, collection names, database name, environment, creator and optional tenant ID.

## GET /api/superadmin/maintenance/backups — inventory 398

Handler listDatabaseBackups. Reads DatabaseBackup using backupFilter(req), sorts newest first, limits results to 10 and returns lean records. Success is 200 {success:true,backups}. Failures return 500 {success:false,message} using publicErrorMessage. No pagination, query filters or file-system access occur in this handler.

## POST /api/superadmin/maintenance/backup — inventory 399
## POST /api/superadmin/maintenance/maintenance/backup — inventory 400
## POST /api/superadmin/maintenance/database/backup — inventory 405

All three aliases call createDatabaseBackup and have identical behavior; the doubled maintenance path is an actual mounted alias, not a separate handler.

- If mongoose.connection.db is unavailable, returns 503 {success:false,message:"Database connection unavailable"}.
- Creates server/backups if absent and generates a timestamp-based database-backup-<timestamp>.json filename.
- Determines platform scope from isTenantBypassed(). It records createdAt, environment, database name, scope, tenant ID (null for platform scope; req.tenantId otherwise) and creator.
- Lists database collections and reads every collection using backupCollectionFilter(req). In a tenant context, the same tenant filter is applied to each collection; this assumes the collections support the tenant filter semantics.
- Writes the JSON backup synchronously to disk, then creates a DatabaseBackup metadata record, then writes a success audit log. These file/database/audit operations are not a single transaction; partial artifacts can remain if a later step fails.
- Success is 200 {success:true,message,file,scope}. Other errors return 500 {success:false,message} after logging error details server-side.
- No request body or query fields are read. No focused test for this controller route was found.

## POST /api/superadmin/maintenance/cache — inventory 401
## POST /api/superadmin/maintenance/maintenance/cache — inventory 402
## POST /api/superadmin/maintenance/database/cache-clear — inventory 406

All three aliases call clearSystemCache and have identical behavior. The handler synchronously inspects process-wide cache, tmp and uploads/tmp directories under process.cwd(); for each existing directory it recursively removes every child and records the directory in cleared. Success is 200 {success:true,message,cleared,timestamp}. Failures attempt a high-severity failure audit record and return 500 {success:false,message}. No request body, path parameter or query input is used.

**Operational risk:** the deletion is process-wide and does not apply a tenant-specific filter. The super-admin authorization gate is the only route-level restriction; the handler does not limit removal to a tenant or verify that the directory contents are disposable before deleting them. The endpoint should be treated as destructive maintenance, not a tenant-local cache operation.

## DELETE /api/superadmin/maintenance/backups/:id — inventory 403

Handler deleteDatabaseBackup. Reads a tenant-filtered DatabaseBackup record by path id using mergeTenantFilter(req,...). Missing metadata returns 404. It constructs a path from BACKUP_DIR and the stored backup.file; if the file exists, it synchronously removes it, then deletes the tenant-filtered metadata record. Success is 200 {success:true,message:"Backup deleted successfully"}. Unexpected failures return 500 {success:false,message}. The file deletion and metadata deletion are separate operations; if the database delete fails after the file removal, metadata may remain for a missing file. No focused controller test was found.

## GET /api/superadmin/maintenance/database/backup/:id/download — inventory 404

Handler downloadDatabaseBackup. Reads the tenant-filtered DatabaseBackup record by path id. Missing metadata or missing disk file returns 404 with a distinct message. Otherwise Express res.download streams the file. Errors attempt a high-severity audit log and return 500 {success:false,message}. This handler does not mutate the backup record. The download path is built from the stored filename under BACKUP_DIR; the filename is created by the backup handler rather than accepted from this request.

## Test evidence and limitations

The discovered server/tests/superAdminBackupListing.test.js tests a different controller and route (listPlatformDatabaseBackups mounted on superAdminRoutes), including a platform-null-tenant filter and super-admin route middleware. It does not test the nine maintenance routes documented here. No focused test was found for createDatabaseBackup, listDatabaseBackups, clearSystemCache, deleteDatabaseBackup or downloadDatabaseBackup in superAdminOperationsController.js. No backup/restore, filesystem deletion, cache clear, or download was executed during this source review. The code exposes backup creation and download but no restore route in this nine-entry router.
