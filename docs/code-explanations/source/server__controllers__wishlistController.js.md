# Source explanation: server/controllers/wishlistController.js

**Source:** [server/controllers/wishlistController.js](../../../server/controllers/wishlistController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Wishlist` from `../models/Wishlist.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Wishlist.js](../../../server/models/Wishlist.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `wishlistFilter` — lines 6–6

Parameters: `req`, `extra (defaulted)`.
Reads request/component inputs: req.user.

Key statements:

### `getWishlist` — lines 9–18

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId, req.user. Persistent operations detected: Wishlist.findOne, Wishlist.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `let wishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 13:** `if (!wishlist) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `wishlist = await Wishlist.create({ tenantId: req.tenantId, user: req.user._id, tours: [] });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 16:** `return res.status(200).json({ success: true, count: wishlist.tours.length, wishlist: wishlist.tours });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `addWishlist` — lines 20–41

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId, req.user. Persistent operations detected: Tour.findOne, Wishlist.findOne, Wishlist.create, Wishlist.updateOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 23:** `const { tourId } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!tourId) return res.status(400).json({ success: false, message: "Tour ID is required" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `if (!mongoose.Types.ObjectId.isValid(tourId)) return res.status(400).json({ success: false, message: "Invalid tour ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: tourId, ...publicTourMatch }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `let wishlist = await Wishlist.findOne(wishlistFilter(req));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `if (!wishlist) wishlist = await Wishlist.create({ tenantId: req.tenantId, user: req.user._id, tours: [] });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `await Wishlist.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `const updatedWishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `return res.status(200).json({ success: true, message: "Tour added to wishlist", count: updatedWishlist.tours.length, wishlist: updatedWishlist.tours });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `removeWishlist` — lines 43–60

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Wishlist.findOne, Wishlist.updateOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 45:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 46:** `const { tourId } = req.params;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `if (!mongoose.Types.ObjectId.isValid(tourId)) return res.status(400).json({ success: false, message: "Invalid tour ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `const wishlist = await Wishlist.findOne(wishlistFilter(req));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 50:** `if (!wishlist) return res.status(404).json({ success: false, message: "Wishlist not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `await Wishlist.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 57:** `const updatedWishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 58:** `return res.status(200).json({ success: true, message: "Tour removed from wishlist", count: updatedWishlist.tours.length, wishlist: updatedWishlist.tours });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const wishlistFilter = (req, extra = {}) => mergeTenantFilter(req, { user: req.user._id, ...extra });`.
- Line 7: `const publicTourMatch = { isDeleted: false, published: true };`.
- Line 9: `export const getWishlist = async (req, res, next) => {`.
- Line 12: `let wishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });`.
- Line 20: `export const addWishlist = async (req, res, next) => {`.
- Line 23: `const { tourId } = req.body;`.
- Line 27: `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: tourId, ...publicTourMatch }));`.
- Line 30: `let wishlist = await Wishlist.findOne(wishlistFilter(req));`.
- Line 38: `const updatedWishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });`.
- Line 43: `export const removeWishlist = async (req, res, next) => {`.
- Line 46: `const { tourId } = req.params;`.
- Line 49: `const wishlist = await Wishlist.findOne(wishlistFilter(req));`.
- Line 57: `const updatedWishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
