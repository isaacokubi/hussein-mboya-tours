# Source explanation: server/controllers/agentTourController.js

**Source:** [server/controllers/agentTourController.js](../../../server/controllers/agentTourController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `slugify` from `slugify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)

## Runtime declarations and data flow

### `isValidId` — lines 7–7

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `cleanString` — lines 8–8

Parameters: `value (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `buildImages` — lines 9–9

Parameters: `files (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `scope` — lines 11–11

Parameters: `req`, `filter (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getAgentProfile` — lines 13–16

Parameters: `req`.
Reads request/component inputs: req.user. Persistent operations detected: Agent.findOne; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 15:** `return Agent.findOne(scope(req, { user: req.user._id }));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createAgentTour` — lines 18–50

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body, req.tenantId. Persistent operations detected: Tour.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 21:** `if (!req.user || !isValidId(req.user._id)) return res.status(401).json({ success: false, message: "Unauthorized." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const agentProfile = await getAgentProfile(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `if (!agentProfile) return res.status(404).json({ success: false, message: "Agent profile not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (!agentProfile.isApproved || agentProfile.status !== "active") return res.status(403).json({ success: false, message: "Agent account is not approved or active." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `if (!req.body.title) return res.status(400).json({ success: false, message: "Tour title is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (!req.body.destination) return res.status(400).json({ success: false, message: "Destination is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `if (req.body.price === undefined && req.body.agentPrice === undefined) return res.status(400).json({ success: false, message: "Tour price is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `const title = cleanString(req.body.title);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const slug = slugify(title, { lower: true, strict: true });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const exists = await Tour.exists(scope(req, { slug, isDeleted: false }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `if (exists) return res.status(409).json({ success: false, message: "A tour with this title already exists." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const tourData = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `for (const field of allowedFields) if (req.body[field] !== undefined) tourData[field] = req.body[field];` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 38:** `if (tourData.price === undefined && tourData.agentPrice !== undefined) tourData.price = Number(tourData.agentPrice);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `if (tourData.agentPrice === undefined && tourData.price !== undefined) tourData.agentPrice = Number(tourData.price);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `if (req.files?.length) tourData.images = buildImages(req.files);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (!tourData.status) tourData.status = "draft";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getAgentTours` — lines 52–61

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.query. Persistent operations detected: Tour.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 54:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 55:** `if (!req.user || !isValidId(req.user._id)) return res.status(401).json({ success: false, message: "Unauthorized." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `const filter = scope(req, { createdBy: req.user._id, isDeleted: false });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `if (req.query.status) filter.status = req.query.status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `const tours = await Tour.find(filter).sort({ createdAt: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 59:** `return res.status(200).json({ success: true, count: tours.length, tours });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAgentTour` — lines 63–71

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 66:** `if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 67:** `const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 68:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `return res.status(200).json({ success: true, tour });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateAgentTour` — lines 73–96

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user, req.body. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 75:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 76:** `if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 80:** `for (const field of allowedFields) if (req.body[field] !== undefined) tour[field] = req.body[field];` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 81:** `if (req.body.title) tour.title = cleanString(req.body.title);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `if (req.body.title && tour.isModified("title")) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `const baseSlug = slugify(tour.title, { lower: true, strict: true });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `let slug = baseSlug;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `let counter = 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `while (await Tour.exists(scope(req, { _id: { $ne: tour._id }, slug, isDeleted: false }))) slug = \`${baseSlug}-${++counter}\`;` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 89:** `if (req.body.price !== undefined) tour.price = Number(req.body.price);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `if (req.body.agentPrice !== undefined) tour.agentPrice = Number(req.body.agentPrice);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 91:** `if (req.files?.length) tour.images = buildImages(req.files);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `await tour.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 94:** `return res.status(200).json({ success: true, message: "Tour updated successfully.", tour });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteAgentTour` — lines 98–110

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 100:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 101:** `if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 102:** `const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 103:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 107:** `await tour.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 108:** `return res.status(200).json({ success: true, message: "Tour deleted successfully." });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);`.
- Line 8: `const cleanString = (value = "") => String(value).trim().replace(/\s+/g, " ");`.
- Line 9: `const buildImages = (files = []) => files.map((file) => ({ url: file.path, publicId: file.filename || "" }));`.
- Line 10: `const allowedFields = ["title", "description", "shortDescription", "destination", "country", "location", "category", "duration", "difficulty", "capacity", "maxGuests", "price", "ag`.
- Line 11: `const scope = (req, filter = {}) => mergeTenantFilter(req, filter);`.
- Line 13: `const getAgentProfile = async (req) => {`.
- Line 18: `export const createAgentTour = async (req, res, next) => {`.
- Line 22: `const agentProfile = await getAgentProfile(req);`.
- Line 29: `const title = cleanString(req.body.title);`.
- Line 30: `const slug = slugify(title, { lower: true, strict: true });`.
- Line 31: `const exists = await Tour.exists(scope(req, { slug, isDeleted: false }));`.
- Line 34: `const tourData = {};`.
- Line 47: `const tour = await Tour.create(tourData);`.
- Line 52: `export const getAgentTours = async (req, res, next) => {`.
- Line 56: `const filter = scope(req, { createdBy: req.user._id, isDeleted: false });`.
- Line 58: `const tours = await Tour.find(filter).sort({ createdAt: -1 }).lean();`.
- Line 63: `export const getAgentTour = async (req, res, next) => {`.
- Line 67: `const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));`.
- Line 73: `export const updateAgentTour = async (req, res, next) => {`.
- Line 77: `const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));`.
- Line 83: `const baseSlug = slugify(tour.title, { lower: true, strict: true });`.
- Line 84: `let slug = baseSlug;`.
- Line 85: `let counter = 1;`.
- Line 98: `export const deleteAgentTour = async (req, res, next) => {`.
- Line 102: `const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
