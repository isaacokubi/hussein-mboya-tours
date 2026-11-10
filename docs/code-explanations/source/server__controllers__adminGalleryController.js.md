# Source explanation: server/controllers/adminGalleryController.js

**Source:** [server/controllers/adminGalleryController.js](../../../server/controllers/adminGalleryController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Gallery` from `../models/Gallery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Gallery.js](../../../server/models/Gallery.js)

## Runtime declarations and data flow

### `getAdminGallery` — lines 5–13

Parameters: `req`, `res`, `next`.
Persistent operations detected: Gallery.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 6:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 8:** `const gallery = await Gallery.find(tenantFilter(req)).sort({ createdAt: -1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 9:** `res.json({ success: true, count: gallery.length, gallery });` — Sends a JSON response; inspect its caller for status and error semantics.

### `uploadGalleryImage` — lines 15–22

Parameters: `req`, `res`, `next`.
Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 17:** `if (!req.file) return res.status(400).json({ success: false, message: "Please upload an image" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `res.json({ success: true, image: { url: req.file.path, publicId: req.file.filename } });` — Sends a JSON response; inspect its caller for status and error semantics.

### `createAdminGallery` — lines 24–43

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: Gallery.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 26:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const { title, category, featured, active, imageUrl, publicId } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `if (!title?.trim()) return res.status(400).json({ success: false, message: "Title is required" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `if (!imageUrl?.trim()) return res.status(400).json({ success: false, message: "Image URL is required" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `const item = await Gallery.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `res.status(201).json({ success: true, gallery: item });` — Builds an HTTP response with an explicit status and JSON payload.

### `updateAdminGallery` — lines 45–67

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 46:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 48:** `const { title, category, featured, active, imageUrl, publicId } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const update = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `if (imageUrl) update.image = { url: String(imageUrl).trim(), publicId: publicId || "" };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `const item = await Gallery.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `res.json({ success: true, gallery: item });` — Sends a JSON response; inspect its caller for status and error semantics.

### `deleteAdminGallery` — lines 69–78

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 70:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 72:** `const item = await Gallery.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 73:** `if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `res.json({ success: true, message: "Gallery item deleted" });` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 5: `export const getAdminGallery = async (req, res, next) => {`.
- Line 8: `const gallery = await Gallery.find(tenantFilter(req)).sort({ createdAt: -1 });`.
- Line 15: `export const uploadGalleryImage = async (req, res, next) => {`.
- Line 24: `export const createAdminGallery = async (req, res, next) => {`.
- Line 26: `const tenantId = requireTenantId();`.
- Line 27: `const { title, category, featured, active, imageUrl, publicId } = req.body;`.
- Line 31: `const item = await Gallery.create({`.
- Line 45: `export const updateAdminGallery = async (req, res, next) => {`.
- Line 48: `const { title, category, featured, active, imageUrl, publicId } = req.body;`.
- Line 49: `const update = {`.
- Line 57: `const item = await Gallery.findOneAndUpdate(`.
- Line 69: `export const deleteAdminGallery = async (req, res, next) => {`.
- Line 72: `const item = await Gallery.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
