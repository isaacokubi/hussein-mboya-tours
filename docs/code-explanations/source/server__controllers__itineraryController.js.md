# Source explanation: server/controllers/itineraryController.js

**Source:** [server/controllers/itineraryController.js](../../../server/controllers/itineraryController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Itinerary` from `../models/Itinerary.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Itinerary.js](../../../server/models/Itinerary.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `activeFilter` — lines 7–7

Parameters: `req`, `extra (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `createItinerary` — lines 9–34

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Tour.findOne, Itinerary.findOne, Itinerary.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `const { tour } = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (!tour || !mongoose.Types.ObjectId.isValid(tour)) return res.status(400).json({ success: false, message: "A valid tour is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `const existingTour = await Tour.findOne(mergeTenantFilter(req, { _id: tour, isDeleted: { $ne: true } })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `if (!existingTour) return res.status(404).json({ success: false, message: "Tour not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const existingItinerary = await Itinerary.findOne(activeFilter(req, { tour })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `if (existingItinerary) return res.status(409).json({ success: false, message: "This tour already has an active itinerary. Edit the existing itinerary instead." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const itinerary = await Itinerary.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `const populated = await Itinerary.findOne(activeFilter(req, { _id: itinerary._id }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `return res.status(201).json({ success: true, message: "Itinerary created successfully", itinerary: populated, data: populated });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 31:** `if (error?.code === 11000) return res.status(409).json({ success: false, message: "This tour already has an itinerary. Edit the existing itinerary instead." });` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `getItineraries` — lines 36–48

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Itinerary.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 37:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 38:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `if (req.query.tour) filter.tour = req.query.tour;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `if (req.query.status && ["draft", "published", "archived"].includes(req.query.status)) filter.status = req.query.status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `const itineraries = await Itinerary.find(filter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `return res.status(200).json({ success: true, count: itineraries.length, itineraries, data: itineraries });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getItinerary` — lines 50–59

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Itinerary.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 51:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 52:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid itinerary id." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `const itinerary = await Itinerary.findOne(activeFilter(req, { _id: req.params.id }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `return res.status(200).json({ success: true, itinerary, data: itinerary });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateItinerary` — lines 61–83

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: Tour.findOne, Itinerary.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 62:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 63:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid itinerary id." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `if (req.body?.tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `if (!mongoose.Types.ObjectId.isValid(req.body.tour)) return res.status(400).json({ success: false, message: "A valid tour is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.body.tour, isDeleted: { $ne: true } })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 67:** `if (!tour) return res.status(400).json({ success: false, message: "Selected tour does not belong to this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `const duplicate = await Itinerary.findOne(activeFilter(req, { tour, _id: { $ne: req.params.id } })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `if (duplicate) return res.status(409).json({ success: false, message: "The selected tour already has another active itinerary." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `const update = { ...req.body, updatedBy: req.user?._id };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `const itinerary = await Itinerary.findOneAndUpdate(activeFilter(req, { _id: req.params.id }), update, { new: true, runValidators: true })` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 77:** `if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `return res.status(200).json({ success: true, message: "Itinerary updated successfully", itinerary, data: itinerary });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 80:** `if (error?.code === 11000) return res.status(409).json({ success: false, message: "This tour already has an active itinerary." });` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `deleteItinerary` — lines 85–96

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 86:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 87:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid itinerary id." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `const itinerary = await Itinerary.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 93:** `if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 94:** `return res.status(200).json({ success: true, message: "Itinerary deleted successfully" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const activeFilter = (req, extra = {}) => mergeTenantFilter(req, { isDeleted: { $ne: true }, ...extra });`.
- Line 9: `export const createItinerary = async (req, res, next) => {`.
- Line 12: `const { tour } = req.body || {};`.
- Line 14: `const existingTour = await Tour.findOne(mergeTenantFilter(req, { _id: tour, isDeleted: { $ne: true } })).lean();`.
- Line 17: `const existingItinerary = await Itinerary.findOne(activeFilter(req, { tour })).lean();`.
- Line 20: `const itinerary = await Itinerary.create({`.
- Line 26: `const populated = await Itinerary.findOne(activeFilter(req, { _id: itinerary._id }))`.
- Line 36: `export const getItineraries = async (req, res, next) => {`.
- Line 38: `const filter = tenantFilter(req);`.
- Line 42: `const itineraries = await Itinerary.find(filter)`.
- Line 50: `export const getItinerary = async (req, res, next) => {`.
- Line 53: `const itinerary = await Itinerary.findOne(activeFilter(req, { _id: req.params.id }))`.
- Line 61: `export const updateItinerary = async (req, res, next) => {`.
- Line 66: `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.body.tour, isDeleted: { $ne: true } })).lean();`.
- Line 68: `const duplicate = await Itinerary.findOne(activeFilter(req, { tour, _id: { $ne: req.params.id } })).lean();`.
- Line 71: `const update = { ...req.body, updatedBy: req.user?._id };`.
- Line 74: `const itinerary = await Itinerary.findOneAndUpdate(activeFilter(req, { _id: req.params.id }), update, { new: true, runValidators: true })`.
- Line 85: `export const deleteItinerary = async (req, res, next) => {`.
- Line 88: `const itinerary = await Itinerary.findOneAndUpdate(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
