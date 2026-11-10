# Source explanation: server/controllers/superAdminOperationsController.js

**Source:** [server/controllers/superAdminOperationsController.js](../../../server/controllers/superAdminOperationsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `isTenantBypassed` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `fs` from `fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `DatabaseBackup` from `../models/DatabaseBackup.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/DatabaseBackup.js](../../../server/models/DatabaseBackup.js)
- `AuditLog` from `../models/AuditLog.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AuditLog.js](../../../server/models/AuditLog.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `createAuditLog` from `../services/auditService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/auditService.js](../../../server/services/auditService.js)

## Runtime declarations and data flow

### `backupFilter` — lines 16–16

Parameters: `req`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `backupCollectionFilter` — lines 18–18

Parameters: `req`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getAuditLogs` — lines 20–20

Parameters: `req`, `res`.
Reads request/component inputs: req.query. Persistent operations detected: AuditLog.find, AuditLog.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `async (req, res) => { try { const { page = 1, search = "", action = "", resource = "", status = "", severity = "" } = req.query; const currentPage = Math.max(Number(page) || 1, 1); const limit = AUDIT_PAGE_SIZE; const fi` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getSecurityStatus` — lines 22–22

Parameters: `req`, `res`.
Reads request/component inputs: req.user. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 22:** `async (req, res) => { try { const securityService = await import("../services/securityService.js"); const data = await securityService.default.getSecurityStatus(); await createAuditLog({ user: req.user?._id, action: "vie` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getDatabaseStatus` — lines 23–23

Parameters: `req`, `res`.
Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 23:** `async (req, res) => { try { const state = mongoose.connection.readyState; res.json({ success: true, database: { status: state === 1 ? "Connected" : "Disconnected", connected: state === 1, host: mongoose.connection.host |` — Builds an HTTP response with an explicit status and JSON payload.

### `getSystemHealth` — lines 25–60

Parameters: `req`, `res`.
Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 26:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 27:** `const memory = process.memoryUsage();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const databaseState = mongoose.connection.readyState;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const databaseConnected = databaseState === 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const timestamp = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const rssMb = Math.round((memory.rss / 1024 / 1024) * 100) / 100;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const heapUsedMb = Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const heapTotalMb = Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const externalMb = Math.round((memory.external / 1024 / 1024) * 100) / 100;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const heapPercent = heapTotalMb > 0 ? Math.round((heapUsedMb / heapTotalMb) * 10000) / 100 : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const status = databaseConnected ? "healthy" : "degraded";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 58:** `res.status(500).json({ success: false, message: "Unable to read system health" });` — Builds an HTTP response with an explicit status and JSON payload.

### `getApiMonitor` — lines 62–62

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 62:** `async (req, res) => { res.json({ success: true, api: { status: "online", timestamp: new Date(), service: "Global Tours API" } }); }` — Sends a JSON response; inspect its caller for status and error semantics.

### `clearSystemCache` — lines 63–63

Parameters: `req`, `res`.
Reads request/component inputs: req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 63:** `async (req, res) => { try { const folders = [path.join(process.cwd(), "cache"), path.join(process.cwd(), "tmp"), path.join(process.cwd(), "uploads", "tmp")]; const cleared = []; for (const folder of folders) if (fs.exist` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createDatabaseBackup` — lines 65–111

Parameters: `req`, `res`.
Reads request/component inputs: req.tenantId, req.user. Persistent operations detected: DatabaseBackup.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 66:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 67:** `if (!mongoose.connection.db) return res.status(503).json({ success: false, message: "Database connection unavailable" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `const filename = \`database-backup-${Date.now()}.json\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `const filepath = path.join(BACKUP_DIR, filename);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `const platformBackup = isTenantBypassed();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `const backupData = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `const collections = await db.listCollections().toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 84:** `const collectionNames = collections.map((collection) => collection.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `for (const collection of collections) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 89:** `.find(backupCollectionFilter(req))` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 95:** `await DatabaseBackup.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 105:** `await createAuditLog({ user: req.user?._id, action: "create", resource: "Database", description: \`Database backup created: ${filename}\`, status: "success", severity: "low" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 106:** `res.json({ success: true, message: "Database backup created successfully", file: filename, scope: platformBackup ? "platform" : "tenant" });` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 109:** `res.status(500).json({ success: false, message: publicErrorMessage(error) });` — Builds an HTTP response with an explicit status and JSON payload.

### `listDatabaseBackups` — lines 113–121

Parameters: `req`, `res`.
Persistent operations detected: DatabaseBackup.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 114:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 115:** `const backups = await DatabaseBackup.find(backupFilter(req)).sort({ createdAt: -1 }).limit(10).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 116:** `res.json({ success: true, backups });` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 119:** `res.status(500).json({ success: false, message: publicErrorMessage(error) });` — Builds an HTTP response with an explicit status and JSON payload.

### `downloadDatabaseBackup` — lines 123–134

Parameters: `req`, `res`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: DatabaseBackup.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 124:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 125:** `const backup = await DatabaseBackup.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 126:** `if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 127:** `const filepath = path.join(BACKUP_DIR, backup.file);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `if (!fs.existsSync(filepath)) return res.status(404).json({ success: false, message: "Backup file missing" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 131:** `await createAuditLog({ user: req.user?._id, action: "error", resource: "Database", description: error.message, status: "failed", severity: "high" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 132:** `res.status(500).json({ success: false, message: publicErrorMessage(error) });` — Builds an HTTP response with an explicit status and JSON payload.

### `deleteDatabaseBackup` — lines 136–147

Parameters: `req`, `res`.
Reads request/component inputs: req.params. Persistent operations detected: DatabaseBackup.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 137:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 138:** `const backup = await DatabaseBackup.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 139:** `if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 140:** `const filepath = path.join(BACKUP_DIR, backup.file);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 141:** `if (fs.existsSync(filepath)) fs.rmSync(filepath);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 142:** `await DatabaseBackup.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 143:** `res.json({ success: true, message: "Backup deleted successfully" });` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 145:** `res.status(500).json({ success: false, message: publicErrorMessage(error) });` — Builds an HTTP response with an explicit status and JSON payload.

## Module-level declarations

- Line 13: `const BACKUP_DIR = path.join(process.cwd(), "server", "backups");`.
- Line 14: `const AUDIT_PAGE_SIZE = 10;`.
- Line 16: `const backupFilter = (req) => (isTenantBypassed() ? {} : tenantFilter(req));`.
- Line 18: `const backupCollectionFilter = (req) => (isTenantBypassed() ? {} : tenantFilter(req));`.
- Line 20: `export const getAuditLogs = async (req, res) => { try { const { page = 1, search = "", action = "", resource = "", status = "", severity = "" } = req.query; const currentPage = Mat`.
- Line 22: `export const getSecurityStatus = async (req, res) => { try { const securityService = await import("../services/securityService.js"); const data = await securityService.default.getS`.
- Line 23: `export const getDatabaseStatus = async (req, res) => { try { const state = mongoose.connection.readyState; res.json({ success: true, database: { status: state === 1 ? "Connected" :`.
- Line 25: `export const getSystemHealth = async (req, res) => {`.
- Line 27: `const memory = process.memoryUsage();`.
- Line 28: `const databaseState = mongoose.connection.readyState;`.
- Line 29: `const databaseConnected = databaseState === 1;`.
- Line 30: `const timestamp = new Date();`.
- Line 31: `const rssMb = Math.round((memory.rss / 1024 / 1024) * 100) / 100;`.
- Line 32: `const heapUsedMb = Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100;`.
- Line 33: `const heapTotalMb = Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100;`.
- Line 34: `const externalMb = Math.round((memory.external / 1024 / 1024) * 100) / 100;`.
- Line 35: `const heapPercent = heapTotalMb > 0 ? Math.round((heapUsedMb / heapTotalMb) * 10000) / 100 : null;`.
- Line 36: `const status = databaseConnected ? "healthy" : "degraded";`.
- Line 62: `export const getApiMonitor = async (req, res) => { res.json({ success: true, api: { status: "online", timestamp: new Date(), service: "Global Tours API" } }); };`.
- Line 63: `export const clearSystemCache = async (req, res) => { try { const folders = [path.join(process.cwd(), "cache"), path.join(process.cwd(), "tmp"), path.join(process.cwd(), "uploads",`.
- Line 65: `export const createDatabaseBackup = async (req, res) => {`.
- Line 68: `const db = mongoose.connection.db;`.
- Line 71: `const filename = \`database-backup-${Date.now()}.json\`;`.
- Line 72: `const filepath = path.join(BACKUP_DIR, filename);`.
- Line 73: `const platformBackup = isTenantBypassed();`.
- Line 74: `const backupData = {`.
- Line 83: `const collections = await db.listCollections().toArray();`.
- Line 84: `const collectionNames = collections.map((collection) => collection.name);`.
- Line 113: `export const listDatabaseBackups = async (req, res) => {`.
- Line 115: `const backups = await DatabaseBackup.find(backupFilter(req)).sort({ createdAt: -1 }).limit(10).lean();`.
- Line 123: `export const downloadDatabaseBackup = async (req, res) => {`.
- Line 125: `const backup = await DatabaseBackup.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 127: `const filepath = path.join(BACKUP_DIR, backup.file);`.
- Line 136: `export const deleteDatabaseBackup = async (req, res) => {`.
- Line 138: `const backup = await DatabaseBackup.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 140: `const filepath = path.join(BACKUP_DIR, backup.file);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
