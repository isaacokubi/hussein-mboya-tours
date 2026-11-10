# Source explanation: server/controllers/reviewController.js

**Source:** [server/controllers/reviewController.js](../../../server/controllers/reviewController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `updateTourRating` — lines 6–16

Parameters: `tourId`.
Persistent operations detected: Review.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 7:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const reviews = await Review.find({ tenantId, tour: tourId, approved: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 9:** `const totalReviews = reviews.length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `await Tour.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createReview` — lines 18–53

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user, req.tenantId. Persistent operations detected: Booking.findOne, Review.findOne, Review.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 21:** `const { tour: requestedTour, tourId, rating, title, comment } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const tour = requestedTour || tourId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (!tour || !rating || !comment) return res.status(400).json({ success: false, message: "Tour, rating and comment are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const booking = await Booking.findOne(mergeTenantFilter({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `if (!booking) return res.status(400).json({ success: false, message: "Only completed tours can be reviewed." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `const existingReview = await Review.findOne(mergeTenantFilter({ user: req.user._id, tour }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 37:** `if (existingReview) return res.status(409).json({ success: false, message: "You have already reviewed this tour." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `const review = await Review.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 51:** `return res.status(201).json({ success: true, message: "Review submitted successfully and is awaiting approval.", review });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourReviews` — lines 55–63

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Review.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 57:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 58:** `const reviews = await Review.find(mergeTenantFilter({ tour: req.params.id, approved: true, isDeleted: false }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `return res.status(200).json({ success: true, count: reviews.length, reviews });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `approveReview` — lines 65–75

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Review.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 67:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 68:** `const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `if (!review) return res.status(404).json({ success: false, message: "Review not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `await review.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `await updateTourRating(review.tour);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 73:** `return res.status(200).json({ success: true, message: "Review approved successfully.", review });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `voteHelpful` — lines 77–86

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Review.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 79:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 80:** `const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 81:** `if (!review) return res.status(404).json({ success: false, message: "Review not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `await review.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 84:** `return res.status(200).json({ success: true, helpfulVotes: review.helpfulVotes });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteReview` — lines 88–98

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Review.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 90:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 91:** `const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 92:** `if (!review) return res.status(404).json({ success: false, message: "Review not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `const tourId = review.tour;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `await review.deleteOne();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 95:** `await updateTourRating(tourId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 96:** `return res.status(200).json({ success: true, message: "Review deleted successfully." });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const updateTourRating = async (tourId) => {`.
- Line 7: `const tenantId = requireTenantId();`.
- Line 8: `const reviews = await Review.find({ tenantId, tour: tourId, approved: true });`.
- Line 9: `const totalReviews = reviews.length;`.
- Line 10: `const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;`.
- Line 18: `export const createReview = async (req, res, next) => {`.
- Line 21: `const { tour: requestedTour, tourId, rating, title, comment } = req.body;`.
- Line 22: `const tour = requestedTour || tourId;`.
- Line 25: `const booking = await Booking.findOne(mergeTenantFilter({`.
- Line 36: `const existingReview = await Review.findOne(mergeTenantFilter({ user: req.user._id, tour }));`.
- Line 39: `const review = await Review.create({`.
- Line 55: `export const getTourReviews = async (req, res, next) => {`.
- Line 58: `const reviews = await Review.find(mergeTenantFilter({ tour: req.params.id, approved: true, isDeleted: false }))`.
- Line 65: `export const approveReview = async (req, res, next) => {`.
- Line 68: `const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 77: `export const voteHelpful = async (req, res, next) => {`.
- Line 80: `const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 88: `export const deleteReview = async (req, res, next) => {`.
- Line 91: `const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 93: `const tourId = review.tour;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
