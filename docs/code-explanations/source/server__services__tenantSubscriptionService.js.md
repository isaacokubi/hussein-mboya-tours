# Source explanation: server/services/tenantSubscriptionService.js

**Source:** [server/services/tenantSubscriptionService.js](../../../server/services/tenantSubscriptionService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `axios` from `axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `SystemSetting` from `../models/SystemSetting.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SystemSetting.js](../../../server/models/SystemSetting.js)
- `Subscription` from `../models/Subscription.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Subscription.js](../../../server/models/Subscription.js)
- `SubscriptionPayment` from `../models/SubscriptionPayment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SubscriptionPayment.js](../../../server/models/SubscriptionPayment.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mpesaConfig`, `getMpesaUrls`, `hasLegacyMpesaConfig` from `../config/mpesa.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/mpesa.js](../../../server/config/mpesa.js)
- `generateAccessToken`, `generateTimestamp`, `generatePassword` from `./mpesaService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaService.js](../../../server/services/mpesaService.js)

## Runtime declarations and data flow

### `getTenantPlanPrices` — lines 17–20

Parameters: none.
Persistent operations detected: SystemSetting.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 18:** `const settings = await SystemSetting.findOne({ tenantId: null, key: "platform" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `return Object.fromEntries(Object.entries(PLAN_FIELDS).map(([plan, field]) => [plan, Number(settings?.[field] ?? ENV_PLAN_PRICES[plan] ?? 0)]));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTenantPlanPrice` — lines 21–21

Parameters: `plan`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:

### `normalizeSubscriptionPhone` — lines 23–29

Parameters: `phone`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `let value = String(phone || "").trim().replace(/\s+/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (value.startsWith("+254")) value = value.slice(1);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (/^0[17]\d{8}$/.test(value)) value = \`254${value.slice(1)}\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `if (!/^254[17]\d{8}$/.test(value)) throw new Error("Enter a valid Kenyan M-Pesa phone number.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `return value;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `activateTenantSubscription` — lines 31–48

Parameters: `{tenantId, plan, provider, periodDays, payment, transactionReference}`.
Persistent operations detected: Organization.findById; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 32:** `if (!mongoose.isValidObjectId(tenantId)) throw new Error("Invalid tenant ID.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const normalizedPlan = String(plan || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `if (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) throw new Error("Invalid subscription plan.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `const organization = await Organization.findById(tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `if (!organization) throw new Error("Company not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const days = Math.max(1, Math.min(Number(periodDays) || 30, 3660));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const end = new Date(now.getTime() + days * DAY_MS);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const existingSubscription = organization.subscription?.toObject?.() || organization.subscription || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const seats = PLAN_SEATS[normalizedPlan];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `await organization.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.findOneAndUpdate({ tenantId: organization._id }, { $set: { tenantId: organization._id, plan: normalizedPlan, status: "active", provider, curre` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `if (payment) { payment.status = "completed"; payment.paidAt = payment.paidAt || now; payment.transactionReference = transactionReference || payment.transactionReference || payment.mpesaReceiptNumber || ""; await payment.` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `return { organization, periodStartsAt: now, periodEndsAt: end };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `switchTenantSubscriptionPlan` — lines 50–72

Parameters: `{tenantId, plan}`.
Persistent operations detected: Organization.findById; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 51:** `if (!mongoose.isValidObjectId(tenantId)) throw new Error("Invalid tenant ID.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `const normalizedPlan = String(plan || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `if (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) throw new Error("Invalid subscription plan.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `const organization = await Organization.findById(tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 55:** `if (!organization) throw new Error("Company not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `const existing = organization.subscription?.toObject?.() || organization.subscription || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `const currentEnd = existing.renewsAt || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const seats = PLAN_SEATS[normalizedPlan];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `await organization.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const subscription = await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 71:** `return { organization, subscription, previousPlan: String(existing.plan || "starter").toLowerCase(), plan: normalizedPlan };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `expireTenantSubscriptions` — lines 74–90

Parameters: none.
Persistent operations detected: Organization.find, Subscription.find, Subscription.updateMany, Organization.updateMany; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 75:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const trialOrgs = await Organization.find({ status: "trial", "subscription.trialEndsAt": { $lte: now } }).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 77:** `const expiredPaidOrgs = await Organization.find({ status: "active", "subscription.renewsAt": { $lte: now } }).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `const graceOrgs = await Organization.find({ status: "active", "subscription.renewsAt": { $lte: now } }).select("_id subscription.renewsAt").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 79:** `const pastDueSubscriptions = await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.find({ status: "past_due", currentPeriodEndsAt: { $lte: new Date(now.getTime() - SUBSCRIPTION_GRACE_PERIOD_DAYS *` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 80:** `const trialIds = trialOrgs.map((item) => item._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const graceIds = graceOrgs.map((item) => item._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `if (graceIds.length) await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.updateMany({ tenantId: { $in: graceIds }, status: "active", currentPeriodEndsAt: { $lte: now } }, { $set: { status: "past` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `const paidPastDueIds = pastDueSubscriptions.map((item) => item.tenantId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const expiredIds = [...new Map([...trialIds.map((id) => [String(id), id]), ...paidPastDueIds.map((id) => [String(id), id])]).values()];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `if (expiredIds.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.updateMany({ tenantId: { $in: expiredIds }, status: { $in: ["trialing", "past_due"] } }, { $set: { status: "expired", currentPeriodEndsAt: now` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 87:** `await Organization.updateMany({ _id: { $in: expiredIds } }, { $set: { status: "suspended", "subscription.renewsAt": null } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `return expiredIds.length + graceIds.length;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `startTenantSubscriptionScheduler` — lines 92–92

Parameters: none.
Error control: try=false, catch=true, finally=false.

Key statements:

### `run` — lines 92–92

Parameters: none.
Error control: try=false, catch=true, finally=false.

Key statements:

### `initiateTenantMpesaPayment` — lines 94–120

Parameters: `{tenantId, userId, plan, phone}`.
Persistent operations detected: Organization.findById, SubscriptionPayment.create; verify tenant/ownership filters in the exact query. HTTP operations detected: axios.post; response/error handling occurs in this function and its caller. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 95:** `const organization = await Organization.findById(tenantId).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 96:** `if (!organization) throw new Error("Company not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 98:** `const normalizedPlan = String(plan || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 99:** `if (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) throw new Error("Invalid subscription plan.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 100:** `const paymentAmount = await getTenantPlanPrice(normalizedPlan);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 101:** `if (!Number.isInteger(paymentAmount) || paymentAmount < 1) throw new Error("This subscription plan has no configured payment amount. Ask the platform owner to configure the plan price.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 102:** `const normalizedPhone = normalizeSubscriptionPhone(phone);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 104:** `const timestamp = generateTimestamp();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `const urls = getMpesaUrls();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `const payment = await SubscriptionPayment.create({ tenantId, userId: userId || null, plan: normalizedPlan, amount: paymentAmount, provider: "mpesa", phoneNumber: normalizedPhone, status: "pending", periodDays: 30 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 108:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 109:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 112:** `await payment.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 113:** `return { payment, response: data };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 117:** `await payment.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 11: `const ENV_PLAN_PRICES = Object.freeze({ starter: Number(process.env.TENANT_PLAN_STARTER_PRICE_KES || 0), professional: Number(process.env.TENANT_PLAN_PROFESSIONAL_PRICE_KES || 0), `.
- Line 12: `const PLAN_FIELDS = Object.freeze({ starter: "tenantPlanStarterPriceKes", professional: "tenantPlanProfessionalPriceKes", business: "tenantPlanBusinessPriceKes", enterprise: "tenan`.
- Line 13: `const PLAN_SEATS = Object.freeze({ starter: 5, professional: 15, business: 50, enterprise: 250 });`.
- Line 14: `const SUBSCRIPTION_GRACE_PERIOD_DAYS = Math.max(0, Math.min(Number(process.env.SUBSCRIPTION_GRACE_PERIOD_DAYS || 3), 30));`.
- Line 15: `const DAY_MS = 86400000;`.
- Line 17: `export const getTenantPlanPrices = async () => runWithTenant({ role: "super_admin", bypass: true }, async () => {`.
- Line 18: `const settings = await SystemSetting.findOne({ tenantId: null, key: "platform" }).lean();`.
- Line 21: `export const getTenantPlanPrice = async (plan) => Number((await getTenantPlanPrices())[String(plan || "").toLowerCase()] || 0);`.
- Line 23: `export const normalizeSubscriptionPhone = (phone) => {`.
- Line 24: `let value = String(phone || "").trim().replace(/\s+/g, "");`.
- Line 31: `export const activateTenantSubscription = async ({ tenantId, plan, provider = "mpesa", periodDays = 30, payment, transactionReference = "" }) => {`.
- Line 33: `const normalizedPlan = String(plan || "").toLowerCase();`.
- Line 35: `const organization = await Organization.findById(tenantId);`.
- Line 37: `const now = new Date();`.
- Line 38: `const days = Math.max(1, Math.min(Number(periodDays) || 30, 3660));`.
- Line 39: `const end = new Date(now.getTime() + days * DAY_MS);`.
- Line 40: `const existingSubscription = organization.subscription?.toObject?.() || organization.subscription || {};`.
- Line 41: `const seats = PLAN_SEATS[normalizedPlan];`.
- Line 50: `export const switchTenantSubscriptionPlan = async ({ tenantId, plan }) => {`.
- Line 52: `const normalizedPlan = String(plan || "").toLowerCase();`.
- Line 54: `const organization = await Organization.findById(tenantId);`.
- Line 57: `const existing = organization.subscription?.toObject?.() || organization.subscription || {};`.
- Line 58: `const currentEnd = existing.renewsAt || null;`.
- Line 59: `const seats = PLAN_SEATS[normalizedPlan];`.
- Line 64: `const now = new Date();`.
- Line 65: `const subscription = await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.findOneAndUpdate(`.
- Line 74: `export const expireTenantSubscriptions = async () => {`.
- Line 75: `const now = new Date();`.
- Line 76: `const trialOrgs = await Organization.find({ status: "trial", "subscription.trialEndsAt": { $lte: now } }).select("_id").lean();`.
- Line 77: `const expiredPaidOrgs = await Organization.find({ status: "active", "subscription.renewsAt": { $lte: now } }).select("_id").lean();`.
- Line 78: `const graceOrgs = await Organization.find({ status: "active", "subscription.renewsAt": { $lte: now } }).select("_id subscription.renewsAt").lean();`.
- Line 79: `const pastDueSubscriptions = await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.find({ status: "past_due", currentPeriodEndsAt: { $lte: new Date(now.getT`.
- Line 80: `const trialIds = trialOrgs.map((item) => item._id);`.
- Line 81: `const graceIds = graceOrgs.map((item) => item._id);`.
- Line 83: `const paidPastDueIds = pastDueSubscriptions.map((item) => item.tenantId);`.
- Line 84: `const expiredIds = [...new Map([...trialIds.map((id) => [String(id), id]), ...paidPastDueIds.map((id) => [String(id), id])]).values()];`.
- Line 92: `export const startTenantSubscriptionScheduler = () => { const run = () => expireTenantSubscriptions().catch((error) => console.error("Tenant subscription expiry sync failed:", erro`.
- Line 94: `export const initiateTenantMpesaPayment = async ({ tenantId, userId, plan, phone }) => {`.
- Line 95: `const organization = await Organization.findById(tenantId).lean();`.
- Line 98: `const normalizedPlan = String(plan || "").toLowerCase();`.
- Line 100: `const paymentAmount = await getTenantPlanPrice(normalizedPlan);`.
- Line 102: `const normalizedPhone = normalizeSubscriptionPhone(phone);`.
- Line 103: `<sensitive declaration redacted>`.
- Line 104: `const timestamp = generateTimestamp();`.
- Line 105: `<sensitive declaration redacted>`.
- Line 106: `const urls = getMpesaUrls();`.
- Line 107: `const payment = await SubscriptionPayment.create({ tenantId, userId: userId || null, plan: normalizedPlan, amount: paymentAmount, provider: "mpesa", phoneNumber: normalizedPhone, s`.
- Line 109: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
