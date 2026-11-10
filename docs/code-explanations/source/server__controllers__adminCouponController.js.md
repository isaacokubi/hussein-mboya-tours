# Source explanation: server/controllers/adminCouponController.js

**Source:** [server/controllers/adminCouponController.js](../../../server/controllers/adminCouponController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Coupon` from `../models/Coupon.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Coupon.js](../../../server/models/Coupon.js)

## Runtime declarations and data flow

### `normalizeCouponPayload` — lines 5–18

Parameters: `body (defaulted)`.
10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `const payload = { ...body };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `if (payload.code != null) payload.code = String(payload.code).trim().toUpperCase();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `if (payload.description != null) payload.description = String(payload.description).trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `if (payload.discountType != null) payload.discountType = String(payload.discountType).toLowerCase();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `if (payload.amount != null) payload.amount = Number(payload.amount);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `if (payload.usageLimit != null) payload.usageLimit = Number(payload.usageLimit);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `if (payload.minimumBookingAmount != null) payload.minimumBookingAmount = Number(payload.minimumBookingAmount);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (payload.maximumDiscount === "" || payload.maximumDiscount == null) payload.maximumDiscount = null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `else payload.maximumDiscount = Number(payload.maximumDiscount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (payload.startDate) payload.startDate = new Date(payload.startDate);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (payload.expiresAt) payload.expiresAt = new Date(payload.expiresAt);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `return payload;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateCouponPayload` — lines 20–40

Parameters: `payload`.
10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `if (!payload.code || payload.code.length < 2 || payload.code.length > 50) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return "Coupon code must be between 2 and 50 characters";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 24:** `if (payload.discountType !== "percentage" && payload.discountType !== "fixed") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `return "Discount type must be percentage or fixed";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 27:** `if (!Number.isFinite(payload.amount) || payload.amount < 0) return "Discount amount must be a valid non-negative number";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `if (payload.discountType === "percentage" && payload.amount > 100) return "Percentage discount cannot exceed 100%";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `if (!Number.isInteger(payload.usageLimit) || payload.usageLimit < 1) return "Usage limit must be at least 1";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (payload.minimumBookingAmount != null && (!Number.isFinite(payload.minimumBookingAmount) || payload.minimumBookingAmount < 0)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `return "Minimum booking amount must be valid";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 33:** `if (payload.maximumDiscount != null && (!Number.isFinite(payload.maximumDiscount) || payload.maximumDiscount < 0)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `return "Maximum discount must be valid";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 36:** `if (payload.expiresAt && Number.isNaN(payload.expiresAt.getTime())) return "Expiry date is invalid";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `if (payload.startDate && Number.isNaN(payload.startDate.getTime())) return "Start date is invalid";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (payload.startDate && payload.expiresAt && payload.expiresAt <= payload.startDate) return "Expiry date must be after the start date";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `serializeCoupon` — lines 42–64

Parameters: `coupon`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 43:** `const plain = typeof coupon?.toObject === "function" ? coupon.toObject() : { ...coupon };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const usedCount = Number(plain.usedCount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const usageLimit = Number(plain.usageLimit || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const startDate = plain.startDate ? new Date(plain.startDate) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const expiresAt = plain.expiresAt ? new Date(plain.expiresAt) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `let status = "active";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `if (plain.active === false) status = "inactive";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `else if (expiresAt && expiresAt <= now) status = "expired";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `else if (startDate && startDate > now) status = "scheduled";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `else if (usageLimit > 0 && usedCount >= usageLimit) status = "used";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAdminCoupons` — lines 66–76

Parameters: `req`, `res`, `next`.
Persistent operations detected: Coupon.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 67:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 69:** `const coupons = await Coupon.find(mergeTenantFilter({})).sort({ createdAt: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 70:** `const serialized = coupons.map(serializeCoupon);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `res.json({ success: true, count: serialized.length, coupons: serialized });` — Sends a JSON response; inspect its caller for status and error semantics.

### `createAdminCoupon` — lines 78–96

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Coupon.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 79:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 81:** `const payload = normalizeCouponPayload(req.body);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `const validationError = validateCouponPayload(payload);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `if (validationError) return res.status(400).json({ success: false, message: validationError });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `const coupon = await Coupon.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `res.status(201).json({ success: true, coupon: serializeCoupon(coupon) });` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 91:** `if (error?.code === 11000) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `return res.status(409).json({ success: false, message: "Coupon code already exists for this company" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateAdminCoupon` — lines 98–122

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 99:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 101:** `const payload = normalizeCouponPayload(req.body);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `const validationError = validateCouponPayload(payload);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `if (validationError) return res.status(400).json({ success: false, message: validationError });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 106:** `return res.status(400).json({ success: false, message: "Invalid coupon id" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 109:** `const coupon = await Coupon.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 114:** `if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 115:** `res.json({ success: true, coupon: serializeCoupon(coupon) });` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 117:** `if (error?.code === 11000) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 118:** `return res.status(409).json({ success: false, message: "Coupon code already exists for this company" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteAdminCoupon` — lines 124–139

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 125:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 127:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 128:** `return res.status(400).json({ success: false, message: "Invalid coupon id" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 131:** `const coupon = await Coupon.findOneAndDelete(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 134:** `if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 135:** `res.json({ success: true, message: "Coupon deleted" });` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 5: `const normalizeCouponPayload = (body = {}) => {`.
- Line 6: `const payload = { ...body };`.
- Line 20: `const validateCouponPayload = (payload) => {`.
- Line 42: `const serializeCoupon = (coupon) => {`.
- Line 43: `const plain = typeof coupon?.toObject === "function" ? coupon.toObject() : { ...coupon };`.
- Line 44: `const now = new Date();`.
- Line 45: `const usedCount = Number(plain.usedCount || 0);`.
- Line 46: `const usageLimit = Number(plain.usageLimit || 0);`.
- Line 47: `const startDate = plain.startDate ? new Date(plain.startDate) : null;`.
- Line 48: `const expiresAt = plain.expiresAt ? new Date(plain.expiresAt) : null;`.
- Line 50: `let status = "active";`.
- Line 66: `export const getAdminCoupons = async (req, res, next) => {`.
- Line 69: `const coupons = await Coupon.find(mergeTenantFilter({})).sort({ createdAt: -1 }).lean();`.
- Line 70: `const serialized = coupons.map(serializeCoupon);`.
- Line 78: `export const createAdminCoupon = async (req, res, next) => {`.
- Line 81: `const payload = normalizeCouponPayload(req.body);`.
- Line 82: `const validationError = validateCouponPayload(payload);`.
- Line 85: `const coupon = await Coupon.create({`.
- Line 98: `export const updateAdminCoupon = async (req, res, next) => {`.
- Line 101: `const payload = normalizeCouponPayload(req.body);`.
- Line 102: `const validationError = validateCouponPayload(payload);`.
- Line 109: `const coupon = await Coupon.findOneAndUpdate(`.
- Line 124: `export const deleteAdminCoupon = async (req, res, next) => {`.
- Line 131: `const coupon = await Coupon.findOneAndDelete(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
