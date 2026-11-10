# Source explanation: server/controllers/adminReviewController.js

**Source:** [server/controllers/adminReviewController.js](../../../server/controllers/adminReviewController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `recalculateTourRating` — lines 5–23

Parameters: `tourId`.
Persistent operations detected: Review.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 6:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `const reviews = await Review.find({ tenantId, tour: tourId, approved: true, isDeleted: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 8:** `const count = reviews.length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const average = count ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count : 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `await Tour.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getAdminReviews` — lines 25–41

Parameters: `req`, `res`, `next`.
Persistent operations detected: Review.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 26:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 27:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const reviews = await Review.find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 37:** `return res.json({ success: true, count: reviews.length, reviews });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 39:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `approveAdminReview` — lines 43–56

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Review.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 44:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 45:** `const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `if (!review) return res.status(404).json({ success: false, message: "Review not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `await review.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 51:** `await recalculateTourRating(review.tour);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `return res.json({ success: true, review });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 54:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `rejectAdminReview` — lines 58–71

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Review.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 59:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 60:** `const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `if (!review) return res.status(404).json({ success: false, message: "Review not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `await review.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 66:** `await recalculateTourRating(review.tour);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 67:** `return res.json({ success: true, review });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 69:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteAdminReview` — lines 73–85

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Review.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 74:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 75:** `const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 76:** `if (!review) return res.status(404).json({ success: false, message: "Review not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `const tourId = review.tour;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `await review.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 80:** `await recalculateTourRating(tourId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 81:** `return res.json({ success: true, message: "Review deleted" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 83:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const recalculateTourRating = async (tourId) => {`.
- Line 6: `const tenantId = requireTenantId();`.
- Line 7: `const reviews = await Review.find({ tenantId, tour: tourId, approved: true, isDeleted: false });`.
- Line 8: `const count = reviews.length;`.
- Line 9: `const average = count ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count : 0;`.
- Line 25: `export const getAdminReviews = async (req, res, next) => {`.
- Line 27: `const tenantId = requireTenantId();`.
- Line 28: `const reviews = await Review.find(`.
- Line 43: `export const approveAdminReview = async (req, res, next) => {`.
- Line 45: `const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));`.
- Line 58: `export const rejectAdminReview = async (req, res, next) => {`.
- Line 60: `const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));`.
- Line 73: `export const deleteAdminReview = async (req, res, next) => {`.
- Line 75: `const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));`.
- Line 77: `const tourId = review.tour;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
