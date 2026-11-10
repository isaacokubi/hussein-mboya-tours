# Source explanation: server/controllers/tenantSubscriptionController.js

**Source:** [server/controllers/tenantSubscriptionController.js](../../../server/controllers/tenantSubscriptionController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `Subscription` from `../models/Subscription.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Subscription.js](../../../server/models/Subscription.js)
- `SubscriptionPayment` from `../models/SubscriptionPayment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SubscriptionPayment.js](../../../server/models/SubscriptionPayment.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `activateTenantSubscription`, `getTenantPlanPrice`, `getTenantPlanPrices`, `initiateTenantMpesaPayment`, `switchTenantSubscriptionPlan` from `../services/tenantSubscriptionService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tenantSubscriptionService.js](../../../server/services/tenantSubscriptionService.js)
- `getPlanFeatureCatalog`, `getTenantPlanFeatures` from `../services/planFeatureService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/planFeatureService.js](../../../server/services/planFeatureService.js)

## Runtime declarations and data flow

### `isAdmin` — lines 8–8

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isPlatformSuperAdmin` — lines 9–9

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getTenantSubscription` — lines 11–24

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId, req.user. Persistent operations detected: Organization.findById, Subscription.findOne, SubscriptionPayment.find; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `const tenantId = req.tenantId || req.user?.tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (!tenantId) return res.status(400).json({ success: false, message: "No tenant is selected." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `const organization = await Organization.findById(tenantId).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 16:** `if (!organization) return res.status(404).json({ success: false, message: "Company not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const subscription = await Subscription.findOne({ tenantId }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `const payments = await SubscriptionPayment.find({ tenantId }).sort({ createdAt: -1 }).limit(10).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `const plan = String(organization.subscription?.plan || subscription?.plan || "starter").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const planPrices = await getTenantPlanPrices();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `const features = await getTenantPlanFeatures(plan);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `return res.json({ success: true, tenant: organization, subscription: subscription || null, plan, amountDue: planPrices[plan] || 0, planPrices, features, featureCatalog: getPlanFeatureCatalog(), payments });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `startTenantSubscriptionPayment` — lines 26–37

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId, req.user, req.body. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 27:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 28:** `const tenantId = req.tenantId || req.user?.tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (!tenantId || !isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the company administrator can pay for the company subscription." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const plan = String(req.body?.plan || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const phone = String(req.body?.phone || req.user?.phone || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const amount = await getTenantPlanPrice(plan);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ success: false, message: "The selected plan price is not configured by the platform owner." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const result = await initiateTenantMpesaPayment({ tenantId, userId: req.user._id, plan, phone });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `return res.status(200).json({ success: true, message: \`M-Pesa payment request sent for KES ${amount.toLocaleString()}.\`, payment: result.payment, data: result.response });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTenantSubscriptionPaymentStatus` — lines 39–45

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.tenantId, req.user. Persistent operations detected: SubscriptionPayment.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 40:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 41:** `const payment = await SubscriptionPayment.findOne({ checkoutRequestID: req.params.checkoutRequestId, tenantId: req.tenantId || req.user?.tenantId }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `if (!payment) return res.status(404).json({ success: false, message: "Subscription payment not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `return res.json({ success: true, payment });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `approveTenantSubscription` — lines 47–63

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.params, req.body. Persistent operations detected: Organization.findById, SubscriptionPayment.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 49:** `if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can manually activate subscriptions." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `const tenantId = req.params.id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const tenant = await Organization.findById(tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `if (!tenant) return res.status(404).json({ success: false, message: "Company not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `const plan = String(req.body?.plan || tenant.subscription?.plan || "starter").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const days = Math.max(1, Math.min(Number(req.body?.periodDays) || 30, 3660));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const amount = await getTenantPlanPrice(plan);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ success: false, message: "The selected plan price is not configured by the platform owner." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `const reference = String(req.body?.reference || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `if (!reference) return res.status(400).json({ success: false, message: "A verified payment reference is required for manual activation." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `const payment = await SubscriptionPayment.create({ tenantId, userId: req.user._id, plan, amount, provider: "manual", status: "pending", periodDays: days, transactionReference: reference, metadata: { approvedBy: req.user.` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `const result = await activateTenantSubscription({ tenantId, plan, provider: "manual", periodDays: days, payment, transactionReference: reference });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `return res.json({ success: true, message: \`Subscription activated for ${days} days.\`, tenant: result.organization, payment });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `switchTenantSubscription` — lines 65–74

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.params, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 66:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 67:** `if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can switch tenant subscription plans." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `const tenantId = req.params.id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const plan = String(req.body?.plan || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `if (!plan) return res.status(400).json({ success: false, message: "A subscription plan is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `const result = await switchTenantSubscriptionPlan({ tenantId, plan });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `return res.json({ success: true, message: \`${result.organization.name} switched from ${result.previousPlan} to ${result.plan} for testing. Existing renewal period was preserved.\`, tenant: result.organization, subscript` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `listSubscriptionPayments` — lines 76–82

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: SubscriptionPayment.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 77:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 78:** `if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can view all subscription payments." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `const payments = await SubscriptionPayment.find({}).sort({ createdAt: -1 }).limit(100).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 80:** `return res.json({ success: true, payments });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `const isAdmin = (user) => ["admin", "administrator", "super_admin", "superadmin"].includes(String(user?.role || user?.legacyRole || "").toLowerCase());`.
- Line 9: `const isPlatformSuperAdmin = (user) => ["super_admin", "superadmin"].includes(String(user?.role || user?.legacyRole || "").toLowerCase());`.
- Line 11: `export const getTenantSubscription = async (req, res, next) => {`.
- Line 13: `const tenantId = req.tenantId || req.user?.tenantId;`.
- Line 15: `const organization = await Organization.findById(tenantId).lean();`.
- Line 17: `const subscription = await Subscription.findOne({ tenantId }).lean();`.
- Line 18: `const payments = await SubscriptionPayment.find({ tenantId }).sort({ createdAt: -1 }).limit(10).lean();`.
- Line 19: `const plan = String(organization.subscription?.plan || subscription?.plan || "starter").toLowerCase();`.
- Line 20: `const planPrices = await getTenantPlanPrices();`.
- Line 21: `const features = await getTenantPlanFeatures(plan);`.
- Line 26: `export const startTenantSubscriptionPayment = async (req, res, next) => {`.
- Line 28: `const tenantId = req.tenantId || req.user?.tenantId;`.
- Line 30: `const plan = String(req.body?.plan || "").toLowerCase();`.
- Line 31: `const phone = String(req.body?.phone || req.user?.phone || "").trim();`.
- Line 32: `const amount = await getTenantPlanPrice(plan);`.
- Line 34: `const result = await initiateTenantMpesaPayment({ tenantId, userId: req.user._id, plan, phone });`.
- Line 39: `export const getTenantSubscriptionPaymentStatus = async (req, res, next) => {`.
- Line 41: `const payment = await SubscriptionPayment.findOne({ checkoutRequestID: req.params.checkoutRequestId, tenantId: req.tenantId || req.user?.tenantId }).lean();`.
- Line 47: `export const approveTenantSubscription = async (req, res, next) => {`.
- Line 50: `const tenantId = req.params.id;`.
- Line 51: `const tenant = await Organization.findById(tenantId);`.
- Line 53: `const plan = String(req.body?.plan || tenant.subscription?.plan || "starter").toLowerCase();`.
- Line 54: `const days = Math.max(1, Math.min(Number(req.body?.periodDays) || 30, 3660));`.
- Line 55: `const amount = await getTenantPlanPrice(plan);`.
- Line 57: `const reference = String(req.body?.reference || "").trim();`.
- Line 59: `const payment = await SubscriptionPayment.create({ tenantId, userId: req.user._id, plan, amount, provider: "manual", status: "pending", periodDays: days, transactionReference: refe`.
- Line 60: `const result = await activateTenantSubscription({ tenantId, plan, provider: "manual", periodDays: days, payment, transactionReference: reference });`.
- Line 65: `export const switchTenantSubscription = async (req, res, next) => {`.
- Line 68: `const tenantId = req.params.id;`.
- Line 69: `const plan = String(req.body?.plan || "").toLowerCase();`.
- Line 71: `const result = await switchTenantSubscriptionPlan({ tenantId, plan });`.
- Line 76: `export const listSubscriptionPayments = async (req, res, next) => {`.
- Line 79: `const payments = await SubscriptionPayment.find({}).sort({ createdAt: -1 }).limit(100).lean();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
