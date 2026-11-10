# Source explanation: server/middleware/uploadMiddleware.js

**Source:** [server/middleware/uploadMiddleware.js](../../../server/middleware/uploadMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `multer` from `multer`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CloudinaryStorage` from `multer-storage-cloudinary`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `cloudinary`, `isCloudinaryConfigured` from `../config/cloudinary.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/cloudinary.js](../../../server/config/cloudinary.js)

## Runtime declarations and data flow

### `fileFilter` — lines 60–77

Parameters: `req`, `file`, `cb`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 61:** `const originalName = String(file.originalname || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const extension = path.extname(originalName).toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const expectedMime = allowedFileTypes.get(extension);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `if (!expectedMime || expectedMime !== String(file.mimetype || "").toLowerCase()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `return cb(` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 72:** `if (/[\u0000-\u001f\u007f]/.test(originalName) || originalName.length > 180) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `return cb(new Error("The uploaded filename is invalid."), false);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 76:** `return cb(null, true);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `unavailableFileFilter` — lines 79–87

Parameters: `req`, `file`, `cb`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 81:** `if (error || !accepted) return cb(error, accepted);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `const unavailable = new Error("File uploads are unavailable because Cloudinary is not configured.");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `return cb(unavailable);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `cloudinaryUnavailable` — lines 112–115

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 112:** `(req, res) => res.status(503).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `createUploadMiddleware` — lines 117–130

Parameters: `method`, `...args`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 118:** `if (isCloudinaryConfigured) return upload[method](...args);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 120:** `const fieldsParser = multer({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `return (req, res, next) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 127:** `if (!req.is("multipart/form-data")) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 128:** `return fieldsParser(req, res, next);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `uploadSingle` — lines 138–139

Parameters: `field (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `uploadMultiple` — lines 141–142

Parameters: `field (defaulted)`, `max (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `uploadFields` — lines 144–145

Parameters: `fields`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 14: `const storage = isCloudinaryConfigured ? new CloudinaryStorage({`.
- Line 18: `const isImage = file.mimetype.startsWith("image/");`.
- Line 52: `const allowedFileTypes = new Map([`.
- Line 60: `const fileFilter = (req, file, cb) => {`.
- Line 61: `const originalName = String(file.originalname || "");`.
- Line 62: `const extension = path.extname(originalName).toLowerCase();`.
- Line 63: `const expectedMime = allowedFileTypes.get(extension);`.
- Line 79: `const unavailableFileFilter = (req, file, cb) => {`.
- Line 82: `const unavailable = new Error("File uploads are unavailable because Cloudinary is not configured.");`.
- Line 89: `const uploadLimits = {`.
- Line 104: `const upload = isCloudinaryConfigured ? multer({`.
- Line 112: `const cloudinaryUnavailable = (req, res) => res.status(503).json({`.
- Line 117: `const createUploadMiddleware = (method, ...args) => {`.
- Line 120: `const fieldsParser = multer({`.
- Line 138: `export const uploadSingle = (field = "image") =>`.
- Line 141: `export const uploadMultiple = (field = "images", max = 10) =>`.
- Line 144: `export const uploadFields = (fields) =>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
