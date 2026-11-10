# Source explanation: server/controllers/superAdminBackupController.js

**Source:** [server/controllers/superAdminBackupController.js](../../../server/controllers/superAdminBackupController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `fs` from `fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `DatabaseBackup` from `../models/DatabaseBackup.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/DatabaseBackup.js](../../../server/models/DatabaseBackup.js)
- `createAuditLog` from `../services/auditService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/auditService.js](../../../server/services/auditService.js)

## Runtime declarations and data flow

### `serializeBackup` — lines 11–14

Parameters: `backup`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `if (!backup) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `return typeof backup.toObject === "function" ? backup.toObject() : backup;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createPlatformDatabaseBackup` — lines 16–81

Parameters: `req`, `res`.
Reads request/component inputs: req.user. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 18:** `if (!mongoose.connection.db) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `return res.status(503).json({ success: false, message: "Database connection unavailable" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 24:** `const filename = \`database-backup-${Date.now()}.json\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const filepath = path.join(BACKUP_DIR, filename);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const collections = await mongoose.connection.db.listCollections().toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `const backupData = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `for (const collection of collections) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 39:** `.find({})` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 44:** `const fileSize = \`${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const result = await DatabaseBackup.collection.insertOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `const backup = await DatabaseBackup.collection.findOne({ _id: result.insertedId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `await createAuditLog({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 71:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 79:** `return res.status(500).json({ success: false, message: publicErrorMessage(error) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `listPlatformDatabaseBackups` — lines 83–101

Parameters: `req`, `res`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 84:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 85:** `const backups = await DatabaseBackup.collection` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 86:** `.find(PLATFORM_BACKUP_FILTER)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 91:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 99:** `return res.status(500).json({ success: false, message: "Unable to read platform backup records" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `downloadPlatformDatabaseBackup` — lines 103–124

Parameters: `req`, `res`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 104:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 105:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 106:** `return res.status(400).json({ success: false, message: "Invalid backup identifier" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 109:** `const backup = await DatabaseBackup.collection.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 114:** `if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 116:** `const filepath = path.join(BACKUP_DIR, path.basename(backup.file));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 117:** `if (!fs.existsSync(filepath)) return res.status(404).json({ success: false, message: "Backup file missing" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 119:** `return res.download(filepath, path.basename(backup.file));` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 122:** `return res.status(500).json({ success: false, message: "Unable to download the selected backup" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deletePlatformDatabaseBackup` — lines 126–161

Parameters: `req`, `res`.
Reads request/component inputs: req.params, req.user. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 127:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 128:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 129:** `return res.status(400).json({ success: false, message: "Invalid backup identifier" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 132:** `const backup = await DatabaseBackup.collection.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 137:** `if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 139:** `const filepath = path.join(BACKUP_DIR, path.basename(backup.file));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 140:** `if (fs.existsSync(filepath)) fs.rmSync(filepath, { force: true });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 142:** `await DatabaseBackup.collection.deleteOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 147:** `await createAuditLog({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 156:** `return res.json({ success: true, message: "Backup deleted successfully" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 159:** `return res.status(500).json({ success: false, message: "Unable to delete the selected backup" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `const BACKUP_DIR = path.join(process.cwd(), "server", "backups");`.
- Line 9: `const PLATFORM_BACKUP_FILTER = { tenantId: null };`.
- Line 11: `const serializeBackup = (backup) => {`.
- Line 16: `export const createPlatformDatabaseBackup = async (req, res) => {`.
- Line 24: `const filename = \`database-backup-${Date.now()}.json\`;`.
- Line 25: `const filepath = path.join(BACKUP_DIR, filename);`.
- Line 26: `const collections = await mongoose.connection.db.listCollections().toArray();`.
- Line 27: `const backupData = {`.
- Line 44: `const fileSize = \`${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB\`;`.
- Line 48: `const result = await DatabaseBackup.collection.insertOne({`.
- Line 60: `const backup = await DatabaseBackup.collection.findOne({ _id: result.insertedId });`.
- Line 83: `export const listPlatformDatabaseBackups = async (req, res) => {`.
- Line 85: `const backups = await DatabaseBackup.collection`.
- Line 103: `export const downloadPlatformDatabaseBackup = async (req, res) => {`.
- Line 109: `const backup = await DatabaseBackup.collection.findOne({`.
- Line 116: `const filepath = path.join(BACKUP_DIR, path.basename(backup.file));`.
- Line 126: `export const deletePlatformDatabaseBackup = async (req, res) => {`.
- Line 132: `const backup = await DatabaseBackup.collection.findOne({`.
- Line 139: `const filepath = path.join(BACKUP_DIR, path.basename(backup.file));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
