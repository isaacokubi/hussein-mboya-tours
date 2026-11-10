# Source explanation: server/controllers/travelLifecycleController.js

**Source:** [server/controllers/travelLifecycleController.js](../../../server/controllers/travelLifecycleController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `OperationalAsset` from `../models/OperationalAsset.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/OperationalAsset.js](../../../server/models/OperationalAsset.js)
- `TravelCommercialRule` from `../models/TravelCommercialRule.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TravelCommercialRule.js](../../../server/models/TravelCommercialRule.js)
- `LoyaltyAccount` from `../models/LoyaltyAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/LoyaltyAccount.js](../../../server/models/LoyaltyAccount.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `tokenHash` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `issueVoucher` — lines 9–15

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body. Persistent operations detected: OperationalAsset.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 10:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 11:** `const raw = crypto.randomBytes(24).toString("hex");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 13:** Sensitive-configuration/data operation; inspect source without copying secret values. — Builds an HTTP response with an explicit status and JSON payload.

### `redeemVoucher` — lines 17–31

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: OperationalAsset.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 19:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `if (!voucher) return res.status(404).json({ success: false, message: "Voucher is invalid, expired, or already redeemed." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (voucher.metadata?.expiresAt && new Date(voucher.metadata.expiresAt) < new Date()) return res.status(410).json({ success: false, message: "Voucher has expired." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `if (Number(voucher.metadata?.redeemedCount || 0) >= Number(voucher.metadata?.redemptionLimit || 1)) return res.status(409).json({ success: false, message: "Voucher redemption limit reached." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `await voucher.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `res.json({ success: true, data: voucher });` — Sends a JSON response; inspect its caller for status and error semantics.

### `calculateDynamicPrice` — lines 33–71

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Tour.findOne, TravelCommercialRule.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 35:** `const requestedTourId = req.body.tourId || req.body.tour || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const requestedDate = req.body.travelDate || req.body.date || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const guests = Number(req.body.guests ?? req.body.numberOfGuests ?? 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `let basePrice = Number(req.body.basePrice);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `if (requestedTourId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `const tour = await Tour.findOne({ _id: requestedTourId, status: { $in: ["scheduled", "upcoming", "ongoing"] }, published: true, available: true, isDeleted: false }).select("price discount discountPrice").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found or not available." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `if (!Number.isFinite(basePrice)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `const listedPrice = Number(tour.discountPrice ?? tour.price);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const discount = Number(tour.discount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `if (!Number.isFinite(basePrice) || basePrice < 0) return res.status(400).json({ success: false, message: "basePrice must be a non-negative number." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (!Number.isInteger(guests) || guests <= 0 || guests > 100) return res.status(400).json({ success: false, message: "guests must be a positive integer between 1 and 100." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `if (requestedDate && Number.isNaN(new Date(requestedDate).getTime())) return res.status(400).json({ success: false, message: "travelDate must be a valid date." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `const rules = await TravelCommercialRule.find({ tenantId: req.user.tenantId, type: "dynamic_price", active: true }).sort({ priority: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 55:** `let price = basePrice;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `let appliedRules = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `for (const rule of rules) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `loyaltyBalance` — lines 73–79

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: LoyaltyAccount.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 74:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 75:** `const customerId = req.params.customerId || req.user._id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const account = await LoyaltyAccount.findOne({ tenantId: req.user.tenantId, customerId }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 77:** `res.json({ success: true, data: account || { points: 0, lifetimeEarned: 0, lifetimeRedeemed: 0 } });` — Sends a JSON response; inspect its caller for status and error semantics.

### `earnLoyalty` — lines 81–91

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: LoyaltyAccount.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 82:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 83:** `const points = Number(req.body.points);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `if (!Number.isInteger(points) || points <= 0 || points > 1000000) return res.status(400).json({ success: false, message: "points must be a positive integer." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `const customerId = req.body.customerId || req.user._id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `const existing = await LoyaltyAccount.findOne({ tenantId: req.user.tenantId, customerId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 87:** `const referralCode = existing?.referralCode || \`REF-${crypto.randomBytes(5).toString("hex").toUpperCase()}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const account = await LoyaltyAccount.findOneAndUpdate({ tenantId: req.user.tenantId, customerId }, { $setOnInsert: { referralCode }, $inc: { points, lifetimeEarned: points } }, { upsert: true, new: true, setDefaultsOnIns` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `res.json({ success: true, data: account });` — Sends a JSON response; inspect its caller for status and error semantics.

### `redeemLoyalty` — lines 93–102

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 94:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 95:** `const points = Number(req.body.points);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 96:** `if (!Number.isInteger(points) || points <= 0) return res.status(400).json({ success: false, message: "points must be a positive integer." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `const customerId = req.body.customerId || req.user._id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 98:** `const account = await LoyaltyAccount.findOneAndUpdate({ tenantId: req.user.tenantId, customerId, points: { $gte: points } }, { $inc: { points: -points, lifetimeRedeemed: points } }, { new: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 99:** `if (!account) return res.status(409).json({ success: false, message: "Insufficient loyalty points." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 100:** `res.json({ success: true, data: account });` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 7: `<sensitive declaration redacted>`.
- Line 9: `export const issueVoucher = async (req, res, next) => {`.
- Line 11: `const raw = crypto.randomBytes(24).toString("hex");`.
- Line 12: `<sensitive declaration redacted>`.
- Line 17: `export const redeemVoucher = async (req, res, next) => {`.
- Line 19: `<sensitive declaration redacted>`.
- Line 20: `<sensitive declaration redacted>`.
- Line 33: `export const calculateDynamicPrice = async (req, res, next) => {`.
- Line 35: `const requestedTourId = req.body.tourId || req.body.tour || null;`.
- Line 36: `const requestedDate = req.body.travelDate || req.body.date || null;`.
- Line 37: `const guests = Number(req.body.guests ?? req.body.numberOfGuests ?? 1);`.
- Line 38: `let basePrice = Number(req.body.basePrice);`.
- Line 41: `const tour = await Tour.findOne({ _id: requestedTourId, status: { $in: ["scheduled", "upcoming", "ongoing"] }, published: true, available: true, isDeleted: false }).select("price d`.
- Line 44: `const listedPrice = Number(tour.discountPrice ?? tour.price);`.
- Line 45: `const discount = Number(tour.discount || 0);`.
- Line 54: `const rules = await TravelCommercialRule.find({ tenantId: req.user.tenantId, type: "dynamic_price", active: true }).sort({ priority: -1 }).lean();`.
- Line 55: `let price = basePrice;`.
- Line 56: `let appliedRules = 0;`.
- Line 58: `const c = rule.conditions || {};`.
- Line 63: `const a = rule.actions || rule.action || {};`.
- Line 73: `export const loyaltyBalance = async (req, res, next) => {`.
- Line 75: `const customerId = req.params.customerId || req.user._id;`.
- Line 76: `const account = await LoyaltyAccount.findOne({ tenantId: req.user.tenantId, customerId }).lean();`.
- Line 81: `export const earnLoyalty = async (req, res, next) => {`.
- Line 83: `const points = Number(req.body.points);`.
- Line 85: `const customerId = req.body.customerId || req.user._id;`.
- Line 86: `const existing = await LoyaltyAccount.findOne({ tenantId: req.user.tenantId, customerId });`.
- Line 87: `const referralCode = existing?.referralCode || \`REF-${crypto.randomBytes(5).toString("hex").toUpperCase()}\`;`.
- Line 88: `const account = await LoyaltyAccount.findOneAndUpdate({ tenantId: req.user.tenantId, customerId }, { $setOnInsert: { referralCode }, $inc: { points, lifetimeEarned: points } }, { u`.
- Line 93: `export const redeemLoyalty = async (req, res, next) => {`.
- Line 95: `const points = Number(req.body.points);`.
- Line 97: `const customerId = req.body.customerId || req.user._id;`.
- Line 98: `const account = await LoyaltyAccount.findOneAndUpdate({ tenantId: req.user.tenantId, customerId, points: { $gte: points } }, { $inc: { points: -points, lifetimeRedeemed: points } }`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
