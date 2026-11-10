# Source explanation: server/controllers/adminDestinationController.js

**Source:** [server/controllers/adminDestinationController.js](../../../server/controllers/adminDestinationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `cloudinary`, `isCloudinaryConfigured` from `../config/cloudinary.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/cloudinary.js](../../../server/config/cloudinary.js)

## Runtime declarations and data flow

### `escapeRegex` — lines 7–7

Parameters: `value (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `createDestination` — lines 9–61

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: Destination.findOne, Destination.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 11:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const { name, slug, description, country, city, featured, seo } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (!name?.trim() || !slug?.trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `return res.status(400).json({ success: false, message: "Name and slug are required." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 18:** `const normalizedSlug = slug.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const escapedName = escapeRegex(name.trim());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const exists = await Destination.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `if (exists) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `return res.status(409).json({ success: false, message: "Destination already exists in this tenant." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 33:** `let parsedSeo = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `if (seo) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 38:** `return res.status(400).json({ success: false, message: "Invalid SEO data." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 42:** `const images = req.files?.map((file) => ({ url: file.path, publicId: file.filename })) || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const destination = await Destination.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 57:** `res.status(201).json({ success: true, message: "Destination created successfully.", destination });` — Builds an HTTP response with an explicit status and JSON payload.

### `getDestinations` — lines 63–91

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Destination.find, Destination.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 64:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 65:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `const page = Math.max(Number(req.query.page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `const limit = Math.min(Number(req.query.limit) || 20, 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `const skip = (page - 1) * limit;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const filter = { tenantId, isDeleted: { $ne: true }, status: "active", active: true };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `if (req.query.featured === "true") filter.featured = true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `if (req.query.country) filter.country = req.query.country;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `const [destinations, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 75:** `Destination.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 76:** `Destination.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 79:** `res.status(200).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `getDestination` — lines 93–109

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Destination.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 94:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 95:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 96:** `const destination = await Destination.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 104:** `if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `res.status(200).json({ success: true, destination });` — Builds an HTTP response with an explicit status and JSON payload.

### `getAdminDestinations` — lines 111–118

Parameters: `req`, `res`, `next`.
Persistent operations detected: Destination.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 112:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 113:** `const destinations = await Destination.find(tenantFilter(req)).sort({ createdAt: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 114:** `res.status(200).json({ success: true, count: destinations.length, destinations });` — Builds an HTTP response with an explicit status and JSON payload.

### `updateDestination` — lines 120–194

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Destination.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 14 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 121:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 122:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `return res.status(400).json({ success: false, message: "Invalid destination ID." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 128:** `const destination = await Destination.findOne({ _id: req.params.id, tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 129:** `if (!destination) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 130:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 137:** `if (req.body.name !== undefined) destination.name = String(req.body.name).trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 139:** `if (req.body.slug !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 140:** `const normalizedSlug = String(req.body.slug).trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 141:** `if (!normalizedSlug) return res.status(400).json({ success: false, message: "Slug cannot be empty." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 143:** `const duplicate = await Destination.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 150:** `if (duplicate) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 151:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 160:** `if (req.body.description !== undefined) destination.description = req.body.description;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 161:** `if (req.body.country !== undefined) destination.country = req.body.country;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 162:** `if (req.body.city !== undefined) destination.city = req.body.city;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 163:** `if (req.body.featured !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `deleteDestination` — lines 196–222

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Destination.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 197:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 198:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 199:** `return res.status(400).json({ success: false, message: "Invalid destination ID." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 202:** `const destination = await Destination.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 203:** `if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 205:** `const imagePublicIds = (destination.images || []).map((image) => image.publicId).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 206:** `if (imagePublicIds.length && !isCloudinaryConfigured) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 207:** `return res.status(503).json({ success: false, message: "Destination images cannot be deleted because Cloudinary is not configured." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 209:** `await Promise.all(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 217:** `await destination.deleteOne();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 218:** `res.status(200).json({ success: true, message: "Destination deleted successfully." });` — Builds an HTTP response with an explicit status and JSON payload.

### `getDestinationById` — lines 224–245

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Destination.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 225:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 226:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 228:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 229:** `return res.status(400).json({ success: false, message: "Invalid destination ID." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 232:** `const destination = await Destination.findOne({ _id: req.params.id, tenantId }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 233:** `if (!destination) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 234:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 241:** `res.json({ success: true, data: destination, destination });` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 7: `const escapeRegex = (value = "") => value.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&");`.
- Line 9: `export const createDestination = async (req, res, next) => {`.
- Line 11: `const tenantId = requireTenantId();`.
- Line 12: `const { name, slug, description, country, city, featured, seo } = req.body;`.
- Line 18: `const normalizedSlug = slug.trim().toLowerCase();`.
- Line 19: `const escapedName = escapeRegex(name.trim());`.
- Line 20: `const exists = await Destination.findOne({`.
- Line 33: `let parsedSeo = {};`.
- Line 42: `const images = req.files?.map((file) => ({ url: file.path, publicId: file.filename })) || [];`.
- Line 44: `const destination = await Destination.create({`.
- Line 63: `export const getDestinations = async (req, res, next) => {`.
- Line 65: `const tenantId = requireTenantId();`.
- Line 66: `const page = Math.max(Number(req.query.page) || 1, 1);`.
- Line 67: `const limit = Math.min(Number(req.query.limit) || 20, 100);`.
- Line 68: `const skip = (page - 1) * limit;`.
- Line 69: `const filter = { tenantId, isDeleted: { $ne: true }, status: "active", active: true };`.
- Line 74: `const [destinations, total] = await Promise.all([`.
- Line 93: `export const getDestination = async (req, res, next) => {`.
- Line 95: `const tenantId = requireTenantId();`.
- Line 96: `const destination = await Destination.findOne({`.
- Line 111: `export const getAdminDestinations = async (req, res, next) => {`.
- Line 113: `const destinations = await Destination.find(tenantFilter(req)).sort({ createdAt: -1 }).lean();`.
- Line 120: `export const updateDestination = async (req, res, next) => {`.
- Line 122: `const tenantId = requireTenantId();`.
- Line 128: `const destination = await Destination.findOne({ _id: req.params.id, tenantId });`.
- Line 140: `const normalizedSlug = String(req.body.slug).trim().toLowerCase();`.
- Line 143: `const duplicate = await Destination.findOne({`.
- Line 168: `const status = String(req.body.status).toLowerCase();`.
- Line 196: `export const deleteDestination = async (req, res, next) => {`.
- Line 202: `const destination = await Destination.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 205: `const imagePublicIds = (destination.images || []).map((image) => image.publicId).filter(Boolean);`.
- Line 224: `export const getDestinationById = async (req, res, next) => {`.
- Line 226: `const tenantId = requireTenantId();`.
- Line 232: `const destination = await Destination.findOne({ _id: req.params.id, tenantId }).lean();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
